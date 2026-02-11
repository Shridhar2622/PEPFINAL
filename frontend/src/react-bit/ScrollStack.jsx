import { useLayoutEffect, useRef, useCallback, useState, useEffect } from 'react';
import Lenis from 'lenis';

export const ScrollStackItem = ({ children, itemClassName = '' }) => (
    <div
        className={`scroll-stack-card relative w-full h-80 my-8 p-12 rounded-[40px] shadow-[0_0_30px_rgba(0,0,0,0.1)] box-border origin-top will-change-transform ${itemClassName}`.trim()}
        style={{
            backfaceVisibility: 'hidden',
            transformStyle: 'preserve-3d'
        }}
    >
        {children}
    </div>
);

const ScrollStack = ({
    children,
    className = '',
    itemDistance = 100,
    itemScale = 0.03,
    itemStackDistance = 30,
    stackPosition = '20%',
    scaleEndPosition = '10%',
    baseScale = 0.85,
    scaleDuration = 0.5,
    rotationAmount = 0,
    blurAmount = 0,
    useWindowScroll = false,
    onStackComplete,
    onActiveIndexChange
}) => {
    const scrollerRef = useRef(null);
    const stackCompletedRef = useRef(false);
    const animationFrameRef = useRef(null);
    const lenisRef = useRef(null);
    const cardsRef = useRef([]);
    const lastTransformsRef = useRef(new Map());
    const isUpdatingRef = useRef(false);

    // Cache layout metrics to avoid thrashing
    const metricsRef = useRef({
        containerHeight: 0,
        stackPositionPx: 0,
        scaleEndPositionPx: 0,
        endElementTop: 0,
        cards: [] // Array of { top, triggerStart, triggerEnd, pinStart, pinEnd }
    });

    const calculateProgress = useCallback((scrollTop, start, end) => {
        if (scrollTop < start) return 0;
        if (scrollTop > end) return 1;
        return (scrollTop - start) / (end - start);
    }, []);

    const parsePercentage = useCallback((value, containerHeight) => {
        if (typeof value === 'string' && value.includes('%')) {
            return (parseFloat(value) / 100) * containerHeight;
        }
        return parseFloat(value);
    }, []);

    const getElementOffset = useCallback(
        element => {
            if (useWindowScroll) {
                const rect = element.getBoundingClientRect();
                return rect.top + window.scrollY;
            } else {
                return element.offsetTop;
            }
        },
        [useWindowScroll]
    );

    // Calculate all metrics that don't change on scroll
    const updateMetrics = useCallback(() => {
        const scroller = scrollerRef.current;
        if (!scroller && !useWindowScroll) return;

        const containerHeight = useWindowScroll ? window.innerHeight : scroller.clientHeight;
        const stackPositionPx = parsePercentage(stackPosition, containerHeight);
        const scaleEndPositionPx = parsePercentage(scaleEndPosition, containerHeight);

        const endElement = useWindowScroll
            ? document.querySelector('.scroll-stack-end')
            : scroller?.querySelector('.scroll-stack-end');

        const endElementTop = endElement ? getElementOffset(endElement) : 0;
        const pinEnd = endElementTop - containerHeight / 2;

        const cardMetrics = cardsRef.current.map((card, i) => {
            if (!card) return null;
            const cardTop = getElementOffset(card);
            const triggerStart = cardTop - stackPositionPx - itemStackDistance * i;
            const triggerEnd = cardTop - scaleEndPositionPx;
            const pinStart = cardTop - stackPositionPx - itemStackDistance * i;

            return {
                top: cardTop,
                triggerStart,
                triggerEnd,
                pinStart,
                pinEnd
            };
        });

        metricsRef.current = {
            containerHeight,
            stackPositionPx,
            scaleEndPositionPx,
            endElementTop,
            cards: cardMetrics
        };

        // Force an update after metrics change
        requestAnimationFrame(() => updateCardTransforms());

    }, [stackPosition, scaleEndPosition, itemStackDistance, parsePercentage, getElementOffset, useWindowScroll]);


    const currentActiveIndexRef = useRef(-1);

    const updateCardTransforms = useCallback(() => {
        if (!cardsRef.current.length || isUpdatingRef.current) return;
        isUpdatingRef.current = true;

        const scrollTop = useWindowScroll ? window.scrollY : scrollerRef.current.scrollTop;
        const metrics = metricsRef.current;

        // Safety check if metrics aren't ready
        if (!metrics.cards.length) {
            isUpdatingRef.current = false;
            return;
        }

        let newActiveIndex = -1;

        cardsRef.current.forEach((card, i) => {
            if (!card) return;
            const cardMetric = metrics.cards[i];
            if (!cardMetric) return;

            const { triggerStart, triggerEnd, pinStart, pinEnd, top: cardTop } = cardMetric;

            // Determine active index: The highest index that has started pinning/stocking
            if (scrollTop >= pinStart - 1) { // -1 tolerance
                newActiveIndex = i;
            }

            const scaleProgress = calculateProgress(scrollTop, triggerStart, triggerEnd);
            // Cubic ease out for smoother scaling behavior
            const easedScaleProgress = 1 - Math.pow(1 - scaleProgress, 3);

            const targetScale = baseScale + i * itemScale;
            // Apply easing to the scale transition
            const scale = 1 - easedScaleProgress * (1 - targetScale);
            const rotation = rotationAmount ? i * rotationAmount * scaleProgress : 0;

            let blur = 0;
            if (blurAmount) {
                // Simplified blur calculation relying on progress rather than expensive loop
                // Estimate depth based on scale progress of next cards
                // This is an approximation for performance
                if (i < cardsRef.current.length - 1) {
                    const nextCardMetric = metrics.cards[i + 1];
                    if (nextCardMetric && scrollTop > nextCardMetric.triggerStart) {
                        const depth = (scrollTop - nextCardMetric.triggerStart) / (nextCardMetric.triggerEnd - nextCardMetric.triggerStart);
                        blur = Math.min(depth * blurAmount, blurAmount * (cardsRef.current.length - 1 - i));
                    }
                }
            }

            let translateY = 0;
            const isPinned = scrollTop >= pinStart && scrollTop <= pinEnd;

            if (isPinned) {
                translateY = scrollTop - cardTop + metrics.stackPositionPx + itemStackDistance * i;
            } else if (scrollTop > pinEnd) {
                translateY = pinEnd - cardTop + metrics.stackPositionPx + itemStackDistance * i;
            }

            const newTransform = {
                translateY: translateY,
                scale: scale,
                rotation: rotation,
                blur: blur
            };

            const lastTransform = lastTransformsRef.current.get(i);

            // Check if significant enough to update, but use much smaller thresholds
            const hasChanged =
                !lastTransform ||
                Math.abs(lastTransform.translateY - newTransform.translateY) > 0.01 ||
                Math.abs(lastTransform.scale - newTransform.scale) > 0.0001 ||
                Math.abs(lastTransform.rotation - newTransform.rotation) > 0.01 ||
                Math.abs(lastTransform.blur - newTransform.blur) > 0.01;

            if (hasChanged) {
                // Use fixed precision for string generation to prevent jitter from floating point noise
                const transform = `translate3d(0, ${newTransform.translateY.toFixed(3)}px, 0) scale(${newTransform.scale.toFixed(4)}) rotate(${newTransform.rotation.toFixed(2)}deg)`;
                const filter = newTransform.blur > 0 ? `blur(${newTransform.blur.toFixed(2)}px)` : '';

                card.style.transform = transform;
                card.style.filter = filter;

                lastTransformsRef.current.set(i, newTransform);
            }

            if (i === cardsRef.current.length - 1) {
                const isInView = scrollTop >= pinStart && scrollTop <= pinEnd;
                if (isInView && !stackCompletedRef.current) {
                    stackCompletedRef.current = true;
                    onStackComplete?.();
                } else if (!isInView && stackCompletedRef.current) {
                    stackCompletedRef.current = false;
                }
            }
        });

        // If we exist before the first pin start, we might want to default to 0 if visible? 
        // Or keep it -1 until interaction starts?
        // Let's assume if scrolling starts towards it, 0 should be active.
        if (newActiveIndex === -1 && metrics.cards.length > 0) {
            // Check if we are approaching the first card
            // If scrollTop is close to first pinStart? 
            // Actually, simply default to 0 effectively means "First card is the context"
            newActiveIndex = 0;
        }

        if (newActiveIndex !== currentActiveIndexRef.current) {
            currentActiveIndexRef.current = newActiveIndex;
            onActiveIndexChange?.(newActiveIndex);
        }

        isUpdatingRef.current = false;
    }, [
        itemScale,
        itemStackDistance,
        baseScale,
        rotationAmount,
        blurAmount,
        useWindowScroll,
        onStackComplete,
        calculateProgress,
        onActiveIndexChange
    ]);

    const handleScroll = useCallback(() => {
        updateCardTransforms();
    }, [updateCardTransforms]);

    const setupLenis = useCallback(() => {
        if (useWindowScroll) {
            const lenis = new Lenis({
                duration: 1.2,
                easing: t => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
                smoothWheel: true,
                touchMultiplier: 2,
                infinite: false,
                wheelMultiplier: 1,
                lerp: 0.1,
                syncTouch: true,
                syncTouchLerp: 0.075
            });

            lenis.on('scroll', handleScroll);

            const raf = time => {
                lenis.raf(time);
                animationFrameRef.current = requestAnimationFrame(raf);
            };
            animationFrameRef.current = requestAnimationFrame(raf);

            lenisRef.current = lenis;
            return lenis;
        } else {
            const scroller = scrollerRef.current;
            if (!scroller) return;

            const lenis = new Lenis({
                wrapper: scroller,
                content: scroller.querySelector('.scroll-stack-inner'),
                duration: 1.2,
                easing: t => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
                smoothWheel: true,
                touchMultiplier: 2,
                infinite: false,
                wheelMultiplier: 1,
                lerp: 0.1,
                syncTouch: true,
                syncTouchLerp: 0.075
            });

            lenis.on('scroll', handleScroll);

            const raf = time => {
                lenis.raf(time);
                animationFrameRef.current = requestAnimationFrame(raf);
            };
            animationFrameRef.current = requestAnimationFrame(raf);

            lenisRef.current = lenis;
            return lenis;
        }
    }, [handleScroll, useWindowScroll]);

    // Handle resize events
    useEffect(() => {
        const handleResize = () => {
            updateMetrics();
            updateCardTransforms();
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [updateMetrics, updateCardTransforms]);

    useLayoutEffect(() => {
        const scroller = scrollerRef.current;
        if (!scroller && !useWindowScroll) return;

        const cards = Array.from(
            useWindowScroll
                ? document.querySelectorAll('.scroll-stack-card')
                : scroller.querySelectorAll('.scroll-stack-card')
        );

        cardsRef.current = cards;
        const transformsCache = lastTransformsRef.current;

        cards.forEach((card, i) => {
            if (i < cards.length - 1) {
                card.style.marginBottom = `${itemDistance}px`;
            }
            card.style.willChange = 'transform, filter';
            card.style.transformOrigin = 'top center';
            card.style.backfaceVisibility = 'hidden';
            card.style.transform = 'translateZ(0)';
            card.style.webkitTransform = 'translateZ(0)';
            card.style.perspective = '1000px';
            card.style.webkitPerspective = '1000px';
        });

        // Initial metrics calculation
        // Slight delay to ensure DOM is fully ready (images loaded etc if they affect height)
        const timer = setTimeout(() => {
            updateMetrics();
        }, 100);

        setupLenis();

        // Need to clean up timer

        return () => {
            clearTimeout(timer);
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
            }
            if (lenisRef.current) {
                lenisRef.current.destroy();
            }
            stackCompletedRef.current = false;
            cardsRef.current = [];
            transformsCache.clear();
            isUpdatingRef.current = false;
        };
    }, [
        itemDistance,
        setupLenis,
        updateMetrics,
        useWindowScroll
    ]);

    // Container styles based on scroll mode
    const containerStyles = useWindowScroll
        ? {
            // Global scroll mode - no overflow constraints
            overscrollBehavior: 'contain',
            WebkitOverflowScrolling: 'touch',
            WebkitTransform: 'translateZ(0)',
            transform: 'translateZ(0)'
        }
        : {
            // Container scroll mode - original behavior
            overscrollBehavior: 'contain',
            WebkitOverflowScrolling: 'touch',
            scrollBehavior: 'smooth',
            WebkitTransform: 'translateZ(0)',
            transform: 'translateZ(0)',
            willChange: 'scroll-position'
        };

    const containerClassName = useWindowScroll
        ? `relative w-full ${className}`.trim()
        : `relative w-full h-full overflow-y-auto overflow-x-visible ${className}`.trim();

    return (
        <div className={containerClassName} ref={scrollerRef} style={containerStyles}>
            <div className="scroll-stack-inner pt-[20vh] px-20 pb-[50rem] min-h-screen">
                {children}
                {/* Spacer so the last pin can release cleanly */}
                <div className="scroll-stack-end w-full h-px" />
            </div>
        </div>
    );
};

export default ScrollStack;
