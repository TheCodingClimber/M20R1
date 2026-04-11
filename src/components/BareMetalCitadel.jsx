import { useEffect, useRef } from "react";
import * as THREE from "three";

const sceneBadges = [
  { label: "Footprint", value: "Owned hardware" },
  { label: "Posture", value: "Operator-run" },
  { label: "Signal", value: "Live state" },
];

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
    scene.fog = new THREE.Fog(0x050a12, 9, 20);

    const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 40);
    camera.position.set(0, 4.8, 11.6);

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: "high-performance",
    });
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.08;
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

    scene.add(new THREE.AmbientLight(0xa7d8ff, 0.8));

    const hemisphere = new THREE.HemisphereLight(0x8dcfff, 0x07111f, 1.1);
    hemisphere.position.set(0, 10, 0);
    scene.add(hemisphere);

    const keyLight = new THREE.DirectionalLight(0xc7ebff, 1.75);
    keyLight.position.set(7, 10, 6);
    scene.add(keyLight);

    const rimLight = new THREE.PointLight(0xff9c6a, 1.45, 18, 2);
    rimLight.position.set(-4.5, 5.8, -4.5);
    scene.add(rimLight);

    const fillLight = new THREE.PointLight(0x43b6ff, 2.2, 16, 2);
    fillLight.position.set(3.5, 2.6, 3.8);
    scene.add(fillLight);

    const baseMaterial = trackMaterial(
      new THREE.MeshPhysicalMaterial({
        color: 0x0f1824,
        metalness: 0.82,
        roughness: 0.34,
        clearcoat: 1,
        clearcoatRoughness: 0.36,
        reflectivity: 0.55,
      }),
    );
    const platformMaterial = trackMaterial(
      new THREE.MeshStandardMaterial({
        color: 0x101a28,
        metalness: 0.7,
        roughness: 0.55,
      }),
    );
    const capMaterial = trackMaterial(
      new THREE.MeshStandardMaterial({
        color: 0x162334,
        metalness: 0.58,
        roughness: 0.3,
      }),
    );
    const edgeMaterial = trackMaterial(
      new THREE.LineBasicMaterial({
        color: 0x6fbfe9,
        transparent: true,
        opacity: 0.16,
      }),
    );
    const glowBlue = trackMaterial(
      new THREE.MeshBasicMaterial({
        color: 0x43b6ff,
        transparent: true,
        opacity: 0.16,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      }),
    );
    const glowWarm = trackMaterial(
      new THREE.MeshBasicMaterial({
        color: 0xff9966,
        transparent: true,
        opacity: 0.14,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      }),
    );
    const pathMaterial = trackMaterial(
      new THREE.MeshBasicMaterial({
        color: 0x6cc8ff,
        transparent: true,
        opacity: 0.4,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      }),
    );
    const pathMaterialWarm = trackMaterial(
      new THREE.MeshBasicMaterial({
        color: 0xff9966,
        transparent: true,
        opacity: 0.26,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      }),
    );
    const particleMaterial = trackMaterial(
      new THREE.PointsMaterial({
        color: 0x8bd3ff,
        size: 0.06,
        sizeAttenuation: true,
        transparent: true,
        opacity: 0.55,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      }),
    );

    const shadowDisk = new THREE.Mesh(
      trackGeometry(new THREE.CircleGeometry(4.5, 48)),
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
      trackGeometry(new THREE.CylinderGeometry(3.45, 3.9, 0.72, 10)),
      platformMaterial,
    );
    platform.position.y = 0.26;
    citadel.add(platform);

    const upperDeck = new THREE.Mesh(
      trackGeometry(new THREE.CylinderGeometry(2.68, 3.04, 0.3, 10)),
      capMaterial,
    );
    upperDeck.position.y = 0.75;
    citadel.add(upperDeck);

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
      { x: 0, z: 0.1, width: 1.12, depth: 1.12, height: 4.15, accent: 0xff9966 },
      { x: -1.9, z: -0.35, width: 0.9, depth: 0.92, height: 2.95, accent: 0x43b6ff },
      { x: 1.95, z: -0.15, width: 0.94, depth: 0.94, height: 3.15, accent: 0x8bd3ff },
      { x: -1.18, z: 1.58, width: 1.02, depth: 0.78, height: 2.42, accent: 0x43b6ff },
      { x: 1.26, z: 1.5, width: 1.05, depth: 0.8, height: 2.18, accent: 0xff9966 },
      { x: -2.52, z: 1.18, width: 0.72, depth: 0.72, height: 1.94, accent: 0x8bd3ff },
      { x: 2.46, z: 1.12, width: 0.74, depth: 0.74, height: 2.02, accent: 0x43b6ff },
      { x: -0.08, z: 2.06, width: 0.84, depth: 0.84, height: 1.74, accent: 0xff9966 },
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

      const stripMaterial = trackMaterial(
        new THREE.MeshStandardMaterial({
          color: 0x15293b,
          emissive: spec.accent,
          emissiveIntensity: 1.6,
          metalness: 0.24,
          roughness: 0.2,
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

    const coreShell = new THREE.Mesh(
      trackGeometry(new THREE.CylinderGeometry(0.28, 0.38, 4.7, 12)),
      trackMaterial(
        new THREE.MeshPhysicalMaterial({
          color: 0x131f2c,
          metalness: 0.72,
          roughness: 0.28,
          clearcoat: 1,
          clearcoatRoughness: 0.22,
        }),
      ),
    );
    coreShell.position.set(0, 3.05, 0);
    citadel.add(coreShell);

    const coreGlow = new THREE.Mesh(
      trackGeometry(new THREE.CylinderGeometry(0.085, 0.12, 4.3, 12)),
      trackMaterial(
        new THREE.MeshBasicMaterial({
          color: 0x7dd5ff,
          transparent: true,
          opacity: 0.38,
          blending: THREE.AdditiveBlending,
          depthWrite: false,
        }),
      ),
    );
    coreGlow.position.set(0, 3.1, 0);
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
    beacon.position.set(0, 5.45, 0);
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

    towerAnchors.slice(1, 6).forEach((anchor, index) => {
      const midpoint = anchor.clone().multiplyScalar(0.45);
      midpoint.y += 1.6 + index * 0.08;
      const curve = new THREE.CatmullRomCurve3([
        anchor,
        midpoint,
        new THREE.Vector3(0, 4.72, 0),
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
        speed: 0.07 + index * 0.01,
        offset: index * 0.19,
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
      pointer.targetX = ((event.clientX - rect.left) / rect.width - 0.5) * 1.4;
      pointer.targetY = ((event.clientY - rect.top) / rect.height - 0.5) * 1.1;
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
      camera.lookAt(0, 2.7, 0);
      camera.updateProjectionMatrix();
    };

    const clock = new THREE.Clock();
    let frame = 0;

    const render = () => {
      const elapsed = clock.getElapsedTime();

      pointer.currentX += (pointer.targetX - pointer.currentX) * 0.045;
      pointer.currentY += (pointer.targetY - pointer.currentY) * 0.045;

      world.rotation.y = elapsed * 0.14 + pointer.currentX * 0.18;
      world.rotation.x = -0.11 + pointer.currentY * 0.06;

      camera.position.x = pointer.currentX * 0.85;
      camera.position.y = 4.8 - pointer.currentY * 0.45;
      camera.lookAt(0, 2.7, 0);

      rings[0].rotation.z = elapsed * 0.28;
      rings[1].rotation.z = -elapsed * 0.34;
      rings[2].rotation.z = elapsed * 0.42;

      baseGlow.scale.setScalar(1 + Math.sin(elapsed * 1.8) * 0.05);
      coreGlow.material.opacity = 0.28 + (Math.sin(elapsed * 2.6) + 1) * 0.08;
      beacon.scale.setScalar(0.92 + (Math.sin(elapsed * 3.4) + 1) * 0.08);

      towerBodies.forEach((tower) => {
        tower.group.position.y = 0.9 + Math.sin(elapsed * 0.95 + tower.index * 0.8) * 0.03;
        tower.topCap.position.y = tower.body.position.y + tower.body.geometry.parameters.height / 2 + 0.08;
      });

      towerStrips.forEach((strip, index) => {
        strip.material.emissiveIntensity =
          1.35 + (Math.sin(elapsed * strip.speed + index * 0.45) + 1) * 0.8;
      });

      curveRunners.forEach((runner, index) => {
        const progress = (elapsed * runner.speed + runner.offset) % 1;
        runner.orb.position.copy(runner.curve.getPointAt(progress));
        runner.orb.scale.setScalar(
          0.72 + (Math.sin(elapsed * 4 + index) + 1) * 0.08,
        );
      });

      dust.rotation.y = -elapsed * 0.05;
      dust.rotation.x = Math.sin(elapsed * 0.2) * 0.02;

      renderer.render(scene, camera);
      frame = window.requestAnimationFrame(render);
    };

    resize();
    camera.lookAt(0, 2.7, 0);

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
      <div className="hero-scene__badges">
        {sceneBadges.map((badge) => (
          <div key={badge.label} className="hero-scene__badge">
            <span>{badge.label}</span>
            <strong>{badge.value}</strong>
          </div>
        ))}
      </div>
    </div>
  );
}
