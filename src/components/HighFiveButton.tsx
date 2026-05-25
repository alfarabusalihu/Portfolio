'use client';

import React, { useState, useEffect } from 'react';
import { Box, IconButton, Typography, Tooltip } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import { Hand } from 'lucide-react';
import { THEME_COLORS } from '../theme/constants';

const SESSION_KEY = 'hf_date';

function hasClickedToday(): boolean {
    if (typeof window === 'undefined') return false;
    const stored = localStorage.getItem(SESSION_KEY);
    if (!stored) return false;
    return stored === new Date().toISOString().slice(0, 10);
}

function markClickedToday(): void {
    localStorage.setItem(SESSION_KEY, new Date().toISOString().slice(0, 10));
}

export const HighFiveButton = React.memo(({ btnSize = '46px' }: { btnSize?: string }) => {
    const [count, setCount] = useState<number | null>(null);
    const [hasClicked, setHasClicked] = useState(() => hasClickedToday());
    const [isHovered, setIsHovered] = useState(false);

    useEffect(() => {
        fetch('/api/highfive')
            .then(r => r.json())
            .then(d => setCount(d.count))
            .catch(() => setCount(0));
    }, []);

    const handleHighFive = async () => {
        if (hasClicked) return;
        markClickedToday();
        setHasClicked(true);
        setCount(c => (c ?? 0) + 1);
        try {
            const res = await fetch('/api/highfive', { method: 'POST' });
            const data = await res.json();
            setCount(data.count);
        } catch {
            // optimistic count already applied
        }
    };

    return (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {/* Outer div — no animation, just hover/tap scale */}
            <motion.div
                onHoverStart={() => setIsHovered(true)}
                onHoverEnd={() => setIsHovered(false)}
                whileHover={{ scale: hasClicked ? 1 : 1.05 }}
                whileTap={{ scale: hasClicked ? 1 : 0.95 }}
            >
                <Tooltip title={hasClicked ? 'High-five received!' : 'Give a High-Five!'}>
                    <Box sx={{ position: 'relative' }}>
                        <IconButton
                            onClick={handleHighFive}
                            disabled={hasClicked}
                            aria-label={hasClicked ? 'High-five sentiment shared' : 'Give Alfar a High-Five'}
                            sx={{
                                width: btnSize,
                                height: btnSize,
                                borderRadius: '10px',
                                bgcolor: hasClicked ? 'rgba(0, 191, 255, 0.15)' : 'rgba(255,255,255,0.05)',
                                color: hasClicked ? '#00BFFF' : THEME_COLORS.silver,
                                border: `2px solid ${hasClicked ? '#00BFFF' : 'rgba(192,192,192,0.2)'}`,
                                boxShadow: hasClicked ? '0 0 25px rgba(0,191,255,0.4)' : 'none',
                                transition: 'all 0.5s cubic-bezier(0.4,0,0.2,1)',
                                '&:hover': {
                                    bgcolor: hasClicked ? 'rgba(0,191,255,0.15)' : 'rgba(192,192,192,0.1)',
                                    borderColor: '#00BFFF',
                                },
                                '&.Mui-disabled': { color: '#00BFFF', opacity: 1 },
                            }}
                        >
                            {/* Only the icon pulses — button border/bg stays static */}
                            <motion.div
                                animate={!hasClicked ? { scale: [1, 1.25, 1] } : { scale: 1 }}
                                transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
                                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                            >
                                <Hand size={hasClicked ? 18 : (isHovered ? 17 : 16)} />
                            </motion.div>
                        </IconButton>

                        <AnimatePresence>
                            {hasClicked && (
                                <motion.div
                                    initial={{ opacity: 0, y: 0, scale: 0.5 }}
                                    animate={{ opacity: 1, y: -40, scale: 1.2 }}
                                    exit={{ opacity: 0 }}
                                    transition={{ duration: 0.8 }}
                                    style={{
                                        position: 'absolute',
                                        top: 0,
                                        left: '50%',
                                        translateX: '-50%',
                                        pointerEvents: 'none',
                                        color: THEME_COLORS.royalBlue,
                                        fontWeight: 900,
                                        fontSize: '0.8rem',
                                        whiteSpace: 'nowrap',
                                    }}
                                >
                                    ❤️ +1
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </Box>
                </Tooltip>
            </motion.div>

            <Box sx={{ display: 'flex', flexDirection: 'column', minWidth: '35px' }}>
                <Typography variant="caption" sx={{
                    fontSize: '0.55rem', fontWeight: 900, color: THEME_COLORS.royalBlue,
                    letterSpacing: 1, lineHeight: 1, display: { xs: 'none', md: 'block' }
                }}>
                    HIGH-FIVES
                </Typography>
                <Typography variant="body2" sx={{
                    fontSize: { xs: '0.75rem', md: '0.9rem' }, fontWeight: 900,
                    color: 'white', lineHeight: 1.2
                }}>
                    {count === null ? '—' : count.toLocaleString()}
                </Typography>
            </Box>
        </Box>
    );
});

HighFiveButton.displayName = 'HighFiveButton';
