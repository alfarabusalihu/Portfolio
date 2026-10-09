'use client';

import { Suspense, useEffect } from 'react';
import { Box } from '@mui/material';
import { Canvas, useThree } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import { motion } from 'framer-motion';
import { TessRig } from './TessRig';
import { TessLighting } from './TessLighting';
import { TessPlatform } from './TessPlatform';
import { useTessController } from './TessController';
import { THEME_COLORS } from '../../theme/constants';

const CameraSetup = () => {
    const { camera } = useThree();
    
    useEffect(() => {
        // Make camera look at Tess's approximate position
        camera.lookAt(0, 0.6, 0);
        camera.updateProjectionMatrix();
    }, [camera]);
    
    return null;
};

export const TessStage = () => {
    const { greeting } = useTessController();

    return (
        <Box
            sx={{
                position: 'relative',
                width: '100%',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden',
                background: THEME_COLORS.deepNavy,
                '& canvas': {
                    background: 'transparent !important',
                }
            }}
        >
            {/* Radiant Border Overlay - Left edge white to dark blue fade */}
            <Box
                sx={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    pointerEvents: 'none',
                    background: `linear-gradient(90deg, rgba(255, 255, 255, 0.12) 0%, rgba(76, 114, 198, 0.04) 15%, transparent 30%)`,
                    zIndex: 2,
                }}
            />

            {/* TESS Title - HTML Overlay */}
            <Box
                component={motion.div}
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                sx={{
                    position: 'absolute',
                    top: '5%',
                    zIndex: 10,
                    textAlign: 'center',
                }}
            >
                <Box
                    component="h2"
                    sx={{
                        fontWeight: 900,
                        color: '#2b2a2aff',
                        fontFamily: '"Segoe UI", system-ui, -apple-system, sans-serif',
                        textTransform: 'uppercase',
                        letterSpacing: { xs: 4, sm: 6, md: 8, lg: 10 },
                        fontSize: { xs: '1.3rem', sm: '1.6rem', md: '1.7rem', lg: '2.4rem' },
                        textShadow: 'inset 0 2px 4px rgba(0, 0, 0, 0.7), 0 1px 1px rgba(255, 255, 255, 0.15)',
                        mb: 0.5,
                        m: 0,
                    }}
                >
                    TESS
                </Box>
                <Box
                    component="p"
                    sx={{
                        fontWeight: 700,
                        color: '#707070',
                        fontFamily: '"Segoe UI", system-ui, -apple-system, sans-serif',
                        textTransform: 'uppercase',
                        letterSpacing: { xs: 2, md: 4 },
                        fontSize: { xs: '0.65rem', sm: '0.7rem', md: '0.75rem' },
                        textShadow: 'inset 0 1px 2px rgba(0, 0, 0, 0.5)',
                        opacity: 1,
                        m: 0,
                        mb: 1,
                    }}
                >
                    AI Project Guide
                </Box>
                
                {/* Work in Progress Note */}
                <Box
                    component={motion.div}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.6, delay: 0.6 }}
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                        justifyContent: 'center',
                        fontSize: '0.65rem',
                        fontWeight: 600,
                        color: '#909090',
                        letterSpacing: 1,
                        textTransform: 'uppercase',
                    }}
                >
                    <Box
                        sx={{
                            width: '8px',
                            height: '8px',
                            borderRadius: '50%',
                            background: '#22C55E',
                            flexShrink: 0,
                        }}
                    />
                    Making Tess Move • Work In Progress
                </Box>
            </Box>

            {/* 3D Canvas */}
            <Canvas
                shadows
                dpr={[1, 1.75]}
                camera={{ 
                    position: [2, 1.2, 2.5], 
                    fov: 55,
                    near: 0.1,
                    far: 100
                }}
                gl={{ 
                    antialias: true, 
                    alpha: true, 
                    powerPreference: 'high-performance',
                    preserveDrawingBuffer: true,
                }}
                style={{ 
                    position: 'absolute', 
                    inset: 0,
                    background: 'transparent',
                }}
            >
                <color attach="background" args={['#000000']} />
                <CameraSetup />
                <Suspense fallback={<Html center style={{ color: '#FFD760', fontWeight: 900, fontSize: 12 }}>Loading Tess...</Html>}>
                    <TessLighting />
                    <TessPlatform />
                    <TessRig />
                </Suspense>
            </Canvas>
        </Box>
    );
};
