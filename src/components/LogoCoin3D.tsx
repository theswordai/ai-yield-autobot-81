import { Canvas } from '@react-three/fiber';
import { useRef, useEffect } from 'react';
import * as THREE from 'three';

function LogoCoin() {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useEffect(() => {
    if (meshRef.current) {
      const animate = () => {
        if (meshRef.current) {
          meshRef.current.rotation.y += 0.015;
          meshRef.current.rotation.x = Math.sin(Date.now() * 0.0008) * 0.08;
        }
        requestAnimationFrame(animate);
      };
      animate();
    }
  }, []);

  return (
    <mesh ref={meshRef} position={[0, 0, 0]}>
      {/* 硬币主体 - 圆柱体 */}
      <cylinderGeometry args={[1.2, 1.2, 0.15, 64]} />
      <meshStandardMaterial 
        color="#C0C0C0"
        metalness={0.9}
        roughness={0.1}
        envMapIntensity={1}
      />
      
      {/* 内部细节 - 圆环 */}
      <mesh position={[0, 0.08, 0]}>
        <torusGeometry args={[0.9, 0.04, 16, 100]} />
        <meshStandardMaterial 
          color="#E8E8E8"
          metalness={0.95}
          roughness={0.05}
        />
      </mesh>
      
      {/* 中心图案基座 */}
      <mesh position={[0, 0.09, 0]}>
        <cylinderGeometry args={[0.6, 0.6, 0.02, 32]} />
        <meshStandardMaterial 
          color="#B8B8B8"
          metalness={0.8}
          roughness={0.2}
        />
      </mesh>
      
      {/* "1" 字符图案 */}
      {/* 垂直主线 */}
      <mesh position={[0.08, 0.1, 0]} rotation={[0, 0, 0]}>
        <boxGeometry args={[0.06, 0.8, 0.025]} />
        <meshStandardMaterial 
          color="#A0A0A0"
          metalness={0.9}
          roughness={0.1}
        />
      </mesh>
      
      {/* 顶部斜线 */}
      <mesh position={[-0.08, 0.32, 0]} rotation={[0, 0, Math.PI / 4]}>
        <boxGeometry args={[0.05, 0.24, 0.025]} />
        <meshStandardMaterial 
          color="#A0A0A0"
          metalness={0.9}
          roughness={0.1}
        />
      </mesh>
    </mesh>
  );
}

function LogoLighting() {
  return (
    <>
      {/* 环境光 */}
      <ambientLight intensity={0.4} />
      
      {/* 主光源 */}
      <directionalLight 
        position={[3, 3, 3]} 
        intensity={1.2} 
        castShadow
      />
      
      {/* 辅助光源 */}
      <directionalLight 
        position={[-2, 2, -2]} 
        intensity={0.6} 
        color="#ffffff"
      />
      
      {/* 点光源增加金属光泽 */}
      <pointLight 
        position={[0, 2, 2]} 
        intensity={0.8} 
        color="#ffffff"
      />
    </>
  );
}

export function LogoCoin3D() {
  return (
    <div className="w-20 h-20">
      <Canvas
        camera={{ 
          position: [0, 0, 4], 
          fov: 45,
          near: 0.1,
          far: 100
        }}
        gl={{ 
          antialias: true,
          alpha: true,
          powerPreference: "high-performance"
        }}
      >
        <LogoLighting />
        <LogoCoin />
      </Canvas>
    </div>
  );
}