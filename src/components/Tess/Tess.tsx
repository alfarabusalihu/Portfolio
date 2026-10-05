'use client';

import { useEffect, useMemo, useState } from 'react';
import { useGLTF } from '@react-three/drei';
import type { Mesh, Object3D } from 'three';

const TESS_MODEL_PATH = '/models/tess-optimized.glb';

export const Tess = ({ partsRef }: { partsRef: React.MutableRefObject<Record<string, Object3D>> }) => {
    const [isReady, setIsReady] = useState(false);
    const gltf = useGLTF(TESS_MODEL_PATH);
    
    const scene = useMemo(() => {
        console.log('🐱 Loading Tess model...');
        const clonedScene = gltf.scene.clone(true);
        
        clonedScene.traverse((object) => {
            const mesh = object as Mesh;
            if (mesh.isMesh) {
                mesh.castShadow = true;
                mesh.receiveShadow = true;
                
                if (mesh.material) {
                    if (Array.isArray(mesh.material)) {
                        mesh.material.forEach(mat => {
                            mat.needsUpdate = false;
                        });
                    } else {
                        mesh.material.needsUpdate = false;
                    }
                }
                
                if (mesh.geometry) {
                    mesh.geometry.computeBoundingSphere();
                }
            }
        });
        
        console.log('🐱 Model loaded and optimized');
        return clonedScene;
    }, [gltf.scene]);

    useEffect(() => {
        const parts: Record<string, Object3D> = {};
        let count = 0;
        
        scene.traverse((object) => {
            if (object.name) {
                parts[object.name] = object;
                count++;
            }
        });
        
        partsRef.current = parts;
        setIsReady(true);
        console.log(`🐱 Tess ready! Found ${count} named parts`);
    }, [partsRef, scene]);

    return <primitive object={scene} />;
};

// Preload model
useGLTF.preload(TESS_MODEL_PATH);
