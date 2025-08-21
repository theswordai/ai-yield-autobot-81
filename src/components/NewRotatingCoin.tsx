import { Canvas } from '@react-three/fiber';
import { useRef, useEffect } from 'react';
import * as THREE from 'three';

function RotatingCoin() {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useEffect(() => {
    if (meshRef.current) {
      const animate = () => {
        if (meshRef.current) {
          // 持续的Y轴旋转
          meshRef.current.rotation.y += 0.03;
          // 添加Z轴的微妙倾斜
          meshRef.current.rotation.z = Math.cos(Date.now() * 0.0015) * 0.1;
        }
        requestAnimationFrame(animate);
      };
      animate();
    }
  }, []);

  return (
    <mesh ref={meshRef} position={[0, 0, 0]}>
      {/* 硬币主体 - 更厚的圆柱体 */}
      <cylinderGeometry args={[1.8, 1.8, 0.25, 72]} />
      <meshStandardMaterial 
        color="#D4AF37"
        metalness={0.95}
        roughness={0.05}
        envMapIntensity={1.2}
      />
      
      {/* 外环装饰 */}
      <mesh position={[0, 0.13, 0]}>
        <torusGeometry args={[1.6, 0.08, 16, 100]} />
        <meshStandardMaterial 
          color="#F4E4BC"
          metalness={0.9}
          roughness={0.1}
        />
      </mesh>
      
      {/* 内环装饰 */}
      <mesh position={[0, 0.13, 0]}>
        <torusGeometry args={[1.2, 0.04, 16, 100]} />
        <meshStandardMaterial 
          color="#B8860B"
          metalness={0.85}
          roughness={0.15}
        />
      </mesh>
      
      {/* 中心凸起 */}
      <mesh position={[0, 0.14, 0]}>
        <cylinderGeometry args={[0.9, 0.9, 0.03, 48]} />
        <meshStandardMaterial 
          color="#DAA520"
          metalness={0.9}
          roughness={0.1}
        />
      </mesh>
      
      {/* 中央图案 - "1" 字符 */}
      {/* 垂直主线 */}
      <mesh position={[0.12, 0.15, 0]} rotation={[0, 0, 0]}>
        <boxGeometry args={[0.08, 1.1, 0.04]} />
        <meshStandardMaterial 
          color="#B8860B"
          metalness={0.95}
          roughness={0.05}
        />
      </mesh>
      
      {/* 顶部斜线 */}
      <mesh position={[-0.12, 0.45, 0]} rotation={[0, 0, Math.PI / 3.5]}>
        <boxGeometry args={[0.06, 0.35, 0.04]} />
        <meshStandardMaterial 
          color="#B8860B"
          metalness={0.95}
          roughness={0.05}
        />
      </mesh>
      
      {/* 背面装饰 - 创建双面硬币效果 */}
      <mesh position={[0, -0.13, 0]} rotation={[Math.PI, 0, 0]}>
        <torusGeometry args={[1.6, 0.08, 16, 100]} />
        <meshStandardMaterial 
          color="#F4E4BC"
          metalness={0.9}
          roughness={0.1}
        />
      </mesh>
      
      <mesh position={[0, -0.13, 0]} rotation={[Math.PI, 0, 0]}>
        <torusGeometry args={[1.2, 0.04, 16, 100]} />
        <meshStandardMaterial 
          color="#B8860B"
          metalness={0.85}
          roughness={0.15}
        />
      </mesh>
    </mesh>
  );
}

function CoinLighting() {
  return (
    <>
      {/* 环境光 */}
      <ambientLight intensity={0.4} />
      
      {/* 主光源 - 从上方照射 */}
      <directionalLight 
        position={[5, 8, 5]} 
        intensity={1.5} 
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
      />
      
      {/* 侧面光源 */}
      <directionalLight 
        position={[-5, 3, -5]} 
        intensity={0.8} 
        color="#fff8dc"
      />
      
      {/* 点光源增加金属光泽 */}
      <pointLight 
        position={[0, 4, 4]} 
        intensity={1} 
        color="#fff8dc"
      />
      
      {/* 底部补光 */}
      <pointLight 
        position={[0, -3, 0]} 
        intensity={0.4} 
        color="#daa520"
      />
      
      {/* 环绕光源 */}
      <pointLight 
        position={[3, 0, 3]} 
        intensity={0.6} 
        color="#f4e4bc"
      />
    </>
  );
}

export function NewRotatingCoin() {
  return (
    <div className="w-full h-full">
      <Canvas
        camera={{ 
          position: [0, 0, 7], 
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
        <CoinLighting />
        <RotatingCoin />
      </Canvas>
    </div>
  );
}