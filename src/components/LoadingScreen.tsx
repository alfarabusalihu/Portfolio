'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Box, Typography, useTheme, useMediaQuery } from '@mui/material';
import { HexShape } from './shared/HexShape';
import { THEME_COLORS } from '../theme/constants';

interface LoadingScreenProps {
    onComplete: () => void;
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

export default function LoadingScreen({ onComplete }: LoadingScreenProps) {
    const [loadingStep, setLoadingStep] = useState(0);
    const [appState, setAppState] = useState<'loading' | 'pushed' | 'text'>('loading');

    useEffect(() => {
        if (appState === 'loading') {
            const interval = setInterval(() => {
                setLoadingStep(prev => {
                    if (prev >= 6) {
                        clearInterval(interval);
                        setAppState('pushed');
                        return 6;
                    }
                    return prev + 1;
                });
            }, 300);
            return () => clearInterval(interval);
        }
    }, [appState]);

    useEffect(() => {
        if (appState === 'pushed') {
            const timer = setTimeout(() => {
                setAppState('text');
            }, 1200);
            return () => clearTimeout(timer);
        }
        if (appState === 'text') {
            const timer = setTimeout(onComplete, 2500);
            return () => clearTimeout(timer);
        }
    }, [appState, onComplete]);

    const isMobile = useMediaQuery('(max-width:600px)');
    const outerSize = isMobile ? 220 : 300;
    const innerSize = isMobile ? 100 : 150;

    return (
        <Box
            sx={{
                position: 'fixed',
                inset: 0,
                zIndex: 10000,
                backgroundColor: THEME_COLORS.deepNavy,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden'
            }}
        >
            <Box sx={{
                position: 'relative',
                width: isMobile ? '100%' : 600,
                height: isMobile ? '100%' : 400,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
            }}>

                <motion.div
                    initial={{ opacity: 1 }}
                    style={{ position: 'absolute' }}
                >
                    <SegmentedHexagonLoading
                        size={outerSize}
                        color="rgba(192, 192, 192, 0.2)"
                        activeColor={THEME_COLORS.royalBlue}
                        strokeWidth={isMobile ? 3 : 4}
                        progress={loadingStep}
                    />
                </motion.div>

                {appState !== 'loading' && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{
                            opacity: 1,
                            scale: appState === 'pushed' || appState === 'text' ? (isMobile ? 1.2 : 1.5) : 1,
                            x: appState === 'pushed' || appState === 'text' ? (isMobile ? -60 : -100) : 0
                        }}
                        transition={{ duration: 1, type: "spring" }}
                        style={{ position: 'absolute', zIndex: 2 }}
                    >
                        <HexShape
                            size={innerSize}
                            color={THEME_COLORS.silver}
                            stroke={THEME_COLORS.royalBlue}
                            strokeWidth={1}
                        />
                    </motion.div>
                )}

                {appState === 'text' && (
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: isMobile ? 60 : 80 }}
                        transition={{ duration: 0.8 }}
                        style={{ position: 'absolute', width: isMobile ? 200 : 300, textAlign: isMobile ? 'left' : 'inherit' }}
                    >
                        <Typography variant={isMobile ? "h4" : "h3"} fontWeight="900" color="white">
                            Alfar
                        </Typography>
                        <Typography variant={isMobile ? "body1" : "h5"} color={THEME_COLORS.silver} gutterBottom sx={{ letterSpacing: isMobile ? 2 : 4 }}>
                            PORTFOLIO
                        </Typography>
                    </motion.div>
                )}
            </Box>
        </Box>
    );
}
