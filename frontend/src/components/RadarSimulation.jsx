import React, { useState, useEffect, useRef } from 'react';

const RadarSimulation = ({ data, size, maxDistance, className }) => {
  const [wiperAngle, setWiperAngle] = useState(0);
  const requestRef = useRef();

  const center = size / 2;
  const scale = (size / 2) / maxDistance;

  useEffect(() => {
    const animate = () => {
      setWiperAngle((prevAngle) => (prevAngle + 1) % 360);
      requestRef.current = requestAnimationFrame(animate);
    };

    requestRef.current = requestAnimationFrame(animate);
    return () => {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
    };
  }, []);

  const renderCircles = () => {
    const circles = [];
    for (let i = 1; i <= 5; i++) {
      circles.push(
        <circle
          key={i}
          cx={center}
          cy={center}
          r={center * (i / 5)}
          fill="none"
          stroke="rgba(0, 255, 0, 0.2)"
          strokeWidth="1"
        />
      );
    }
    return circles;
  };

  const renderAngles = () => {
    const angles = [];
    for (let i = 0; i < 360; i += 30) {
      const x2 = center + Math.cos((i * Math.PI) / 180) * center;
      const y2 = center + Math.sin((i * Math.PI) / 180) * center;
      angles.push(
        <line
          key={i}
          x1={center}
          y1={center}
          x2={x2}
          y2={y2}
          stroke="rgba(0, 255, 0, 0.2)"
          strokeWidth="1"
        />
      );
    }
    return angles;
  };

  const renderWiper = () => {
    const x2 = center + Math.cos((wiperAngle * Math.PI) / 180) * center;
    const y2 = center + Math.sin((wiperAngle * Math.PI) / 180) * center;
    return (
      <line
        x1={center}
        y1={center}
        x2={x2}
        y2={y2}
        stroke="rgba(0, 255, 0, 0.8)"
        strokeWidth="2"
      />
    );
  };

  const renderObstacles = () => {
    return data.map((point, index) => {
      const x = center + Math.cos((point.angle * Math.PI) / 180) * point.distance * scale;
      const y = center + Math.sin((point.angle * Math.PI) / 180) * point.distance * scale;
      return (
        <circle
          key={index}
          cx={x}
          cy={y}
          r="4"
          fill="rgb(0, 255, 0)"
        />
      );
    });
  };

  return (
    <div className={`relative min-w-96 min-h-96 w-96 h-96 bg-green-900 flex items-center justify-center ${className} rounded-full overflow-hidden`}>
      <svg width={size} height={size} className="absolute top-0 m-10 left-0">
        {renderCircles()}
        {renderAngles()}
        {renderWiper()}
        {renderObstacles()}
      </svg>
    </div>
  );
};

export default RadarSimulation;

