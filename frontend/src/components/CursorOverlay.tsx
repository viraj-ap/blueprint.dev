import React from 'react';
import type { CursorPosition } from '../types';

interface CursorOverlayProps {
    cursors: CursorPosition[];
}

const CursorOverlay: React.FC<CursorOverlayProps> = ({ cursors }) => {
    return (
        <div className="pointer-events-none absolute inset-0 z-50 overflow-hidden">
            {cursors.map((cursor) => (
                <div
                    key={cursor.userId}
                    className="absolute transition-all duration-100 ease-linear"
                    style={{
                        left: cursor.x, // Assuming x/y are raw pixels for MVP, ideally percentage for responsive
                        top: cursor.y,
                    }}
                >
                    <svg
                        className="h-6 w-6 -rotate-90 transform drop-shadow-md"
                        fill={cursor.color}
                        viewBox="0 0 20 20"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                    </svg>
                    <span
                        className="ml-2 rounded px-2 py-1 text-xs font-semibold text-white shadow"
                        style={{ backgroundColor: cursor.color }}
                    >
                        {cursor.name}
                    </span>
                </div>
            ))}
        </div>
    );
};

export default CursorOverlay;
