'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Box, Typography, Snackbar, Alert } from '@mui/material';
import { Mail } from 'lucide-react';
import { THEME_COLORS } from '../../theme/constants';
import { ContactForm } from './ContactForm';
import type { SendStatus } from '../../interfaces';

export const ContactSection = () => {
    const [status, setStatus] = useState<SendStatus>('idle');
    const [snackOpen, setSnackOpen] = useState(false);

    return (
        <Box
            sx={{
                width: '100%',
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                py: { xs: 4, md: 8 },
                px: { xs: 2, sm: 4, md: 6 },
            }}
        >
            <Box
                component={motion.div}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                sx={{
                    width: '100%',
                    maxWidth: { xs: '100%', sm: '90%', md: '700px', lg: '800px' },
                    background: THEME_COLORS.glassBg,
                    backdropFilter: 'blur(10px)',
                    padding: { xs: '24px', md: '40px' },
                    borderRadius: { xs: '24px', md: '32px' },
                    border: `1px solid ${THEME_COLORS.glassBorder}`,
                    boxShadow: '0 10px 40px rgba(0,0,0,0.5)',
                    position: 'relative',
                    mx: 'auto',
                }}
            >
                {/* Background Accent */}
                <Box
                    sx={{
                        position: 'absolute',
                        top: -50,
                        right: -50,
                        width: 150,
                        height: 150,
                        background: `radial-gradient(circle, ${THEME_COLORS.royalBlue} 0%, transparent 70%)`,
                        opacity: 0.1,
                        zIndex: 0,
                    }}
                />

                <Box sx={{ position: 'relative', zIndex: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: { xs: 2, md: 3 } }}>
                        <Mail size={24} color={THEME_COLORS.royalBlue} />
                        <Typography
                            variant="h4"
                            component="h2"
                            sx={{
                                fontWeight: 900,
                                color: 'white',
                                textTransform: 'uppercase',
                                letterSpacing: 2,
                                fontSize: { xs: '1.25rem', md: '1.75rem' },
                            }}
                        >
                            Get In <span style={{ color: THEME_COLORS.royalBlue }}>Touch</span>
                        </Typography>
                    </Box>

                    <Typography
                        variant="body2"
                        sx={{
                            mb: { xs: 2, md: 3 },
                            color: THEME_COLORS.silver,
                            opacity: 0.8,
                            fontSize: { xs: '0.8rem', md: '0.9rem' },
                            maxWidth: '100%',
                        }}
                    >
                        I&apos;m always open to discussing new projects, creative ideas or opportunities to be part of your visions.
                    </Typography>

                    <ContactForm status={status} setStatus={setStatus} setSnackOpen={setSnackOpen} />
                </Box>
            </Box>

            {/* Notification Snackbar */}
            <Snackbar
                open={snackOpen}
                autoHideDuration={5000}
                onClose={() => setSnackOpen(false)}
                anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
                sx={{ zIndex: 9999, mt: { xs: 8, md: 2 } }}
            >
                <Alert
                    severity={status === 'success' ? 'success' : 'error'}
                    onClose={() => setSnackOpen(false)}
                    sx={{
                        bgcolor: 'rgba(0, 8, 20, 0.96)',
                        backdropFilter: 'blur(20px)',
                        border: `1px solid ${status === 'success' ? '#22C55E40' : '#EF444440'}`,
                        color: 'white',
                        '& .MuiAlert-icon': { color: 'inherit' },
                        borderRadius: '14px',
                        boxShadow: '0 16px 48px rgba(0,0,0,0.6)',
                    }}
                >
                    <Typography sx={{ fontWeight: 700, fontSize: '0.85rem', mb: 0.3 }}>
                        {status === 'success' ? '✅ Message sent!' : '⚠️ Message failed to send.'}
                    </Typography>
                    <Typography sx={{ fontSize: '0.75rem', opacity: 0.75 }}>
                        {status === 'success'
                            ? "I'll get back to you as soon as possible."
                            : 'Please try again or email me directly.'}
                    </Typography>
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default ContactSection;
