'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Box, Typography, useMediaQuery } from '@mui/material';
import { HexShape } from './shared/HexShape';
import { THEME_COLORS, SPRING_TRANSITION } from '../theme/constants';
import * as LucideIcons from 'lucide-react';
import generatedSkills from '../data/generated-skills.json'; // Import the JSON

interface Skill {
    name: string;
    icon: string; // Changed to string for JSON compatibility
}

// Icon Mapping Function
const getIcon = (iconName: string, size: number = 20) => {
    const IconComponent = (LucideIcons as any)[iconName] || LucideIcons.Zap;
    return <IconComponent size={size} />;
};

const HexSkillCard = ({ name, icon, color, size = 95 }: Skill & { color: string, size?: number }) => {
    return (
        <motion.div
            whileHover={{ scale: 1.15, zIndex: 10, filter: 'brightness(1.2)' }}
            transition={SPRING_TRANSITION}
            style={{
                width: `${size + 5}px`,
                height: `${size + 15}px`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer'
            }}
        >
            <HexShape
                size={size}
                color={THEME_COLORS.deepNavy}
                stroke={color}
                strokeWidth={size > 80 ? 2.5 : 2}
            >
                <Box aria-label={name} sx={{ color: 'white', opacity: 0.9, mb: size > 80 ? 0.5 : 0.2, display: 'flex' }}>
                    {getIcon(icon, size > 80 ? 20 : 16)}
                </Box>
                <Typography
                    variant="caption"
                    sx={{
                        fontWeight: 'bold',
                        color: 'white',
                        textAlign: 'center',
                        px: { xs: 0.25, md: 0.5 },
                        fontSize: size > 80 ? '0.6rem' : '0.42rem',
                        textTransform: 'uppercase',
                        letterSpacing: { xs: 0.2, md: 0.5 },
                        fontFamily: 'var(--font-space-grotesk)',
                        lineHeight: 1.1
                    }}
                >
                    {name}
                </Typography>
            </HexShape>
        </motion.div>
    );
};

const HoneycombGrid = ({ items, color, rowPattern = [4, 3] }: { items: Skill[], color: string, rowPattern?: number[] }) => {
    const isMobile = useMediaQuery('(max-width:600px)');
    const cardSize = isMobile ? 65 : 100;
    const hexSize = isMobile ? 60 : 95;
    const horizontalShift = isMobile ? '32px' : '55px';
    const verticalShift = isMobile ? '-14px' : '-28px';

    const rows: Skill[][] = [];
    let currentItem = 0;
    let patternIdx = 0;

    // Safety: prevent infinite loops if pattern is empty
    if (rowPattern.length === 0) rowPattern = [4];

    while (currentItem < items.length) {
        const count = rowPattern[patternIdx % rowPattern.length];
        rows.push(items.slice(currentItem, currentItem + count));
        currentItem += count;
        patternIdx++;
    }

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', ml: { xs: 0, md: 2 } }}>
            {rows.map((row, rIdx) => (
                <Box
                    key={rIdx}
                    sx={{
                        display: 'flex',
                        // Shift every other row
                        ml: rIdx % 2 !== 0 ? horizontalShift : '0px',
                        mt: rIdx > 0 ? verticalShift : '0px'
                    }}
                >
                    {row.map((skill, sIdx) => (
                        <Box key={sIdx} sx={{ mx: { xs: '0.5px', md: '2px' } }}>
                            <HexSkillCard {...skill} color={color} size={hexSize} />
                        </Box>
                    ))}
                </Box>
            ))}
        </Box>
    );
};

export const SkillsSection = () => {
    const isMobile = useMediaQuery('(max-width:600px)');
    const stacks = generatedSkills.stacks;
    const tools = generatedSkills.tools;

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
                pb: { xs: 10, md: 10 }
            }}
        >
            <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
            >
                {/* Header & Avatar */}
                <Box sx={{ display: 'flex', alignItems: 'center', mb: { xs: 2.5, md: 6 }, gap: 2 }}>
                    <Typography
                        variant="h6"
                        sx={{
                            color: THEME_COLORS.silver,
                            fontWeight: 300,
                            borderLeft: `3px solid ${THEME_COLORS.royalBlue}`,
                            pl: 2,
                            textTransform: 'uppercase',
                            letterSpacing: isMobile ? 1.5 : 3,
                            fontSize: { xs: '0.75rem', md: '1rem' },
                            fontFamily: 'var(--font-space-grotesk)'
                        }}
                    >
                        Programming Stacks
                    </Typography>
                </Box>

                {/* Stacks Grid */}
                <Box sx={{ mb: isMobile ? 4 : 8 }}>
                    <HoneycombGrid items={isMobile ? stacks.slice(0, 12) : stacks} color={THEME_COLORS.royalBlue} rowPattern={isMobile ? [4, 3] : [4, 3, 5]} />
                </Box>

                {/* Tools Header */}
                <Box sx={{ mb: { xs: 2.5, md: 6 } }}>
                    <Typography
                        variant="h6"
                        sx={{
                            color: THEME_COLORS.silver,
                            fontWeight: 300,
                            borderLeft: `3px solid ${THEME_COLORS.silver}`,
                            pl: 2,
                            textTransform: 'uppercase',
                            letterSpacing: isMobile ? 1.5 : 3,
                            fontSize: { xs: '0.75rem', md: '1rem' },
                            fontFamily: 'var(--font-space-grotesk)'
                        }}
                    >
                        Libraries & Tools
                    </Typography>
                </Box>

                {/* Tools Grid */}
                <Box>
                    <HoneycombGrid items={isMobile ? tools.slice(0, 10) : tools} color={THEME_COLORS.silver} rowPattern={isMobile ? [3, 4] : [3, 4, 3]} />
                </Box>
            </motion.div>
        </Box>
    );
};
