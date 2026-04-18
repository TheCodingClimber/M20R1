import { useEffect, useRef } from "react";
import * as THREE from "three";

function createBeam({
  THREE,
  trackGeometry,
  start,
  end,
  radius,
  material,
  radialSegments = 8,
}) {
  const direction = new THREE.Vector3().subVectors(end, start);
  const length = direction.length();
  const beam = new THREE.Mesh(
    trackGeometry(
      new THREE.CylinderGeometry(radius, radius, length, radialSegments),
    ),
    material,
  );

  beam.position.copy(start).add(end).multiplyScalar(0.5);
  beam.quaternion.setFromUnitVectors(
    new THREE.Vector3(0, 1, 0),
    direction.normalize(),
  );

  return beam;
}

export default function BareMetalCitadel() {
  const mountRef = useRef(null);

  useEffect(() => {
    const mount = mountRef.current;

    if (!mount) {
      return undefined;
    }

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    const scene = new THREE.Scene();
    scene.fog = new THREE.Fog(0x04070d, 8, 18);

    const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 40);
    camera.position.set(0, 5.15, 12.2);

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: "high-performance",
    });
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 0.98;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.8));
    renderer.domElement.className = "hero-scene__webgl";
    mount.appendChild(renderer.domElement);

    const geometries = [];
    const materials = [];
    const trackGeometry = (geometry) => {
      geometries.push(geometry);
      return geometry;
    };
    const trackMaterial = (material) => {
      materials.push(material);
      return material;
    };

    const world = new THREE.Group();
    world.position.y = -0.35;
    scene.add(world);

    const citadel = new THREE.Group();
    world.add(citadel);

    scene.add(new THREE.AmbientLight(0x7fa6c6, 0.48));

    const hemisphere = new THREE.HemisphereLight(0x83b7de, 0x050b15, 0.82);
    hemisphere.position.set(0, 9, 0);
    scene.add(hemisphere);

    const keyLight = new THREE.DirectionalLight(0xd9efff, 2.28);
    keyLight.position.set(6.8, 8.4, 4.9);
    scene.add(keyLight);

    const backLight = new THREE.DirectionalLight(0x587ba4, 0.68);
    backLight.position.set(-6.5, 3.8, -6.2);
    scene.add(backLight);

    const rimLight = new THREE.PointLight(0xff8f61, 0.98, 12, 2);
    rimLight.position.set(-1.8, 6, -3.8);
    scene.add(rimLight);

    const fillLight = new THREE.PointLight(0x43b6ff, 1.28, 12, 2);
    fillLight.position.set(2.8, 1.35, 5.1);
    scene.add(fillLight);

    const baseMaterial = trackMaterial(
      new THREE.MeshPhysicalMaterial({
        color: 0x0a121b,
        metalness: 0.86,
        roughness: 0.42,
        clearcoat: 1,
        clearcoatRoughness: 0.42,
        reflectivity: 0.42,
      }),
    );
    const platformMaterial = trackMaterial(
      new THREE.MeshStandardMaterial({
        color: 0x0d1622,
        metalness: 0.82,
        roughness: 0.6,
      }),
    );
    const capMaterial = trackMaterial(
      new THREE.MeshStandardMaterial({
        color: 0x121f2e,
        metalness: 0.68,
        roughness: 0.36,
      }),
    );
    const braceMaterial = trackMaterial(
      new THREE.MeshStandardMaterial({
        color: 0x151f2c,
        emissive: 0x4fa0d9,
        emissiveIntensity: 0.12,
        metalness: 0.74,
        roughness: 0.38,
      }),
    );
    const ventMaterial = trackMaterial(
      new THREE.MeshStandardMaterial({
        color: 0x0a1119,
        metalness: 0.4,
        roughness: 0.68,
      }),
    );
    const edgeMaterial = trackMaterial(
      new THREE.LineBasicMaterial({
        color: 0x6aa9d2,
        transparent: true,
        opacity: 0.1,
      }),
    );
    const glowBlue = trackMaterial(
      new THREE.MeshBasicMaterial({
        color: 0x43b6ff,
        transparent: true,
        opacity: 0.12,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      }),
    );
    const glowWarm = trackMaterial(
      new THREE.MeshBasicMaterial({
        color: 0xff9966,
        transparent: true,
        opacity: 0.08,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      }),
    );
    const pathMaterial = trackMaterial(
      new THREE.MeshBasicMaterial({
        color: 0x6cc8ff,
        transparent: true,
        opacity: 0.26,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      }),
    );
    const pathMaterialWarm = trackMaterial(
      new THREE.MeshBasicMaterial({
        color: 0xff9966,
        transparent: true,
        opacity: 0.15,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      }),
    );
    const particleMaterial = trackMaterial(
      new THREE.PointsMaterial({
        color: 0x8bd3ff,
        size: 0.045,
        sizeAttenuation: true,
        transparent: true,
        opacity: 0.34,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      }),
    );

    const shadowDisk = new THREE.Mesh(
      trackGeometry(new THREE.CircleGeometry(4.85, 48)),
      trackMaterial(
        new THREE.MeshBasicMaterial({
          color: 0x02060b,
          transparent: true,
          opacity: 0.42,
          depthWrite: false,
        }),
      ),
    );
    shadowDisk.rotation.x = -Math.PI / 2;
    shadowDisk.position.y = -0.05;
    shadowDisk.scale.set(1.18, 1, 1.06);
    citadel.add(shadowDisk);

    const platform = new THREE.Mesh(
      trackGeometry(new THREE.CylinderGeometry(3.45, 3.9, 0.72, 8)),
      platformMaterial,
    );
    platform.position.y = 0.26;
    citadel.add(platform);

    const lowerSkirt = new THREE.Mesh(
      trackGeometry(new THREE.CylinderGeometry(3.8, 4.15, 0.28, 8)),
      capMaterial,
    );
    lowerSkirt.position.y = 0.02;
    citadel.add(lowerSkirt);

    const upperDeck = new THREE.Mesh(
      trackGeometry(new THREE.CylinderGeometry(2.68, 3.04, 0.3, 8)),
      capMaterial,
    );
    upperDeck.position.y = 0.75;
    citadel.add(upperDeck);

    const perimeterWall = new THREE.Mesh(
      trackGeometry(new THREE.CylinderGeometry(3.22, 3.44, 0.42, 8, 1, true)),
      trackMaterial(
        new THREE.MeshStandardMaterial({
          color: 0x0a1119,
          metalness: 0.76,
          roughness: 0.56,
          side: THREE.DoubleSide,
        }),
      ),
    );
    perimeterWall.position.y = 0.54;
    citadel.add(perimeterWall);

    const baseGlow = new THREE.Mesh(
      trackGeometry(new THREE.CircleGeometry(2.9, 48)),
      glowBlue,
    );
    baseGlow.rotation.x = -Math.PI / 2;
    baseGlow.position.y = 0.92;
    citadel.add(baseGlow);

    const rings = [
      new THREE.Mesh(
        trackGeometry(new THREE.TorusGeometry(3.12, 0.05, 16, 72)),
        glowBlue,
      ),
      new THREE.Mesh(
        trackGeometry(new THREE.TorusGeometry(2.32, 0.035, 16, 72)),
        glowWarm,
      ),
      new THREE.Mesh(
        trackGeometry(new THREE.TorusGeometry(1.44, 0.028, 16, 72)),
        pathMaterial,
      ),
    ];

    rings[0].rotation.x = Math.PI / 2;
    rings[0].position.y = 0.94;
    rings[1].rotation.x = Math.PI / 2 + 0.18;
    rings[1].position.y = 1.85;
    rings[2].rotation.x = Math.PI / 2 - 0.42;
    rings[2].position.y = 3.46;
    rings.forEach((ring) => citadel.add(ring));

    const towerStrips = [];
    const towerBodies = [];
    const towerAnchors = [];

    const towerSpecs = [
      { x: 0, z: 0.08, width: 1.16, depth: 1.16, height: 4.45, accent: 0xff8f61 },
      { x: -1.96, z: -0.28, width: 0.94, depth: 0.94, height: 3.18, accent: 0x43b6ff },
      { x: 2, z: -0.14, width: 0.96, depth: 0.96, height: 3.26, accent: 0x8bd3ff },
      { x: -1.12, z: 1.72, width: 1.08, depth: 0.82, height: 2.62, accent: 0x43b6ff },
      { x: 1.2, z: 1.64, width: 1.08, depth: 0.84, height: 2.44, accent: 0x43b6ff },
      { x: -2.64, z: 1.1, width: 0.76, depth: 0.76, height: 2.08, accent: 0x8bd3ff },
      { x: 2.6, z: 1.05, width: 0.78, depth: 0.78, height: 2.14, accent: 0x43b6ff },
      { x: 0.06, z: 2.16, width: 0.86, depth: 0.86, height: 1.86, accent: 0xff8f61 },
    ];

    towerSpecs.forEach((spec, index) => {
      const group = new THREE.Group();
      group.position.set(spec.x, 0.9, spec.z);

      const bodyGeometry = trackGeometry(
        new THREE.BoxGeometry(spec.width, spec.height, spec.depth),
      );
      const body = new THREE.Mesh(bodyGeometry, baseMaterial);
      body.position.y = spec.height / 2;
      group.add(body);

      const topCap = new THREE.Mesh(
        trackGeometry(
          new THREE.BoxGeometry(spec.width * 0.84, 0.12, spec.depth * 0.84),
        ),
        capMaterial,
      );
      topCap.position.y = spec.height + 0.08;
      group.add(topCap);

      const serviceFace = new THREE.Mesh(
        trackGeometry(
          new THREE.BoxGeometry(spec.width * 0.72, spec.height * 0.48, 0.04),
        ),
        capMaterial,
      );
      serviceFace.position.set(0, spec.height * 0.54, spec.depth / 2 + 0.03);
      group.add(serviceFace);

      for (let ventIndex = 0; ventIndex < 4; ventIndex += 1) {
        const vent = new THREE.Mesh(
          trackGeometry(
            new THREE.BoxGeometry(spec.width * 0.52, 0.045, 0.018),
          ),
          ventMaterial,
        );
        vent.position.set(
          0,
          spec.height * 0.38 + ventIndex * 0.22,
          spec.depth / 2 + 0.055,
        );
        group.add(vent);
      }

      const stripMaterial = trackMaterial(
        new THREE.MeshStandardMaterial({
          color: 0x15293b,
          emissive: spec.accent,
          emissiveIntensity: 1.2,
          metalness: 0.24,
          roughness: 0.3,
        }),
      );
      const stripGeometry = trackGeometry(
        new THREE.BoxGeometry(0.07, spec.height * 0.64, 0.035),
      );
      const frontStrip = new THREE.Mesh(stripGeometry, stripMaterial);
      frontStrip.position.set(spec.width / 2 + 0.025, spec.height * 0.56, 0);
      const rearStrip = new THREE.Mesh(stripGeometry, stripMaterial.clone());
      materials.push(rearStrip.material);
      rearStrip.position.set(-(spec.width / 2 + 0.025), spec.height * 0.56, 0);
      group.add(frontStrip, rearStrip);

      const edgeLines = new THREE.LineSegments(
        trackGeometry(new THREE.EdgesGeometry(bodyGeometry)),
        edgeMaterial,
      );
      edgeLines.position.copy(body.position);
      group.add(edgeLines);

      const antenna = new THREE.Mesh(
        trackGeometry(new THREE.CylinderGeometry(0.022, 0.022, 0.42, 10)),
        trackMaterial(
          new THREE.MeshStandardMaterial({
            color: 0x476174,
            emissive: 0x8bd3ff,
            emissiveIntensity: 0.7,
          }),
        ),
      );
      antenna.position.y = spec.height + 0.3;
      group.add(antenna);

      citadel.add(group);
      towerBodies.push({ group, body, topCap, index });
      towerStrips.push({ material: frontStrip.material, speed: 1.8 + index * 0.18 });
      towerStrips.push({ material: rearStrip.material, speed: 1.65 + index * 0.16 });
      towerAnchors.push(
        new THREE.Vector3(spec.x, spec.height + 1.05, spec.z),
      );
    });

    const buttressSpecs = [
      { x: -1.62, z: -1.12, height: 3.18 },
      { x: 1.62, z: -1.12, height: 3.18 },
      { x: -1.54, z: 1.14, height: 2.86 },
      { x: 1.54, z: 1.14, height: 2.86 },
    ];
    const coreTarget = new THREE.Vector3(0, 4.54, 0);

    buttressSpecs.forEach((spec) => {
      const column = new THREE.Mesh(
        trackGeometry(new THREE.BoxGeometry(0.32, spec.height, 0.42)),
        braceMaterial,
      );
      column.position.set(spec.x, 0.95 + spec.height / 2, spec.z);
      citadel.add(column);

      const collar = new THREE.Mesh(
        trackGeometry(new THREE.BoxGeometry(0.48, 0.14, 0.62)),
        capMaterial,
      );
      collar.position.set(spec.x, 0.95 + spec.height - 0.18, spec.z);
      citadel.add(collar);

      const uplink = createBeam({
        THREE,
        trackGeometry,
        start: new THREE.Vector3(spec.x, 0.95 + spec.height - 0.12, spec.z),
        end: coreTarget.clone().add(
          new THREE.Vector3(spec.x * -0.08, spec.z < 0 ? 0.12 : -0.12, spec.z * -0.08),
        ),
        radius: 0.05,
        material: braceMaterial,
      });
      citadel.add(uplink);

      const uplinkGlow = createBeam({
        THREE,
        trackGeometry,
        start: new THREE.Vector3(spec.x, 0.95 + spec.height - 0.06, spec.z),
        end: coreTarget.clone(),
        radius: 0.018,
        material: pathMaterial,
      });
      citadel.add(uplinkGlow);
    });

    const coreShell = new THREE.Mesh(
      trackGeometry(new THREE.CylinderGeometry(0.3, 0.42, 4.95, 8)),
      trackMaterial(
        new THREE.MeshPhysicalMaterial({
          color: 0x0f1924,
          metalness: 0.8,
          roughness: 0.34,
          clearcoat: 1,
          clearcoatRoughness: 0.3,
        }),
      ),
    );
    coreShell.position.set(0, 3.18, 0);
    citadel.add(coreShell);

    const coreCollar = new THREE.Mesh(
      trackGeometry(new THREE.CylinderGeometry(0.7, 0.92, 0.2, 8)),
      capMaterial,
    );
    coreCollar.position.set(0, 4.56, 0);
    citadel.add(coreCollar);

    const coreShoulder = new THREE.Mesh(
      trackGeometry(new THREE.CylinderGeometry(0.48, 0.62, 0.16, 8)),
      braceMaterial,
    );
    coreShoulder.position.set(0, 5.06, 0);
    citadel.add(coreShoulder);

    const coreGlow = new THREE.Mesh(
      trackGeometry(new THREE.CylinderGeometry(0.072, 0.098, 4.55, 8)),
      trackMaterial(
        new THREE.MeshBasicMaterial({
          color: 0x7dd5ff,
          transparent: true,
          opacity: 0.28,
          blending: THREE.AdditiveBlending,
          depthWrite: false,
        }),
      ),
    );
    coreGlow.position.set(0, 3.2, 0);
    citadel.add(coreGlow);

    const beacon = new THREE.Mesh(
      trackGeometry(new THREE.SphereGeometry(0.18, 20, 20)),
      trackMaterial(
        new THREE.MeshBasicMaterial({
          color: 0xff9966,
          transparent: true,
          opacity: 0.95,
          blending: THREE.AdditiveBlending,
          depthWrite: false,
        }),
      ),
    );
    beacon.position.set(0, 5.68, 0);
    citadel.add(beacon);

    const curveRunners = [];
    const orbMaterial = trackMaterial(
      new THREE.MeshBasicMaterial({
        color: 0xdaf4ff,
        transparent: true,
        opacity: 0.96,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      }),
    );

      towerAnchors.slice(1, 5).forEach((anchor, index) => {
      const midpoint = anchor.clone().multiplyScalar(0.45);
      midpoint.y += 1.38 + index * 0.08;
      const curve = new THREE.CatmullRomCurve3([
        anchor,
        midpoint,
        new THREE.Vector3(0, 4.82, 0),
      ]);
      const tube = new THREE.Mesh(
        trackGeometry(new THREE.TubeGeometry(curve, 56, 0.028, 8, false)),
        index % 2 === 0 ? pathMaterial : pathMaterialWarm,
      );
      citadel.add(tube);

      const orb = new THREE.Mesh(
        trackGeometry(new THREE.SphereGeometry(0.07, 14, 14)),
        orbMaterial,
      );
      citadel.add(orb);

      curveRunners.push({
        curve,
        orb,
        speed: 0.038 + index * 0.006,
        offset: index * 0.23,
      });
    });

    const dustGeometry = trackGeometry(new THREE.BufferGeometry());
    const dustCount = 220;
    const dustPositions = new Float32Array(dustCount * 3);
    for (let index = 0; index < dustCount; index += 1) {
      const radius = 1.6 + Math.random() * 2.5;
      const angle = Math.random() * Math.PI * 2;
      dustPositions[index * 3] = Math.cos(angle) * radius;
      dustPositions[index * 3 + 1] = 0.8 + Math.random() * 5.6;
      dustPositions[index * 3 + 2] = Math.sin(angle) * radius;
    }
    dustGeometry.setAttribute(
      "position",
      new THREE.BufferAttribute(dustPositions, 3),
    );
    const dust = new THREE.Points(dustGeometry, particleMaterial);
    citadel.add(dust);

    const pointer = {
      currentX: 0,
      currentY: 0,
      targetX: 0,
      targetY: 0,
    };

    const handlePointerMove = (event) => {
      const rect = mount.getBoundingClientRect();
      pointer.targetX = ((event.clientX - rect.left) / rect.width - 0.5) * 0.9;
      pointer.targetY = ((event.clientY - rect.top) / rect.height - 0.5) * 0.72;
    };

    const resetPointer = () => {
      pointer.targetX = 0;
      pointer.targetY = 0;
    };

    const resize = () => {
      const width = mount.clientWidth;
      const height = mount.clientHeight;

      if (!width || !height) {
        return;
      }

      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.lookAt(0, 2.95, 0);
      camera.updateProjectionMatrix();
    };

    const clock = new THREE.Clock();
    let frame = 0;

    const render = () => {
      const elapsed = clock.getElapsedTime();

      pointer.currentX += (pointer.targetX - pointer.currentX) * 0.035;
      pointer.currentY += (pointer.targetY - pointer.currentY) * 0.035;

      world.rotation.y = elapsed * 0.075 + pointer.currentX * 0.14;
      world.rotation.x = -0.13 + pointer.currentY * 0.042;

      camera.position.x = pointer.currentX * 0.68;
      camera.position.y = 5.15 - pointer.currentY * 0.32;
      camera.lookAt(0, 2.95, 0);

      rings[0].rotation.z = elapsed * 0.11;
      rings[1].rotation.z = -elapsed * 0.13;
      rings[2].rotation.z = elapsed * 0.18;

      baseGlow.scale.setScalar(1 + Math.sin(elapsed * 1.1) * 0.03);
      coreGlow.material.opacity = 0.22 + (Math.sin(elapsed * 1.8) + 1) * 0.05;
      beacon.scale.setScalar(0.94 + (Math.sin(elapsed * 2.2) + 1) * 0.05);

      towerBodies.forEach((tower) => {
        tower.group.position.y =
          0.9 + Math.sin(elapsed * 0.46 + tower.index * 0.7) * 0.012;
        tower.topCap.position.y =
          tower.body.position.y + tower.body.geometry.parameters.height / 2 + 0.08;
      });

      towerStrips.forEach((strip, index) => {
        strip.material.emissiveIntensity =
          0.85 + (Math.sin(elapsed * strip.speed + index * 0.45) + 1) * 0.46;
      });

      curveRunners.forEach((runner, index) => {
        const progress = (elapsed * runner.speed + runner.offset) % 1;
        runner.orb.position.copy(runner.curve.getPointAt(progress));
        runner.orb.scale.setScalar(
          0.66 + (Math.sin(elapsed * 2.4 + index) + 1) * 0.05,
        );
      });

      dust.rotation.y = -elapsed * 0.025;
      dust.rotation.x = Math.sin(elapsed * 0.12) * 0.01;

      renderer.render(scene, camera);
      frame = window.requestAnimationFrame(render);
    };

    resize();
    camera.lookAt(0, 2.95, 0);

    if (prefersReducedMotion) {
      renderer.render(scene, camera);
    } else {
      render();
      mount.addEventListener("pointermove", handlePointerMove, { passive: true });
      mount.addEventListener("pointerleave", resetPointer);
    }

    window.addEventListener("resize", resize);

    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("resize", resize);
      mount.removeEventListener("pointermove", handlePointerMove);
      mount.removeEventListener("pointerleave", resetPointer);

      geometries.forEach((geometry) => geometry.dispose());
      materials.forEach((material) => material.dispose());
      renderer.dispose();
      mount.removeChild(renderer.domElement);
    };
  }, []);

  return (
    <div className="hero-scene" aria-hidden="true">
      <div ref={mountRef} className="hero-scene__canvas" />
    </div>
  );
}
