import { NextResponse } from 'next/server';
import { langfuse } from '@/app/lib/langfuse';
import { LangfuseTraceClient } from 'langfuse';
import { SearchResult } from '@/app/lib/race/type';
import { getTodaysDateOfStockholm } from '@/app/lib/askAI/dates';
import { extractRaceSchedule } from '@/app/lib/race/transform';
import { CalendarDayRaw } from '@/app/lib/race/utils';

export const runtime = 'nodejs';

export async function GET(req: Request) {
    const parentTraceId = req.headers.get('x-langfuse-trace-id');
    const { searchParams } = new URL(req.url);

    const qRaw = (searchParams.get('q') ?? '').trim();
    const q = qRaw.toLowerCase();
    const view = (searchParams.get('view') ?? '').trim();

    const dateParam = (searchParams.get('date') ?? '').trim();
    const today = getTodaysDateOfStockholm();
    const date = dateParam || today;

    let trace: LangfuseTraceClient;

    if (parentTraceId) {
        trace = langfuse.trace({
            id: parentTraceId,
        });
    } else {
        trace = langfuse.trace({
            name: 'race-api-request',
            input: { qRaw, view, dateParam, effectiveDate: date },
        });
    }

    const span = trace.span({
        name: 'get_races_date',
        input: { qRaw, view, dateParam, effectiveDate: date },
    });

    try {
        const validateSpan = span.span({
            name: 'validate-query',
            input: { dateParam, qRaw, view },
        });

        try {
            if (dateParam && !/^\d{4}-\d{2}-\d{2}$/.test(dateParam)) {
                validateSpan.update({
                    level: 'WARNING',
                    output: { message: 'Invalid date format', got: dateParam },
                });

                span.update({
                    output: {
                        ok: false,
                        status: 400,
                        reason: 'invalid-date',
                        got: dateParam,
                    },
                });

                return NextResponse.json(
                    { message: 'Invalid date format. Expected YYYY-MM-DD.' },
                    { status: 400 }
                );
            }
            validateSpan.update({ output: { ok: true } });
        } finally {
            validateSpan.end();
        }
        const ATG_CALENDER_API_URL = process.env.ATG_CALENDER_API_URL;
        if (!ATG_CALENDER_API_URL) {
            trace.update({
                output: {
                    ok: false,
                    status: 500,
                    reason: 'missing-env',
                    key: 'ATG_CALENDER_API_URL',
                },
            });
            return NextResponse.json(
                { message: 'ATG_CALENDER_API_URL saknas i .env.local' },
                { status: 500 }
            );
        }

        const buildUrlSpan = span.span({
            name: 'build-atg-url',
            input: { ATG_CALENDER_API_URL, date },
        });

        const atgUrl = new URL(ATG_CALENDER_API_URL);
        atgUrl.pathname = atgUrl.pathname.replace(/\/$/, '') + `/${date}`;

        try {
            buildUrlSpan.update({ output: { atgUrl: atgUrl.toString() } });
        } finally {
            buildUrlSpan.end();
        }

        const fetchSpan = span.span({
            name: 'fetch-atg',
            input: { url: atgUrl.toString() },
        });

        let res: Response;
        let text: string;

        try {
            res = await fetch(atgUrl.toString(), {
                headers: { Accept: 'application/json' },
                cache: 'no-store',
            });

            text = await res.text();

            fetchSpan.update({
                output: {
                    ok: res.ok,
                    status: res.status,
                    bytes: text.length,
                },
            });

            if (!res.ok) {
                fetchSpan.update({
                    level: 'ERROR',
                    output: {
                        message: 'ATG responded not ok',
                        status: res.status,
                    },
                });

                span.update({
                    output: { ok: false, status: res.status, reason: 'atg-error' },
                });

                return NextResponse.json(
                    { message: 'Could not get race data', status: res.status },
                    { status: res.status }
                );
            }
        } catch (error) {
            fetchSpan.update({
                level: 'ERROR',
                output: { error: String(error) },
            });

            span.update({
                output: {
                    ok: false,
                    status: 500,
                    reason: 'fetch-exception',
                    error: String(error),
                },
            });

            throw error;
        } finally {
            fetchSpan.end();
        }

        const raw = JSON.parse(text) as CalendarDayRaw;

        const { date: apiDate, tracks } = extractRaceSchedule(raw);
        const effectiveDate = apiDate || date;

        if (view === 'ai') {
            const ai = {
                date: effectiveDate,
                tracks: tracks.map((t) => {
                    const betTypes = Array.from(
                        new Set(
                            (t.races ?? [])
                                .flatMap((r) => r.mergedPools ?? [])
                                .flatMap((p) => p.betTypes)
                        )
                    ).sort();

                    return {
                        id: t.id,
                        name: t.name,
                        firstStart: t.startTime.slice(11, 16),
                        raceCount: (t.races ?? []).length,
                        upcomingCount: (t.races ?? []).filter((r) => r.status === 'UPCOMING')
                            .length,
                        biggestGameType: t.biggestGameType ?? null,
                        sport: t.sport ?? null,
                        countryCode: t.countryCode ?? null,
                        betTypes,
                        races: (t.races ?? []).map((r) => ({
                            id: r.id,
                            number: r.number,
                            status: r.status,
                            startTime: r.startTime.slice(11, 16),
                        })),
                    };
                }),
                games: raw.games ?? {},
            };

            span.update({
                output: {
                    ok: true,
                    status: 200,
                    mode: 'ai',
                    effectiveDate,
                    trackCount: tracks.length,
                },
            });

            return NextResponse.json(ai);
        }

        if (!qRaw) {
            span.update({
                output: {
                    ok: true,
                    status: 200,
                    mode: 'raw',
                    effectiveDate,
                    trackCount: tracks.length,
                },
            });
            return NextResponse.json(raw);
        }

        const filtered = tracks
            .filter((t) => {
                const hay = `${t.name} ${t.id}`.toLowerCase();
                return hay.includes(q);
            })
            .map((t) => ({
                trackId: t.id,
                trackName: t.name,
                firstStartTime: t.startTime.slice(11, 16),
                races: (t.races ?? []).map((r) => ({
                    id: r.id,
                    number: r.number,
                    startTime: r.startTime.slice(11, 16),
                    status: r.status,
                })),
            }));

        const result: SearchResult = {
            date: effectiveDate,
            searchQuery: qRaw,
            tracks: filtered,
        };

        span.update({
            output: {
                ok: true,
                status: 200,
                mode: 'search',
                effectiveDate,
                q: qRaw,
                trackCount: tracks.length,
                matchCount: filtered.length,
            },
        });

        return NextResponse.json(result);
    } catch (error) {
        span.update({
            output: {
                ok: false,
                status: 500,
                error: (error as Error).message,
            },
        });

        return NextResponse.json(
            { message: 'Internal server error', error: (error as Error).message },
            { status: 500 }
        );
    } finally {
        span.end();
        langfuse.flush();
    }
}
