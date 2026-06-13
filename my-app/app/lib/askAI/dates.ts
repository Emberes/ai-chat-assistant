export function parseISODate(input: string) {
    return input.trim().replace(/[‐-‒–—−]/g, '-');
}

export function isValidISODate(s: string) {
    const str = parseISODate(s);
    return /^\d{4}-\d{2}-\d{2}$/.test(str);
}

export function getTodaysDateOfStockholm(): string {
    const parts = new Intl.DateTimeFormat('sv-SE', {
        timeZone: 'Europe/Stockholm',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
    }).formatToParts(new Date());

    const year = parts.find((part) => part.type === 'year')?.value ?? '0000';
    const month = parts.find((part) => part.type === 'month')?.value ?? '00';
    const day = parts.find((part) => part.type === 'day')?.value ?? '00';
    return `${year}-${month}-${day}`;
}

export function buildSwedishDateContext(todaysDate: string): string {
    const now = new Date();
    const days = ['söndag', 'måndag', 'tisdag', 'onsdag', 'torsdag', 'fredag', 'lördag'];
    const dayName = days[now.getDay()];

    return `Idag är det ${dayName} ${todaysDate}`;
}
