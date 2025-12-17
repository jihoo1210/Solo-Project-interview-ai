import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, MeshDistortMaterial, GradientTexture, Line } from '@react-three/drei';
import * as THREE from 'three';

// 행성 위를 뛰어다니는 토끼
function JumpingRabbitOnPlanet({
  planetRadius = 1.5,
  color = '#FFFFFF',
  innerEarColor = '#FFB6C1',
  startAngle = 0,
  orbitSpeed = 0.5
}: {
  planetRadius?: number;
  color?: string;
  innerEarColor?: string;
  startAngle?: number;
  orbitSpeed?: number;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const rabbitRef = useRef<THREE.Group>(null);
  const earLeftRef = useRef<THREE.Mesh>(null);
  const earRightRef = useRef<THREE.Mesh>(null);

  // 토끼가 행성 위를 뛰어다니는 애니메이션
  useFrame((state) => {
    if (groupRef.current && rabbitRef.current) {
      const time = state.clock.elapsedTime;

      // 행성 주위를 도는 각도 (천천히)
      const orbitAngle = startAngle + time * orbitSpeed;

      // 토끼의 위치 (행성 표면 위)
      const surfaceOffset = 0.35; // 토끼 높이
      const radius = planetRadius + surfaceOffset;

      // 행성 표면 위 위치 계산
      groupRef.current.position.x = Math.cos(orbitAngle) * radius;
      groupRef.current.position.y = Math.sin(orbitAngle) * radius;
      groupRef.current.position.z = 0;

      // 토끼가 행성 표면을 향하도록 회전
      groupRef.current.rotation.z = orbitAngle - Math.PI / 2;

      // 뛰는 동작 (위아래로 통통)
      const jumpHeight = Math.abs(Math.sin(time * 4)) * 0.15;
      rabbitRef.current.position.y = jumpHeight;

      // 뛸 때 약간 기울어지는 효과
      rabbitRef.current.rotation.x = Math.sin(time * 4) * 0.1;
    }

    // 귀 펄럭임
    if (earLeftRef.current) {
      earLeftRef.current.rotation.z = 0.2 + Math.sin(state.clock.elapsedTime * 5) * 0.15;
    }
    if (earRightRef.current) {
      earRightRef.current.rotation.z = -0.2 + Math.sin(state.clock.elapsedTime * 5 + 0.3) * 0.15;
    }
  });

  return (
    <group ref={groupRef}>
      <group ref={rabbitRef} scale={0.4}>
        {/* 몸통 */}
        <mesh position={[0, 0.15, 0]}>
          <sphereGeometry args={[0.35, 32, 32]} />
          <meshStandardMaterial color={color} roughness={0.3} />
        </mesh>

        {/* 머리 */}
        <mesh position={[0, 0.55, 0]}>
          <sphereGeometry args={[0.28, 32, 32]} />
          <meshStandardMaterial color={color} roughness={0.3} />
        </mesh>

        {/* 왼쪽 귀 */}
        <mesh ref={earLeftRef} position={[-0.12, 0.85, 0]} rotation={[0, 0, 0.2]}>
          <capsuleGeometry args={[0.06, 0.3, 8, 16]} />
          <meshStandardMaterial color={color} roughness={0.3} />
        </mesh>
        {/* 왼쪽 귀 안쪽 */}
        <mesh position={[-0.12, 0.87, 0.04]} rotation={[0, 0, 0.2]}>
          <capsuleGeometry args={[0.03, 0.2, 8, 16]} />
          <meshStandardMaterial color={innerEarColor} roughness={0.3} />
        </mesh>

        {/* 오른쪽 귀 */}
        <mesh ref={earRightRef} position={[0.12, 0.85, 0]} rotation={[0, 0, -0.2]}>
          <capsuleGeometry args={[0.06, 0.3, 8, 16]} />
          <meshStandardMaterial color={color} roughness={0.3} />
        </mesh>
        {/* 오른쪽 귀 안쪽 */}
        <mesh position={[0.12, 0.87, 0.04]} rotation={[0, 0, -0.2]}>
          <capsuleGeometry args={[0.03, 0.2, 8, 16]} />
          <meshStandardMaterial color={innerEarColor} roughness={0.3} />
        </mesh>

        {/* 왼쪽 눈 */}
        <mesh position={[-0.08, 0.58, 0.22]}>
          <sphereGeometry args={[0.05, 16, 16]} />
          <meshStandardMaterial color="#292524" />
        </mesh>
        {/* 왼쪽 눈 하이라이트 */}
        <mesh position={[-0.06, 0.6, 0.26]}>
          <sphereGeometry args={[0.015, 16, 16]} />
          <meshStandardMaterial color="#FFFFFF" />
        </mesh>

        {/* 오른쪽 눈 */}
        <mesh position={[0.08, 0.58, 0.22]}>
          <sphereGeometry args={[0.05, 16, 16]} />
          <meshStandardMaterial color="#292524" />
        </mesh>
        {/* 오른쪽 눈 하이라이트 */}
        <mesh position={[0.1, 0.6, 0.26]}>
          <sphereGeometry args={[0.015, 16, 16]} />
          <meshStandardMaterial color="#FFFFFF" />
        </mesh>

        {/* 코 */}
        <mesh position={[0, 0.5, 0.26]}>
          <sphereGeometry args={[0.03, 16, 16]} />
          <meshStandardMaterial color="#FFB6C1" />
        </mesh>

        {/* 볼 터치 (왼쪽) */}
        <mesh position={[-0.15, 0.5, 0.18]}>
          <sphereGeometry args={[0.04, 16, 16]} />
          <meshStandardMaterial color="#FFB6C1" transparent opacity={0.5} />
        </mesh>

        {/* 볼 터치 (오른쪽) */}
        <mesh position={[0.15, 0.5, 0.18]}>
          <sphereGeometry args={[0.04, 16, 16]} />
          <meshStandardMaterial color="#FFB6C1" transparent opacity={0.5} />
        </mesh>

        {/* 꼬리 */}
        <mesh position={[0, 0.1, -0.35]}>
          <sphereGeometry args={[0.1, 16, 16]} />
          <meshStandardMaterial color={color} roughness={0.2} />
        </mesh>

        {/* 앞발 */}
        <mesh position={[-0.15, -0.1, 0.1]}>
          <sphereGeometry args={[0.08, 16, 16]} />
          <meshStandardMaterial color={color} roughness={0.3} />
        </mesh>
        <mesh position={[0.15, -0.1, 0.1]}>
          <sphereGeometry args={[0.08, 16, 16]} />
          <meshStandardMaterial color={color} roughness={0.3} />
        </mesh>

        {/* 뒷발 */}
        <mesh position={[-0.12, -0.15, -0.1]}>
          <capsuleGeometry args={[0.06, 0.12, 8, 16]} />
          <meshStandardMaterial color={color} roughness={0.3} />
        </mesh>
        <mesh position={[0.12, -0.15, -0.1]}>
          <capsuleGeometry args={[0.06, 0.12, 8, 16]} />
          <meshStandardMaterial color={color} roughness={0.3} />
        </mesh>
      </group>
    </group>
  );
}

// 메인 그라디언트 행성
function GradientPlanet() {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = state.clock.elapsedTime * 0.1;
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.15;
    }
  });

  return (
    <Float speed={1} rotationIntensity={0.2} floatIntensity={0.5}>
      <mesh ref={meshRef} scale={1.5}>
        <sphereGeometry args={[1, 64, 64]} />
        <MeshDistortMaterial
          speed={1.5}
          distort={0.2}
          radius={1}
        >
          <GradientTexture
            stops={[0, 0.5, 1]}
            colors={['#F59E0B', '#FBBF24', '#6366F1']}
          />
        </MeshDistortMaterial>
      </mesh>
    </Float>
  );
}

// 떠다니는 별들
function FloatingStars() {
  const stars = useMemo(() => {
    const items = [];
    for (let i = 0; i < 20; i++) {
      items.push({
        id: i,
        position: [
          (Math.random() - 0.5) * 10,
          (Math.random() - 0.5) * 8,
          (Math.random() - 0.5) * 6 - 2,
        ] as [number, number, number],
        scale: 0.05 + Math.random() * 0.1,
        speed: 0.5 + Math.random() * 1,
        color: Math.random() > 0.5 ? '#FBBF24' : '#6366F1',
      });
    }
    return items;
  }, []);

  return (
    <>
      {stars.map((star) => (
        <FloatingStar key={star.id} {...star} />
      ))}
    </>
  );
}

function FloatingStar({
  position,
  scale,
  speed,
  color,
}: {
  position: [number, number, number];
  scale: number;
  speed: number;
  color: string;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const initialScale = useRef(scale);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.z = state.clock.elapsedTime * speed;
      meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * speed) * 0.2;
      const pulse = 0.8 + Math.sin(state.clock.elapsedTime * speed * 2) * 0.2;
      meshRef.current.scale.setScalar(initialScale.current * pulse);
    }
  });

  return (
    <mesh ref={meshRef} position={position}>
      <octahedronGeometry args={[1, 0]} />
      <meshStandardMaterial
        color={color}
        emissive={color}
        emissiveIntensity={0.3}
        roughness={0.2}
        metalness={0.8}
      />
    </mesh>
  );
}

// 궤도 링
function OrbitRings() {
  const ring1Ref = useRef<THREE.Mesh>(null);
  const ring2Ref = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (ring1Ref.current) {
      ring1Ref.current.rotation.x = Math.PI / 3 + state.clock.elapsedTime * 0.2;
      ring1Ref.current.rotation.z = state.clock.elapsedTime * 0.1;
    }
    if (ring2Ref.current) {
      ring2Ref.current.rotation.x = -Math.PI / 4 + state.clock.elapsedTime * 0.15;
      ring2Ref.current.rotation.y = state.clock.elapsedTime * 0.1;
    }
  });

  return (
    <>
      <mesh ref={ring1Ref} scale={2.2}>
        <torusGeometry args={[1, 0.015, 16, 100]} />
        <meshBasicMaterial color="#F59E0B" transparent opacity={0.5} />
      </mesh>
      <mesh ref={ring2Ref} scale={2.6}>
        <torusGeometry args={[1, 0.012, 16, 100]} />
        <meshBasicMaterial color="#6366F1" transparent opacity={0.4} />
      </mesh>
    </>
  );
}

// 연결선들
function ConnectionLines() {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.z = state.clock.elapsedTime * 0.03;
    }
  });

  const lines = useMemo(() => {
    const items = [];
    for (let i = 0; i < 5; i++) {
      const angle = (i / 5) * Math.PI * 2;
      items.push({
        id: i,
        points: [
          new THREE.Vector3(0, 0, 0),
          new THREE.Vector3(
            Math.cos(angle) * 2.5,
            Math.sin(angle) * 2.5,
            (Math.random() - 0.5) * 1.5
          ),
        ],
      });
    }
    return items;
  }, []);

  return (
    <group ref={groupRef}>
      {lines.map((line) => (
        <Line
          key={line.id}
          points={line.points}
          color="#FBBF24"
          lineWidth={1}
          transparent
          opacity={0.25}
        />
      ))}
    </group>
  );
}

// 파티클 필드
function ParticleField() {
  const particlesRef = useRef<THREE.Points>(null);
  const count = 80;

  const { positions, colors } = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);

    const primaryColor = new THREE.Color('#F59E0B');
    const accentColor = new THREE.Color('#6366F1');

    for (let i = 0; i < count; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const r = 3.5 + Math.random() * 2;

      pos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      pos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      pos[i * 3 + 2] = r * Math.cos(phi);

      const color = Math.random() > 0.5 ? primaryColor : accentColor;
      col[i * 3] = color.r;
      col[i * 3 + 1] = color.g;
      col[i * 3 + 2] = color.b;
    }
    return { positions: pos, colors: col };
  }, []);

  const positionAttribute = useMemo(
    () => new THREE.BufferAttribute(positions, 3),
    [positions]
  );

  const colorAttribute = useMemo(
    () => new THREE.BufferAttribute(colors, 3),
    [colors]
  );

  useFrame((state) => {
    if (particlesRef.current) {
      particlesRef.current.rotation.y = state.clock.elapsedTime * 0.02;
      particlesRef.current.rotation.x = state.clock.elapsedTime * 0.015;
    }
  });

  return (
    <points ref={particlesRef}>
      <bufferGeometry>
        <primitive attach="attributes-position" object={positionAttribute} />
        <primitive attach="attributes-color" object={colorAttribute} />
      </bufferGeometry>
      <pointsMaterial
        size={0.05}
        vertexColors
        transparent
        opacity={0.7}
        sizeAttenuation
      />
    </points>
  );
}

// 메인 Scene
function Scene({ isPremium = false }: { isPremium?: boolean }) {
  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight position={[5, 5, 5]} intensity={0.8} />
      <pointLight position={[-3, 3, 3]} intensity={0.5} color="#F59E0B" />
      <pointLight position={[3, -3, 3]} intensity={0.3} color="#6366F1" />

      <GradientPlanet />
      <OrbitRings />
      <ConnectionLines />
      <FloatingStars />
      <ParticleField />

      {/* 행성 위를 뛰어다니는 흰색 토끼 */}
      <JumpingRabbitOnPlanet planetRadius={1.5} />

      {/* Premium 사용자: 노란색 토끼 추가 (반대편에서 뛰어다님) */}
      {isPremium && (
        <JumpingRabbitOnPlanet
          planetRadius={1.5}
          color="#FBBF24"
          innerEarColor="#F59E0B"
          startAngle={Math.PI}
          orbitSpeed={0.6}
        />
      )}
    </>
  );
}

interface CoachCharacterProps {
  className?: string;
  mood?: 'happy' | 'thinking' | 'excited';
  isPremium?: boolean;
}

export default function CoachCharacter({ className = '', isPremium = false }: CoachCharacterProps) {
  return (
    <div className={`${className}`}>
      <Canvas
        camera={{ position: [0, 0, 6], fov: 50 }}
        style={{ background: 'transparent' }}
        gl={{ antialias: true, alpha: true }}
      >
        <Scene isPremium={isPremium} />
      </Canvas>
    </div>
  );
}
