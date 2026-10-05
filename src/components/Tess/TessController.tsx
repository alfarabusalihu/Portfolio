'use client';

/**
 * TessController - Simplified
 * Removed auto-greeting voice since it's not needed.
 * Voice narrations are now only triggered via speaker buttons on project cards.
 */
export const useTessController = () => {
    const greeting = `Hello! I'm Tess, your project guide. I'll help you discover some amazing projects.`;

    // No auto-voice anymore - speakers on project cards handle audio

    return {
        greeting,
    };
};
