'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Box, Typography, useMediaQuery } from '@mui/material';
import { HexShape } from './shared/HexShape';
import { THEME_COLORS, SPRING_TRANSITION } from '../theme/constants';
import * as LucideIcons from 'lucide-react';
import { usePortfolioData } from '../context/PortfolioDataContext';

interface Skill {
    name: string;
    icon: string;
}

// ── Adaptive hex size ────────────────────────────────────────────────────────
// All hexagons in a grid are the SAME size — alignment must never break.
// Long names get smaller font + tighter spacing to fit inside the fixed hex.
const HEX_SIZE = { desktop: 95, mobile: 62 };

// Font size scales down based on name length to fit inside the fixed hex
function getLabelFontSize(name: string, isDesktop: boolean): string {
    const len = name.length;
    if (isDesktop) {
        if (len > 18) return '0.38rem';
        if (len > 12) return '0.46rem';
        return '0.58rem';
    } else {
        if (len > 18) return '0.28rem';
        if (len > 12) return '0.34rem';
        return '0.42rem';
    }
}

// ── Icon lookup ──────────────────────────────────────────────────────────────
const getIcon = (iconName: string, size: number = 20) => {
    const icons = LucideIcons as unknown as Record<string, React.ComponentType<{ size?: number }>>;
    const IconComponent = icons[iconName] || LucideIcons.Zap;
    return <IconComponent size={size} />;
};

// ── Hex card ─────────────────────────────────────────────────────────────────
const HexSkillCard = ({ name, icon, color, isMobile }: Skill & { color: string; isMobile: boolean }) => {
    const size = isMobile ? HEX_SIZE.mobile : HEX_SIZE.desktop;
    const fontSize = getLabelFontSize(name, !isMobile);

    return (
        <motion.div
            whileHover={{ scale: 1.12, zIndex: 10, filter: 'brightness(1.2)' }}
            transition={SPRING_TRANSITION}
            style={{
                width: `${size + 6}px`,
                height: `${size + 16}px`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
            }}
        >
            <HexShape
                size={size}
                color={THEME_COLORS.deepNavy}
                stroke={color}
                strokeWidth={2}
            >
                <Box
                    aria-label={name}
                    sx={{ color: 'white', opacity: 0.9, mb: 0.4, display: 'flex' }}
                >
                    {getIcon(icon, isMobile ? 14 : 18)}
                </Box>
                <Typography
                    variant="caption"
                    sx={{
                        fontWeight: 'bold',
                        color: 'white',
                        textAlign: 'center',
                        px: 0.4,
                        fontSize,
                        textTransform: 'uppercase',
                        letterSpacing: 0.2,
                        fontFamily: 'var(--font-space-grotesk)',
                        lineHeight: 1.15,
                        wordBreak: 'break-word',
                        // Constrain to ~70% of hex width so text never bleeds outside
                        maxWidth: `${Math.round(size * 0.70)}px`,
                        display: 'block',
                    }}
                >
                    {name}
                </Typography>
            </HexShape>
        </motion.div>
    );
};

// ── Honeycomb grid ────────────────────────────────────────────────────────────
// Uses the largest hex in each row to set the row's vertical offset so mixed
// sizes still tile correctly.
const HoneycombGrid = ({
    items,
    color,
    rowPattern = [4, 3],
}: {
    items: Skill[];
    color: string;
    rowPattern?: number[];
}) => {
    const isMobile = useMediaQuery('(max-width:600px)');

    // Build rows
    const rows: Skill[][] = [];
    let idx = 0;
    let pi = 0;
    if (rowPattern.length === 0) rowPattern = [4];
    while (idx < items.length) {
        const count = rowPattern[pi % rowPattern.length];
        rows.push(items.slice(idx, idx + count));
        idx += count;
        pi++;
    }

    // Horizontal shift and vertical overlap derived from the fixed hex size
    const baseSize = isMobile ? HEX_SIZE.mobile : HEX_SIZE.desktop;
    const hShift = `${Math.round(baseSize * 0.57)}px`;
    const vOverlap = `${Math.round(baseSize * 0.29)}px`;

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', ml: { xs: 0, md: 2 } }}>
            {rows.map((row, rIdx) => (
                <Box
                    key={rIdx}
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        ml: rIdx % 2 !== 0 ? hShift : '0px',
                        mt: rIdx > 0 ? `-${vOverlap}` : '0px',
                    }}
                >
                    {row.map((skill, sIdx) => (
                        <Box key={sIdx} sx={{ mx: { xs: '0.5px', md: '2px' } }}>
                            <HexSkillCard {...skill} color={color} isMobile={isMobile} />
                        </Box>
                    ))}
                </Box>
            ))}
        </Box>
    );
};

// ── Section ───────────────────────────────────────────────────────────────────
export const SkillsSection = () => {
    const isMobile = useMediaQuery('(max-width:600px)');
    const { skills } = usePortfolioData();

    return (
        <Box
            sx={{
                width: '100%',
                height: 'auto',
                maxHeight: { xs: 'none', md: '75vh' },
                overflowY: { xs: 'visible', md: 'auto' },
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'flex-start',
                scrollbarWidth: 'none',
                '&::-webkit-scrollbar': { display: 'none' },
                WebkitOverflowScrolling: 'touch',
                pr: { md: 4 },
                pt: { xs: 4, md: 0 },
                pb: { xs: 10, md: 10 },
            }}
        >
            <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
            >
                {/* Stacks header */}
                <Box sx={{ display: 'flex', alignItems: 'center', mb: { xs: 2.5, md: 6 }, gap: 2 }}>
                    <Typography
                        variant="h6"
                        component="h2"
                        sx={{
                            color: THEME_COLORS.silver,
                            fontWeight: 300,
                            borderLeft: `3px solid ${THEME_COLORS.royalBlue}`,
                            pl: 2,
                            textTransform: 'uppercase',
                            letterSpacing: isMobile ? 1.5 : 3,
                            fontSize: { xs: '0.75rem', md: '1rem' },
                            fontFamily: 'var(--font-space-grotesk)',
                        }}
                    >
                        Programming Stacks
                    </Typography>
                </Box>

                {/* Stacks grid */}
                <Box sx={{ mb: isMobile ? 4 : 8 }}>
                    <HoneycombGrid
                        items={isMobile ? skills.stacks.slice(0, 12) : skills.stacks}
                        color={THEME_COLORS.royalBlue}
                        rowPattern={isMobile ? [4, 3] : [4, 3, 5]}
                    />
                </Box>

                {/* Tools header */}
                <Box sx={{ mb: { xs: 2.5, md: 6 } }}>
                    <Typography
                        variant="h6"
                        component="h2"
                        sx={{
                            color: THEME_COLORS.silver,
                            fontWeight: 300,
                            borderLeft: `3px solid ${THEME_COLORS.silver}`,
                            pl: 2,
                            textTransform: 'uppercase',
                            letterSpacing: isMobile ? 1.5 : 3,
                            fontSize: { xs: '0.75rem', md: '1rem' },
                            fontFamily: 'var(--font-space-grotesk)',
                        }}
                    >
                        Libraries & Tools
                    </Typography>
                </Box>

                {/* Tools grid */}
                <Box>
                    <HoneycombGrid
                        items={isMobile ? skills.tools.slice(0, 10) : skills.tools}
                        color={THEME_COLORS.silver}
                        rowPattern={isMobile ? [3, 4] : [3, 4, 3]}
                    />
                </Box>
            </motion.div>
        </Box>
    );
};
