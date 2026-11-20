"use client";

import React, { useEffect, useRef } from "react";
import * as THREE from "three";

export function TimeCreditToken3D() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const width = containerRef.current.clientWidth || 360;
    const height = containerRef.current.clientHeight || 360;

    // Scene, Camera, Renderer
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.z = 4.5;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    containerRef.current.appendChild(renderer.domElement);

    // Group to hold mesh
    const group = new THREE.Group();
    scene.add(group);

    // 3D Cylinder / Token Coin
    const geometry = new THREE.CylinderGeometry(1.6, 1.6, 0.25, 48);
    const material = new THREE.MeshStandardMaterial({
      color: 0x06080c,
      metalness: 0.9,
      roughness: 0.15,
      wireframe: false,
    });
    const token = new THREE.Mesh(geometry, material);
    token.rotation.x = Math.PI / 2.5;
    group.add(token);

    // Outer Wireframe Ring / Glow Frame
    const ringGeo = new THREE.TorusGeometry(1.8, 0.04, 16, 100);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0x00ff66,
      wireframe: true,
    });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = Math.PI / 2.5;
    group.add(ring);

    // Inner Emblem (Hourglass / Clock stylized geometry)
    const innerGeo = new THREE.OctahedronGeometry(0.8, 0);
    const innerMat = new THREE.MeshStandardMaterial({
      color: 0x39ff14,
      metalness: 0.5,
      roughness: 0.2,
      wireframe: true,
    });
    const emblem = new THREE.Mesh(innerGeo, innerMat);
    emblem.position.z = 0.2;
    group.add(emblem);

    // Orbiting particle ring
    const particleCount = 80;
    const particleGeo = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
      const angle = (i / particleCount) * Math.PI * 2;
      const radius = 2.2 + (Math.random() - 0.5) * 0.3;
      positions[i * 3] = Math.cos(angle) * radius;
      positions[i * 3 + 1] = Math.sin(angle) * radius;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 0.5;
    }

    particleGeo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    const particleMat = new THREE.PointsMaterial({
      color: 0x00ff66,
      size: 0.05,
      transparent: true,
      opacity: 0.8,
    });
    const particles = new THREE.Points(particleGeo, particleMat);
    particles.rotation.x = Math.PI / 2.5;
    group.add(particles);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);

    const pointLight = new THREE.PointLight(0x00ff66, 3, 50);
    pointLight.position.set(3, 3, 4);
    scene.add(pointLight);

    const backLight = new THREE.PointLight(0xffffff, 1.5, 50);
    backLight.position.set(-3, -3, -2);
    scene.add(backLight);

    // Mouse Interaction
    let mouseX = 0;
    let mouseY = 0;
    let targetX = 0;
    let targetY = 0;

    const handleMouseMove = (event: MouseEvent) => {
      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) return;
      const x = (event.clientX - rect.left) / rect.width - 0.5;
      const y = (event.clientY - rect.top) / rect.height - 0.5;
      targetX = x * 1.2;
      targetY = y * 1.2;
    };

    window.addEventListener("mousemove", handleMouseMove);

    // Animation Loop
    let animationFrameId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // Smooth mouse follow
      mouseX += (targetX - mouseX) * 0.05;
      mouseY += (targetY - mouseY) * 0.05;

      group.rotation.y = elapsedTime * 0.5 + mouseX;
      group.rotation.x = 0.4 + mouseY;
      emblem.rotation.y = -elapsedTime * 0.8;
      particles.rotation.z = elapsedTime * 0.2;

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      if (!containerRef.current) return;
      const w = containerRef.current.clientWidth;
      const h = containerRef.current.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationFrameId);
      if (containerRef.current?.contains(renderer.domElement)) {
        containerRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  return (
    <div className="relative w-full h-[360px] sm:h-[420px] flex items-center justify-center">
      <div ref={containerRef} className="w-full h-full cursor-grab active:cursor-grabbing" />
      <div className="absolute bottom-2 px-3 py-1 rounded-full bg-midnight-900/80 border border-lime-neon/30 text-[11px] font-mono text-lime-neon shadow-neon-sm backdrop-blur">
        Interactive 3D Time-Credit Token • 1 Hr = 1 C
      </div>
    </div>
  );
}
