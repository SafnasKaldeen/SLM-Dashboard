"use client";

import { Suspense, useRef, useEffect, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import {
  OrbitControls,
  PerspectiveCamera,
  Environment,
  ContactShadows,
  useGLTF,
  Text,
} from "@react-three/drei";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RotateCcw, Play, Pause, Move3D } from "lucide-react";
import * as THREE from "three";

// Fallback if 3D fails
function ImageFallback() {
  const meshRef = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.3;
    }
  });

  return (
    <group ref={meshRef}>
      <mesh position={[0, 0, 0]}>
        <planeGeometry args={[3, 2]} />
        <meshBasicMaterial>
          <primitive
            object={new THREE.TextureLoader().load(
              "/Scooter3D/scooter-preview.png"
            )}
            attach="map"
          />
        </meshBasicMaterial>
      </mesh>
      <mesh position={[0, 0, -0.01]}>
        <planeGeometry args={[3.1, 2.1]} />
        <meshBasicMaterial color="#1e293b" />
      </mesh>
    </group>
  );
}

// Load GLB - Fixed scaling issue
function LoadedScooterModel({
  glbPath,
  isAutoRotating,
  onLoad,
}: {
  glbPath: string;
  isAutoRotating: boolean;
  onLoad?: () => void;
}) {
  const { scene } = useGLTF(glbPath);
  const meshRef = useRef<THREE.Group>(null);
  const [isScaled, setIsScaled] = useState(false);

  // Only rotate when isAutoRotating is true
  useFrame((_, delta) => {
    if (meshRef.current && isAutoRotating) {
      meshRef.current.rotation.y += delta * 0.5;
    }
  });

  useEffect(() => {
    if (scene && !isScaled) {
      const box = new THREE.Box3().setFromObject(scene);
      const center = box.getCenter(new THREE.Vector3());
      const size = box.getSize(new THREE.Vector3());
      const maxDim = Math.max(size.x, size.y, size.z);
      const scale = 2 / maxDim;

      scene.scale.setScalar(scale);
      scene.position.copy(center).multiplyScalar(-scale);

      setIsScaled(true);

      // Notify parent that model has loaded
      if (onLoad) {
        onLoad();
      }
    }
  }, [scene, isScaled, onLoad]);

  return <primitive ref={meshRef} object={scene} />;
}

// Updated to pass isAutoRotating prop and handle loading
function ScooterModel({
  isAutoRotating,
  onLoad,
}: {
  isAutoRotating: boolean;
  onLoad?: () => void;
}) {
  return (
    <LoadedScooterModel
      glbPath="/Scooter3D/YADEA.glb"
      isAutoRotating={isAutoRotating}
      onLoad={onLoad}
    />
  );
}

// Fixed loading fallback using Three.js objects
function LoadingFallback() {
  const spinnerRef = useRef<THREE.Mesh>(null);

  useFrame((_, delta) => {
    if (spinnerRef.current) {
      spinnerRef.current.rotation.z += delta * 2;
    }
  });

  return (
    <group>
      {/* Spinning loading ring */}
      <mesh ref={spinnerRef} position={[0, 0.5, 0]}>
        <ringGeometry args={[0.3, 0.4, 32]} />
        <meshBasicMaterial color="#06b6d4" transparent opacity={0.8} />
      </mesh>

      {/* Loading text */}
      <Text
        position={[0, -0.5, 0]}
        fontSize={0.2}
        color="#ffffff"
        anchorX="center"
        anchorY="middle"
      >
        Loading 3D Scooter Model...
      </Text>
    </group>
  );
}

export function SimpleScooter3D() {
  const [currentView, setCurrentView] = useState("angle");
  const [isAutoRotating, setIsAutoRotating] = useState(false);
  const [cameraPosition, setCameraPosition] = useState({ x: 2, y: 1.5, z: 2 });
  const [targetPosition, setTargetPosition] = useState({ x: 0, y: 0, z: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const controlsRef = useRef<any>(null);

  // 40% zoom-in: scale camera closer
  const zoomedViewPresets = {
    front: { position: [-0.1, 0.51, 3.16], target: [0, 0, 0] },
    side: { position: [3.18, -0.31, 0.12], target: [0, 0, 0] },
    back: { position: [0.13, 0.33, -3.18], target: [0, 0, 0] },
    top: { position: [0.02, 3.04, -0.99], target: [0, 0, 0] },
    angle: { position: [2, 1.5, 2], target: [0, 0, 0] },
  };

  const handleViewChange = (view: string) => {
    if (isAutoRotating) return;
    setCurrentView(view);
    const preset = zoomedViewPresets[view as keyof typeof zoomedViewPresets];

    if (controlsRef.current?.object && controlsRef.current?.target) {
      controlsRef.current.object.position.set(...preset.position);
      controlsRef.current.target.set(...preset.target);
      controlsRef.current.update();
    }
  };

  const resetView = () => {
    handleViewChange("angle");
    setIsAutoRotating(false);
  };

  return (
    <div className="relative w-full h-full min-h-[500px] overflow-hidden">
      {/* Consistent background layer */}
      <div className="absolute inset-0 bg-transparent" />

      {/* Loading overlay - outside Canvas */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-900/80 backdrop-blur-sm z-10">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-gray-300 mt-2">Loading 3D Scooter Model...</p>
          </div>
        </div>
      )}

      <Canvas
        shadows
        camera={{ position: [2, 1.5, 2], fov: 50 }}
        className="relative w-full h-full"
        gl={{ antialias: true, alpha: true }}
        onCreated={({ gl }) => {
          gl.setClearColor(0x000000, 0); // Transparent canvas
          gl.toneMapping = THREE.ACESFilmicToneMapping;
          gl.toneMappingExposure = 1.2;
        }}
        style={{ background: "transparent" }}
      >
        <PerspectiveCamera makeDefault position={[2, 1.5, 2]} />

        <ambientLight intensity={0.3} color="#ffffff" />
        <directionalLight
          position={[10, 10, 5]}
          intensity={1.5}
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
          shadow-camera-far={50}
          shadow-camera-left={-10}
          shadow-camera-right={10}
          shadow-camera-top={10}
          shadow-camera-bottom={-10}
          color="#ffffff"
        />
        <pointLight
          position={[-5, 5, -5]}
          intensity={0.4}
          color="#0ea5e9"
          distance={20}
        />
        <pointLight
          position={[5, 2, 5]}
          intensity={0.3}
          color="#06b6d4"
          distance={15}
        />
        <spotLight
          position={[0, 8, 8]}
          intensity={0.5}
          angle={Math.PI / 4}
          penumbra={0.5}
          color="#38bdf8"
          target-position={[0, 0, 0]}
        />

        <Environment preset="city" background={false} />
        <ContactShadows
          position={[0, -2, 0]}
          opacity={0.4}
          scale={12}
          blur={2.5}
          far={4}
          resolution={512}
          color="#000000"
        />

        <OrbitControls
          ref={controlsRef}
          enablePan
          enableZoom
          enableRotate
          minDistance={1}
          maxDistance={8}
          autoRotate={isAutoRotating}
          autoRotateSpeed={1.5}
          onStart={() => setIsAutoRotating(false)}
          onChange={() => {
            if (controlsRef.current?.object) {
              const pos = controlsRef.current.object.position;
              const target = controlsRef.current.target;
              setCameraPosition({
                x: Math.round(pos.x * 100) / 100,
                y: Math.round(pos.y * 100) / 100,
                z: Math.round(pos.z * 100) / 100,
              });
              setTargetPosition({
                x: Math.round(target.x * 100) / 100,
                y: Math.round(target.y * 100) / 100,
                z: Math.round(target.z * 100) / 100,
              });
            }
          }}
          dampingFactor={0.05}
          enableDamping
          maxPolarAngle={Math.PI * 0.9}
          minPolarAngle={Math.PI * 0.1}
        />

        <Suspense fallback={<LoadingFallback />}>
          <ScooterModel
            isAutoRotating={isAutoRotating}
            onLoad={() => setIsLoading(false)}
          />
        </Suspense>
      </Canvas>

      {/* View buttons (top-left) */}
      <div className="absolute top-4 left-4 space-y-3 z-20">
        <Badge className="bg-black/80 text-white border-white/20 backdrop-blur-md">
          <Move3D className="w-4 h-4 mr-2" />
          Interactive 3D Scooter
        </Badge>

        <div className="flex flex-wrap gap-2">
          {Object.keys(zoomedViewPresets).map((view) => (
            <Button
              key={view}
              size="sm"
              disabled={isAutoRotating || isLoading}
              variant={currentView === view ? "default" : "outline"}
              className={`text-xs transition-all duration-200 ${
                isAutoRotating || isLoading
                  ? "opacity-50 cursor-not-allowed"
                  : currentView === view
                  ? "bg-cyan-500 hover:bg-cyan-600 text-white shadow-lg shadow-cyan-500/25"
                  : "bg-black/80 border-white/20 text-white hover:bg-white hover:text-black backdrop-blur-md"
              }`}
              onClick={() => handleViewChange(view)}
            >
              {view.charAt(0).toUpperCase() + view.slice(1)}
            </Button>
          ))}
        </div>
      </div>

      {/* Bottom-right controls */}
      <div className="absolute bottom-4 right-4 flex gap-2 z-20">
        <Button
          size="sm"
          variant="outline"
          disabled={isLoading}
          className="bg-black/80 border-white/20 text-white hover:bg-white hover:text-black backdrop-blur-md transition-all duration-200 disabled:opacity-50"
          onClick={() => setIsAutoRotating(!isAutoRotating)}
          title={isAutoRotating ? "Pause rotation" : "Start rotation"}
        >
          {isAutoRotating ? (
            <Pause className="w-4 h-4" />
          ) : (
            <Play className="w-4 h-4" />
          )}
        </Button>

        <Button
          size="sm"
          variant="outline"
          disabled={isLoading}
          className="bg-black/80 border-white/20 text-white hover:bg-white hover:text-black backdrop-blur-md transition-all duration-200 disabled:opacity-50"
          onClick={resetView}
          title="Reset view"
        >
          <RotateCcw className="w-4 h-4" />
        </Button>
      </div>

      {/* Status indicator */}
      <div className="absolute top-4 right-4 z-20">
        <Badge
          className={`backdrop-blur-md transition-all duration-300 ${
            isLoading
              ? "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
              : "bg-green-500/20 text-green-400 border-green-500/30"
          }`}
        >
          {isLoading ? "🔄 Loading..." : "✓ 3D Model Ready"}
        </Badge>
      </div>
    </div>
  );
}

export default SimpleScooter3D;
