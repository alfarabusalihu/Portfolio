'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Box, Typography, TextField, Button, useTheme, Snackbar, Alert } from '@mui/material';
import { Mail, Send, CheckCircle2, AlertCircle } from 'lucide-react';
import { THEME_COLORS } from '../theme/constants';

type SendStatus = 'idle' | 'sending' | 'success' | 'error';

// ---------------------------------------------------------------------------
// Spinning border wrapper — reusable for the send button
// ---------------------------------------------------------------------------
function SpinningBorderWrapper({
    active,
    children,
}: {
    active: boolean;
    children: React.ReactNode;
}) {
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

export const ContactSection = () => {
    const [status, setStatus] = useState<SendStatus>('idle');
    const [form, setForm] = useState({ name: '', email: '', message: '' });
    const [snackOpen, setSnackOpen] = useState(false);
    const isSending = status === 'sending';

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (isSending) return;
        setStatus('sending');

        try {
            const res = await fetch('https://formsubmit.co/ajax/alfarabusalihu@gmail.com', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
                body: JSON.stringify({
                    name: form.name,
                    email: form.email,
                    message: form.message,
                    _subject: `Portfolio message from ${form.name}`,
                    _captcha: 'false',
                }),
            });

            if (res.ok) {
                setStatus('success');
                setForm({ name: '', email: '', message: '' });
            } else {
                setStatus('error');
            }
        } catch {
            setStatus('error');
        }

        setSnackOpen(true);
        setTimeout(() => setStatus('idle'), 5000);
    };

    const buttonLabel =
        status === 'sending'
            ? 'Sending…'
            : status === 'success'
                ? 'Message Sent!'
                : status === 'error'
                    ? 'Failed — Try Again'
                    : 'Send Message';

    const buttonIcon =
        status === 'success' ? (
            <CheckCircle2 size={18} />
        ) : status === 'error' ? (
            <AlertCircle size={18} />
        ) : (
            <Send size={18} />
        );

    const buttonColor =
        status === 'success'
            ? '#22C55E'
            : status === 'error'
                ? '#EF4444'
                : THEME_COLORS.royalBlue;

    return (
        <Box
            sx={{
                width: '100%',
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
            }}
        >
            <Box
                component={motion.div}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                sx={{
                    width: '100%',
                    maxWidth: { xs: '100%', sm: '650px' },
                    background: THEME_COLORS.glassBg,
                    backdropFilter: 'blur(10px)',
                    padding: { xs: '24px', md: '30px' },
                    borderRadius: { xs: '24px', md: '32px' },
                    border: `1px solid ${THEME_COLORS.glassBorder}`,
                    boxShadow: '0 10px 40px rgba(0,0,0,0.5)',
                    position: 'relative',
                    mx: { xs: 2, sm: 0 },
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

                    <Box
                        component="form"
                        onSubmit={handleSubmit}
                        sx={{
                            display: 'grid',
                            gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
                            gap: { xs: 2, md: 3 },
                        }}
                    >
                        <TextField
                            fullWidth
                            required
                            label="Name"
                            name="name"
                            value={form.name}
                            onChange={handleChange}
                            variant="outlined"
                            sx={{
                                '& .MuiOutlinedInput-root': {
                                    borderRadius: '12px',
                                    color: 'white',
                                    '& fieldset': { borderColor: THEME_COLORS.glassBorder },
                                    '&:hover fieldset': { borderColor: THEME_COLORS.royalBlue },
                                },
                                '& .MuiInputLabel-root': { color: THEME_COLORS.silver },
                            }}
                        />
                        <TextField
                            fullWidth
                            required
                            type="email"
                            label="Email"
                            name="email"
                            value={form.email}
                            onChange={handleChange}
                            variant="outlined"
                            sx={{
                                '& .MuiOutlinedInput-root': {
                                    borderRadius: '12px',
                                    color: 'white',
                                    '& fieldset': { borderColor: THEME_COLORS.glassBorder },
                                    '&:hover fieldset': { borderColor: THEME_COLORS.royalBlue },
                                },
                                '& .MuiInputLabel-root': { color: THEME_COLORS.silver },
                            }}
                        />
                        <Box sx={{ gridColumn: { sm: 'span 2' } }}>
                            <TextField
                                fullWidth
                                required
                                label="Message"
                                name="message"
                                value={form.message}
                                onChange={handleChange}
                                variant="outlined"
                                multiline
                                rows={3}
                                sx={{
                                    '& .MuiOutlinedInput-root': {
                                        borderRadius: '15px',
                                        color: 'white',
                                        '& fieldset': { borderColor: THEME_COLORS.glassBorder },
                                        '&:hover fieldset': { borderColor: THEME_COLORS.royalBlue },
                                    },
                                    '& .MuiInputLabel-root': { color: THEME_COLORS.silver },
                                }}
                            />
                        </Box>

                        <Box sx={{ gridColumn: { sm: 'span 2' }, mt: 1 }}>
                            <SpinningBorderWrapper active={isSending}>
                                <Button
                                    type="submit"
                                    variant="contained"
                                    size="large"
                                    fullWidth
                                    disabled={isSending}
                                    endIcon={buttonIcon}
                                    sx={{
                                        py: 2,
                                        borderRadius: '15px',
                                        background: buttonColor,
                                        fontWeight: 'bold',
                                        textTransform: 'uppercase',
                                        letterSpacing: 2,
                                        transition: 'all 0.3s ease',
                                        '&:hover': {
                                            background: buttonColor,
                                            transform: isSending ? 'none' : 'scale(1.02)',
                                        },
                                        '&.Mui-disabled': {
                                            background: buttonColor,
                                            color: 'white',
                                            opacity: 0.9,
                                        },
                                    }}
                                >
                                    {buttonLabel}
                                </Button>
                            </SpinningBorderWrapper>
                        </Box>
                    </Box>
                </Box>
            </Box>

            {/* Result notification — top-right */}
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
