import { useRef, useCallback, useState } from 'react';
import { useAudio } from '../context/AudioContext';

export const useAudioAnalyzer = () => {
    const analyserRef = useRef<AnalyserNode | null>(null);
    const dataArrayRef = useRef<Uint8Array | null>(null);
    const audioContextRef = useRef<AudioContext | null>(null);
    const sourceRef = useRef<MediaElementAudioSourceNode | null>(null);
    const [beatDetected, setBeatDetected] = useState(false);
    const lastBeatTimeRef = useRef<number>(0);
    const frequencyDataRef = useRef<number>(0);
    const { audioRef } = useAudio();

    const initAnalyzer = useCallback((audioElement?: HTMLAudioElement) => {
        try {
            // Use provided element or fallback to context audio
            const element = audioElement || audioRef.current;
            if (!element) {
                console.warn('No audio element available');
                return;
            }

            // Create audio context
            if (!audioContextRef.current) {
                audioContextRef.current = new (window.AudioContext || 
                    (window as any).webkitAudioContext)();
            }

            const ctx = audioContextRef.current;

            // Resume context if suspended (required by some browsers)
            if (ctx.state === 'suspended') {
                ctx.resume().catch(e => console.warn('Could not resume audio context:', e));
            }

            // Create analyser if not exists
            if (!analyserRef.current) {
                analyserRef.current = ctx.createAnalyser();
                analyserRef.current.fftSize = 256;
                analyserRef.current.smoothingTimeConstant = 0.8;
                dataArrayRef.current = new Uint8Array(analyserRef.current.frequencyBinCount);
            }

            // Connect audio element to analyser
            if (!sourceRef.current) {
                try {
                    sourceRef.current = ctx.createMediaElementSource(element);
                    sourceRef.current.connect(analyserRef.current);
                    analyserRef.current.connect(ctx.destination);
                    console.log('✅ Audio analyzer initialized with element:', element.src);
                } catch (e) {
                    console.log('⚠️ Audio source already connected or error:', e);
                }
            }
        } catch (e) {
            console.error('❌ Failed to initialize audio analyzer:', e);
        }
    }, [audioRef]);

    const detectBeat = useCallback((): boolean => {
        if (!analyserRef.current || !dataArrayRef.current) return false;

        try {
            // Get frequency data
            (analyserRef.current as any).getByteFrequencyData(dataArrayRef.current);

            // Detect voice/narration frequencies (80-250Hz range)
            // These indices roughly correspond to voice frequencies
            const voiceFrequencies = dataArrayRef.current.slice(3, 12);
            const voiceAverage = voiceFrequencies.reduce((a, b) => a + b, 0) / voiceFrequencies.length;

            // Store current frequency for smooth animations
            frequencyDataRef.current = voiceAverage;

            // Beat threshold - tune this based on your audio
            // Range: 0-255 (lower = more sensitive)
            const threshold = 100;
            const isBeat = voiceAverage > threshold;

            // Prevent multiple beat detections within 150ms
            const now = Date.now();
            if (isBeat && now - lastBeatTimeRef.current > 150) {
                lastBeatTimeRef.current = now;
                setBeatDetected(true);
                // Reset beat flag after 80ms
                setTimeout(() => setBeatDetected(false), 80);
                return true;
            }

            return false;
        } catch (e) {
            console.warn('Audio analyzer not ready');
            return false;
        }
    }, []);

    const getFrequencyData = useCallback((): number => {
        return frequencyDataRef.current / 255; // Normalize 0-1
    }, []);

    return {
        initAnalyzer,
        detectBeat,
        beatDetected,
        getFrequencyData,
        analyser: analyserRef.current,
    };
};
