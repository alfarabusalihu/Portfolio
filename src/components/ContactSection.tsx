'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Box, Typography, TextField, Button, useTheme } from '@mui/material';
import { Mail, Send } from 'lucide-react';
import { THEME_COLORS } from '../theme/constants';

export const ContactSection = () => {
    return (
        <Box
            sx={{
                width: '100%',
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
            }}
        >
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                style={{
                    width: '100%',
                    maxWidth: '650px',
                    maxHeight: '85vh',
                    overflowY: 'auto',
                    background: THEME_COLORS.glassBg,
                    backdropFilter: 'blur(10px)',
                    padding: '40px',
                    borderRadius: '32px',
                    border: `1px solid ${THEME_COLORS.glassBorder}`,
                    boxShadow: '0 10px 40px rgba(0,0,0,0.5)',
                    position: 'relative',
                    scrollbarWidth: 'none'
                }}
            >
                {/* Background Accent */}
                <Box sx={{
                    position: 'absolute',
                    top: -50,
                    right: -50,
                    width: 150,
                    height: 150,
                    background: `radial-gradient(circle, ${THEME_COLORS.royalBlue} 0%, transparent 70%)`,
                    opacity: 0.1,
                    zIndex: 0
                }} />

                <Box sx={{ position: 'relative', zIndex: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
                        <Mail size={32} color={THEME_COLORS.royalBlue} />
                        <Typography variant="h4" sx={{ fontWeight: 900, color: 'white', textTransform: 'uppercase', letterSpacing: 2 }}>
                            Get In <span style={{ color: THEME_COLORS.royalBlue }}>Touch</span>
                        </Typography>
                    </Box>

                    <Typography variant="body2" sx={{ mb: 4, color: THEME_COLORS.silver, opacity: 0.8, fontSize: '1rem', maxWidth: '100%' }}>
                        I'm always open to discussing new projects, creative ideas or opportunities to be part of your visions.
                    </Typography>

                    <Box component="form" sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 3 }}>
                        <TextField
                            fullWidth
                            label="Name"
                            variant="outlined"
                            sx={{
                                '& .MuiOutlinedInput-root': {
                                    borderRadius: '12px',
                                    color: 'white',
                                    '& fieldset': { borderColor: THEME_COLORS.glassBorder },
                                    '&:hover fieldset': { borderColor: THEME_COLORS.royalBlue },
                                }
                            }}
                        />
                        <TextField
                            fullWidth
                            label="Email"
                            variant="outlined"
                            sx={{
                                '& .MuiOutlinedInput-root': {
                                    borderRadius: '12px',
                                    color: 'white',
                                    '& fieldset': { borderColor: THEME_COLORS.glassBorder },
                                    '&:hover fieldset': { borderColor: THEME_COLORS.royalBlue },
                                }
                            }}
                        />
                        <Box sx={{ gridColumn: { sm: 'span 2' } }}>
                            <TextField
                                fullWidth
                                label="Message"
                                variant="outlined"
                                multiline
                                rows={4}
                                sx={{
                                    '& .MuiOutlinedInput-root': {
                                        borderRadius: '15px',
                                        color: 'white',
                                        '& fieldset': { borderColor: THEME_COLORS.glassBorder },
                                        '&:hover fieldset': { borderColor: THEME_COLORS.royalBlue },
                                    }
                                }}
                            />
                        </Box>

                        <Box sx={{ gridColumn: { sm: 'span 2' }, mt: 1 }}>
                            <Button
                                variant="contained"
                                size="large"
                                fullWidth
                                endIcon={<Send size={18} />}
                                href="mailto:alfarabusalihu@gmail.com"
                                sx={{
                                    py: 2,
                                    borderRadius: '15px',
                                    background: THEME_COLORS.royalBlue,
                                    fontWeight: 'bold',
                                    textTransform: 'uppercase',
                                    letterSpacing: 2,
                                    '&:hover': {
                                        background: THEME_COLORS.royalBlue,
                                        transform: 'scale(1.02)'
                                    },
                                    transition: 'all 0.3s ease'
                                }}
                            >
                                Send Message
                            </Button>
                        </Box>
                    </Box>
                </Box>
            </motion.div>
        </Box>
    );
};
