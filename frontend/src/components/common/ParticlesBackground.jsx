import React, { useEffect, useRef } from 'react';

const ParticlesBackground = () => {
    const canvasRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        let animationFrameId;
        let particles = [];

        const resizeCanvas = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            initParticles();
        };

        const initParticles = () => {
            const particleCount = Math.min(window.innerWidth * 0.05, 50); // Responsive count, max 50
            particles = [];
            for (let i = 0; i < particleCount; i++) {
                particles.push({
                    x: Math.random() * canvas.width,
                    y: Math.random() * canvas.height,
                    vx: (Math.random() - 0.5) * 0.2, // Very slow horizontal drift
                    vy: (Math.random() - 0.5) * 0.2, // Very slow vertical drift
                    size: Math.random() * 2 + 1, // Size 1-3px
                    alpha: Math.random() * 0.5 + 0.1, // Opacity 0.1-0.6
                    targetAlpha: Math.random() * 0.5 + 0.1,
                    growing: Math.random() > 0.5,
                    speed: Math.random() * 0.01 + 0.005
                });
            }
        };

        const updateParticles = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            particles.forEach(p => {
                // Movement
                p.x += p.vx;
                p.y += p.vy;

                // Wrap around screen
                if (p.x < 0) p.x = canvas.width;
                if (p.x > canvas.width) p.x = 0;
                if (p.y < 0) p.y = canvas.height;
                if (p.y > canvas.height) p.y = 0;

                // Twinkle effect (smooth alpha transition)
                if (p.growing) {
                    p.alpha += p.speed;
                    if (p.alpha >= p.targetAlpha) {
                        p.alpha = p.targetAlpha;
                        p.growing = false;
                        p.targetAlpha = Math.random() * 0.5 + 0.1;
                    }
                } else {
                    p.alpha -= p.speed;
                    if (p.alpha <= p.targetAlpha) {
                        p.alpha = p.targetAlpha;
                        p.growing = true;
                        p.targetAlpha = Math.random() * 0.5 + 0.1;
                    }
                }

                // Draw
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(255, 255, 255, ${p.alpha})`; // White particles
                ctx.fill();
            });

            animationFrameId = requestAnimationFrame(updateParticles);
        };

        window.addEventListener('resize', resizeCanvas);
        resizeCanvas();
        updateParticles();

        return () => {
            window.removeEventListener('resize', resizeCanvas);
            cancelAnimationFrame(animationFrameId);
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            className="absolute inset-0 pointer-events-none"
            style={{ zIndex: 1 }} // Just above the dark background color
        />
    );
};

export default ParticlesBackground;
