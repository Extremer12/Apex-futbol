import React, { useRef, useEffect } from 'react';

export const AnimatedNumber: React.FC<{ value: number | undefined | null, formatter: (n: number) => string, className?: string }> = React.memo(({ value, formatter, className }) => {
    const ref = useRef<HTMLSpanElement>(null);
    const prevValueRef = useRef(value);
    const frameRef = useRef<number | null>(null);

    useEffect(() => {
        const startValue = prevValueRef.current || 0;
        const endValue = value || 0;
        prevValueRef.current = value || 0;
        let startTime: number | null = null;

        const animate = (timestamp: number) => {
            if (!startTime) startTime = timestamp;
            const progress = Math.min((timestamp - startTime) / 500, 1);
            const easing = (t: number) => t * (2 - t); // Ease out quad
            const currentValue = startValue + (endValue - startValue) * easing(progress);
            if (ref.current) {
                ref.current.textContent = formatter(currentValue);
            }
            if (progress < 1) {
                frameRef.current = requestAnimationFrame(animate);
            }
        };
        frameRef.current = requestAnimationFrame(animate);
        return () => {
            if (frameRef.current) cancelAnimationFrame(frameRef.current);
        };
    }, [value, formatter]);

    return <span ref={ref} className={className}>{formatter(value || 0)}</span>;
});
