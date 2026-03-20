"use client";

import * as THREE from "three";
import { useEffect, useRef } from "react";

const CANVAS_DURATION = 4500;
const PAUSE_START = 2000 / CANVAS_DURATION;
const PAUSE_END   = 2500 / CANVAS_DURATION;

interface Props {
  onDone: () => void;
  startRef: React.MutableRefObject<number>;
  rafRef:   React.MutableRefObject<number>;
  darkBgRef: React.RefObject<HTMLDivElement | null>;
}

export default function WormholeCanvas({ onDone, startRef, rafRef, darkBgRef }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const darkBg = darkBgRef.current;
    if (!canvas || !darkBg) return;

    let alive = true;
    const W = window.innerWidth;
    const H = window.innerHeight;

    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    renderer.setSize(W, H);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.setClearColor(0x000000, 0);

    const scene  = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, W / H, 0.1, 300);
    camera.position.z = 0;

    const tanHFov = Math.tan((75 / 2) * Math.PI / 180);
    const aspect  = W / H;

    // ── G sprite texture ──────────────────────────────────────────────
    let gTex: THREE.Texture;
    let animStarted = false;

    new THREE.TextureLoader().load("/G-sprite.png", (tex) => {
      if (!alive) { tex.dispose(); return; }
      gTex = tex;
      startAnimation();
    });

    // ── Stars ─────────────────────────────────────────────────────────
    const N         = 1800;
    const positions = new Float32Array(N * 3);
    const speeds    = new Float32Array(N);
    const rotAngles = new Float32Array(N);
    const rotSpeeds = new Float32Array(N);
    let   curProg   = 0;

    const initStar = (i: number, randomZ = true) => {
      if (curProg >= PAUSE_START) {
        const z  = -(1 + Math.random() * 10);
        const hw = Math.abs(z) * tanHFov;
        const hh = hw / aspect;
        positions[i*3]     = (Math.random()*2-1) * hw;
        positions[i*3 + 1] = (Math.random()*2-1) * hh;
        positions[i*3 + 2] = z;
      } else {
        const angle = Math.random() * Math.PI * 2;
        const r     = Math.sqrt(Math.random()) * 110;
        positions[i*3]     = Math.cos(angle) * r;
        positions[i*3 + 1] = Math.sin(angle) * r;
        positions[i*3 + 2] = randomZ ? -Math.random() * 180 : -180;
      }
      speeds[i]    = 0.25 + Math.random() * 0.75;
      rotAngles[i] = Math.random() * Math.PI * 2;
      rotSpeeds[i] = (Math.random() < 0.5 ? 1 : -1) * (0.02 + Math.random() * 0.06);
    };
    for (let i = 0; i < N; i++) initStar(i, true);

    // ── Fog ───────────────────────────────────────────────────────────
    const N_FOG     = 20;
    const fogPos    = new Float32Array(N_FOG * 3);
    const fogSpeeds = new Float32Array(N_FOG);
    const fogScales = new Float32Array(N_FOG);

    const initFog = (i: number) => {
      const z  = -(4 + Math.random() * 12);
      const hw = Math.abs(z) * tanHFov;
      const hh = hw / aspect;
      const x  = (Math.random()*2-1) * hw;
      const y  = (Math.random()*2-1) * hh;
      fogPos[i*3]     = x;
      fogPos[i*3 + 1] = y;
      fogPos[i*3 + 2] = z;
      fogSpeeds[i] = 0.003 + Math.random() * 0.006;
      const dist = Math.sqrt((x/hw)**2 + (y/hh)**2);
      fogScales[i] = 0.02 + (1 - dist) * 0.07 + Math.random() * 0.02;
    };
    for (let i = 0; i < N_FOG; i++) initFog(i);

    // Reusable math objects
    const _pos  = new THREE.Vector3();
    const _quat = new THREE.Quaternion();
    const _scl  = new THREE.Vector3();
    const _mat  = new THREE.Matrix4();
    const _axis = new THREE.Vector3(0, 0, 1);

    let gGeo: THREE.PlaneGeometry;
    let gMat: THREE.MeshBasicMaterial;
    let gMesh: THREE.InstancedMesh;
    let fogMat: THREE.MeshBasicMaterial;
    let fogMesh: THREE.InstancedMesh;

    const startAnimation = () => {
      if (animStarted || !alive) return;
      animStarted = true;

      gGeo  = new THREE.PlaneGeometry(1, 1);
      gMat  = new THREE.MeshBasicMaterial({ map: gTex, transparent: true, depthWrite: false, side: THREE.DoubleSide, blending: THREE.NormalBlending });
      gMesh = new THREE.InstancedMesh(gGeo, gMat, N);
      gMesh.frustumCulled = false;
      scene.add(gMesh);

      fogMat  = new THREE.MeshBasicMaterial({ map: gTex, transparent: true, depthWrite: false, side: THREE.DoubleSide, blending: THREE.NormalBlending, opacity: 0 });
      fogMesh = new THREE.InstancedMesh(gGeo, fogMat, N_FOG);
      fogMesh.frustumCulled = false;
      scene.add(fogMesh);

      startRef.current = performance.now();

      const draw = (now: number) => {
        if (!alive) return;

        const elapsed  = now - startRef.current;
        const progress = Math.min(elapsed / CANVAS_DURATION, 1);
        curProg = progress;

        let speedMult: number;
        if (progress < PAUSE_START) {
          speedMult = 2 * Math.pow(9, progress / PAUSE_START);
        } else if (progress < PAUSE_END) {
          const t = (progress - PAUSE_START) / (PAUSE_END - PAUSE_START);
          speedMult = Math.pow(13.5, 1 - t) * Math.pow(0.025, t);
        } else {
          speedMult = 0.025;
        }

        if (progress < PAUSE_START) {
          darkBg.style.opacity = "1";
        } else if (progress < PAUSE_END) {
          const t = (progress - PAUSE_START) / (PAUSE_END - PAUSE_START);
          darkBg.style.opacity = String(Math.pow(13.5, 1-t) * Math.pow(0.025, t) / 13.5);
        } else {
          darkBg.style.opacity = "0";
        }

        const starAlpha = progress < PAUSE_END ? 1 : Math.pow(1 - (progress - PAUSE_END) / (1 - PAUSE_END), 0.55);
        gMat.opacity = starAlpha;

        let fogAlpha: number;
        if (progress < PAUSE_START) {
          fogAlpha = 0;
        } else if (progress < PAUSE_END) {
          fogAlpha = ((progress - PAUSE_START) / (PAUSE_END - PAUSE_START)) * 0.38;
        } else {
          fogAlpha = 0.38 * Math.pow(1 - (progress - PAUSE_END) / (1 - PAUSE_END), 0.55);
        }
        fogMat.opacity = fogAlpha;

        for (let i = 0; i < N; i++) {
          rotAngles[i] += rotSpeeds[i] * (speedMult / 4 + 0.3);
          positions[i*3 + 2] += speeds[i] * speedMult;
          if (positions[i*3 + 2] > 2) initStar(i, false);
          _pos.set(positions[i*3], positions[i*3+1], positions[i*3+2]);
          _quat.setFromAxisAngle(_axis, rotAngles[i]);
          _scl.setScalar(0.08 + (Math.min(speedMult, 18) / 18) * 0.38);
          _mat.compose(_pos, _quat, _scl);
          gMesh.setMatrixAt(i, _mat);
        }
        gMesh.instanceMatrix.needsUpdate = true;

        _quat.identity();
        for (let i = 0; i < N_FOG; i++) {
          fogPos[i*3+2] += fogSpeeds[i];
          if (fogPos[i*3+2] > 2) initFog(i);
          _pos.set(fogPos[i*3], fogPos[i*3+1], fogPos[i*3+2]);
          _scl.setScalar(fogScales[i]);
          _mat.compose(_pos, _quat, _scl);
          fogMesh.setMatrixAt(i, _mat);
        }
        fogMesh.instanceMatrix.needsUpdate = true;

        renderer.render(scene, camera);

        if (progress < 1) {
          rafRef.current = requestAnimationFrame(draw);
        } else {
          if (alive) {
            onDone();
            window.dispatchEvent(new Event("intro-done"));
          }
          renderer.dispose();
        }
      };

      rafRef.current = requestAnimationFrame(draw);
    };

    const onResize = () => {
      const w = window.innerWidth, h = window.innerHeight;
      renderer.setSize(w, h);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    };
    window.addEventListener("resize", onResize);

    return () => {
      alive = false;
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", onResize);
      renderer.dispose();
    };
  }, [onDone, startRef, rafRef]);

  return (
    <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
  );
}
