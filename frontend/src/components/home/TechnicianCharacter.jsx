import React from 'react';
import restingTechnicianImg from '../../assets/resting-on-card.png';

const TechnicianCharacter = ({ className = "", pose, mood }) => {
    return (
        <img
            src={restingTechnicianImg}
            alt="Technician resting on card"
            className={`block max-w-full h-auto object-contain ${className}`}
        />
    );
};

export default TechnicianCharacter;
