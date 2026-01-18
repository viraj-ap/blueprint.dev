
const STORAGE_KEY = 'plannotator-identity';

export function generateIdentity(): string {
    const adjectives = ['swift', 'gentle', 'brave', 'calm', 'quiet'];
    const nouns = ['falcon', 'crystal', 'fox', 'river', 'stone'];
    const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
    const noun = nouns[Math.floor(Math.random() * nouns.length)];
    return `${adj}-tater-${noun}`;
}

export function getIdentity(): string {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
        return stored;
    }

    const identity = generateIdentity();
    saveIdentity(identity);
    return identity;
}

export function saveIdentity(identity: string): void {
    localStorage.setItem(STORAGE_KEY, identity);
}

export function isCurrentUser(author?: string): boolean {
    if (!author) return false;
    return localStorage.getItem(STORAGE_KEY) === author;
}
