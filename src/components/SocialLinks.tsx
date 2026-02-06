import React from 'react';
import { Box } from '@mui/material';
import { motion } from 'framer-motion';
import { Mail, Linkedin, Github } from 'lucide-react';
import { THEME_COLORS } from '../theme/constants';
import Link from 'next/link';

const socialLinks = [
    { href: 'mailto:alfarabusalihu@gmail.com', icon: <Mail size={20} />, label: 'Email' },
    { href: 'https://linkedin.com/in/alfarabusalihu', icon: <Linkedin size={20} />, label: 'LinkedIn', external: true },
    { href: 'https://github.com/alfarabusalihu', icon: <Github size={20} />, label: 'GitHub', external: true }
];

export const SocialLinks = () => {
    return (
        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
            {socialLinks.map((link, i) => (
                <Link
                    key={i}
                    href={link.href}
                    target={link.external ? "_blank" : "_self"}
                    rel={link.external ? "noreferrer" : ""}
                    style={{ textDecoration: 'none' }}
                >
                    <Box
                        component={motion.div}
                        whileHover={{ y: -5, scale: 1.1 }}
                        aria-label={link.label}
                        sx={{
                            background: THEME_COLORS.glassBg,
                            backdropFilter: 'blur(5px)',
                            padding: '12px',
                            borderRadius: '12px',
                            display: 'flex',
                            border: `1px solid ${THEME_COLORS.glassBorder}`,
                            color: 'white',
                            cursor: 'pointer'
                        }}
                    >
                        {link.icon}
                    </Box>
                </Link>
            ))}
        </Box>
    );
};
