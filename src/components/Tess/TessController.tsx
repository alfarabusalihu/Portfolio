'use client';

import { useEffect, useRef } from 'react';

/**
 * TessController - Simplified
 * Only handles the greeting message for now.
 * Other animation states are removed since they don't work.
 */
export const useTessController = () => {
    const startedRef = useRef(false);
    const greeting = `Hello! I'm Tess, your project guide. I'll help you discover some amazing projects.`;

    useEffect(() => {
        if (startedRef.current) return;
        startedRef.current = true;

        // Attempt text-to-speech greeting if available
        if ('speechSynthesis' in window) {
            const utterance = new SpeechSynthesisUtterance(greeting);
            utterance.rate = 0.95;
            utterance.pitch = 1.14;
            utterance.volume = 0.82;
            window.speechSynthesis.speak(utterance);
        }
    }, [greeting]);

    return {
        greeting,
    };
};
