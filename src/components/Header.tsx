'use client';

import React, { useState } from 'react';
import { Button, Box, Typography, useMediaQuery } from '@mui/material';
import { motion } from 'framer-motion';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { CVModal } from './CVModal';
import { HighFiveButton } from './HighFiveButton';

interface HeaderProps {
    title?: string;
}

export const Header = ({ title }: HeaderProps) => {
    const isMobile = useMediaQuery('(max-width:600px)');
    const [cvOpen, setCvOpen] = useState(false);
    const [isHovered, setIsHovered] = useState(false);

    return (
        <>
            <Box component="nav" sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                py: 2,
                px: { xs: 2.5, md: 4 },
                position: 'relative',
                zIndex: 110,
                background: 'rgba(0, 8, 20, 0.4)',
                backdropFilter: 'blur(10px)',
                borderBottom: '1px solid rgba(255, 255, 255, 0.05)'
            }}>
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
                            fontSize: { xs: '0.9rem', md: '1.25rem' }
                        }}
                    >
                        {title || 'Dashboard'}
                    </Typography>
                </motion.div>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1.5, md: 3 } }}>
                    <Button
                        component={motion.button}
                        onClick={() => setCvOpen(true)}
                        onHoverStart={() => setIsHovered(true)}
                        onHoverEnd={() => setIsHovered(false)}
                        whileHover={{ scale: 1.05, translateY: -2 }}
                        whileTap={{ scale: 0.95 }}
                        aria-label="View Curriculum Vitae"
                        sx={{
                            borderColor: 'primary.main',
                            color: 'primary.main',
                            borderRadius: '50px',
                            minWidth: isMobile ? '40px' : 'auto',
                            width: isMobile ? '40px' : 'auto',
                            height: isMobile ? '40px' : 'auto',
                            px: isMobile ? 0 : { xs: 2, md: 3 },
                            py: isMobile ? 0 : { xs: 0.5, md: 1 },
                            fontSize: { xs: '0.7rem', md: '0.875rem' },
                            fontWeight: 900,
                            border: '1px solid',
                            textTransform: 'uppercase',
                            letterSpacing: { xs: 1, md: 2 },
                            '&:hover': {
                                borderColor: 'secondary.main',
                                color: 'secondary.main',
                                backgroundColor: 'rgba(192, 192, 192, 0.05)',
                            },
                        }}
                    >
                        {isMobile ? <VisibilityIcon sx={{ fontSize: '1.2rem' }} /> : 'View CV'}
                    </Button>

                    <HighFiveButton />
                </Box>
            </Box>
            <CVModal open={cvOpen} onClose={() => setCvOpen(false)} />
        </>
    );
};