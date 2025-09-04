// src/hooks/useTextureManager.ts

import * as THREE from 'three';
import { useState, useEffect, useMemo } from 'react';

interface UseTextureManagerProps {
  imageSrc: string | null;
  text: string;
  textColor?: string;
  fontFamily?: string;
  fontSize?: number;
}

export function useTextureManager({ imageSrc, text, textColor, fontFamily, fontSize }: UseTextureManagerProps) {
  // O estado agora armazena a textura. É isso que vai disparar a re-renderização.
  const [texture, setTexture] = useState<THREE.CanvasTexture | null>(null);

  // Usamos useMemo para o canvas e o contexto, para não recriá-los desnecessariamente.
  const { canvas, ctx } = useMemo(() => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    // Proporções corretas da área de impressão.
    canvas.width = 2100;
    canvas.height = 970;

    return { canvas, ctx };
  }, []);

  useEffect(() => {
    if (!ctx) return;

    // Se não há arte, limpa tudo.
    if (!imageSrc && !text) {
      setTexture(null);
      return;
    }

    // Limpa o canvas a cada nova arte.
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const drawImage = () => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        // Lógica de centralização da imagem (object-fit: contain)
        const imgAspectRatio = img.width / img.height;
        const canvasAspectRatio = canvas.width / canvas.height;
        let renderableWidth, renderableHeight, xStart, yStart;

        if (imgAspectRatio > canvasAspectRatio) {
          renderableWidth = canvas.width;
          renderableHeight = renderableWidth / imgAspectRatio;
        } else {
          renderableHeight = canvas.height;
          renderableWidth = renderableHeight * imgAspectRatio;
        }
        xStart = (canvas.width - renderableWidth) / 2;
        yStart = (canvas.height - renderableHeight) / 2;
        
        // Desenha a imagem no canvas
        ctx.drawImage(img, xStart, yStart, renderableWidth, renderableHeight);
        
        // CRIA E ATUALIZA O ESTADO DA TEXTURA *DEPOIS* DA IMAGEM SER DESENHADA
        const newTexture = new THREE.CanvasTexture(canvas);
        newTexture.colorSpace = THREE.SRGBColorSpace;
        setTexture(newTexture);
      };
      img.src = imageSrc!;
    };

    const drawText = () => {
      ctx.fillStyle = textColor || '#000000';
      const adjustedFontSize = fontSize || 120;
      ctx.font = `${adjustedFontSize}px ${fontFamily || 'sans-serif'}`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(text, canvas.width / 2, canvas.height / 2);

      // CRIA E ATUALIZA O ESTADO DA TEXTURA PARA O TEXTO
      const newTexture = new THREE.CanvasTexture(canvas);
      newTexture.colorSpace = THREE.SRGBColorSpace;
      setTexture(newTexture);
    };

    if (imageSrc) {
      drawImage();
    } else if (text) {
      drawText();
    }

    // Cleanup: importante para performance
    return () => {
      texture?.dispose();
    };

  }, [canvas, ctx, imageSrc, text, textColor, fontFamily, fontSize]);

  return texture;
}