export function buildConversationMemory(
    conversation: Array<{ role: 'user' | 'assistant'; content: string }>
): string {
    const joined = conversation
        .map((m) => `${m.role}: ${m.content}`)
        .join('\n')
        .toLowerCase();

    const trackMatches = joined.match(
        /\b(romme|solvalla|boden|örebro|kalmar|gävle|halmstad|åby|sörlandet|skive|enghien|fairview|gulfstream park)\b/g
    );
    const gameMatches = joined.match(/\b(v64|v65|v75|v85|v86|v5|v4)\b/g);
    const dateMatches = joined.match(/\b\d{4}-\d{2}-\d{2}\b/g);
    const raceMatches = joined.match(/\b(?:lopp|avdelning)\s*(\d+)\b/g);

    const horseMatches = [
        ...joined.matchAll(/hästen\s+([A-ZÅÄÖ][A-Za-zÅÄÖåäö' -]+)/g),
        ...joined.matchAll(/horse\s+([A-ZÅÄÖ][A-Za-zÅÄÖåäö' -]+)/gi),
    ];

    const driverMatches = [
        ...joined.matchAll(/kusk(?:en)?\s+([A-ZÅÄÖ][A-Za-zÅÄÖåäö' -]+)/g),
        ...joined.matchAll(/driver\s+([A-ZÅÄÖ][A-Za-zÅÄÖåäö' -]+)/gi),
    ];

    const lastTrackName = trackMatches?.[trackMatches.length - 1] ?? null;
    const lastGameType = gameMatches?.[gameMatches.length - 1]?.toUpperCase() ?? null;
    const lastDate = dateMatches?.[dateMatches.length - 1] ?? null;
    const lastRaceMatch = raceMatches?.[raceMatches.length - 1] ?? null;
    const lastRaceNumber = lastRaceMatch ? (lastRaceMatch.match(/\d+/)?.[0] ?? null) : null;

    const lastHorseName =
        horseMatches.length > 0 ? horseMatches[horseMatches.length - 1][1].trim() : null;

    const lastDriverName =
        driverMatches.length > 0 ? driverMatches[driverMatches.length - 1][1].trim() : null;

    const lastUserMsg =
        conversation
            .filter((m) => m.role === 'user')
            .slice(-1)[0]
            ?.content.toLowerCase() || '';
    const newTrackMentioned = /\b(romme|solvalla|boden|örebro|kalmar|gävle|halmstad|åby)\b/.test(
        lastUserMsg
    );

    const memoryParts: string[] = [];

    if (lastTrackName) memoryParts.push(`Senast nämnda bana: ${lastTrackName}`);
    if (lastGameType) memoryParts.push(`Senast nämnda speltyp: ${lastGameType}`);
    if (lastDate) memoryParts.push(`Senast nämnda datum: ${lastDate}`);
    if (lastRaceNumber) memoryParts.push(`Senast nämnda loppnummer: ${lastRaceNumber}`);
    if (lastHorseName && !newTrackMentioned)
        memoryParts.push(`Senast nämnda häst: ${lastHorseName}`);
    if (lastDriverName) memoryParts.push(`Senast nämnda kusk: ${lastDriverName}`);

    if (memoryParts.length === 0) {
        return 'Ingen tidigare relevant kontext hittades i samtalet.';
    }

    return memoryParts.join('. ');
}
