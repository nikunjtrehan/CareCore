import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Center } from '@react-three/drei';

export default function MedicalCross({ scrollRotation }) {
  const groupRef = useRef();

  // Read the global scroll framer motion value natively in the 3D loop
  useFrame((state, delta) => {
    if (groupRef.current) {
      // Direct pass from the Framer Motion transformation calculation
      const rotationY = scrollRotation.get();
      groupRef.current.rotation.y = rotationY;
      
      // Keep your ambient rotation logic if desired... wait, let's keep it purely linked to scroll
      // Or we can add an innate rotation offset if you want. Let's just track the scroll linearly!
    }
  });

  const materialProps = {
    transmission: 0.9,
    opacity: 1,
    roughness: 0.2,
    ior: 1.5,
    thickness: 2,
    color: '#ef4444',
    transparent: true
  };

  return (
    <>
      {/* Lighting */}
      <ambientLight intensity={0.4} />
      {/* Soft Gold Directional */}
      <directionalLight position={[5, 5, 5]} intensity={1.2} color="#ffd700" />
      {/* Pure White Directional */}
      <directionalLight position={[-5, -5, 5]} intensity={0.8} color="#ffffff" />
      
      {/* Centered Medical Cross with raw Three.js group refs instead of framer-motion-3d */}
      <Center>
        <group ref={groupRef}>
          {/* Vertical Box */}
          <mesh>
            <boxGeometry args={[1, 3, 1]} />
            <meshPhysicalMaterial {...materialProps} />
          </mesh>
          {/* Horizontal Box */}
          <mesh>
            <boxGeometry args={[3, 1, 1]} />
            <meshPhysicalMaterial {...materialProps} />
          </mesh>
        </group>
      </Center>
    </>
  );
}
