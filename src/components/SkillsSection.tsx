'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Box, Typography } from '@mui/material';
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

const HexSkillCard = ({ name, icon, color }: Skill & { color: string }) => {
    return (
        <motion.div
            whileHover={{ scale: 1.15, zIndex: 10, filter: 'brightness(1.2)' }}
            transition={SPRING_TRANSITION}
            style={{
                width: '100px',
                height: '110px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer'
            }}
        >
            <HexShape
                size={95}
                color={THEME_COLORS.deepNavy}
                stroke={color}
                strokeWidth={2.5}
            >
                <Box aria-label={name} sx={{ color: 'white', opacity: 0.9, mb: 0.5, display: 'flex' }}>
                    {getIcon(icon)}
                </Box>
                <Typography
                    variant="caption"
                    sx={{
                        fontWeight: 'bold',
                        color: 'white',
                        textAlign: 'center',
                        px: 0.5,
                        fontSize: '0.6rem',
                        textTransform: 'uppercase',
                        letterSpacing: 0.5,
                        fontFamily: 'var(--font-space-grotesk)'
                    }}
                >
                    {name}
                </Typography>
            </HexShape>
        </motion.div>
    );
};

const HoneycombGrid = ({ items, color, rowPattern = [4, 3] }: { items: Skill[], color: string, rowPattern?: number[] }) => {
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
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', ml: { md: 2 } }}>
            {rows.map((row, rIdx) => (
                <Box
                    key={rIdx}
                    sx={{
                        display: 'flex',
                        // Shift every other row
                        ml: rIdx % 2 !== 0 ? '55px' : '0px',
                        mt: rIdx > 0 ? '-28px' : '0px'
                    }}
                >
                    {row.map((skill, sIdx) => (
                        <Box key={sIdx} sx={{ mx: '2px' }}>
                            <HexSkillCard {...skill} color={color} />
                        </Box>
                    ))}
                </Box>
            ))}
        </Box>
    );
};

export const SkillsSection = () => {
    const stacks = generatedSkills.stacks;
    const tools = generatedSkills.tools;

    return (
        <Box
            sx={{
                width: '100%',
                height: 'auto',
                maxHeight: '75vh',
                overflowY: 'auto',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'flex-start',
                scrollbarWidth: 'none',
                '&::-webkit-scrollbar': { display: 'none' },
                WebkitOverflowScrolling: 'touch',
                pr: { md: 4 },
                pb: 10
            }}
        >
            <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
            >
                {/* Header & Avatar */}
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 6, gap: 2 }}>
                    <Typography
                        variant="h6"
                        sx={{
                            color: THEME_COLORS.silver,
                            fontWeight: 300,
                            borderLeft: `3px solid ${THEME_COLORS.royalBlue}`,
                            pl: 2,
                            textTransform: 'uppercase',
                            letterSpacing: 3,
                            fontSize: '1rem',
                            fontFamily: 'var(--font-space-grotesk)'
                        }}
                    >
                        Programming Stacks
                    </Typography>
                </Box>

                {/* Stacks Grid */}
                <Box sx={{ mb: 8 }}>
                    <HoneycombGrid items={stacks} color={THEME_COLORS.royalBlue} rowPattern={[4, 3, 5]} />
                </Box>

                {/* Tools Header */}
                <Box sx={{ mb: 6 }}>
                    <Typography
                        variant="h6"
                        sx={{
                            color: THEME_COLORS.silver,
                            fontWeight: 300,
                            borderLeft: `3px solid ${THEME_COLORS.silver}`,
                            pl: 2,
                            textTransform: 'uppercase',
                            letterSpacing: 3,
                            fontSize: '1rem',
                            fontFamily: 'var(--font-space-grotesk)'
                        }}
                    >
                        Libraries & Tools
                    </Typography>
                </Box>

                {/* Tools Grid */}
                <Box>
                    <HoneycombGrid items={tools} color={THEME_COLORS.silver} rowPattern={[3, 4, 3]} />
                </Box>
            </motion.div>
        </Box>
    );
};
