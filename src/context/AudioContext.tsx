'use client';

import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';

export interface AudioContextType {
    isAudioPlaying: boolean;
    currentProject: string | null;
    playAudio: (projectTitle: string, audioPath: string) => Promise<void>;
    stopAudio: () => void;
    audioRef: React.RefObject<HTMLAudioElement | null>;
}

const AudioContext = createContext<AudioContextType | undefined>(undefined);

export const AudioProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [isAudioPlaying, setIsAudioPlaying] = useState(false);
    const [currentProject, setCurrentProject] = useState<string | null>(null);
    const audioRef = useRef<HTMLAudioElement>(null);

    // Ensure audio element exists in DOM for Web Audio API access
    useEffect(() => {
        if (!audioRef.current) {
            const audio = document.createElement('audio');
            audio.id = 'tess-narrator-audio';
            audio.style.display = 'none';
            audio.crossOrigin = 'anonymous';
            document.body.appendChild(audio);
            audioRef.current = audio;
        }

        return () => {
            // Cleanup on unmount
            if (audioRef.current && audioRef.current.parentNode) {
                audioRef.current.parentNode.removeChild(audioRef.current);
            }
        };
    }, []);

    const playAudio = useCallback(async (projectTitle: string, audioPath: string) => {
        if (!audioRef.current) {
            console.error('Audio element not found');
            return;
        }

        // Test if URL is accessible
        try {
            const testResponse = await fetch(audioPath, { method: 'HEAD' });
            if (!testResponse.ok) {
                throw new Error(`Audio file not accessible: HTTP ${testResponse.status}`);
            }
        } catch (fetchErr) {
            console.error('Failed to access audio file:', fetchErr);
            return;
        }

        // Stop any existing audio
        if (audioRef.current.src) {
            audioRef.current.pause();
            audioRef.current.currentTime = 0;
        }

        audioRef.current.src = audioPath;
        audioRef.current.load();
        setCurrentProject(projectTitle);

        try {
            await audioRef.current.play();
            setIsAudioPlaying(true);
        } catch (err) {
            console.error('Playback failed:', err);
            setIsAudioPlaying(false);
            setCurrentProject(null);
            throw err;
        }
    }, []);

    const stopAudio = useCallback(() => {
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.currentTime = 0;
        }
        setIsAudioPlaying(false);
        setCurrentProject(null);
    }, []);

    // Handle audio end event
    useEffect(() => {
        if (!audioRef.current) return;

        const handleEnded = () => {
            setIsAudioPlaying(false);
            setCurrentProject(null);
        };

        const handleError = () => {
            console.error('Audio playback error');
            setIsAudioPlaying(false);
            setCurrentProject(null);
        };

        audioRef.current.addEventListener('ended', handleEnded);
        audioRef.current.addEventListener('error', handleError);

        return () => {
            if (!audioRef.current) return;
            audioRef.current.removeEventListener('ended', handleEnded);
            audioRef.current.removeEventListener('error', handleError);
        };
    }, []);

    return (
        <AudioContext.Provider value={{ isAudioPlaying, currentProject, playAudio, stopAudio, audioRef }}>
            {children}
        </AudioContext.Provider>
    );
};

export const useAudio = () => {
    const context = useContext(AudioContext);
    if (!context) {
        throw new Error('useAudio must be used within AudioProvider');
    }
    return context;
};
