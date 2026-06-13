export const SESSION_KEY = 'travkollen_session_v1';

export function getOrCreateSessionId() {
    const existing = localStorage.getItem(SESSION_KEY);
    if (existing) return existing;

    const id = crypto.randomUUID();
    localStorage.setItem(SESSION_KEY, id);
    return id;
}

export function formatSwedishDate(d = new Date()) {
    const weekday = new Intl.DateTimeFormat('sv-SE', {
        weekday: 'long',
        timeZone: 'Europe/Stockholm',
    }).format(d);

    const date = new Intl.DateTimeFormat('sv-SE', {
        day: '2-digit',
        month: 'long',
        timeZone: 'Europe/Stockholm',
    }).format(d);

    const capWeekday = weekday.charAt(0).toUpperCase() + weekday.slice(1);
    return `${capWeekday}, ${date}`;
}
