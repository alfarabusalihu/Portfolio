'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { Box, Typography, useMediaQuery, CircularProgress } from '@mui/material';
import { HexShape } from './shared/HexShape';
import { THEME_COLORS, SPRING_TRANSITION } from '../theme/constants';
import * as LucideIcons from 'lucide-react';
import { resolveSkillIcon } from '../interfaces/skillIcons';
import type { Skill, SkillsData } from '../interfaces/skillIcons';

// ── Font size — scales down for long names to fit inside the fixed hex ────────
function getLabelFontSize(name: string, isDesktop: boolean): string {
    if (!name) return isDesktop ? '0.58rem' : '0.42rem';
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

// ── Icon lookup ───────────────────────────────────────────────────────────────
const getIcon = (iconName?: string, size: number = 20) => {
    const icons = LucideIcons as unknown as Record<string, React.ComponentType<{ size?: number }>>;
    const IconComponent = (iconName && icons[iconName]) || LucideIcons.Zap;
    return <IconComponent size={size} />;
};

// ── Hex card ──────────────────────────────────────────────────────────────────
const HEX_SIZE = { desktop: 95, mobile: 62 };

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
                <Box aria-label={name} sx={{ color: 'white', opacity: 0.9, mb: 0.4, display: 'flex' }}>
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

    const rows: Skill[][] = [];
    let idx = 0;
    let pi = 0;
    const pattern = rowPattern.length ? rowPattern : [4];
    while (idx < items.length) {
        const count = pattern[pi % pattern.length];
        rows.push(items.slice(idx, idx + count));
        idx += count;
        pi++;
    }

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

// ── Loading skeleton ──────────────────────────────────────────────────────────
const SkillsSkeleton = () => (
    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', py: 8 }}>
        <CircularProgress size={28} sx={{ color: THEME_COLORS.royalBlue, opacity: 0.5 }} />
    </Box>
);

// ── Section ───────────────────────────────────────────────────────────────────
export const SkillsSection = () => {
    const isMobile = useMediaQuery('(max-width:600px)');
    const [data, setData] = useState<SkillsData>({ stacks: [], tools: [] });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let cancelled = false;
        const fetchSkills = async () => {
            try {
                const res = await axios.get<SkillsData>('/api/skills');
                if (!cancelled) {
                    // Resolve icons from the frontend interface map
                    const withIcons = (items: Skill[]) =>
                        items
                            .filter((s) => s.name)
                            .map((s) => ({
                                name: s.name,
                                icon: s.icon || resolveSkillIcon(s.name),
                            }));

                    setData({
                        stacks: withIcons(res.data.stacks || []),
                        tools:  withIcons(res.data.tools  || []),
                    });
                }
            } catch (err) {
                console.error('SkillsSection: failed to fetch /api/skills', err);
            } finally {
                if (!cancelled) setLoading(false);
            }
        };
        fetchSkills();
        return () => { cancelled = true; };
    }, []);

    return (
        <Box
            sx={{
                width: '100%',
                height: 'auto',
                maxHeight: { md: '75vh' },
                overflowY: { xs: 'visible', md: 'auto' },
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'flex-start',
                scrollbarWidth: 'none',
                '&::-webkit-scrollbar': { display: 'none' },
                WebkitOverflowScrolling: 'touch',
                pr: { md: 4 },
                pt: { xs: 6, sm: 6, md: 2 },
                pb: { xs: 18, sm: 18, md: 10 },
            }}
        >
            {loading ? (
                <SkillsSkeleton />
            ) : (
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8 }}
                >
                    {/* ── Programming Stacks ── */}
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

                    <Box sx={{ mb: { xs: 7, sm: 7, md: 8 } }}>
                        <HoneycombGrid
                            items={isMobile ? data.stacks.slice(0, 12) : data.stacks}
                            color={THEME_COLORS.royalBlue}
                            rowPattern={isMobile ? [4, 3] : [4, 3, 5]}
                        />
                    </Box>

                    {/* ── Libraries & Tools ── */}
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
                            Libraries &amp; Tools
                        </Typography>
                    </Box>

                    <Box>
                        <HoneycombGrid
                            items={isMobile ? data.tools.slice(0, 10) : data.tools}
                            color={THEME_COLORS.silver}
                            rowPattern={isMobile ? [3, 4] : [3, 4, 3]}
                        />
                    </Box>
                </motion.div>
            )}
        </Box>
    );
};
