// src/hooks/useTextureManager.ts
import * as THREE from 'three';
import { useState, useEffect, useMemo } from 'react';

interface UseTextureManagerProps {
  imageSrc: string | null;
  text?: string;
  textColor?: string;
  fontFamily?: string;
  fontSize?: number;
}

export function useTextureManager({ imageSrc, text, textColor, fontFamily, fontSize }: UseTextureManagerProps) {
  const [texture, setTexture] = useState<THREE.CanvasTexture | null>(null);

  const { canvas, ctx } = useMemo(() => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    // proporção 21 x 9.7 -> usar NPOT deliberadamente (21:9.7).
    canvas.width = 2100; // NPOT
    canvas.height = 970; // NPOT
    return { canvas, ctx };
  }, []);

  useEffect(() => {
    if (!ctx || !canvas) return;

    // sempre fundo branco para que a textura não seja transparente
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // util utilitário rápido: desenha checkerboard se nenhum input for passado (debug)
    const drawChecker = (c: HTMLCanvasElement) => {
      const cctx = c.getContext('2d')!;
      const size = 32;
      for (let y = 0; y < c.height; y += size) {
        for (let x = 0; x < c.width; x += size) {
          cctx.fillStyle = ((x / size + Math.floor(y / size)) % 2) ? '#ff3366' : '#33ff66';
          cctx.fillRect(x, y, size, size);
        }
      }
    };

    const createAndSetTextureFromCanvas = () => {
      // CRÍTICO: NPOT -> disable mipmaps, use LinearFilter
      const newTexture = new THREE.CanvasTexture(canvas);
      // compatibilidade: new three versions use colorSpace
      // @ts-ignore
      if (THREE.ColorManagement && 'sRGB' in THREE) {
        // noop, keep modern
      }
      // set common props
      // try both for compatibility
      // @ts-ignore
      if ('colorSpace' in newTexture) newTexture.colorSpace = (THREE as any).SRGBColorSpace || (THREE as any).sRGBEncoding;
      // fallback
      // @ts-ignore
      if ('encoding' in newTexture) newTexture.encoding = (THREE as any).sRGBEncoding || newTexture.encoding;

      newTexture.flipY = false;
      newTexture.center.set(0.5, 0.5);
      newTexture.rotation = Math.PI; // manter rotação como tentamos antes

      newTexture.wrapS = THREE.ClampToEdgeWrapping;
      newTexture.wrapT = THREE.ClampToEdgeWrapping;
      newTexture.generateMipmaps = false;        // CRÍTICO para NPOT
      newTexture.minFilter = THREE.LinearFilter; // CRÍTICO para NPOT
      newTexture.magFilter = THREE.LinearFilter;
      newTexture.needsUpdate = true;

      // guarda global para inspeção no console
      // @ts-ignore
      window.__lastMockupCanvas = canvas;
      console.log('[useTextureManager] canvas size:', canvas.width, canvas.height);
      console.log('[useTextureManager] texture props:', {
        generateMipmaps: newTexture.generateMipmaps,
        minFilter: newTexture.minFilter,
        magFilter: newTexture.magFilter,
        wrapS: newTexture.wrapS,
        wrapT: newTexture.wrapT,
        image: (newTexture.image && { w: newTexture.image.width, h: newTexture.image.height }) || null,
      });

      setTexture(newTexture);
    };

    if (!imageSrc && !text) {
      // nada, mas ainda garanta um checker para debug se quiser
      drawChecker(canvas);
      createAndSetTextureFromCanvas();
      return;
    }

    if (imageSrc) {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        // fill white already set; desenhar centralizado mantendo proporção
        const imgAR = img.width / img.height;
        const canvasAR = canvas.width / canvas.height;
        let rw, rh;
        if (imgAR > canvasAR) {
          rw = canvas.width;
          rh = rw / imgAR;
        } else {
          rh = canvas.height;
          rw = rh * imgAR;
        }
        const x = (canvas.width - rw) / 2;
        const y = (canvas.height - rh) / 2;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, x, y, rw, rh);

        createAndSetTextureFromCanvas();
      };
      img.onerror = (e) => {
        console.error('[useTextureManager] erro ao carregar imagem', e);
        // fallback visual
        drawChecker(canvas);
        createAndSetTextureFromCanvas();
      };
      img.src = imageSrc;
    } else if (text) {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = textColor || '#000000';
      const fsize = fontSize || 120;
      ctx.font = `${fsize}px ${fontFamily || 'sans-serif'}`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(text, canvas.width / 2, canvas.height / 2);
      createAndSetTextureFromCanvas();
    }

    return () => {
      // libera anterior (se houver)
      texture?.dispose();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [imageSrc, text, textColor, fontFamily, fontSize]);

  return { texture, canvas };
}