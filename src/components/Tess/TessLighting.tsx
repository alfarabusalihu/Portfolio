'use client';

import { Environment } from '@react-three/drei';

export const TessLighting = () => (
    <>
        {/* Ambient base light */}
        <ambientLight intensity={0.7} />
        
        {/* Key light - main illumination from front-left */}
        <directionalLight 
            position={[-3, 5, 4]} 
            intensity={2.2} 
            castShadow 
            shadow-mapSize-width={1024} 
            shadow-mapSize-height={1024}
            shadow-camera-far={15}
            shadow-camera-left={-5}
            shadow-camera-right={5}
            shadow-camera-top={5}
            shadow-camera-bottom={-5}
        />
        
        {/* Fill light - warm accent from right */}
        <pointLight 
            position={[2.4, 2.2, 2.4]} 
            intensity={2.4} 
            color="#ffd76b" 
            distance={5} 
            decay={2}
        />
        
        {/* Rim light - cool backlight for depth */}
        <spotLight 
            position={[0, 3.2, -2.5]} 
            angle={0.5} 
            penumbra={0.8} 
            intensity={1.5} 
            color="#6f8cff"
            castShadow
        />
        
        {/* Eye highlight - focused light to emphasize eyes */}
        <pointLight 
            position={[0, 1.2, 2.8]} 
            intensity={1.8} 
            distance={3.5} 
            color="#090303ff"
        />
        
        {/* HDRI environment for realistic reflections - using warehouse for darker setting */}
        <Environment preset="warehouse" environmentIntensity={0.35} />
    </>
);
