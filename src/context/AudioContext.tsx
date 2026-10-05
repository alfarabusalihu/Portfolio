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
            console.error('[AudioContext] Audio element not found');
            return;
        }

        console.log(`[AudioContext] Preparing to play: ${projectTitle}`);
        console.log(`[AudioContext] Audio source: ${audioPath}`);

        // Test if URL is accessible
        try {
            const testResponse = await fetch(audioPath, { method: 'HEAD' });
            console.log(`[AudioContext] URL test: ${testResponse.status} ${testResponse.statusText}`);
            console.log(`[AudioContext] Content-Type: ${testResponse.headers.get('content-type')}`);
            console.log(`[AudioContext] Content-Length: ${testResponse.headers.get('content-length')}`);
            
            if (!testResponse.ok) {
                throw new Error(`Audio file not accessible: HTTP ${testResponse.status}`);
            }
        } catch (fetchErr) {
            console.error('[AudioContext] Failed to access audio file:', fetchErr);
            alert(`Could not load audio: ${(fetchErr as Error).message}`);
            setIsAudioPlaying(false);
            setCurrentProject(null);
            return;
        }

        // Stop any existing audio
        audioRef.current.pause();
        audioRef.current.currentTime = 0;

        audioRef.current.src = audioPath;
        setCurrentProject(projectTitle);

        try {
            console.log('[AudioContext] Starting playback...');
            await audioRef.current.play();
            setIsAudioPlaying(true);
            console.log('[AudioContext] Playback started successfully');
        } catch (err) {
            console.error('[AudioContext] Playback failed:', err);
            console.error('[AudioContext] Error details:', {
                name: (err as Error).name,
                message: (err as Error).message,
                audioSrc: audioRef.current.src,
                audioReadyState: audioRef.current.readyState,
                audioNetworkState: audioRef.current.networkState,
            });
            setIsAudioPlaying(false);
            setCurrentProject(null);
            throw err; // Re-throw to let caller handle
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
