'use client';

import { useState } from 'react';
import { EvaluationResponse } from '../lib/evaluation/types';

export default function EvaluationPage() {
    const [secretKey, setSecretKey] = useState('');
    const [data, setData] = useState<EvaluationResponse | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    async function runEvaluation() {
        setLoading(true);
        setError('');
        setData(null);

        try {
            const response = await fetch(`/api/evaluation/run?key=${encodeURIComponent(secretKey)}`);

            const result = (await response.json()) as EvaluationResponse;

            if (!response.ok || !result.ok) {
                throw new Error(result.error || 'Evaluation failed');
            }

            setData(result);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Something went wrong');
        } finally {
            setLoading(false);
        }
    }

    const passRate =
        data?.total && data.total > 0 && data.passed !== undefined
            ? Math.round((data.passed / data.total) * 100)
            : 0;

    return (
        <main className="evaluation-page">
            <section className="evaluation-hero">
                <p className="evaluation-label">TravHjälpen Kvalitetskontroll</p>
                <h1>Automatisk svarstestning</h1>
                <p>
                    Kör benchmark-frågor mot AI-assistenten och jämför svaren med referenssvar
                    med hjälp av embeddings och cosine similarity.
                </p>
            </section>

            <section className="evaluation-panel">
                <div className="evaluation-input-group">
                    <label htmlFor="secret">Testnyckel</label>
                    <input
                        id="secret"
                        type="password"
                        value={secretKey}
                        onChange={(event) => setSecretKey(event.target.value)}
                        placeholder="Enter SEED_SECRET"
                    />
                </div>

                <button
                    className="evaluation-button"
                    onClick={runEvaluation}
                    disabled={loading || !secretKey}
                >
                    {loading ? 'Kör evaluation...' : 'Kör evaluation'}
                </button>
            </section>

            {error && <p className="evaluation-error">{error}</p>}

            {data && (
                <section className="evaluation-summary">
                    <div className="summary-card">
                        <span>Total tests</span>
                        <strong>{data.total}</strong>
                    </div>

                    <div className="summary-card success">
                        <span>Godkända</span>
                        <strong>{data.passed}</strong>
                    </div>

                    <div className="summary-card failed">
                        <span>Underkända</span>
                        <strong>{data.failed}</strong>
                    </div>

                    <div className="summary-card">
                        <span>Godkännandegrad</span>
                        <strong>{passRate}%</strong>
                    </div>
                </section>
            )}

            {data?.results && (
                <section className="evaluation-results">
                    <h2>Testresultat</h2>

                    <div className="result-list">
                        {data.results.map((result) => {
                            const similarityPercent = Math.round(result.similarity * 100);

                            return (
                                <article key={result.id} className="result-card">
                                    <div className="result-card-header">
                                        <div>
                                            <p className="result-id">{result.id}</p>
                                            <h3>{result.question}</h3>
                                        </div>

                                        <span className={result.passed ? 'status passed' : 'status failed'}>
                                            {result.passed ? 'Godkänd' : 'Underkänd'}
                                        </span>
                                    </div>

                                    {result.expectedTool && (
                                        <p className="tool-badge">Expected tool: {result.expectedTool}</p>
                                    )}

                                    <div className="similarity-block">
                                        <div className="similarity-row">
                                            <span>Likhet</span>
                                            <strong>{result.similarity.toFixed(3)}</strong>
                                        </div>

                                        <div className="similarity-bar">
                                            <div
                                                className="similarity-fill"
                                                style={{ width: `${similarityPercent}%` }}
                                            />
                                        </div>
                                    </div>

                                    <div className="answer-grid">
                                        <div>
                                            <h4>Referenssvar</h4>
                                            <p>{result.referenceAnswer}</p>
                                        </div>

                                        <div>
                                            <h4>Modellens svar</h4>
                                            <p>{result.modelAnswer}</p>
                                        </div>
                                    </div>
                                </article>
                            );
                        })}
                    </div>
                </section>
            )}
        </main>
    );
}