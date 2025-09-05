// src/components/3d/MugModel.tsx
import { useMemo } from 'react';
import { useLoader } from '@react-three/fiber';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import * as THREE from 'three';

interface MugModelProps {
  texture: THREE.CanvasTexture | null;
  forceTestTexture?: boolean;
}

// ... (createCheckerPOTTexture permanece o mesmo) ...

export function MugModel({ texture, forceTestTexture }: MugModelProps) {
  const gltf = useLoader(GLTFLoader, '/caneca-nova.glb');

  // --- MUDANÇA TEMPORÁRIA PARA DIAGNÓSTICO ---
  // Loga os nomes de todos os meshes no console.
  useMemo(() => {
    gltf.scene.traverse((child: any) => {
      if (child.isMesh) {
        console.log(`[MugModel-Diagnostic] Mesh found: ${child.name}`);
        if (child.material) {
          const materials = Array.isArray(child.material) ? child.material : [child.material];
          materials.forEach((mat: any) => {
            console.log(`  - Material: ${mat.name || 'Unnamed Material'}`);
          });
        }
      }
    });
  }, [gltf.scene]);
  // --- FIM DA MUDANÇA TEMPORÁRIA ---

  const texturedModel = useMemo(() => {
    const cloned = gltf.scene.clone(true);
    const texToUse = forceTestTexture ? createCheckerPOTTexture(256) : texture;

    if (!texToUse) {
      return cloned;
    }

    cloned.traverse((child: any) => {
      if (child.isMesh && child.geometry?.attributes?.uv) {
        // Por enquanto, esta lógica permanece a mesma da última vez
        // Vamos ajustar isso APÓS identificarmos os nomes
        const materials = Array.isArray(child.material) 
          ? child.material 
          : [child.material];

        const newMaterials = materials.map((mat: THREE.MeshStandardMaterial) => {
          if (!mat) return null;

          const clonedMat = mat.clone();
          clonedMat.map = texToUse;
          
          if (clonedMat.color) {
            clonedMat.color.set(0xffffff);
          }
          
          clonedMat.needsUpdate = true;
          return clonedMat;
        });

        child.material = Array.isArray(child.material) 
          ? newMaterials 
          : newMaterials[0];
          
        child.material.needsUpdate = true;
      }
    });

    return cloned;
  }, [gltf.scene, texture, forceTestTexture]);

  return (
    <primitive object={texturedModel} scale={1.0} position={[0, 0, 0]} dispose={null} />
  );
}