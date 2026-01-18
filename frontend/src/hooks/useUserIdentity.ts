import { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';

const STORAGE_KEY = 'plannotator_identity';

interface UserIdentity {
    id: string;
    name: string;
    color: string;
}

export const useUserIdentity = () => {
    const [identity, setIdentity] = useState<UserIdentity | null>(null);

    useEffect(() => {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            try {
                setIdentity(JSON.parse(stored));
            } catch (e) {
                console.error('Failed to parse identity', e);
                // Fallback to new identity if corrupt
                createNewIdentity();
            }
        } else {
            // Create initial identity but with empty name if not found
            // Wait, we want to prompt for name if missing.
            // If we create a full identity here, we might skip prompt if we just check for `identity`.
            // So we should probably store partial identity or check if name is set.
            createNewIdentity();
        }
    }, []);

    const createNewIdentity = () => {
        const newIdentity = {
            id: uuidv4(),
            name: '', // Empty name triggers prompt
            color: '#' + Math.floor(Math.random() * 16777215).toString(16)
        };
        // Don't save to storage yet? Or save with empty name?
        // Saving with empty name is fine, as long as UI checks for empty name.
        setIdentity(newIdentity);
        // We defer saving to localStorage until name is set to avoid junk?
        // Actually, saving UUID is good so we keep same color/ID even if name not set?
        // But if they reload before setting name, maybe better to start fresh?
        // Let's defer saving until name is set.
    };

    const updateName = (name: string) => {
        if (!identity) return;
        const newIdentity = { ...identity, name };
        setIdentity(newIdentity);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newIdentity));
    };

    return {
        identity,
        updateName,
        hasName: !!identity?.name
    };
};
