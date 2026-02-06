'use client';

import React, { useState } from 'react';
import { Button, Box, Typography } from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { CVModal } from './CVModal';

interface HeaderProps {
    title?: string;
}

export const Header = ({ title }: HeaderProps) => {
    const [cvOpen, setCvOpen] = useState(false);

    return (
        <>
            <Box component="nav" sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 1.5, px: 3, position: 'relative', zIndex: 110 }}>
                <Typography
                    variant="h6"
                    sx={{
                        fontWeight: 900,
                        color: 'secondary.main',
                        textTransform: 'uppercase',
                        letterSpacing: 4,
                        opacity: 0.8
                    }}
                >
                    {title || 'Dashboard'}
                </Typography>
                <Button
                    variant="outlined"
                    startIcon={<VisibilityIcon />}
                    onClick={() => setCvOpen(true)}
                    sx={{
                        borderColor: 'primary.main',
                        color: 'primary.main',
                        borderRadius: '50px',
                        px: 3,
                        py: 1,
                        fontWeight: 'bold',
                        textTransform: 'uppercase',
                        letterSpacing: 2,
                        '&:hover': {
                            borderColor: 'secondary.main',
                            color: 'secondary.main',
                            backgroundColor: 'rgba(192, 192, 192, 0.05)',
                            transform: 'translateY(-2px)',
                        },
                        transition: 'all 0.3s ease'
                    }}
                >
                    View CV
                </Button>
            </Box>
            <CVModal open={cvOpen} onClose={() => setCvOpen(false)} />
        </>
    );
};