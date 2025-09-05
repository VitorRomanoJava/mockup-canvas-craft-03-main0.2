// src/hooks/useTextureManager.ts
import * as THREE from 'three';
import { useState, useEffect, useMemo } from 'react';

// Interface expandida para aceitar parâmetros independentes
interface UseTextureManagerProps {
  imageSrc: string | null;
  text?: string;
  textColor?: string;
  fontFamily?: string;
  fontSize?: number;

  // Parâmetros da Imagem
  imageScaleX?: number;
  imageScaleY?: number;
  imageOffsetX?: number;
  imageOffsetY?: number;
  imageRotation?: number; 
  textureOffsetX?: number; // Este continua global, pois "gira" a caneca inteira

  // Parâmetros do Texto
  textScaleY?: number; // Para texto, a escala Y (altura) é a mais relevante
  textOffsetX?: number;
  textOffsetY?: number;
  textRotation?: number;
}

export function useTextureManager({ 
  imageSrc, 
  text, 
  textColor, 
  fontFamily, 
  fontSize,
  // Valores padrão para a Imagem
  imageScaleX = 1,
  imageScaleY = 1,
  imageOffsetX = 0,
  imageOffsetY = 0,
  imageRotation = 0,
  textureOffsetX = 0,
  // Valores padrão para o Texto
  textScaleY = 1,
  textOffsetX = 0,
  textOffsetY = 0,
  textRotation = 0,
}: UseTextureManagerProps) {
  const [texture, setTexture] = useState<THREE.CanvasTexture | null>(null);

  const { canvas, ctx } = useMemo(() => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = 2100;
    canvas.height = 970;
    return { canvas, ctx };
  }, []);

  useEffect(() => {
    if (!ctx || !canvas) return;

    // Funções auxiliares de desenho (sem alterações na lógica interna delas)
    const createAndSetTextureFromCanvas = () => {
        const newTexture = new THREE.CanvasTexture(canvas);
        if ('colorSpace' in newTexture) (newTexture as any).colorSpace = (THREE as any).SRGBColorSpace;
        newTexture.flipY = false;
        newTexture.wrapS = THREE.RepeatWrapping; 
        newTexture.wrapT = THREE.ClampToEdgeWrapping;
        newTexture.offset.x = textureOffsetX; 
        newTexture.generateMipmaps = false;
        newTexture.minFilter = THREE.LinearFilter;
        newTexture.magFilter = THREE.LinearFilter;
        newTexture.needsUpdate = true;
        (window as any).__lastMockupCanvas = canvas;
        setTexture(newTexture);
    };

    const applyRotation = (centerX: number, centerY: number, rotation: number) => {
      ctx.translate(centerX, centerY);
      ctx.rotate(rotation * (Math.PI / 180));
      ctx.translate(-centerX, -centerY);
    };
    
    // Lógica de renderização em camadas com parâmetros independentes
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 1. Desenha a Imagem
    if (imageSrc) {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        const rw = img.width * imageScaleX;
        const rh = img.height * imageScaleY;
        const x = (canvas.width - rw) / 2 + imageOffsetX;
        const y = (canvas.height - rh) / 2 + imageOffsetY;
        const centerX = x + rw / 2;
        const centerY = y + rh / 2;
        
        ctx.save();
        applyRotation(centerX, centerY, imageRotation);
        ctx.drawImage(img, x, y, rw, rh);
        ctx.restore();

        // 2. Desenha o Texto (depois da imagem ter carregado)
        drawText();
        createAndSetTextureFromCanvas();
      };
      img.onerror = (e) => {
        console.error('[useTextureManager] erro ao carregar imagem', e);
        drawText(); // Mesmo com erro, desenha o texto
        createAndSetTextureFromCanvas();
      };
      img.src = imageSrc;
    } else {
      // Se não houver imagem, apenas desenha o texto
      drawText();
      createAndSetTextureFromCanvas();
    }
    
    function drawText() {
        if (!text || text.trim() === '') return;
        const fsize = (fontSize || 120) * textScaleY;
        ctx.font = `${fsize}px ${fontFamily || 'sans-serif'}`;
        const x = (canvas.width / 2) + textOffsetX;
        const y = (canvas.height / 2) + textOffsetY;

        ctx.save();
        applyRotation(x, y, textRotation);
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = textColor || '#000000';
        ctx.fillText(text, x, y);
        ctx.restore();
    }

    return () => {
      texture?.dispose();
    };
  }, [
    imageSrc, text, textColor, fontFamily, fontSize, textureOffsetX,
    imageScaleX, imageScaleY, imageOffsetX, imageOffsetY, imageRotation,
    textScaleY, textOffsetX, textOffsetY, textRotation
  ]);

  return { texture, canvas };
}