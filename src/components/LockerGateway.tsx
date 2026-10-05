'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Box, Typography, useMediaQuery } from '@mui/material';
import { HexShape } from './shared/HexShape';
import { THEME_COLORS } from '../theme/constants';

interface LockerGatewayProps {
    onUnlock: () => void;
}

// Rotating border animation component (like Live Sync button)
function HexBorderSweep({ size, active }: { size: number; active: boolean }) {
    if (!active) return null;
    
    return (
        <motion.svg
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            style={{
                position: 'absolute',
                inset: 0,
                width: '100%',
                height: '100%',
                pointerEvents: 'none',
                zIndex: 10,
            }}
            viewBox="0 0 100 100"
        >
            <motion.path
                d="M 50,5 L 90,27.5 L 90,72.5 L 50,95 L 10,72.5 L 10,27.5 Z"
                fill="none"
                stroke={THEME_COLORS.royalBlue}
                strokeWidth={3}
                strokeLinecap="round"
                pathLength={1}
                strokeDasharray="0.15 0.85"
                animate={{ strokeDashoffset: [0, -1] }}
                transition={{
                    duration: 2.5,
                    repeat: Infinity,
                    ease: 'linear',
                }}
                style={{ filter: `drop-shadow(0 0 6px ${THEME_COLORS.royalBlue})` }}
            />
        </motion.svg>
    );
}

export default function LockerGateway({ onUnlock }: LockerGatewayProps) {
    const [loadingComplete, setLoadingComplete] = useState(false);

    // Auto-start: Loading animation runs for 5.5 seconds, then unlocks
    useEffect(() => {
        const timer = setTimeout(() => {
            setLoadingComplete(true);
        }, 3000);

        return () => clearTimeout(timer);
    }, []);

    // Trigger unlock when loading completes
    useEffect(() => {
        if (loadingComplete) {
            // Smooth exit animation before unlock
            const exitTimer = setTimeout(onUnlock, 800);
            return () => clearTimeout(exitTimer);
        }
    }, [loadingComplete, onUnlock]);

    const isMobile = useMediaQuery('(max-width:600px)');
    const hexSize = isMobile ? 280 : 380;
    const borderThickness = 3;

    return (
        <Box
            sx={{
                position: 'fixed',
                inset: 0,
                zIndex: 9999,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden',
                background: '#000000',
                pointerEvents: 'none', // Remove all click interactions
            }}
        >
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{
                    opacity: loadingComplete ? 0 : 1,
                    scale: loadingComplete ? 8 : 1,
                }}
                transition={{ duration: 0.8, ease: [0.43, 0.13, 0.23, 0.96] }}
                style={{
                    position: 'relative',
                    width: hexSize,
                    height: hexSize,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    willChange: 'transform, opacity',
                }}
            >
                {/* Background Hexagon Shape */}
                <div style={{ position: 'relative', width: '100%', height: '100%' }}>
                    <HexShape
                        size={hexSize}
                        color={THEME_COLORS.deepNavy}
                        stroke={THEME_COLORS.silver}
                        strokeWidth={borderThickness}
                    />
                </div>

                {/* Rotating Border Loading Animation (Always visible until unlock) */}
                <div style={{ position: 'absolute', width: '100%', height: '100%', zIndex: 1, pointerEvents: 'none' }}>
                    <HexBorderSweep size={hexSize} active={true} />
                </div>

                {/* Text Content */}
                <Box
                    sx={{
                        position: 'absolute',
                        zIndex: 2,
                        textAlign: 'center',
                        pointerEvents: 'none',
                        maxWidth: '85%'
                    }}
                >
                    <Typography
                        variant={isMobile ? "h5" : "h4"}
                        sx={{
                            fontWeight: 300,
                            color: "white",
                            letterSpacing: isMobile ? 3 : 4,
                            textTransform: 'uppercase',
                            opacity: 0.9,
                            mb: 0.5,
                            fontSize: isMobile ? '1.1rem' : 'inherit'
                        }}
                    >
                        Alfar Abusalihu's
                    </Typography>
                    <Typography
                        variant={isMobile ? "body1" : "h6"}
                        sx={{
                            fontWeight: 700,
                            color: THEME_COLORS.royalBlue,
                            letterSpacing: isMobile ? 5 : 8,
                            textTransform: 'uppercase',
                            opacity: 0.8,
                            fontSize: isMobile ? '0.8rem' : 'inherit'
                        }}
                    >
                        Portfolio
                    </Typography>

                    {/* Loading indicator text */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: [0, 0.6, 0.6, 0] }}
                        transition={{ delay: 0.5, duration: 3, repeat: Infinity, repeatDelay: 1 }}
                    >
                        <Typography
                            sx={{
                                mt: 2,
                                fontSize: isMobile ? '0.55rem' : '0.6rem',
                                letterSpacing: isMobile ? 3 : 4,
                                textTransform: 'uppercase',
                                color: THEME_COLORS.silver,
                                fontWeight: 400,
                            }}
                        >
                            Loading...
                        </Typography>
                    </motion.div>
                </Box>
            </motion.div>
        </Box>
    );
}
