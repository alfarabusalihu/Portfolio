import React from 'react';
import { Box, useMediaQuery } from '@mui/material';
import { motion } from 'framer-motion';
import { Mail, Linkedin, Github } from 'lucide-react';
import { THEME_COLORS } from '../theme/constants';
import Link from 'next/link';

const socialLinks = [
    { href: 'mailto:alfarabusalihu@gmail.com', icon: (size: number) => <Mail size={size} />, label: 'Email' },
    { href: 'https://linkedin.com/in/alfarabusalihu', icon: (size: number) => <Linkedin size={size} />, label: 'LinkedIn', external: true },
    { href: 'https://github.com/alfarabusalihu', icon: (size: number) => <Github size={size} />, label: 'GitHub', external: true }
];

export const SocialLinks = () => {
    const isMobile = useMediaQuery('(max-width:600px)');
    const iconSize = isMobile ? 18 : 20;

    return (
        <Box sx={{
            display: 'flex',
            gap: { xs: 1.5, sm: 2 },
            justifyContent: 'center',
            alignItems: 'center',
            mt: { xs: 1, md: 1.5 }
        }}>
            {socialLinks.map((link, i) => (
                <Link
                    key={i}
                    href={link.href}
                    target={link.external ? "_blank" : "_self"}
                    rel={link.external ? "noopener noreferrer" : ""}
                    aria-label={`Visit my ${link.label} profile`}
                    style={{ textDecoration: 'none' }}
                >
                    <Box
                        component={motion.div}
                        whileHover={{ y: -4, scale: 1.08 }}
                        aria-hidden="true"
                        sx={{
                            background: THEME_COLORS.glassBg,
                            backdropFilter: 'blur(5px)',
                            px: { xs: 1.5, sm: 2 },
                            py: { xs: 1, sm: 1.25 },
                            borderRadius: '12px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            border: `1px solid ${THEME_COLORS.glassBorder}`,
                            color: 'white',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                            '&:hover': {
                                borderColor: THEME_COLORS.royalBlue,
                                color: THEME_COLORS.royalBlue,
                                boxShadow: '0 4px 15px rgba(65, 105, 225, 0.2)'
                            }
                        }}
                    >
                        {link.icon(iconSize)}
                    </Box>
                </Link>
            ))}
        </Box>
    );
};
