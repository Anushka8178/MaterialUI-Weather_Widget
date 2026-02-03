import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Points, PointMaterial } from '@react-three/drei';
import * as THREE from 'three';
import './AnimatedBackground.css';

function Particles({ count = 2000, weatherType = 'clear' }) {
    const mesh = useRef();
    
    // Create particle positions based on weather type
    const particles = useMemo(() => {
        const positions = new Float32Array(count * 3);
        for (let i = 0; i < count; i++) {
            positions[i * 3] = (Math.random() - 0.5) * 20;
            positions[i * 3 + 1] = (Math.random() - 0.5) * 20;
            positions[i * 3 + 2] = (Math.random() - 0.5) * 20;
        }
        return positions;
    }, [count]);

    useFrame((state, delta) => {
        if (mesh.current) {
            mesh.current.rotation.x += delta * 0.1;
            mesh.current.rotation.y += delta * 0.15;
        }
    });

    const color = weatherType === 'rain' ? '#B8D4F0' : 
                  weatherType === 'snow' ? '#E8E8FF' : 
                  weatherType === 'cloudy' ? '#D4C5F9' : '#FFE5B4';

    return (
        <Points ref={mesh} positions={particles} stride={3} frustumCulled={false}>
            <PointMaterial
                transparent
                color={color}
                size={0.05}
                sizeAttenuation={true}
                depthWrite={false}
                opacity={0.6}
            />
        </Points>
    );
}

export default function AnimatedBackground({ weatherType = 'clear' }) {
    return (
        <div className="animated-background">
            <Canvas camera={{ position: [0, 0, 5], fov: 75 }}>
                <ambientLight intensity={0.5} />
                <Particles count={2000} weatherType={weatherType} />
            </Canvas>
        </div>
    );
}
