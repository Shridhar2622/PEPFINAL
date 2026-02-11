import React from 'react';
import restingWorkerImg from '../../assets/resting-on-card.png';

const WorkerCharacter = ({ className = "", pose, mood }) => {
    return (
        <img
            src={restingWorkerImg}
            alt="Worker resting on card"
            className={`block max-w-full h-auto object-contain ${className}`}
        />
    );
};

export default WorkerCharacter;
