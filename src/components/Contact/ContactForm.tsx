'use client';

import React, { useState } from 'react';
import { Box, Typography, TextField, Button } from '@mui/material';
import { Send, CheckCircle2, AlertCircle } from 'lucide-react';
import { THEME_COLORS } from '../../theme/constants';
import { SpinningBorderWrapper } from './SpinningBorderWrapper';
import type { SendStatus, ContactFormData, ContactFormErrors } from '../../interfaces';

interface ContactFormProps {
    status: SendStatus;
    setStatus: React.Dispatch<React.SetStateAction<SendStatus>>;
    setSnackOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

export const ContactForm = ({ status, setStatus, setSnackOpen }: ContactFormProps) => {
    const [form, setForm] = useState<ContactFormData>({ name: '', email: '', message: '' });
    const [errors, setErrors] = useState<ContactFormErrors>({ name: '', email: '', message: '' });
    const isSending = status === 'sending';

    const validateForm = () => {
        const newErrors: ContactFormErrors = { name: '', email: '', message: '' };
        let isValid = true;

        if (!form.name.trim()) {
            newErrors.name = 'Name is required';
            isValid = false;
        } else if (form.name.trim().length < 2) {
            newErrors.name = 'Name must be at least 2 characters';
            isValid = false;
        }

        if (!form.email.trim()) {
            newErrors.email = 'Email is required';
            isValid = false;
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
            newErrors.email = 'Please enter a valid email address';
            isValid = false;
        }

        if (!form.message.trim()) {
            newErrors.message = 'Message is required';
            isValid = false;
        } else if (form.message.trim().length < 10) {
            newErrors.message = 'Message must be at least 10 characters';
            isValid = false;
        }

        setErrors(newErrors);
        return isValid;
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
        if (errors[name as keyof ContactFormErrors]) {
            setErrors((prev) => ({ ...prev, [name]: '' }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!validateForm()) return;
        if (isSending) return;

        setStatus('sending');

        try {
            const res = await fetch('/api/contact', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form),
            });

            if (res.ok) {
                await new Promise(resolve => setTimeout(resolve, 3000));
                setStatus('success');
                setForm({ name: '', email: '', message: '' });
                setErrors({ name: '', email: '', message: '' });
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
            component="form"
            onSubmit={handleSubmit}
            sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
                gap: { xs: 2, md: 3 },
            }}
        >
            <Box>
                <TextField
                    fullWidth
                    required
                    label="Name"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    variant="outlined"
                    error={!!errors.name}
                    sx={{
                        '& .MuiOutlinedInput-root': {
                            borderRadius: '12px',
                            color: 'white',
                            '& fieldset': { 
                                borderColor: errors.name ? '#EF4444' : THEME_COLORS.glassBorder 
                            },
                            '&:hover fieldset': { 
                                borderColor: errors.name ? '#EF4444' : THEME_COLORS.royalBlue 
                            },
                            '&.Mui-focused fieldset': {
                                borderColor: errors.name ? '#EF4444' : THEME_COLORS.royalBlue,
                            }
                        },
                        '& .MuiInputLabel-root': { color: THEME_COLORS.silver },
                    }}
                />
                {errors.name && (
                    <Typography sx={{ mt: 0.75, fontSize: '0.75rem', color: '#EF4444', fontWeight: 500 }}>
                        {errors.name}
                    </Typography>
                )}
            </Box>
            
            <Box>
                <TextField
                    fullWidth
                    required
                    type="email"
                    label="Email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    variant="outlined"
                    error={!!errors.email}
                    sx={{
                        '& .MuiOutlinedInput-root': {
                            borderRadius: '12px',
                            color: 'white',
                            '& fieldset': { 
                                borderColor: errors.email ? '#EF4444' : THEME_COLORS.glassBorder 
                            },
                            '&:hover fieldset': { 
                                borderColor: errors.email ? '#EF4444' : THEME_COLORS.royalBlue 
                            },
                            '&.Mui-focused fieldset': {
                                borderColor: errors.email ? '#EF4444' : THEME_COLORS.royalBlue,
                            }
                        },
                        '& .MuiInputLabel-root': { color: THEME_COLORS.silver },
                    }}
                />
                {errors.email && (
                    <Typography sx={{ mt: 0.75, fontSize: '0.75rem', color: '#EF4444', fontWeight: 500 }}>
                        {errors.email}
                    </Typography>
                )}
            </Box>
            
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
                    error={!!errors.message}
                    sx={{
                        '& .MuiOutlinedInput-root': {
                            borderRadius: '15px',
                            color: 'white',
                            '& fieldset': { 
                                borderColor: errors.message ? '#EF4444' : THEME_COLORS.glassBorder 
                            },
                            '&:hover fieldset': { 
                                borderColor: errors.message ? '#EF4444' : THEME_COLORS.royalBlue 
                            },
                            '&.Mui-focused fieldset': {
                                borderColor: errors.message ? '#EF4444' : THEME_COLORS.royalBlue,
                            }
                        },
                        '& .MuiInputLabel-root': { color: THEME_COLORS.silver },
                    }}
                />
                {errors.message && (
                    <Typography sx={{ mt: 0.75, fontSize: '0.75rem', color: '#EF4444', fontWeight: 500 }}>
                        {errors.message}
                    </Typography>
                )}
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
    );
};
