'use client';

import { useFrame } from '@react-three/fiber';
import { useRef } from 'react';
import type { Group } from 'three';

interface TessAnimationsProps {
    rootRef: React.MutableRefObject<Group | null>;
}

/**
 * TessAnimations - Simplified
 * Only breathing animation (up/down) 
 */
export const TessAnimations = ({ rootRef }: TessAnimationsProps) => {
    const basePositionRef = useRef<number | null>(null);
    
    useFrame(({ clock }) => {
        const elapsed = clock.getElapsedTime();
        const root = rootRef.current;
        if (!root) return;

        // Capture base Y position on first frame
        if (basePositionRef.current === null) {
            basePositionRef.current = root.position.y;
        }

        // Subtle breathing animation (up and down)
        const breathingOffset = Math.sin(elapsed * 1.8) * 0.018;
        root.position.y = basePositionRef.current + breathingOffset;
    });

    return null;
};
