import React, { useState, useRef, useEffect } from 'react';
import axios from "axios";
import styles from './Buzzer.module.css';

const API_URL = 'http://localhost:4000/api';

type BuzzerProps = {
    playerId: string;
    onBuzzerPress: () => void;
    buzzed: boolean;
    hasControl?: boolean; // Ajouté
};

const Buzzer = ({ playerId, onBuzzerPress, buzzed, hasControl }: BuzzerProps) => {
    const [pressed, setPressed] = useState(false);
    const buzzSound = useRef<HTMLAudioElement | null>(null);

    // Précharge le son au premier rendu
    if (!buzzSound.current) {
        buzzSound.current = new window.Audio('/buzz.mp3');
    }

    const handleBuzzerClick = async () => {
        setPressed(true);
        if (buzzSound.current) {
            buzzSound.current.currentTime = 0;
            buzzSound.current.play();
        }
        await axios.post(`${API_URL}/players/${playerId}/buzz`);
        onBuzzerPress();
        setTimeout(() => setPressed(false), 200);
    };

    // Ajoute la gestion de la touche Espace
    useEffect(() => {
        const onKeyDown = (e: KeyboardEvent) => {
            if ((e.code === 'Space' || e.key === ' ') && !buzzed) {
                e.preventDefault();
                handleBuzzerClick();
            }
        };
        window.addEventListener('keydown', onKeyDown);
        return () => window.removeEventListener('keydown', onKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [buzzed, playerId]); // Ajoute buzzed et playerId comme dépendances

    return (
        <button
            id="buzz"
            onClick={handleBuzzerClick}
            disabled={buzzed}
            className={
                `${styles.buzzerButton} ${pressed ? styles.buzzerPressed : ''} ${hasControl ? styles.buzzerHasControl : ''}`
            }
        >
            <span style={{ fontSize: 38, display: 'block', marginBottom: 4 }}>
                {buzzed ? '🔕' : '🔔'}
            </span>
            {buzzed ? 'Buzzé !' : 'BUZZ'}
        </button>
    );
};

export default Buzzer;