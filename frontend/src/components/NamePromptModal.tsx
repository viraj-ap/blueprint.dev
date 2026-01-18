import React, { useState } from 'react';

interface NamePromptModalProps {
    onSubmit: (name: string) => void;
}

export const NamePromptModal: React.FC<NamePromptModalProps> = ({ onSubmit }) => {
    const [name, setName] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (name.trim()) {
            onSubmit(name.trim());
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="w-full max-w-md rounded-lg bg-card p-6 shadow-xl border border-border">
                <h2 className="mb-4 text-2xl font-bold text-foreground">Join Session</h2>
                <p className="mb-6 text-muted-foreground">Please enter your name to join the collaboration.</p>
                <form onSubmit={handleSubmit}>
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Your Name (e.g. Alice)"
                        className="mb-4 w-full rounded-md border border-input bg-background px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                        autoFocus
                    />
                    <button
                        type="submit"
                        disabled={!name.trim()}
                        className="w-full rounded-md bg-primary px-4 py-2 font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
                    >
                        Join
                    </button>
                </form>
            </div>
        </div>
    );
};
