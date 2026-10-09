'use client';

import { useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import type { Mesh, MeshBasicMaterial, Light } from 'three';
import { useAudio } from '../../context/AudioContext';
import { useAudioAnalyzer } from '../../hooks/useAudioAnalyzer';

export const TessPlatform = () => {
    const platformRef = useRef<Mesh>(null);
    const glowRef = useRef<Mesh>(null);
    const beatGlowRef = useRef<Mesh>(null);
    const pointLightRef = useRef<Light>(null);
    const basePlatformScaleRef = useRef<number>(1);
    const lastUpdateTime = useRef<number>(0);
    
    // Smoothing refs for audio-reactive values
    const smoothBeatIntensity = useRef<number>(0);
    const smoothLightIntensity = useRef<number>(0.8);

    const { isAudioPlaying } = useAudio();
    const { initAnalyzer, detectBeat, getFrequencyData } = useAudioAnalyzer();

    // Initialize analyzer when audio starts
    useEffect(() => {
        if (isAudioPlaying) {
            initAnalyzer();
        }
    }, [isAudioPlaying, initAnalyzer]);

    useFrame(({ clock }) => {
        const elapsed = clock.getElapsedTime();
        const deltaTime = 0.016; // ~60fps

        // Re-capture base scale every 5 seconds
        if (elapsed - lastUpdateTime.current > 5 || !basePlatformScaleRef.current) {
            if (platformRef.current) {
                basePlatformScaleRef.current = platformRef.current.scale.x;
            }
            lastUpdateTime.current = elapsed;
        }

        // Subtle breathing effect on platform - smoother
        if (platformRef.current) {
            const breathScale = 1 + Math.sin(elapsed * 0.6) * 0.01; // Reduced from 0.015 to 0.01
            platformRef.current.scale.set(
                basePlatformScaleRef.current * breathScale,
                1,
                basePlatformScaleRef.current * breathScale
            );
        }

        // Golden glow - always breathing (smoother)
        if (glowRef.current) {
            const glowIntensity = 0.65 + Math.sin(elapsed * 1.2) * 0.15; // Smoother oscillation
            const material = glowRef.current.material as MeshBasicMaterial;
            material.opacity = glowIntensity;
        }

        // DARK BEAT GLOW - responds to real beat detection with smoothing
        if (beatGlowRef.current && isAudioPlaying) {
            const isBeat = detectBeat();
            const frequencyData = getFrequencyData();

            // Target intensity - increased for better visibility
            let targetIntensity = frequencyData * 0.4;
            if (isBeat) {
                targetIntensity = 1.0; // Increased from 0.85 to 1.0 for full visibility
            }

            // Smooth interpolation with different speeds for rise/fall
            const lerpSpeed = targetIntensity > smoothBeatIntensity.current ? 0.5 : 0.2; // Faster rise for beat visibility
            smoothBeatIntensity.current += (targetIntensity - smoothBeatIntensity.current) * lerpSpeed;

            const material = beatGlowRef.current.material as MeshBasicMaterial;
            material.opacity = smoothBeatIntensity.current;
        } else if (beatGlowRef.current) {
            // Fade out smoothly when no audio
            smoothBeatIntensity.current *= 0.9;
            const material = beatGlowRef.current.material as MeshBasicMaterial;
            material.opacity = smoothBeatIntensity.current;
        }

        // Audio-reactive point light with smooth transitions
        if (pointLightRef.current && isAudioPlaying) {
            const frequencyData = getFrequencyData();
            const isBeat = detectBeat();

            // Target intensity - increased for better beat visibility
            let targetLightIntensity = 1.0 + frequencyData * 1.0;
            if (isBeat) {
                targetLightIntensity = 3.0; // Increased from 2.2 for more dramatic beat effect
            }

            // Smooth interpolation with faster rise for beats
            const lightLerpSpeed = targetLightIntensity > smoothLightIntensity.current ? 0.5 : 0.2;
            smoothLightIntensity.current += (targetLightIntensity - smoothLightIntensity.current) * lightLerpSpeed;

            pointLightRef.current.intensity = Math.min(smoothLightIntensity.current, 3.5); // Raised ceiling from 2.5
        } else if (pointLightRef.current) {
            // Smooth return to base intensity
            smoothLightIntensity.current += (0.8 - smoothLightIntensity.current) * 0.1;
            pointLightRef.current.intensity = smoothLightIntensity.current;
        }
    });

    return (
        <group position={[0, 0, 0]}>
            {/* Main circular platform - DARK */}
            <mesh
                ref={platformRef}
                rotation-x={-Math.PI / 2}
                position={[0, 0, 0]}
                receiveShadow
            >
                <circleGeometry args={[0.85, 64]} />
                <meshStandardMaterial
                    color="#0a0a0a"
                    metalness={0.4}
                    roughness={0.6}
                    emissive="#0a0a0a"
                    emissiveIntensity={0.2}
                />
            </mesh>

            {/* Golden breathing glow - ALIGNED with platform edge */}
            <mesh
                ref={glowRef}
                rotation-x={-Math.PI / 2}
                position={[0, 0.015, 0]}
            >
                <ringGeometry args={[0.82, 0.88, 64]} />
                <meshBasicMaterial
                    color="#FFD760"
                    transparent
                    opacity={0.65}
                />
            </mesh>

            {/* DARK BEAT PULSE - responds to real audio beats, ALIGNED */}
            <mesh
                ref={beatGlowRef}
                rotation-x={-Math.PI / 2}
                position={[0, 0.02, 0]}
            >
                <ringGeometry args={[0.80, 0.90, 64]} />
                <meshBasicMaterial
                    color="#1a1a1a"
                    transparent
                    opacity={0}
                />
            </mesh>

            {/* Additional inner glow ring - ORANGE/GOLD, ALIGNED */}
            <mesh
                rotation-x={-Math.PI / 2}
                position={[0, 0.01, 0]}
            >
                <ringGeometry args={[0.75, 0.83, 64]} />
                <meshBasicMaterial
                    color="#FFA500"
                    transparent
                    opacity={0.35}
                />
            </mesh>

            {/* Soft shadow underneath Tess */}
            <mesh rotation-x={-Math.PI / 2} position={[0, 0.025, 0]}>
                <circleGeometry args={[0.35, 32]} />
                <meshBasicMaterial
                    color="#000000"
                    transparent
                    opacity={0.25}
                />
            </mesh>

            {/* Ambient light bloom effect - responds to audio smoothly */}
            <pointLight
                ref={pointLightRef}
                position={[0, 0.1, 0]}
                intensity={0.8}
                distance={2.5}
                color="#FFD760"
                decay={2}
            />
        </group>
    );
};
