'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Box, Typography, useMediaQuery } from '@mui/material';
import { HexShape } from './shared/HexShape';
import { SegmentedHexagonLoading } from './shared/SegmentedHexagonLoading';
import { THEME_COLORS } from '../theme/constants';

interface LockerGatewayProps {
    onUnlock: () => void;
}

export default function LockerGateway({ onUnlock }: LockerGatewayProps) {
    const [status, setStatus] = useState<'idle' | 'loading' | 'exiting'>('idle');
    const [loadStep, setLoadStep] = useState(0);

    const handleInteraction = () => {
        if (status === 'idle') {
            setStatus('loading');
        }
    };

    useEffect(() => {
        if (status === 'loading') {
            const interval = setInterval(() => {
                setLoadStep(prev => {
                    if (prev >= 6) {
                        clearInterval(interval);
                        setTimeout(() => setStatus('exiting'), 400);
                        return 6;
                    }
                    return prev + 1;
                });
            }, 250); // Slightly faster loading
            return () => clearInterval(interval);
        }
    }, [status]);

    useEffect(() => {
        if (status === 'exiting') {
            const timer = setTimeout(onUnlock, 800);
            return () => clearTimeout(timer);
        }
    }, [status, onUnlock]);

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
                background: '#000000'
            }}
        >
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{
                    opacity: status === 'exiting' ? 0 : 1,
                    scale: status === 'exiting' ? 8 : 1,
                }}
                transition={{ duration: 0.8, ease: [0.43, 0.13, 0.23, 0.96] }}
                onClick={handleInteraction}
                whileHover={status === 'idle' ? {
                    scale: 1.02,
                    filter: `drop-shadow(0px 0px 25px rgba(65, 105, 225, 0.4))` // Royal Blue glow
                } : {}}
                style={{
                    cursor: status === 'idle' ? 'pointer' : 'default',
                    position: 'relative',
                    width: hexSize,
                    height: hexSize,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    willChange: 'transform, opacity'
                }}
            >
                {/* Pulse ring hint — fades in after 1s to signal clickability */}
                {status === 'idle' && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 1, duration: 0.6 }}
                        style={{
                            position: 'absolute',
                            width: '100%',
                            height: '100%',
                            zIndex: 0,
                            pointerEvents: 'none',
                        }}
                    >
                        <motion.div
                            animate={{ scale: [1, 1.08, 1], opacity: [0.4, 0.15, 0.4] }}
                            transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
                            style={{
                                position: 'absolute',
                                inset: -8,
                                borderRadius: '50%',
                                background: `radial-gradient(circle, ${THEME_COLORS.royalBlue}30 0%, transparent 70%)`,
                            }}
                        />
                    </motion.div>
                )}

                {/* Background Shape */}
                <div style={{ position: 'relative', width: '100%', height: '100%' }}>
                    <HexShape
                        size={hexSize}
                        color={THEME_COLORS.deepNavy}
                        stroke={THEME_COLORS.silver}
                        strokeWidth={borderThickness}
                    />
                </div>

                {/* Blue Loading Animation Overlay */}
                {status !== 'idle' && (
                    <div style={{ position: 'absolute', width: '100%', height: '100%', zIndex: 1, pointerEvents: 'none' }}>
                        <SegmentedHexagonLoading
                            size={hexSize}
                            color="rgba(192, 192, 192, 0.1)" // Faint Silver
                            activeColor={THEME_COLORS.royalBlue} // Royal Blue
                            strokeWidth={borderThickness}
                            progress={loadStep}
                        />
                    </div>
                )}

                {/* Elegant Text */}
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

                    {/* Press hint — fades in after 1.5s, pulses */}
                    {status === 'idle' && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: [0, 0.5, 0.5, 0] }}
                            transition={{ delay: 1.5, duration: 3, repeat: Infinity, repeatDelay: 2 }}
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
                                Click
                            </Typography>
                        </motion.div>
                    )}
                </Box>

            </motion.div>
        </Box>
    );
}
