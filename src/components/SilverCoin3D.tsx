import { Canvas } from '@react-three/fiber';
import { useRef, useEffect } from 'react';
import * as THREE from 'three';

function Coin() {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useEffect(() => {
    if (meshRef.current) {
      const animate = () => {
        if (meshRef.current) {
          meshRef.current.rotation.y += 0.02;
          meshRef.current.rotation.x = Math.sin(Date.now() * 0.001) * 0.1;
        }
        requestAnimationFrame(animate);
      };
      animate();
    }
  }, []);

  return (
    <mesh ref={meshRef} position={[0, 0, 0]}>
      {/* 硬币主体 - 圆柱体 */}
      <cylinderGeometry args={[1.5, 1.5, 0.2, 64]} />
      <meshStandardMaterial 
        color="#C0C0C0"
        metalness={0.9}
        roughness={0.1}
        envMapIntensity={1}
      />
      
      {/* 内部细节 - 圆环 */}
      <mesh position={[0, 0.11, 0]}>
        <torusGeometry args={[1.2, 0.05, 16, 100]} />
        <meshStandardMaterial 
          color="#E8E8E8"
          metalness={0.95}
          roughness={0.05}
        />
      </mesh>
      
      {/* 中心图案 - 美元符号样式的立体字母 */}
      <mesh position={[0, 0.12, 0]}>
        <cylinderGeometry args={[0.8, 0.8, 0.02, 32]} />
        <meshStandardMaterial 
          color="#B8B8B8"
          metalness={0.8}
          roughness={0.2}
        />
      </mesh>
      
      {/* "1" 字符图案 */}
      {/* 垂直主线 */}
      <mesh position={[0.1, 0.13, 0]} rotation={[0, 0, 0]}>
        <boxGeometry args={[0.08, 1.0, 0.03]} />
        <meshStandardMaterial 
          color="#A0A0A0"
          metalness={0.9}
          roughness={0.1}
        />
      </mesh>
      
      {/* 顶部斜线 */}
      <mesh position={[-0.1, 0.4, 0]} rotation={[0, 0, Math.PI / 4]}>
        <boxGeometry args={[0.06, 0.3, 0.03]} />
        <meshStandardMaterial 
          color="#A0A0A0"
          metalness={0.9}
          roughness={0.1}
        />
      </mesh>
      
      {/* 底部基座线 */}
      <mesh position={[0, -0.3, 0]} rotation={[0, 0, 0]}>
        <boxGeometry args={[0.4, 0.06, 0.03]} />
        <meshStandardMaterial 
          color="#A0A0A0"
          metalness={0.9}
          roughness={0.1}
        />
      </mesh>
    </mesh>
  );
}

function Lighting() {
  return (
    <>
      {/* 环境光 */}
      <ambientLight intensity={0.3} />
      
      {/* 主光源 */}
      <directionalLight 
        position={[5, 5, 5]} 
        intensity={1} 
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
      />
      
      {/* 辅助光源 */}
      <directionalLight 
        position={[-5, 3, -5]} 
        intensity={0.5} 
        color="#ffffff"
      />
      
      {/* 点光源增加金属光泽 */}
      <pointLight 
        position={[0, 3, 3]} 
        intensity={0.8} 
        color="#ffffff"
      />
      
      {/* 底部补光 */}
      <pointLight 
        position={[0, -2, 0]} 
        intensity={0.3} 
        color="#f0f0f0"
      />
    </>
  );
}

export function SilverCoin3D() {
  return (
    <div className="absolute inset-0 w-full h-full opacity-40">
      <Canvas
        camera={{ 
          position: [0, 0, 6], 
          fov: 50,
          near: 0.1,
          far: 100
        }}
        gl={{ 
          antialias: true,
          alpha: true,
          powerPreference: "high-performance"
        }}
      >
        <Lighting />
        <Coin />
      </Canvas>
    </div>
  );
}