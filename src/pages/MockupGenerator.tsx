// src/pages/MockupGenerator.tsx

import { useState, useRef } from "react";
import { Mug3DViewer } from "@/components/3d/Mug3DViewer";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Download, Upload, Text, Palette, Wand2, RotateCw, Move3d, ArrowLeftRight, ArrowUpDown } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";

const fonts = [
  { name: "Arial", value: "Arial, sans-serif" },
  { name: "Verdana", value: "Verdana, sans-serif" },
  { name: "Georgia", value: "Georgia, serif" },
  { name: "Times New Roman", value: "Times New Roman, Times, serif" },
  { name: "Courier New", value: "Courier New, Courier, monospace" },
  { name: "Lobster", value: "'Lobster', cursive" },
  { name: "Roboto", value: "'Roboto', sans-serif" },
];

export function MockupGenerator() {
  // --- Estados da Imagem ---
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [imageScaleX, setImageScaleX] = useState(2.31);
  const [imageScaleY, setImageScaleY] = useState(1);
  const [imageOffsetX, setImageOffsetX] = useState(110);
  const [imageOffsetY, setImageOffsetY] = useState(230);
  const [imageRotation, setImageRotation] = useState(180);

  // --- Estados do Texto ---
  const [customText, setCustomText] = useState(""); 
  const [textColor, setTextColor] = useState("#000000");
  const [textFont, setTextFont] = useState(fonts[0].value);
  const [textSize, setTextSize] = useState(120);
  const [textScaleY, setTextScaleY] = useState(0.65);
  const [textOffsetX, setTextOffsetX] = useState(-500);
  const [textOffsetY, setTextOffsetY] = useState(70);
  const [textRotation, setTextRotation] = useState(180);

  // --- Estado Global ---
  const [textureOffsetX, setTextureOffsetX] = useState(190 / 360);

  // --- Controle da UI ---
  const [activeTab, setActiveTab] = useState("image");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  // O estado 'exportMug' foi removido.

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setUploadedImage(reader.result as string);
        setActiveTab("image");
      };
      reader.readAsDataURL(file);
    }
  };

  // --- NOVA FUNÇÃO handleDownload ---
  const handleDownload = () => {
    const canvas = document.getElementById('mug-canvas') as HTMLCanvasElement;

    if (canvas) {
      try {
        const dataUrl = canvas.toDataURL('image/png');
        const link = document.createElement("a");
        link.href = dataUrl;
        link.download = "mockup-caneca.png";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast({
          title: "Download Iniciado!",
          description: "Seu mockup está sendo baixado.",
        });
      } catch (error) {
        console.error("Erro ao exportar canvas:", error);
        toast({
          title: "Erro na Exportação",
          description: "Não foi possível capturar a imagem do canvas.",
          variant: "destructive",
        });
      }
    } else {
      toast({
        title: "Erro",
        description: "Elemento canvas não encontrado para exportação.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex flex-col lg:flex-row h-screen bg-muted/20">
      <div className="lg:w-1/3 p-4 lg:p-6 border-r border-border/40 overflow-y-auto">
        <div className="space-y-6">
          <header>
            <h1 className="text-2xl font-bold font-heading flex items-center">
              <Wand2 className="w-6 h-6 mr-2 text-primary" />
              Editor de Mockup
            </h1>
            <p className="text-muted-foreground">
              Personalize a arte da sua caneca.
            </p>
          </header>

          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="image">
                <Upload className="w-4 h-4 mr-2" /> Imagem
              </TabsTrigger>
              <TabsTrigger value="text">
                <Text className="w-4 h-4 mr-2" /> Texto
              </TabsTrigger>
            </TabsList>

            <TabsContent value="image" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Enviar Imagem</CardTitle>
                </CardHeader>
                <CardContent>
                  <Button
                    className="w-full"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Escolher Arquivo
                  </Button>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleImageUpload}
                    className="hidden"
                    accept="image/png, image/jpeg"
                  />
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Ajustes da Imagem</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6 pt-2">
                  <div className="space-y-2">
                    <Label className="flex justify-between">
                      <span className="flex items-center"><ArrowLeftRight className="w-4 h-4 mr-2" /> Largura</span>
                      <span>{imageScaleX.toFixed(2)}x</span>
                    </Label>
                    <Slider value={[imageScaleX]} onValueChange={(v) => setImageScaleX(v[0])} min={0.1} max={3} step={0.01} />
                  </div>
                  <div className="space-y-2">
                    <Label className="flex justify-between">
                      <span className="flex items-center"><ArrowUpDown className="w-4 h-4 mr-2" /> Altura</span>
                      <span>{imageScaleY.toFixed(2)}x</span>
                    </Label>
                    <Slider value={[imageScaleY]} onValueChange={(v) => setImageScaleY(v[0])} min={0.1} max={3} step={0.01} />
                  </div>
                  <div className="space-y-2">
                    <Label className="flex justify-between">Posição Horizontal (X)<span>{imageOffsetX}px</span></Label>
                    <Slider value={[imageOffsetX]} onValueChange={(v) => setImageOffsetX(v[0])} min={-500} max={500} step={1} />
                  </div>
                  <div className="space-y-2">
                    <Label className="flex justify-between">Posição Vertical (Y)<span>{imageOffsetY}px</span></Label>
                    <Slider value={[imageOffsetY]} onValueChange={(v) => setImageOffsetY(v[0])} min={-500} max={500} step={1} />
                  </div>
                  <div className="space-y-2">
                    <Label className="flex justify-between">
                        <span className="flex items-center"><RotateCw className="w-4 h-4 mr-2" /> Rotação 2D</span>
                        <span>{imageRotation}°</span>
                    </Label>
                    <Slider value={[imageRotation]} onValueChange={(v) => setImageRotation(v[0])} min={0} max={360} step={1} />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="text" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Adicionar Texto</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2"><Label>Texto</Label><Input value={customText} onChange={(e) => setCustomText(e.target.value)} /></div>
                  <div className="space-y-2"><Label>Fonte</Label><Select value={textFont} onValueChange={setTextFont}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{fonts.map((f) => <SelectItem key={f.name} value={f.value}>{f.name}</SelectItem>)}</SelectContent></Select></div>
                  <div className="flex gap-4"><div className="space-y-2 flex-1"><Label>Cor</Label><Input type="color" value={textColor} onChange={(e) => setTextColor(e.target.value)} className="p-1 h-10" /></div><div className="space-y-2 flex-1"><Label>Tamanho Base</Label><Input type="number" value={textSize} onChange={(e) => setTextSize(Number(e.target.value))} /></div></div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader><CardTitle>Ajustes do Texto</CardTitle></CardHeader>
                <CardContent className="space-y-6 pt-2">
                  <div className="space-y-2">
                    <Label className="flex justify-between">
                        <span className="flex items-center"><ArrowUpDown className="w-4 h-4 mr-2" /> Altura (Escala)</span>
                        <span>{textScaleY.toFixed(2)}x</span>
                    </Label>
                    <Slider value={[textScaleY]} onValueChange={(v) => setTextScaleY(v[0])} min={0.1} max={3} step={0.01} />
                  </div>
                  <div className="space-y-2">
                    <Label className="flex justify-between">Posição Horizontal (X)<span>{textOffsetX}px</span></Label>
                    <Slider value={[textOffsetX]} onValueChange={(v) => setTextOffsetX(v[0])} min={-500} max={500} step={1} />
                  </div>
                  <div className="space-y-2">
                    <Label className="flex justify-between">Posição Vertical (Y)<span>{textOffsetY}px</span></Label>
                    <Slider value={[textOffsetY]} onValueChange={(v) => setTextOffsetY(v[0])} min={-500} max={500} step={1} />
                  </div>
                  <div className="space-y-2">
                    <Label className="flex justify-between">
                        <span className="flex items-center"><RotateCw className="w-4 h-4 mr-2" /> Rotação 2D</span>
                        <span>{textRotation}°</span>
                    </Label>
                    <Slider value={[textRotation]} onValueChange={(v) => setTextRotation(v[0])} min={0} max={360} step={1} />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <Card>
            <CardHeader><CardTitle>Ajustes Gerais da Caneca</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label className="flex justify-between">
                    <span className="flex items-center"><Move3d className="w-4 h-4 mr-2" /> Girar Arte (360°)</span>
                    <span>{(textureOffsetX * 360).toFixed(0)}°</span>
                </Label>
                <Slider value={[textureOffsetX]} onValueChange={(v) => setTextureOffsetX(v[0])} min={0} max={1} step={0.01} />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader><CardTitle>Finalizar</CardTitle></CardHeader>
            <CardContent><Button size="lg" className="w-full" onClick={handleDownload}><Download className="w-4 h-4 mr-2" /> Baixar Mockup</Button></CardContent>
          </Card>
        </div>
      </div>

      <div className="flex-1 min-h-[50vh] lg:min-h-0">
        <Mug3DViewer
          // A prop 'onExportReady' foi removida
          uploadedImage={uploadedImage}
          customText={customText}
          textColor={textColor}
          textFont={textFont}
          textSize={textSize}
          textureOffsetX={textureOffsetX}
          imageScaleX={imageScaleX}
          imageScaleY={imageScaleY}
          imageOffsetX={imageOffsetX}
          imageOffsetY={imageOffsetY}
          imageRotation={imageRotation}
          textScaleY={textScaleY}
          textOffsetX={textOffsetX}
          textOffsetY={textOffsetY}
          textRotation={textRotation}
        />
      </div>
    </div>
  );
};