import React, { forwardRef } from 'react';
import frame0 from '../../assets/supermanframe0.png';
import frame1 from '../../assets/supermanframe1.png';
import frame2 from '../../assets/supermanframe2.png';
import frame3 from '../../assets/supermanframe3.png';

const SupermanWorker = forwardRef(({ className = "" }, ref) => {
    return (
        <div ref={ref} className={`relative w-full h-full ${className}`}>
            {/* 
        Render all frames stacked. 
        We will control visibility via GSAP classes or opacity 
        to ensure instant switching without loading flicker.
      */}
            <img src={frame0} alt="Hero Start" className="superman-frame frame-0 absolute inset-0 w-full h-full object-contain" />
            <img src={frame1} alt="Hero Look" className="superman-frame frame-1 absolute inset-0 w-full h-full object-contain opacity-0" />
            <img src={frame2} alt="Hero Ready" className="superman-frame frame-2 absolute inset-0 w-full h-full object-contain opacity-0" />
            <img src={frame3} alt="Hero Fly" className="superman-frame frame-3 absolute inset-0 w-full h-full object-contain opacity-0" />

            {/* 
          Helper for maintaining aspect ratio/layout if needed, 
          using the main frame as the 'static' footprint if it wasn't absolute.
          But since we positioned them all absolute, we need a relative container size.
          Typically handled by the parent or by making one of them relative.
          Let's make frame-0 relative so the container takes its size.
      */}
        </div>
    );
});

export default SupermanWorker;
