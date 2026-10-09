'use client';

import React from 'react';
import { Box } from '@mui/material';
import { THEME_COLORS } from '../../theme/constants';
import type { SpinningBorderWrapperProps } from '../../interfaces';

export function SpinningBorderWrapper({ active, children }: SpinningBorderWrapperProps) {
    return (
        <Box
            sx={{
                position: 'relative',
                borderRadius: '17px',
                p: '2px',
                overflow: 'hidden',
                ...(active && {
                    '&::before': {
                        content: '""',
                        position: 'absolute',
                        inset: '-40%',
                        width: '180%',
                        height: '180%',
                        background: `conic-gradient(from 0deg, transparent 0deg, ${THEME_COLORS.royalBlue} 80deg, transparent 100deg)`,
                        animation: 'spinBorderContact 1.2s linear infinite',
                        zIndex: 0,
                    },
                    '@keyframes spinBorderContact': {
                        '0%': { transform: 'rotate(0deg)' },
                        '100%': { transform: 'rotate(360deg)' },
                    },
                    '&::after': {
                        content: '""',
                        position: 'absolute',
                        inset: '2px',
                        borderRadius: '15px',
                        background: THEME_COLORS.royalBlue,
                        zIndex: 0,
                    },
                }),
            }}
        >
            <Box sx={{ position: 'relative', zIndex: 1, width: '100%' }}>{children}</Box>
        </Box>
    );
}
