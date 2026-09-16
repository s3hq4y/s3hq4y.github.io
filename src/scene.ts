// Babylon.js — explicit subpath imports so only what we use is bundled.
import { Engine } from '@babylonjs/core/Engines/engine';
import { Scene } from '@babylonjs/core/scene';
import { ArcRotateCamera } from '@babylonjs/core/Cameras/arcRotateCamera';
import { HemisphericLight } from '@babylonjs/core/Lights/hemisphericLight';
import { PointLight } from '@babylonjs/core/Lights/pointLight';
import { PBRMaterial } from '@babylonjs/core/Materials/PBR/pbrMaterial';
import { StandardMaterial } from '@babylonjs/core/Materials/standardMaterial';
import { MeshBuilder } from '@babylonjs/core/Meshes/meshBuilder';
import { TransformNode } from '@babylonjs/core/Meshes/transformNode';
import { Color3, Color4 } from '@babylonjs/core/Maths/math.color';
import { Vector3 } from '@babylonjs/core/Maths/math.vector';
import { GlowLayer } from '@babylonjs/core/Layers/glowLayer';

// Side-effect imports: register shaders/materials used above.
import '@babylonjs/core/Materials/standardMaterial';
import '@babylonjs/core/Rendering/depthRendererSceneComponent';
import '@babylonjs/core/Materials/Textures/Loaders';
import '@babylonjs/core/Meshes/Builders/icoSphereBuilder';
import '@babylonjs/core/Meshes/Builders/sphereBuilder';
import '@babylonjs/core/Meshes/Builders/torusBuilder';

import type { Mesh } from '@babylonjs/core/Meshes/mesh';

/**
 * Builds the hero WebGL stage: a glowing core, a wireframe shell,
 * three orbital rings and a field of orbiting motes.
 */
export function createStage(canvas: HTMLCanvasElement): () => void {
  const engine = new Engine(canvas, true, { stencil: false, preserveDrawingBuffer: false }, true);
  const scene = new Scene(engine);
  scene.clearColor = new Color4(0.024, 0.024, 0.031, 1);

  const camera = new ArcRotateCamera('cam', Math.PI * 0.35, Math.PI * 0.42, 11.5, Vector3.Zero(), scene);
  camera.fov = 0.92;
  camera.minZ = 0.1;
  camera.maxZ = 200;

  const hemi = new HemisphericLight('hemi', new Vector3(0, 1, 0), scene);
  hemi.intensity = 0.32;
  hemi.groundColor = new Color3(0.06, 0.02, 0.05);

  const key = new PointLight('key', new Vector3(7, 9, -8), scene);
  key.intensity = 90;
  key.radius = 3;
  key.diffuse = new Color3(1, 0.35, 0.55);

  const rim = new PointLight('rim', new Vector3(-9, -5, 7), scene);
  rim.intensity = 70;
  rim.radius = 3;
  rim.diffuse = new Color3(0.35, 0.5, 1);

  const coreMat = new PBRMaterial('coreMat', scene);
  coreMat.albedoColor = new Color3(0.055, 0.055, 0.07);
  coreMat.metallic = 0.95;
  coreMat.roughness = 0.22;
  coreMat.emissiveColor = new Color3(0.42, 0.03, 0.14);

  const core = MeshBuilder.CreateIcoSphere('core', { radius: 2.05, subdivisions: 4, flat: true }, scene);
  core.material = coreMat;

  const shellMat = new StandardMaterial('shellMat', scene);
  shellMat.wireframe = true;
  shellMat.emissiveColor = new Color3(0.95, 0.14, 0.42);
  shellMat.diffuseColor = new Color3(0, 0, 0);
  shellMat.disableLighting = true;
  shellMat.alpha = 0.5;

  const shell = MeshBuilder.CreateIcoSphere('shell', { radius: 2.85, subdivisions: 3 }, scene);
  shell.material = shellMat;

  const ringColors = [
    new Color3(0.98, 0.16, 0.45),
    new Color3(0.34, 0.55, 1),
    new Color3(1, 0.74, 0.32),
  ];
  const rings: Mesh[] = [];
  for (let i = 0; i < ringColors.length; i++) {
    const mat = new StandardMaterial('ringMat' + i, scene);
    mat.emissiveColor = ringColors[i];
    mat.diffuseColor = new Color3(0, 0, 0);
    mat.disableLighting = true;
    const ring = MeshBuilder.CreateTorus(
      'ring' + i,
      { diameter: 6.2 + i * 1.1, thickness: 0.04, tessellation: 160 },
      scene,
    );
    ring.material = mat;
    ring.rotation.x = Math.PI * (0.16 + i * 0.2);
    ring.rotation.y = Math.PI * 0.12 * i;
    rings.push(ring);
  }

  const moteField = new TransformNode('moteField', scene);
  const moteMat = new StandardMaterial('moteMat', scene);
  moteMat.emissiveColor = new Color3(1, 0.88, 0.94);
  moteMat.diffuseColor = new Color3(0, 0, 0);
  moteMat.disableLighting = true;
  const moteMaster = MeshBuilder.CreateSphere('mote', { diameter: 0.06, segments: 6 }, scene);
  moteMaster.material = moteMat;
  moteMaster.isVisible = false;

  const MOTE_COUNT = 240;
  for (let i = 0; i < MOTE_COUNT; i++) {
    const inst = moteMaster.createInstance('mote' + i);
    inst.parent = moteField;
    const r = 3.7 + Math.random() * 4.4;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    inst.position.set(
      r * Math.sin(phi) * Math.cos(theta),
      r * Math.cos(phi) * 0.65,
      r * Math.sin(phi) * Math.sin(theta),
    );
    inst.scaling.setAll(0.6 + Math.random() * 1.8);
  }

  const glow = new GlowLayer('glow', scene, { blurKernelSize: 48 });
  glow.intensity = 0.9;

  let pointerX = 0;
  let pointerY = 0;
  let easedX = 0;
  let easedY = 0;
  let scrollN = 0;

  const onPointerMove = (e: PointerEvent) => {
    pointerX = (e.clientX / window.innerWidth - 0.5) * 2;
    pointerY = (e.clientY / window.innerHeight - 0.5) * 2;
  };
  const onScroll = () => {
    const max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    scrollN = Math.min(1, Math.max(0, window.scrollY / max));
  };
  window.addEventListener('pointermove', onPointerMove, { passive: true });
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let t = 0;

  engine.runRenderLoop(() => {
    const dt = engine.getDeltaTime() / 1000;
    if (!reduced) t += dt;

    easedX += (pointerX - easedX) * 0.05;
    easedY += (pointerY - easedY) * 0.05;

    core.rotation.y = t * 0.12;
    core.rotation.x = t * 0.05;
    shell.rotation.y = -t * 0.19;
    shell.rotation.z = t * 0.08;

    for (let i = 0; i < rings.length; i++) {
      rings[i].rotation.z += dt * (0.14 + i * 0.07) * (i % 2 === 0 ? 1 : -1);
    }

    moteField.rotation.y = t * 0.09;
    moteField.rotation.x = Math.sin(t * 0.13) * 0.12;

    camera.alpha = Math.PI * 0.35 + easedX * 0.42 + t * 0.025;
    camera.beta = Math.PI * 0.42 + easedY * 0.16;
    camera.radius = 11.5 - scrollN * 2.6;
    camera.target.y = -easedY * 0.5;

    scene.render();
  });

  const onResize = () => engine.resize();
  window.addEventListener('resize', onResize);
  onResize();

  return () => {
    window.removeEventListener('pointermove', onPointerMove);
    window.removeEventListener('scroll', onScroll);
    window.removeEventListener('resize', onResize);
    engine.stopRenderLoop();
    scene.dispose();
    engine.dispose();
  };
}