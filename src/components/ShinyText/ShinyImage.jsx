"use client";

import { useState, useCallback, useEffect, useRef } from 'react';
import { motion, useMotionValue, useAnimationFrame, useTransform } from 'motion/react';

const ShinyImage = ({
    src,
    alt,
    className = '',
    shineColor = 'rgba(255,255,255,0.8)',
    spread = 120,
    speed = 3,
    delay = 0,
    offset = 0,
    direction = 'left',
    yoyo = false,
    layoutId,
    transition
}) => {
    const progress = useMotionValue(0);
    const elapsedRef = useRef(0);
    const lastTimeRef = useRef(null);
    const directionRef = useRef(direction === 'left' ? 1 : -1);

    const animationDuration = speed * 1000;
    const delayDuration = delay * 1000;

    useAnimationFrame(time => {
        if (lastTimeRef.current === null) {
            lastTimeRef.current = time;
            return;
        }

        const deltaTime = time - lastTimeRef.current;
        lastTimeRef.current = time;

        elapsedRef.current += deltaTime;

        if (yoyo) {
            const cycleDuration = animationDuration + delayDuration;
            const fullCycle = cycleDuration * 2;
            const adjustedElapsed = elapsedRef.current + (offset * 1000);
            const cycleTime = adjustedElapsed % fullCycle;

            if (cycleTime < animationDuration) {
                const p = (cycleTime / animationDuration) * 100;
                progress.set(directionRef.current === 1 ? p : 100 - p);
            } else if (cycleTime < cycleDuration) {
                progress.set(directionRef.current === 1 ? 100 : 0);
            } else if (cycleTime < cycleDuration + animationDuration) {
                const reverseTime = cycleTime - cycleDuration;
                const p = 100 - (reverseTime / animationDuration) * 100;
                progress.set(directionRef.current === 1 ? p : 100 - p);
            } else {
                progress.set(directionRef.current === 1 ? 0 : 100);
            }
        } else {
            const cycleDuration = animationDuration + delayDuration;
            const adjustedElapsed = elapsedRef.current + (offset * 1000);
            const cycleTime = adjustedElapsed % cycleDuration;

            if (cycleTime < animationDuration) {
                const p = (cycleTime / animationDuration) * 100;
                progress.set(directionRef.current === 1 ? p : 100 - p);
            } else {
                progress.set(directionRef.current === 1 ? 100 : 0);
            }
        }
    });

    useEffect(() => {
        directionRef.current = direction === 'left' ? 1 : -1;
        elapsedRef.current = 0;
        progress.set(0);
    }, [direction]);

    const backgroundPosition = useTransform(progress, p => `${150 - p * 2}% center`);

    const overlayStyle = {
        backgroundImage: `linear-gradient(${spread}deg, transparent 0%, transparent 35%, ${shineColor} 50%, transparent 65%, transparent 100%)`,
        backgroundSize: '200% auto',
        WebkitMaskImage: `url('${src}')`,
        WebkitMaskSize: 'contain',
        WebkitMaskRepeat: 'no-repeat',
        WebkitMaskPosition: 'left center',
    };

    return (
        <motion.div layoutId={layoutId} transition={transition} className={`relative flex items-center justify-center ${className}`}>
            <img src={src} alt={alt} className="w-auto h-full object-contain" />
            <motion.div
                className="absolute inset-0 pointer-events-none"
                style={{ ...overlayStyle, backgroundPosition }}
            />
        </motion.div>
    );
};

export default ShinyImage;
