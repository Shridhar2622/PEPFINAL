import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useUser } from './UserContext';

const SoundContext = createContext();

export const SoundProvider = ({ children }) => {
    const { isAuthenticated } = useUser();
    const [isSoundEnabled, setIsSoundEnabled] = useState(() => {
        const saved = localStorage.getItem('sound_enabled');
        return saved !== null ? JSON.parse(saved) : true; // Default to true for everyone
    });

    // Reset sound on logout
    useEffect(() => {
        if (!isAuthenticated) {
            // We keep it enabled even if logged out, or follow policy. 
            // User likely wants sound on next login too. 
            // setIsSoundEnabled(false); // Removed to keep user preference
        }
    }, [isAuthenticated]);

    const [audioCtx, setAudioCtx] = useState(null);

    // Initialize Audio Context on first interaction to comply with browser policies
    const initAudio = useCallback(() => {
        if (!audioCtx) {
            const ctx = new (window.AudioContext || window.webkitAudioContext)();
            setAudioCtx(ctx);
        } else if (audioCtx.state === 'suspended') {
            audioCtx.resume();
        }
    }, [audioCtx]);

    const playGlassSound = useCallback(() => {
        if (!isSoundEnabled || !audioCtx) return;

        const oscillator = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();

        oscillator.type = 'sine';
        // A high-pitched "glassy" frequency
        oscillator.frequency.setValueAtTime(1200, audioCtx.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(800, audioCtx.currentTime + 0.05);

        gainNode.gain.setValueAtTime(0.15, audioCtx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.1);

        oscillator.connect(gainNode);
        gainNode.connect(audioCtx.destination);

        oscillator.start();
        oscillator.stop(audioCtx.currentTime + 0.1);
    }, [isSoundEnabled, audioCtx]);

    const playNotificationSound = useCallback(() => {
        if (!isSoundEnabled) return;

        try {
            const audio = new Audio("https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3");
            audio.play().catch(e => console.log("Audio play failed (user interaction needed first):", e));
        } catch (err) {
            console.error("Error playing notification sound:", err);
        }
    }, [isSoundEnabled]);

    useEffect(() => {
        localStorage.setItem('sound_enabled', JSON.stringify(isSoundEnabled));
    }, [isSoundEnabled]);

    // Global click/touch listener to initialize audio context
    useEffect(() => {
        const handleInteraction = () => {
            initAudio();
            // Remove listeners once audio is initialized
            window.removeEventListener('click', handleInteraction);
            window.removeEventListener('touchstart', handleInteraction);
        };

        window.addEventListener('click', handleInteraction);
        window.addEventListener('touchstart', handleInteraction);

        // Mobile specific feedback
        const handleMobileClick = (e) => {
            const isMobile = window.innerWidth < 768;
            // Only play sound if mobile, enabled, AND user is authenticated
            if (!isMobile || !isSoundEnabled || !isAuthenticated) return;

            const target = e.target.closest('button, a, [role="button"]');
            if (target) {
                playGlassSound();
            }
        };

        window.addEventListener('click', handleMobileClick);

        return () => {
            window.removeEventListener('click', handleInteraction);
            window.removeEventListener('touchstart', handleInteraction);
            window.removeEventListener('click', handleMobileClick);
        };
    }, [initAudio, playGlassSound, isSoundEnabled, isAuthenticated]);

    return (
        <SoundContext.Provider value={{ isSoundEnabled, setIsSoundEnabled, playGlassSound, playNotificationSound, initAudio }}>
            {children}
        </SoundContext.Provider>
    );
};

export const useSound = () => {
    const context = useContext(SoundContext);
    if (!context) {
        throw new Error('useSound must be used within a SoundProvider');
    }
    return context;
};
