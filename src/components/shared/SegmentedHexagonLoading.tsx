import { motion } from 'framer-motion';

interface SegmentedHexagonLoadingProps {
    size: number;
    color: string;
    activeColor: string;
    strokeWidth: number;
    progress: number;
}

const points = [
    { x1: 50, y1: 0, x2: 95, y2: 25 },
    { x1: 95, y1: 25, x2: 95, y2: 75 },
    { x1: 95, y1: 75, x2: 50, y2: 100 },
    { x1: 50, y1: 100, x2: 5, y2: 75 },
    { x1: 5, y1: 75, x2: 5, y2: 25 },
    { x1: 5, y1: 25, x2: 50, y2: 0 },
];

export const SegmentedHexagonLoading = ({
    size,
    color,
    activeColor,
    strokeWidth,
    progress,
}: SegmentedHexagonLoadingProps) => {
    return (
        <div style={{ width: size, height: size, position: 'relative' }}>
            <svg width="100%" height="100%" viewBox="0 0 100 100" style={{ overflow: 'visible' }}>
                {points.map((p, index) => {
                    const isActive = index < progress;
                    return (
                        <motion.line
                            key={index}
                            x1={p.x1} y1={p.y1}
                            x2={p.x2} y2={p.y2}
                            stroke={isActive ? activeColor : color}
                            strokeWidth={strokeWidth}
                            initial={{ stroke: color }}
                            animate={{ stroke: isActive ? activeColor : color }}
                            transition={{ duration: 0.2 }}
                            strokeLinecap="round"
                        />
                    );
                })}
            </svg>
        </div>
    );
};
