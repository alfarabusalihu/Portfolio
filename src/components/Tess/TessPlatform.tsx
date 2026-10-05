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

    const { isAudioPlaying } = useAudio();
    const { initAnalyzer, detectBeat, getFrequencyData } = useAudioAnalyzer();

    // Initialize analyzer when audio starts
    useEffect(() => {
        if (isAudioPlaying) {
            // Initialize with the audio element from context (in DOM)
            initAnalyzer();
        }
    }, [isAudioPlaying, initAnalyzer]);

    useFrame(({ clock }) => {
        const elapsed = clock.getElapsedTime();

        // Re-capture base scale every 5 seconds
        if (elapsed - lastUpdateTime.current > 5 || !basePlatformScaleRef.current) {
            if (platformRef.current) {
                basePlatformScaleRef.current = platformRef.current.scale.x;
            }
            lastUpdateTime.current = elapsed;
        }

        // Subtle breathing effect on platform
        if (platformRef.current) {
            const breathScale = 1 + Math.sin(elapsed * 0.8) * 0.015;
            platformRef.current.scale.set(
                basePlatformScaleRef.current * breathScale,
                1,
                basePlatformScaleRef.current * breathScale
            );
        }

        // Golden glow - always breathing
        if (glowRef.current) {
            const glowIntensity = 0.6 + Math.sin(elapsed * 1.5) * 0.2;
            const material = glowRef.current.material as MeshBasicMaterial;
            material.opacity = glowIntensity;
        }

        // DARK BEAT GLOW - responds to real beat detection
        if (beatGlowRef.current && isAudioPlaying) {
            const isBeat = detectBeat();
            const frequencyData = getFrequencyData();

            // Blend beat pulse with frequency data for smooth response
            let beatIntensity = frequencyData * 0.3; // Smooth background glow from frequency
            if (isBeat) {
                beatIntensity = 0.9; // Sharp pulse on beat
            }

            const material = beatGlowRef.current.material as MeshBasicMaterial;
            material.opacity = beatIntensity;
        } else if (beatGlowRef.current) {
            // No audio - hide dark beat glow
            const material = beatGlowRef.current.material as MeshBasicMaterial;
            material.opacity = 0;
        }

        // Audio-reactive point light
        if (pointLightRef.current && isAudioPlaying) {
            const frequencyData = getFrequencyData();
            const isBeat = detectBeat();

            // Base intensity + frequency response
            let lightIntensity = 0.8 + frequencyData * 1.0;
            if (isBeat) {
                lightIntensity = 2.0; // Spike on beat
            }

            pointLightRef.current.intensity = Math.min(lightIntensity, 2.5);
        } else if (pointLightRef.current) {
            pointLightRef.current.intensity = 0.8;
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

            {/* Golden breathing glow - always visible */}
            <mesh
                ref={glowRef}
                rotation-x={-Math.PI / 2}
                position={[0, 0.02, 0]}
            >
                <ringGeometry args={[0.8, 0.9, 64]} />
                <meshBasicMaterial
                    color="#FFD760"
                    transparent
                    opacity={0.8}
                />
            </mesh>

            {/* DARK BEAT PULSE - responds to real audio beats */}
            <mesh
                ref={beatGlowRef}
                rotation-x={-Math.PI / 2}
                position={[0, 0.025, 0]}
            >
                <ringGeometry args={[0.78, 0.92, 64]} />
                <meshBasicMaterial
                    color="#1a1a1a"
                    transparent
                    opacity={0}
                />
            </mesh>

            {/* Additional inner glow ring - ORANGE/GOLD */}
            <mesh
                rotation-x={-Math.PI / 2}
                position={[0, 0.01, 0]}
            >
                <ringGeometry args={[0.73, 0.82, 64]} />
                <meshBasicMaterial
                    color="#FFA500"
                    transparent
                    opacity={0.4}
                />
            </mesh>

            {/* Soft shadow underneath Tess */}
            <mesh rotation-x={-Math.PI / 2} position={[0, 0.03, 0]}>
                <circleGeometry args={[0.35, 32]} />
                <meshBasicMaterial
                    color="#000000"
                    transparent
                    opacity={0.3}
                />
            </mesh>

            {/* Ambient light bloom effect - responds to audio */}
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
