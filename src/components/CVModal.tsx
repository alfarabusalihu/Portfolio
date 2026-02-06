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
                    height: '90vh',
                    bgcolor: '#0f172a',
                    color: 'white',
                    border: `1px solid ${THEME_COLORS.silver}40`,
                    borderRadius: 4,
                    overflow: 'hidden'
                }
            }}
        >
            <DialogTitle component="div" sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                borderBottom: `1px solid ${THEME_COLORS.silver}20`,
                px: 3,
                py: 2
            }}>
                <Typography variant="h6" sx={{ fontWeight: 900, letterSpacing: 2, textTransform: 'uppercase', color: THEME_COLORS.silver }}>
                    Curriculum Vitae
                </Typography>
                <Tooltip title="Close">
                    <IconButton onClick={onClose} size="small" sx={{ color: 'white', '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' } }}>
                        <CloseIcon />
                    </IconButton>
                </Tooltip>
            </DialogTitle>
            <DialogContent sx={{ p: 0, height: '100%', bgcolor: '#000' }}>
                <Box sx={{ width: '100%', height: '100%', overflow: 'hidden' }}>
                    <iframe
                        src="/cv.pdf"
                        title="CV Viewer"
                        width="100%"
                        height="100%"
                        style={{ border: 'none', display: 'block' }}
                    />
                </Box>
            </DialogContent>
        </Dialog>
    );
};
