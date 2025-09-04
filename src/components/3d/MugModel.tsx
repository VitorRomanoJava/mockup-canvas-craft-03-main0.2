// src/components/3d/MugModel.tsx

import { useMemo, useEffect } from 'react';
import { useLoader } from '@react-three/fiber';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import * as THREE from 'three';

interface MugModelProps {
  texture: THREE.CanvasTexture | null;
}

const loggedMaterials = new Set();

export function MugModel({ texture }: MugModelProps) {
  const gltf = useLoader(GLTFLoader, '/caneca-nova.glb');

  // Log de materiais (mantido para depuração, se necessário)
  useEffect(() => {
    if (loggedMaterials.size > 0) return; // Roda só uma vez
    gltf.scene.traverse((child) => {
      if (child instanceof THREE.Mesh && child.material) {
        console.log(`[Material Inspector] Nome: "${child.material.name}"`);
        loggedMaterials.add(child.material.uuid);
      }
    });
  }, [gltf.scene]);

  const texturedModel = useMemo(() => {
    const clonedModel = gltf.scene.clone();

    if (texture) {
      // CONFIGURAÇÃO DA TEXTURA - APLICADA A CADA NOVA TEXTURA
      texture.flipY = false;
      texture.rotation = Math.PI;
      texture.center.set(0.5, 0.5);
      texture.wrapS = THREE.ClampToEdgeWrapping;
      texture.wrapT = THREE.ClampToEdgeWrapping;
      texture.repeat.set(1, 1);
      
      clonedModel.traverse((child) => {
        if (child instanceof THREE.Mesh && child.material) {
          // AJUSTE AQUI O NOME DO MATERIAL COM BASE NOS LOGS DO CONSOLE
          const TARGET_MATERIAL_NAME = 'Caneca-corpo'; 

          if (child.material.name === TARGET_MATERIAL_NAME) {
            const clonedMaterial = child.material.clone();
            clonedMaterial.map = texture;
            clonedMaterial.color.set(0xffffff);
            
            // Atribuição final
            child.material = clonedMaterial;
          }
        }
      });
    }

    return clonedModel;
  }, [gltf.scene, texture]); // O useMemo agora re-executa quando a 'texture' muda!

  return (
    <primitive
      object={texturedModel}
      scale={1.0}
      position={[0, 0, 0]}
      dispose={null}
    />
  );
}