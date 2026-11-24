import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';

interface CinematicShieldCanvasProps {
  elapsedSecRef: React.MutableRefObject<number>;
}

const _vec3 = new THREE.Vector3();

function createShieldShape(scale: number): THREE.Shape {
  const s = new THREE.Shape();
  s.moveTo(0, 1.45 * scale);
  s.bezierCurveTo(
    0.58 * scale,
    1.45 * scale,
    1.08 * scale,
    1.22 * scale,
    1.18 * scale,
    1.04 * scale
  );
  s.bezierCurveTo(
    1.16 * scale,
    0.25 * scale,
    0.92 * scale,
    -0.82 * scale,
    0,
    -1.48 * scale
  );
  s.bezierCurveTo(
    -0.92 * scale,
    -0.82 * scale,
    -1.16 * scale,
    0.25 * scale,
    -1.18 * scale,
    1.04 * scale
  );
  s.bezierCurveTo(
    -1.08 * scale,
    1.22 * scale,
    -0.58 * scale,
    1.45 * scale,
    0,
    1.45 * scale
  );
  return s;
}

export default function CinematicShieldCanvas({
  elapsedSecRef,
}: CinematicShieldCanvasProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const [contextLost, setContextLost] = useState(false);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const isSoftwareGl = (() => {
      try {
        const probe = document.createElement('canvas').getContext('webgl2');
        if (!probe) return true;
        const ext = probe.getExtension('WEBGL_debug_renderer_info');
        const param = ext ? ext.UNMASKED_RENDERER_WEBGL : probe.RENDERER;
        const gpu = String(probe.getParameter(param));
        probe.getExtension('WEBGL_lose_context')?.loseContext();
        return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
      } catch {
        return true;
      }
    })();

    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x101412);
    scene.fog = new THREE.FogExp2(0x101412, 0.055);

    const camera = new THREE.PerspectiveCamera(44, width / height, 0.1, 80);
    camera.position.set(0, 0.2, 8.2);

    const renderer = new THREE.WebGLRenderer({
      antialias: !isSoftwareGl,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(
      isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2)
    );
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.12;
    container.appendChild(renderer.domElement);

    const handleContextLost = (e: Event) => {
      e.preventDefault();
      setContextLost(true);
    };
    const handleContextRestored = () => {
      setContextLost(false);
    };
    renderer.domElement.addEventListener('webglcontextlost', handleContextLost);
    renderer.domElement.addEventListener(
      'webglcontextrestored',
      handleContextRestored
    );

    // Studio environment map for glass & champagne metal reflections
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    const roomEnv = new RoomEnvironment();
    const envTarget = pmremGenerator.fromScene(roomEnv, 0.04);
    scene.environment = envTarget.texture;
    roomEnv.dispose();
    pmremGenerator.dispose();

    // 3-Point Warm Champagne / Deep Forest Studio Lighting Rig
    const hemiLight = new THREE.HemisphereLight(0x4f6d60, 0x0d100e, 0.85);
    scene.add(hemiLight);

    const keyLight = new THREE.DirectionalLight(0xf6e6c8, 2.2);
    keyLight.position.set(4.5, 5.5, 6);
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0xc6a878, 1.8);
    rimLight.position.set(-5, 2.5, -4);
    scene.add(rimLight);

    const impactPointLight = new THREE.PointLight(0xe5c58e, 0, 14, 1.8);
    impactPointLight.position.set(0, 0, 1.8);
    scene.add(impactPointLight);

    const disposableGeometries: THREE.BufferGeometry[] = [];
    const disposableMaterials: THREE.Material[] = [];

    // 1. Floating Architectural Translucent Monoliths (Environment Depth)
    const monolithGroup = new THREE.Group();
    const monolithGeo = new THREE.BoxGeometry(0.7, 3.2, 0.16);
    disposableGeometries.push(monolithGeo);

    const monolithMat = new THREE.MeshPhysicalMaterial({
      color: 0x263a32,
      roughness: 0.18,
      metalness: 0.15,
      transparent: true,
      opacity: 0.34,
      clearcoat: 1.0,
    });
    disposableMaterials.push(monolithMat);

    const monolithCount = 14;
    const monolithInstanced = new THREE.InstancedMesh(
      monolithGeo,
      monolithMat,
      monolithCount
    );
    const dummy = new THREE.Object3D();
    for (let i = 0; i < monolithCount; i++) {
      const side = i % 2 === 0 ? -1 : 1;
      const depth = -1.5 - (i * 1.15);
      const x = side * (2.6 + (i % 3) * 0.95);
      const y = ((i % 4) - 1.5) * 0.65;
      dummy.position.set(x, y, depth);
      dummy.rotation.set(0, side * -0.25, 0);
      dummy.scale.setScalar(0.85 + (i % 3) * 0.22);
      dummy.updateMatrix();
      monolithInstanced.setMatrixAt(i, dummy.matrix);
    }
    monolithInstanced.computeBoundingSphere();
    monolithGroup.add(monolithInstanced);
    scene.add(monolithGroup);

    // 2. Composite Multi-Part 3D Translucent Glass Security Shield
    const shieldGroup = new THREE.Group();

    // Part A: Primary beveled optical glass body
    const innerShieldShape = createShieldShape(0.98);
    const glassGeo = new THREE.ExtrudeGeometry(innerShieldShape, {
      depth: 0.14,
      bevelEnabled: true,
      bevelThickness: 0.06,
      bevelSize: 0.05,
      bevelSegments: 4,
      curveSegments: 28,
    });
    glassGeo.center();
    disposableGeometries.push(glassGeo);

    const glassMat = new THREE.MeshPhysicalMaterial({
      color: 0x3b594c,
      metalness: 0.0,
      roughness: 0.08,
      transmission: isSoftwareGl ? 0 : 0.86,
      transparent: true,
      opacity: isSoftwareGl ? 0.42 : 0.96,
      ior: 1.52,
      thickness: 1.1,
      attenuationColor: new THREE.Color(0x263a32),
      attenuationDistance: 2.2,
      clearcoat: 1.0,
      clearcoatRoughness: 0.06,
      depthWrite: isSoftwareGl ? false : true,
    });
    disposableMaterials.push(glassMat);
    const shieldGlassMesh = new THREE.Mesh(glassGeo, glassMat);
    shieldGlassMesh.renderOrder = 2;
    shieldGroup.add(shieldGlassMesh);

    // Part B: Brushed Champagne-Gold Metallic Perimeter Frame (Hollow Extrude)
    const outerFrameShape = createShieldShape(1.06);
    const innerCutoutPath = createShieldShape(0.96);
    outerFrameShape.holes.push(innerCutoutPath);
    const frameGeo = new THREE.ExtrudeGeometry(outerFrameShape, {
      depth: 0.22,
      bevelEnabled: true,
      bevelThickness: 0.025,
      bevelSize: 0.025,
      bevelSegments: 3,
      curveSegments: 28,
    });
    frameGeo.center();
    disposableGeometries.push(frameGeo);

    const champagneMetalMat = new THREE.MeshPhysicalMaterial({
      color: 0xc6a878,
      metalness: 0.92,
      roughness: 0.24,
      clearcoat: 0.4,
      emissive: new THREE.Color(0x3a2a14),
      emissiveIntensity: 0.2,
    });
    disposableMaterials.push(champagneMetalMat);
    const shieldFrameMesh = new THREE.Mesh(frameGeo, champagneMetalMat);
    shieldGroup.add(shieldFrameMesh);

    // Part C: Precision Architectural Vertical Rib & Inner Aperture Ring
    const ribGeo = new THREE.BoxGeometry(0.03, 2.05, 0.19);
    disposableGeometries.push(ribGeo);
    const ribMat = new THREE.MeshStandardMaterial({
      color: 0xc6a878,
      metalness: 0.9,
      roughness: 0.25,
    });
    disposableMaterials.push(ribMat);
    const verticalRib = new THREE.Mesh(ribGeo, ribMat);
    verticalRib.position.set(0, -0.02, 0.04);
    shieldGroup.add(verticalRib);

    const ringGeo = new THREE.TorusGeometry(0.42, 0.016, 16, 48);
    disposableGeometries.push(ringGeo);
    const coreRing = new THREE.Mesh(ringGeo, ribMat);
    coreRing.position.set(0, 0.12, 0.12);
    shieldGroup.add(coreRing);

    // Part D: Subtle Impact Shockwave Halo
    const haloGeo = new THREE.RingGeometry(0.2, 0.28, 48);
    disposableGeometries.push(haloGeo);
    const haloMat = new THREE.MeshBasicMaterial({
      color: 0xe6c891,
      transparent: true,
      opacity: 0,
      side: THREE.DoubleSide,
      depthWrite: false,
    });
    disposableMaterials.push(haloMat);
    const shockwaveHalo = new THREE.Mesh(haloGeo, haloMat);
    shockwaveHalo.position.set(0, 0.1, 0.25);
    shieldGroup.add(shockwaveHalo);

    shieldGroup.position.set(0, 0, 0);
    shieldGroup.scale.setScalar(0.01);
    scene.add(shieldGroup);

    // 3. Corrupted Threat Shards (Scene 4 -> Intercepted at Scene 5)
    const shardCount = 36;
    const shardGeo = new THREE.OctahedronGeometry(0.09, 0);
    disposableGeometries.push(shardGeo);
    const shardMat = new THREE.MeshStandardMaterial({
      color: 0x9f3344,
      emissive: new THREE.Color(0x4a121b),
      emissiveIntensity: 0.9,
      roughness: 0.3,
      metalness: 0.5,
    });
    disposableMaterials.push(shardMat);
    const shardInstanced = new THREE.InstancedMesh(shardGeo, shardMat, shardCount);
    shardInstanced.frustumCulled = false;

    const shardSeeds = Array.from({ length: shardCount }, (_, i) => ({
      offsetX: Math.sin(i * 2.1) * 1.15,
      offsetY: Math.cos(i * 1.7) * 0.85,
      startZ: 7.5 + (i % 7) * 0.9,
      speed: 3.1 + (i % 5) * 0.45,
      rotSpeed: 1.8 + (i % 4) * 0.5,
    }));
    scene.add(shardInstanced);

    // 4. Harmless Champagne-Gold Light Particles (Released on Interception + Ambient Stream)
    const particleCount = 180;
    const particlePositions = new Float32Array(particleCount * 3);
    const particleSeeds = Array.from({ length: particleCount }, (_, i) => {
      const angle = (i / particleCount) * Math.PI * 2;
      const radius = 0.3 + (i % 15) * 0.24;
      return {
        angle,
        radius,
        yOffset: ((i % 19) - 9) * 0.28,
        speed: 0.4 + (i % 6) * 0.12,
      };
    });
    for (let i = 0; i < particleCount; i++) {
      particlePositions[i * 3] = Math.cos(particleSeeds[i].angle) * particleSeeds[i].radius;
      particlePositions[i * 3 + 1] = particleSeeds[i].yOffset;
      particlePositions[i * 3 + 2] = -2 + (i % 10) * 0.5;
    }

    const particleGeo = new THREE.BufferGeometry();
    particleGeo.setAttribute(
      'position',
      new THREE.BufferAttribute(particlePositions, 3)
    );
    disposableGeometries.push(particleGeo);

    const particleMat = new THREE.PointsMaterial({
      color: 0xdcc08e,
      size: 0.045,
      transparent: true,
      opacity: 0.72,
      depthWrite: false,
    });
    disposableMaterials.push(particleMat);
    const goldParticles = new THREE.Points(particleGeo, particleMat);
    scene.add(goldParticles);

    // Animation / Choreography Loop driven by master timeline
    let frameId = 0;
    let disposed = false;

    const updateSceneAtTime = (t: number) => {
      // Scene timeline mapping inside 3D stage (7.2s -> 22.5s)
      const inWorldProgress = THREE.MathUtils.clamp((t - 7.2) / 3.4, 0, 1);
      const shieldAppearProgress = THREE.MathUtils.clamp((t - 13.6) / 1.1, 0, 1);
      const impactElapsed = t - 14.8; // Exact moment corrupted stream hits shield

      // Camera glide
      const targetCamZ =
        t < 10.6
          ? THREE.MathUtils.lerp(8.2, 5.4, inWorldProgress)
          : t < 17.6
          ? THREE.MathUtils.lerp(5.4, 4.6, THREE.MathUtils.clamp((t - 10.6) / 7.0, 0, 1))
          : THREE.MathUtils.lerp(4.6, 5.1, THREE.MathUtils.clamp((t - 17.6) / 3.5, 0, 1));

      camera.position.z = targetCamZ;
      camera.position.x = Math.sin(t * 0.35) * 0.25;
      camera.position.y = 0.15 + Math.cos(t * 0.28) * 0.08;
      _vec3.set(0, 0, 0);
      camera.lookAt(_vec3);

      // Shield emerge & slow dignified rotation
      const easeOutShield = 1 - Math.pow(1 - shieldAppearProgress, 3);
      shieldGroup.scale.setScalar(Math.max(0.001, easeOutShield));
      shieldGroup.visible = shieldAppearProgress > 0.01;

      if (t >= 17.6) {
        // Scene 6: Slow champagne sweep rotation
        shieldGroup.rotation.y = (t - 17.6) * 0.32;
        shieldGroup.position.y = Math.sin(t * 0.9) * 0.04;
      } else {
        shieldGroup.rotation.y = Math.sin(t * 0.5) * 0.12;
      }

      // Impact gold light burst & shockwave halo (t ~ 14.8s)
      if (impactElapsed >= 0 && impactElapsed <= 2.4) {
        const burstDecay = Math.exp(-impactElapsed * 2.2);
        impactPointLight.intensity = burstDecay * 9.5;
        champagneMetalMat.emissiveIntensity = 0.2 + burstDecay * 1.4;
        haloMat.opacity = burstDecay * 0.85;
        const haloScale = 1 + impactElapsed * 4.5;
        shockwaveHalo.scale.setScalar(haloScale);
      } else {
        impactPointLight.intensity = 0;
        champagneMetalMat.emissiveIntensity = 0.2;
        haloMat.opacity = 0;
      }

      // Sweeping directional champagne rim light during Scene 6 brand reveal
      if (t >= 17.6) {
        const sweep = THREE.MathUtils.clamp((t - 17.6) / 3.0, 0, 1);
        rimLight.position.x = THREE.MathUtils.lerp(-5, 5, sweep);
        rimLight.intensity = 2.4;
      }

      // Update corrupted shards (Scene 4 approach -> neutralized at 14.8s)
      const threatActive = t >= 10.2 && t <= 16.0;
      shardInstanced.visible = threatActive;
      if (threatActive) {
        for (let i = 0; i < shardCount; i++) {
          const seed = shardSeeds[i];
          const localTime = Math.max(0, t - 10.6);
          let z = seed.startZ - localTime * seed.speed;

          if (z <= 0.28) {
            // Stopped at shield plane & scattered rapidly upon interception
            const scatterAge = Math.max(0, t - 14.8);
            const scaleFade = Math.max(0, 1 - scatterAge * 1.4);
            dummy.position.set(
              seed.offsetX * (1 + scatterAge * 2.4),
              seed.offsetY * (1 + scatterAge * 2.4),
              0.28 + scatterAge * 0.35
            );
            dummy.scale.setScalar(scaleFade);
          } else {
            dummy.position.set(
              seed.offsetX * (z / 7.5),
              seed.offsetY * (z / 7.5),
              z
            );
            dummy.scale.setScalar(1);
          }
          dummy.rotation.set(t * seed.rotSpeed, t * seed.rotSpeed * 0.7, 0);
          dummy.updateMatrix();
          shardInstanced.setMatrixAt(i, dummy.matrix);
        }
        shardInstanced.instanceMatrix.needsUpdate = true;
      }

      // Update floating harmless golden particles
      const posAttr = particleGeo.getAttribute('position') as THREE.BufferAttribute;
      const arr = posAttr.array as Float32Array;
      const burstBoost =
        impactElapsed >= 0 ? Math.min(2.2, 1 + Math.exp(-impactElapsed * 0.8) * 1.4) : 1;
      for (let i = 0; i < particleCount; i++) {
        const s = particleSeeds[i];
        const angle = s.angle + t * 0.16 * s.speed;
        const r = s.radius * burstBoost;
        arr[i * 3] = Math.cos(angle) * r;
        arr[i * 3 + 1] = s.yOffset + Math.sin(t * 0.8 + i) * 0.18;
        arr[i * 3 + 2] = Math.sin(angle) * r * 0.7;
      }
      posAttr.needsUpdate = true;
    };

    function afterDraw(cb: () => void) {
      if (disposed) return;
      const gl = renderer.getContext() as WebGL2RenderingContext;
      const sync = gl.fenceSync ? gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0) : null;
      if (!sync) {
        frameId = window.setTimeout(cb, 80);
        return;
      }
      gl.flush();
      const poll = () => {
        if (disposed) {
          gl.deleteSync(sync);
          return;
        }
        const state = gl.getSyncParameter(sync, gl.SYNC_STATUS);
        if (state === gl.UNSIGNALED) {
          frameId = window.setTimeout(poll, 5);
        } else {
          gl.deleteSync(sync);
          frameId = window.setTimeout(cb, 80);
        }
      };
      frameId = window.setTimeout(poll, 5);
    }

    const tick = () => {
      if (disposed) return;
      updateSceneAtTime(elapsedSecRef.current);
      renderer.render(scene, camera);
      if (isSoftwareGl) {
        afterDraw(tick);
      } else {
        frameId = requestAnimationFrame(tick);
      }
    };

    if (!isSoftwareGl) {
      renderer.compile(scene, camera);
    }
    tick();

    const handleResize = () => {
      if (!container || disposed) return;
      const w = container.clientWidth || window.innerWidth;
      const h = container.clientHeight || window.innerHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      disposed = true;
      cancelAnimationFrame(frameId);
      clearTimeout(frameId);
      window.removeEventListener('resize', handleResize);
      renderer.domElement.removeEventListener('webglcontextlost', handleContextLost);
      renderer.domElement.removeEventListener(
        'webglcontextrestored',
        handleContextRestored
      );
      disposableGeometries.forEach((g) => g.dispose());
      disposableMaterials.forEach((m) => m.dispose());
      envTarget.dispose();
      renderer.dispose();
      if (renderer.domElement.parentNode === container) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [elapsedSecRef]);

  if (contextLost) {
    return (
      <div
        className="flex h-full w-full items-center justify-center bg-[#101412] text-center text-sm text-[#A69B8A]"
        role="img"
        aria-label="Digital glass shield protection scene"
      >
        3D graphics context paused. Continuing sequence...
      </div>
    );
  }

  return <div ref={mountRef} className="h-full w-full" />;
}
