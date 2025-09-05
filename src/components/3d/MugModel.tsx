// src/components/3d/MugModel.tsx
import { useMemo, useEffect } from 'react';
import { useLoader } from '@react-three/fiber';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import * as THREE from 'three';

interface MugModelProps {
  texture: THREE.CanvasTexture | null;
  forceTestTexture?: boolean; // toggle temporário para diagnóstico
}

function createCheckerPOTTexture(size = 256) {
  const c = document.createElement('canvas');
  c.width = c.height = size;
  const ctx = c.getContext('2d')!;
  const s = size / 8;
  for (let y = 0; y < size; y += s) {
    for (let x = 0; x < size; x += s) {
      ctx.fillStyle = ((x / s + y / s) % 2) ? '#ff0000' : '#0000ff';
      ctx.fillRect(x, y, s, s);
    }
  }
  const tex = new THREE.CanvasTexture(c);
  // POT -> allow mipmaps for crispness
  tex.generateMipmaps = true;
  tex.minFilter = THREE.LinearMipmapLinearFilter;
  tex.magFilter = THREE.LinearFilter;
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.needsUpdate = true;
  // compat sRGB
  // @ts-ignore
  if ('colorSpace' in tex) tex.colorSpace = (THREE as any).SRGBColorSpace || tex.colorSpace;
  // @ts-ignore
  if ('encoding' in tex) tex.encoding = (THREE as any).sRGBEncoding || tex.encoding;
  return tex;
}

const MATERIAL_NAME_HINTS = ['body','corpo','mug','cup','outer','shell','caneca'];

export function MugModel({ texture, forceTestTexture }: MugModelProps) {
  const gltf = useLoader(GLTFLoader, '/caneca-nova.glb');

  useEffect(() => {
    // log dos materiais pra você copiar
    gltf.scene.traverse((child: any) => {
      if (child.isMesh) {
        const mats = Array.isArray(child.material) ? child.material : [child.material];
        console.log('[MugModel] mesh:', child.name || '(no-name)', 'materials:', mats.map((m: any) => ({ name: m?.name, uuid: m?.uuid, hasMap: !!m?.map })));
        const hasUV = !!child.geometry?.attributes?.uv;
        console.log('[MugModel] - has UV?:', hasUV, 'geometry attributes:', Object.keys(child.geometry?.attributes || {}));
      }
    });
  }, [gltf.scene]);

  const texturedModel = useMemo(() => {
    const cloned = gltf.scene.clone(true);

    // se for forçar teste, cria texture POT xadrez
    const testTex = forceTestTexture ? createCheckerPOTTexture(256) : null;
    const texToUse = testTex || texture;

    console.log('[MugModel] texture object incoming:', texToUse);

    if (!texToUse) {
      console.warn('[MugModel] nenhuma textura válida fornecida (texture null).');
      return cloned;
    }

    cloned.traverse((child: any) => {
      if (!child.isMesh) return;
      const geo = child.geometry;
      const hasUV = !!geo?.attributes?.uv;
      if (!hasUV) {
        console.warn('[MugModel] Mesh sem UVs, pulando:', child.name);
        return;
      }

      // materiais (suporta array)
      const mats = Array.isArray(child.material) ? child.material.slice() : [child.material];

      // heurísticas pra escolher quais materiais receberão a textura
      const targetIndices: number[] = [];

      // 1) por nome (case-insensitive contains hint)
      mats.forEach((m: any, idx: number) => {
        const name = (m?.name || '').toLowerCase();
        if (MATERIAL_NAME_HINTS.some(h => name.includes(h))) targetIndices.push(idx);
      });

      // 2) fallback: materiais claros por luminância
      if (targetIndices.length === 0) {
        mats.forEach((m: any, idx: number) => {
          if (m && m.color) {
            const r = m.color.r, g = m.color.g, b = m.color.b;
            const lum = 0.2126 * r + 0.7152 * g + 0.0722 * b; // 0..1
            if (lum > 0.75) targetIndices.push(idx);
          }
        });
      }

      // 3) fallback final: se ainda vazio, aplicar ao primeiro material
      if (targetIndices.length === 0) targetIndices.push(0);

      // aplicar clone em cada target index
      const newMats = mats.slice();
      targetIndices.forEach((ti) => {
        const orig = mats[ti];
        if (!orig) return;
        const clonedMat = orig.clone();
        clonedMat.map = texToUse;
        // assegurar cor branca para não multiplicar
        if (clonedMat.color) clonedMat.color.set(0xffffff);
        // garantir que a textura e material sejam atualizados
        if (clonedMat.map) {
          clonedMat.map.needsUpdate = true;
          // compat sRGB
          // @ts-ignore
          if ('colorSpace' in clonedMat.map) clonedMat.map.colorSpace = (THREE as any).SRGBColorSpace || clonedMat.map.colorSpace;
          // @ts-ignore
          if ('encoding' in clonedMat.map) clonedMat.map.encoding = (THREE as any).sRGBEncoding || clonedMat.map.encoding;
        }
        clonedMat.needsUpdate = true;
        newMats[ti] = clonedMat;
      });

      // assign back (preserva multi-material se houver)
      child.material = Array.isArray(child.material) ? newMats : newMats[0];
      child.material.needsUpdate = true;
      console.log('[MugModel] applied texture to mesh:', child.name, 'indices:', targetIndices);
    });

    return cloned;
  }, [gltf.scene, texture, forceTestTexture]);

  return (
    <primitive object={texturedModel} scale={1.0} position={[0, 0, 0]} dispose={null} />
  );
}