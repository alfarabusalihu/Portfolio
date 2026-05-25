'use client';

import React, { useState } from 'react';
import { Button, Box, Typography, useMediaQuery } from '@mui/material';
import { motion } from 'framer-motion';
import { FileText } from 'lucide-react';
import { CVModal } from './CVModal';
import { HighFiveButton } from './HighFiveButton';
import ManualAnalysisButton from './ManualAnalysisButton';
import { THEME_COLORS } from '../theme/constants';

interface HeaderProps {
    title?: string;
}

// Uniform button size used across all three header buttons
const BTN_SIZE_MOBILE = '38px';
const BTN_SIZE_DESKTOP = '46px';

export const Header = ({ title }: HeaderProps) => {
    const isMobile = useMediaQuery('(max-width:600px)');
    const [cvOpen, setCvOpen] = useState(false);

    return (
        <>
            <Box component="nav" sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                py: 1.5,
                px: { xs: 2.5, md: 4 },
                position: 'relative',
                zIndex: 110,
                background: 'rgba(0, 8, 20, 0.4)',
                backdropFilter: 'blur(10px)',
                borderBottom: '1px solid rgba(255, 255, 255, 0.05)'
            }}>
                {/* Left — section title */}
                <motion.div
                    key={title}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <Typography
                        variant="h6"
                        component="h2"
                        sx={{
                            fontWeight: 900,
                            color: 'secondary.main',
                            textTransform: 'uppercase',
                            letterSpacing: { xs: 2, md: 4 },
                            opacity: 0.8,
                            fontSize: { xs: '0.85rem', md: '1.1rem' }
                        }}
                    >
                        {title || 'Dashboard'}
                    </Typography>
                </motion.div>

                {/* Right — buttons: View CV | Live Sync | High Five */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1, md: 1.5 } }}>

                    {/* View CV */}
                    <Button
                        onClick={() => setCvOpen(true)}
                        aria-label="View Curriculum Vitae"
                        startIcon={<FileText size={15} />}
                        sx={{
                            height: isMobile ? BTN_SIZE_MOBILE : BTN_SIZE_DESKTOP,
                            borderRadius: '10px',
                            bgcolor: 'rgba(65, 105, 225, 0.08)',
                            color: THEME_COLORS.royalBlue,
                            border: `2px solid ${THEME_COLORS.royalBlue}50`,
                            backdropFilter: 'blur(10px)',
                            px: isMobile ? 1.5 : 2,
                            minWidth: 0,
                            fontSize: '0.7rem',
                            fontWeight: 900,
                            letterSpacing: 1.5,
                            textTransform: 'uppercase',
                            whiteSpace: 'nowrap',
                            transition: 'border-color 0.3s ease, box-shadow 0.3s ease, background-color 0.3s ease',
                            '&:hover': {
                                bgcolor: 'rgba(0, 191, 255, 0.1)',
                                borderColor: '#00BFFF',
                                boxShadow: '0 0 10px rgba(0,191,255,0.25)',
                            },
                        }}
                    >
                        {isMobile ? 'CV' : 'View CV'}
                    </Button>

                    {/* Live Sync */}
                    <ManualAnalysisButton btnSize={isMobile ? BTN_SIZE_MOBILE : BTN_SIZE_DESKTOP} />

                    {/* High Five — far right */}
                    <HighFiveButton btnSize={isMobile ? BTN_SIZE_MOBILE : BTN_SIZE_DESKTOP} />
                </Box>
            </Box>
            <CVModal open={cvOpen} onClose={() => setCvOpen(false)} />
        </>
    );
};
