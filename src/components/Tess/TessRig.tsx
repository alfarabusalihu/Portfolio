'use client';

import { useRef } from 'react';
import type { Group } from 'three';
import { Tess } from './Tess';
import { TessAnimations } from './TessAnimations';

export const TessRig = () => {
    const rootRef = useRef<Group | null>(null);
    const partsRef = useRef<Record<string, any>>({});

    return (
        <group ref={rootRef} position={[0, 0.5, 0]} rotation={[0, 1.0, 0]} scale={1.0}>
            <Tess partsRef={partsRef} />
            <TessAnimations rootRef={rootRef} />
        </group>
    );
};
