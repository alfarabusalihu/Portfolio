'use client';

import { Box, Typography, Button, useMediaQuery } from '@mui/material';
import Image from 'next/image';
import { useState } from 'react';
import { THEME_COLORS } from '../theme/constants';
import { Github, Globe, ChevronDown, ChevronUp, Image as ImageIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import projectsData from '../data/projects.json';

interface Project {
    title: string;
    description: string;
    image: string;
    link: string;
    websiteLink?: string;
    tags: string[];
}

const projects = projectsData as Project[];

const ProjectCard = ({ project }: { project: Project }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [showImage, setShowImage] = useState(false);
    const isMobile = useMediaQuery('(max-width:600px)');

    return (
        <Box component="article" sx={{ height: 'auto', minHeight: isMobile ? '120px' : '180px' }}>
            <motion.div
                layout
                style={{
                    height: '100%',
                    background: THEME_COLORS.glassBg,
                    borderRadius: isMobile ? '16px' : '24px',
                    border: `1px solid ${THEME_COLORS.silver}40`,
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column',
                    position: 'relative',
                    boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
                    backdropFilter: 'blur(10px)'
                }}
            >
                {/* Image Overlay (Desktop Only) */}
                {!isMobile && (
                    <AnimatePresence>
                        {showImage && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                style={{
                                    position: 'absolute',
                                    top: 0,
                                    left: 0,
                                    width: '100%',
                                    height: '100%',
                                    zIndex: 50,
                                    background: '#000',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}
                            >
                                <Box sx={{ position: 'relative', width: '100%', height: '100%' }}>
                                    <Image
                                        src={project.image}
                                        alt={project.title}
                                        fill
                                        style={{ objectFit: 'contain' }}
                                        unoptimized
                                        onError={(e: any) => {
                                            e.currentTarget.src = '/loading sample.png';
                                        }}
                                    />
                                    <Button
                                        onClick={() => setShowImage(false)}
                                        sx={{
                                            position: 'absolute',
                                            top: 10,
                                            right: 10,
                                            color: 'white',
                                            bgcolor: 'rgba(0,0,0,0.5)',
                                            '&:hover': { bgcolor: 'rgba(0,0,0,0.8)' }
                                        }}
                                    >
                                        Close
                                    </Button>
                                </Box>
                            </motion.div>
                        )}
                    </AnimatePresence>
                )}

                <Box sx={{ p: { xs: 2.5, md: 3 }, flex: 1, display: 'flex', flexDirection: 'column' }}>
                    {/* Header Row */}
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1, gap: 1 }}>
                        <Typography
                            variant="h6"
                            sx={{
                                fontWeight: 900,
                                color: THEME_COLORS.royalBlue,
                                textTransform: 'uppercase',
                                fontFamily: 'var(--font-space-grotesk)',
                                fontSize: { xs: '0.9rem', md: '1.1rem' },
                                letterSpacing: 1
                            }}
                        >
                            {project.title}
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 0.5, flexShrink: 0 }}>
                            {!isMobile && (
                                <Button
                                    size="small"
                                    onClick={() => setShowImage(true)}
                                    sx={{ minWidth: 0, p: 0.5, color: THEME_COLORS.silver }}
                                    aria-label="View Screenshot"
                                >
                                    <ImageIcon size={16} />
                                </Button>
                            )}
                            <Button
                                size="small"
                                onClick={() => setIsExpanded(!isExpanded)}
                                sx={{ minWidth: 0, p: 0.5, color: THEME_COLORS.royalBlue }}
                            >
                                {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                            </Button>
                        </Box>
                    </Box>

                    {/* Expandable Description */}
                    <motion.div
                        initial={false}
                        animate={{ height: isExpanded ? 'auto' : (isMobile ? '60px' : '40px') }}
                        transition={{ duration: 0.3 }}
                        style={{ overflow: 'hidden', marginBottom: '12px' }}
                    >
                        <Typography
                            variant="body2"
                            sx={{
                                color: THEME_COLORS.silver,
                                lineHeight: 1.5,
                                fontSize: { xs: '0.8rem', md: '0.85rem' },
                                opacity: 0.8,
                                display: isExpanded ? 'block' : '-webkit-box',
                                WebkitLineClamp: isMobile ? 3 : 2,
                                WebkitBoxOrient: 'vertical',
                                overflow: 'hidden'
                            }}
                        >
                            {project.description}
                        </Typography>
                    </motion.div>

                    {/* Tags */}
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 3 }}>
                        {project.tags.map(tag => (
                            <Typography
                                key={tag}
                                sx={{
                                    fontSize: '0.55rem',
                                    px: 1,
                                    py: 0.25,
                                    bgcolor: 'rgba(65, 105, 225, 0.05)',
                                    color: THEME_COLORS.royalBlue,
                                    borderRadius: '4px',
                                    border: `1px solid rgba(65, 105, 225, 0.15)`,
                                    fontWeight: 700,
                                    textTransform: 'uppercase'
                                }}
                            >
                                {tag}
                            </Typography>
                        ))}
                    </Box>

                    {/* Links Row - Always Visible */}
                    <Box sx={{ display: 'flex', gap: 1.5, mt: 'auto', visibility: (isMobile && isExpanded) ? 'hidden' : 'visible', height: (isMobile && isExpanded) ? 0 : 'auto' }}>
                        <Button
                            component="a"
                            href={project.link}
                            target="_blank"
                            rel="noreferrer"
                            startIcon={<Github size={14} />}
                            sx={{
                                color: 'white',
                                fontWeight: 800,
                                fontSize: '0.7rem',
                                letterSpacing: 1,
                                bgcolor: 'rgba(255,255,255,0.05)',
                                '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' },
                                px: 2,
                                minWidth: '90px'
                            }}
                        >
                            REPO
                        </Button>
                        {project.websiteLink && (
                            <Button
                                component="a"
                                href={project.websiteLink}
                                target="_blank"
                                rel="noreferrer"
                                startIcon={<Globe size={14} />}
                                sx={{
                                    color: THEME_COLORS.royalBlue,
                                    fontWeight: 800,
                                    fontSize: '0.7rem',
                                    letterSpacing: 1,
                                    bgcolor: 'rgba(65, 105, 225, 0.05)',
                                    border: `1px solid rgba(65, 105, 225, 0.25)`,
                                    '&:hover': { bgcolor: 'rgba(65, 105, 225, 0.15)' },
                                    px: 2,
                                    minWidth: '90px'
                                }}
                            >
                                LIVE
                            </Button>
                        )}
                    </Box>
                </Box>
            </motion.div>
        </Box>
    );
};

export const ProjectsSection = () => {
    return (
        <Box sx={{ width: '100%', py: { xs: 2, md: 4 }, display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
            <Box
                sx={{
                    display: 'grid',
                    gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' },
                    gap: { xs: 2, md: 3 },
                    overflowY: 'auto',
                    pt: 2,
                    pb: { xs: 12, md: 8 },
                    px: { xs: 1, md: 4 },
                    height: '100%',
                    scrollbarWidth: 'none',
                    '&::-webkit-scrollbar': { display: 'none' },
                    WebkitOverflowScrolling: 'touch'
                }}
            >
                {projects.map((p, idx) => (
                    <ProjectCard key={idx} project={p} />
                ))}
            </Box>
        </Box>
    );
};
