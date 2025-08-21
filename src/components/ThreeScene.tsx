import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Sphere, Ring, Box, Torus, OrbitControls } from '@react-three/drei';
import * as THREE from 'three';

// Rotating Earth component
function RotatingEarth() {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.5;
      meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.5) * 0.1;
    }
  });

  return (
    <Sphere ref={meshRef} args={[1.2, 32, 32]} position={[3, 0, 0]}>
      <meshStandardMaterial
        color="#4338ca"
        roughness={0.3}
        metalness={0.7}
        transparent
        opacity={0.8}
      />
    </Sphere>
  );
}

// Floating crypto symbols
function FloatingCrypto() {
  const groupRef = useRef<THREE.Group>(null);
  
  useFrame((state, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.3;
      groupRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.8) * 0.3;
    }
  });

  return (
    <group ref={groupRef} position={[-3, 0, 0]}>
      <Box args={[0.6, 0.6, 0.6]} position={[0, 1, 0]}>
        <meshStandardMaterial color="#f59e0b" roughness={0.4} metalness={0.6} />
      </Box>
      <Torus args={[0.8, 0.2, 8, 16]} position={[0, -1, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <meshStandardMaterial color="#10b981" roughness={0.4} metalness={0.6} />
      </Torus>
    </group>
  );
}

// Orbiting rings
function OrbitingRings() {
  const ringRef = useRef<THREE.Group>(null);
  
  useFrame((state, delta) => {
    if (ringRef.current) {
      ringRef.current.rotation.z += delta * 0.7;
      ringRef.current.rotation.x += delta * 0.2;
    }
  });

  return (
    <group ref={ringRef} position={[0, 0, -2]}>
      <Ring args={[2, 2.1, 32]} rotation={[0, 0, 0]}>
        <meshStandardMaterial color="#8b5cf6" transparent opacity={0.6} />
      </Ring>
      <Ring args={[2.5, 2.6, 32]} rotation={[Math.PI / 2, 0, 0]}>
        <meshStandardMaterial color="#06b6d4" transparent opacity={0.4} />
      </Ring>
      <Ring args={[3, 3.1, 32]} rotation={[0, Math.PI / 2, 0]}>
        <meshStandardMaterial color="#f43f5e" transparent opacity={0.3} />
      </Ring>
    </group>
  );
}

// Floating particles
function FloatingParticles() {
  const count = 50;
  const positions = useMemo(() => {
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 20;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 20;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 20;
    }
    return positions;
  }, []);

  const pointsRef = useRef<THREE.Points>(null);
  
  useFrame((state, delta) => {
    if (pointsRef.current) {
      pointsRef.current.rotation.y += delta * 0.1;
      pointsRef.current.rotation.x += delta * 0.05;
    }
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          array={positions}
          count={count}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.05}
        color="#8b5cf6"
        transparent
        opacity={0.8}
        sizeAttenuation
      />
    </points>
  );
}

// Main 3D Scene component
export function ThreeScene() {
  return (
    <div className="absolute inset-0 pointer-events-none">
      <Canvas
        camera={{ position: [0, 0, 8], fov: 60 }}
        style={{ background: 'transparent' }}
      >
        {/* Lighting */}
        <ambientLight intensity={0.6} />
        <directionalLight position={[10, 10, 5]} intensity={1} />
        
        {/* Simple test sphere */}
        <Sphere args={[1, 32, 32]} position={[0, 0, 0]}>
          <meshStandardMaterial color="#4338ca" />
        </Sphere>
      </Canvas>
    </div>
  );
}