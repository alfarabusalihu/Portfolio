import { CSSProperties, ReactNode } from 'react';

export interface HeaderProps {
    title?: string;
    specialtonMode?: boolean;
    onToggleSpecialton?: () => void;
    showTessButton?: boolean;
}

export interface CVModalProps {
    open: boolean;
    onClose: () => void;
}

export interface HexShapeProps {
    size?: number;
    color?: string;
    stroke?: string;
    strokeWidth?: number;
    children?: ReactNode;
    style?: CSSProperties;
    className?: string;
}

export interface LockerGatewayProps {
    onUnlock: () => void;
}
