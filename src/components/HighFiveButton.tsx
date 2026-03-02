'use client';

import React, { useState, useEffect } from 'react';
import { Box, IconButton, Typography, Tooltip, Zoom, useMediaQuery } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import { Hand } from 'lucide-react';
import { THEME_COLORS } from '../theme/constants';

// For demo purposes, we'll use a local counter if no API is provided.
// In professional use, this would call a Supabase/Upstash endpoint.
const STORAGE_KEY = 'portfolio_high_five_clicked';
const COUNT_KEY = 'portfolio_high_five_count';

export const HighFiveButton = () => {
    const [count, setCount] = useState(0);
    const [hasClicked, setHasClicked] = useState(false);
    const [isHovered, setIsHovered] = useState(false);

    // Using a reliable public counter namespace (based on repo name)
    const namespace = 'alfarabus_portfolio';
    const key = 'high_fives';

    const isMobile = useMediaQuery('(max-width:600px)');

    useEffect(() => {
        const checkClicked = () => {
            const clicked = localStorage.getItem(STORAGE_KEY) === 'true';
            setHasClicked(clicked);
        };

        const fetchCount = () => {
            // CountAPI is permanently down. Using a base count + local simulation.
            // In production, consider Supabase, Upstash, or Firebase.
            const baseCount = 142;
            const localSaved = parseInt(localStorage.getItem(COUNT_KEY) || '0');
            setCount(baseCount + localSaved);
        };

        checkClicked();
        fetchCount();
    }, []);

    const handleHighFive = async () => {
        if (hasClicked) return;

        const prevCount = count;
        setCount(prevCount + 1);
        setHasClicked(true);
        localStorage.setItem(STORAGE_KEY, 'true');

        // CountAPI is down. We'll simulate the "global" count by incrementing a local value.
        // This ensures the user sees their interaction reflected without console errors.
        const currentLocal = parseInt(localStorage.getItem(COUNT_KEY) || '0');
        localStorage.setItem(COUNT_KEY, (currentLocal + 1).toString());
    };

    return (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <motion.div
                onHoverStart={() => setIsHovered(true)}
                onHoverEnd={() => setIsHovered(false)}
                whileHover={{ scale: hasClicked ? 1 : 1.1 }}
                whileTap={{ scale: hasClicked ? 1 : 0.9 }}
            >
                <Tooltip title={hasClicked ? "High-five received!" : "Give a High-Five!"}>
                    <Box sx={{ position: 'relative' }}>
                        <motion.div
                            animate={!hasClicked ? { scale: [1, 1.15, 1] } : {}}
                            transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
                        >
                            <IconButton
                                onClick={handleHighFive}
                                disabled={hasClicked}
                                aria-label={hasClicked ? "High-five sentiment shared" : "Give Alfar a High-Five"}
                                sx={{
                                    width: { xs: 40, md: 55 },
                                    height: { xs: 40, md: 55 },
                                    bgcolor: hasClicked ? 'rgba(0, 191, 255, 0.15)' : 'rgba(255, 255, 255, 0.05)',
                                    color: hasClicked ? '#00BFFF' : THEME_COLORS.silver,
                                    border: `2px solid ${hasClicked ? '#00BFFF' : 'rgba(192, 192, 192, 0.2)'}`,
                                    boxShadow: hasClicked ? '0 0 25px rgba(0, 191, 255, 0.4)' : 'none',
                                    transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
                                    '&:hover': {
                                        bgcolor: hasClicked ? 'rgba(0, 191, 255, 0.15)' : 'rgba(192, 192, 192, 0.1)',
                                        borderColor: '#00BFFF',
                                    },
                                    '&.Mui-disabled': {
                                        color: '#00BFFF',
                                        opacity: 1
                                    }
                                }}
                            >
                                <Hand size={isMobile ? (hasClicked ? 20 : 18) : (hasClicked ? 30 : (isHovered ? 28 : 24))} />
                            </IconButton>
                        </motion.div>

                        {/* Success Particles - Simplified */}
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
                                        whiteSpace: 'nowrap'
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
                <Typography
                    variant="caption"
                    sx={{
                        fontSize: '0.55rem',
                        fontWeight: 900,
                        color: THEME_COLORS.royalBlue,
                        letterSpacing: 1,
                        lineHeight: 1,
                        display: { xs: 'none', md: 'block' }
                    }}
                >
                    HIGH-FIVES
                </Typography>
                <Typography
                    variant="body2"
                    sx={{
                        fontSize: { xs: '0.75rem', md: '0.9rem' },
                        fontWeight: 900,
                        color: 'white',
                        lineHeight: 1.2
                    }}
                >
                    {count.toLocaleString()}
                </Typography>
            </Box>
        </Box>
    );
};
