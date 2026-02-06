'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Box, Typography, useTheme, useMediaQuery } from '@mui/material';
import { HexShape } from './shared/HexShape';
import { THEME_COLORS } from '../theme/constants';

interface LockerGatewayProps {
    onUnlock: () => void;
}

const SegmentedHexagonLoading = ({ size, color, activeColor, strokeWidth, progress }: { size: number, color: string, activeColor: string, strokeWidth: number, progress: number }) => {
    const points = [
        { x1: 50, y1: 0, x2: 95, y2: 25 },
        { x1: 95, y1: 25, x2: 95, y2: 75 },
        { x1: 95, y1: 75, x2: 50, y2: 100 },
        { x1: 50, y1: 100, x2: 5, y2: 75 },
        { x1: 5, y1: 75, x2: 5, y2: 25 },
        { x1: 5, y1: 25, x2: 50, y2: 0 }
    ];

    return (
        <div style={{ width: size, height: size, position: 'relative' }}>
            <svg width="100%" height="100%" viewBox="0 0 100 100" style={{ overflow: 'visible' }}>
                {points.map((p, index) => {
                    const isActive = index < progress;
                    return (
                        <motion.line
                            key={index}
                            x1={p.x1} y1={p.y1}
                            x2={p.x2} y2={p.y2}
                            stroke={isActive ? activeColor : color}
                            strokeWidth={strokeWidth}
                            initial={{ stroke: color }}
                            animate={{ stroke: isActive ? activeColor : color }}
                            transition={{ duration: 0.2 }}
                            strokeLinecap="round"
                        />
                    );
                })}
            </svg>
        </div>
    );
};

export default function LockerGateway({ onUnlock }: LockerGatewayProps) {
    const theme = useTheme();
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
                            color: THEME_COLORS.royalBlue, // Silver
                            letterSpacing: isMobile ? 5 : 8,
                            textTransform: 'uppercase',
                            opacity: 0.8,
                            fontSize: isMobile ? '0.8rem' : 'inherit'
                        }}
                    >
                        Portfolio
                    </Typography>
                </Box>

            </motion.div>
        </Box>
    );
}
