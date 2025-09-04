// src/lib/three-utils.ts

import * as THREE from 'three';

/**
 * Aplica uma textura a um objeto Mesh dentro de um modelo 3D, utilizando mapeamento UV.
 * A função percorre a cena do modelo, encontra o primeiro Mesh com coordenadas UV,
 * clona seu material original e aplica a nova textura a ele.
 *
 * @param model O objeto Group ou Scene do Three.js que contém o modelo 3D.
 * @param texture A textura (THREE.Texture) já carregada que será aplicada.
 * @returns O modelo modificado com a textura aplicada.
 */
export function applyTextureWithUVMapping(
  model: THREE.Object3D,
  texture: THREE.Texture
): THREE.Object3D {
  if (!model || !texture) {
    console.warn("Modelo 3D ou textura não fornecidos para `applyTextureWithUVMapping`.");
    return model;
  }

  // --- Melhoras de Qualidade ---
  // 1. flipY = false: Garante que a textura não fique de cabeça para baixo.
  // O Canvas 2D já gera a imagem na orientação correta para o mapeamento UV de modelos GLB.
  texture.flipY = false;

  // 2. Wrapping: ClampToEdgeWrapping evita que a textura se repita nas bordas.
  // A arte aparecerá uma única vez, como esperado em uma caneca.
  texture.wrapS = THREE.ClampToEdgeWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  
  // 3. Min/Mag Filter: Garante que a textura fique nítida mesmo em diferentes níveis de zoom.
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;
  
  // Garante que a textura será atualizada na GPU
  texture.needsUpdate = true;

  let meshFound = false;

  model.traverse((child) => {
    if (!meshFound && child instanceof THREE.Mesh && child.geometry.attributes.uv) {
      
      // --- Lógica de Material Aprimorada ---
      // Em vez de criar um material novo, clonamos o existente.
      // Isso preserva todas as propriedades originais do material da caneca
      // (como roughness, metalness, cor base, etc.), alterando apenas a textura (map).
      // O resultado é muito mais realista.
      const originalMaterial = child.material as THREE.MeshStandardMaterial;
      const newMaterial = originalMaterial.clone();
      
      newMaterial.map = texture;
      newMaterial.transparent = true; // Mantém a transparência para PNGs

      child.material = newMaterial;
      meshFound = true;
    }
  });

  if (!meshFound) {
    console.warn("Nenhum mesh com coordenadas UV foi encontrado no modelo para aplicar a textura.");
  }

  return model;
}