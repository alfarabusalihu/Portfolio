import React from 'react';
import { Box, Dialog, DialogContent, DialogTitle, IconButton, Tooltip, Typography } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { THEME_COLORS } from '../theme/constants';

interface CVModalProps {
    open: boolean;
    onClose: () => void;
}

export const CVModal = ({ open, onClose }: CVModalProps) => {
    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="lg"
            fullWidth
            PaperProps={{
                sx: {
                    height: { xs: '95vh', md: '90vh' },
                    width: '100vw',
                    bgcolor: '#000',
                    color: 'white',
                    border: `1px solid ${THEME_COLORS.silver}20`,
                    borderRadius: { xs: 0, md: 3 },
                    overflow: 'hidden',
                    m: { xs: 0, md: 2 }
                }
            }}
        >
            <DialogTitle component="div" sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                px: 2,
                py: 1,
                minHeight: '48px',
                bgcolor: '#0f172a'
            }}>
                <Typography variant="body2" sx={{ fontWeight: 900, letterSpacing: 1, textTransform: 'uppercase', color: THEME_COLORS.silver, fontSize: '0.7rem' }}>
                    Curriculum Vitae
                </Typography>
                <IconButton onClick={onClose} size="small" sx={{ color: 'white', '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' } }}>
                    <CloseIcon sx={{ fontSize: '1.2rem' }} />
                </IconButton>
            </DialogTitle>
            <DialogContent sx={{ p: 0, height: '100%', overflow: 'hidden' }}>
                <Box sx={{ width: '100%', height: '100%', display: 'flex' }}>
                    <iframe
                        src="/cv.pdf"
                        title="CV Viewer"
                        width="100%"
                        height="100%"
                        style={{ border: 'none' }}
                    />
                </Box>
            </DialogContent>
        </Dialog>
    );
};
