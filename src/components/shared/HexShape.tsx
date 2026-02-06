import React from 'react';

interface HexShapeProps {
    size: number;
    color: string;
    stroke: string;
    strokeWidth: number;
    children?: React.ReactNode;
    style?: React.CSSProperties;
}

export const HexShape = ({ size, color, stroke, strokeWidth, children, style }: HexShapeProps) => {
    return (
        <div
            style={{
                width: size,
                height: size,
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                ...style
            }}
        >
            <svg
                width={size}
                height={size}
                viewBox="0 0 100 100"
                style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    filter: stroke ? `drop-shadow(0 0 8px ${stroke}66)` : 'none'
                }}
            >
                <polygon
                    points="50 0, 95 25, 95 75, 50 100, 5 75, 5 25"
                    fill={color}
                    stroke={stroke}
                    strokeWidth={strokeWidth}
                    vectorEffect="non-scaling-stroke"
                />
            </svg>
            <div style={{
                zIndex: 1,
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                width: '100%',
                height: '100%'
            }}>
                {children}
            </div>
        </div>
    );
};
