// src/components/3d/Mug3DViewer.tsx

import { Canvas } from '@react-three/fiber';
import { Stage, OrbitControls } from '@react-three/drei';
import { MugModel } from './MugModel';
import { useTextureManager } from '@/hooks/useTextureManager';

// Interface de props simplificada (onExportReady foi removido)
interface Mug3DViewerProps {
  uploadedImage: string | null;
  customText: string;
  textColor: string;
  textFont: string;
  textSize: number;
  textureOffsetX: number;
  imageScaleX: number;
  imageScaleY: number;
  imageOffsetX: number;
  imageOffsetY: number;
  imageRotation: number;
  textScaleY: number;
  textOffsetX: number;
  textOffsetY: number;
  textRotation: number;
}

export function Mug3DViewer({ 
  uploadedImage, 
  customText, 
  textColor, 
  textFont, 
  textSize,
  textureOffsetX,
  imageScaleX,
  imageScaleY,
  imageOffsetX,
  imageOffsetY,
  imageRotation,
  textScaleY,
  textOffsetX,
  textOffsetY,
  textRotation,
}: Mug3DViewerProps) {
  const { texture } = useTextureManager({
    imageSrc: uploadedImage,
    text: customText,
    textColor: textColor,
    fontFamily: textFont,
    fontSize: textSize,
    textureOffsetX: textureOffsetX,
    imageScaleX: imageScaleX,
    imageScaleY: imageScaleY,
    imageOffsetX: imageOffsetX,
    imageOffsetY: imageOffsetY,
    imageRotation: imageRotation,
    textScaleY: textScaleY,
    textOffsetX: textOffsetX,
    textOffsetY: textOffsetY,
    textRotation: textRotation,
  });

  return (
    // Adicionado 'id' e removida a lógica de 'onExportReady'
    <Canvas 
      id="mug-canvas" 
      camera={{ fov: 45 }} 
      shadows 
      dpr={[1, 2]} 
      gl={{ preserveDrawingBuffer: true }}
    >
      <Stage environment="city" intensity={0.6} adjustCamera>
        <MugModel 
          texture={texture} 
          forceTestTexture={false}
        />
      </Stage>
      <OrbitControls makeDefault enableZoom enablePan={false} />
    </Canvas>
  );
}