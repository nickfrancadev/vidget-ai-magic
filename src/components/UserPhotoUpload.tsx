import { useState, useRef } from 'react';
import { Upload, User, X, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { normalizeUserUploadImage } from '@/lib/normalizeUserUploadImage';

interface UserPhotoUploadProps {
  userPhoto: File | null;
  onPhotoSelect: (file: File | null) => void;
}

export const UserPhotoUpload = ({ userPhoto, onPhotoSelect }: UserPhotoUploadProps) => {
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      try {
        // Normaliza orientação (corrige EXIF que causa resultados girados 90°)
        const normalized = await normalizeUserUploadImage(file);
        onPhotoSelect(normalized.file);
        setPreview(normalized.dataUrl);
      } catch {
        // Fallback: usa arquivo original
        onPhotoSelect(file);
        const reader = new FileReader();
        reader.onloadend = () => setPreview(reader.result as string);
        reader.readAsDataURL(file);
      }
    }
  };

  const handleRemovePhoto = () => {
    onPhotoSelect(null);
    setPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <Card className="ai-card p-6">
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <User className="h-5 w-5 text-ai-primary" />
          <h3 className="text-lg font-semibold text-text-primary">
            Foto para Virtual Try-On (Opcional)
          </h3>
        </div>

        <p className="text-sm text-text-secondary">
          Faça upload de uma foto para visualizar como o produto ficaria em você
        </p>

        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3 text-sm text-yellow-600 dark:text-yellow-400">
          ⚠️ <strong>Atenção:</strong> Arquivos HEIC (formato iPhone) não são suportados. 
          Por favor, converta para JPG ou PNG antes de fazer upload.
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/jpg,image/png,image/webp"
          onChange={handleFileSelect}
          className="hidden"
        />

        {!preview ? (
          <div 
            onClick={handleClick}
            className="border-2 border-dashed border-ai-primary/30 rounded-xl p-8 text-center hover:border-ai-primary/50 transition-colors cursor-pointer"
          >
            <Upload className="h-12 w-12 text-ai-primary mx-auto mb-4" />
            <p className="text-text-primary font-medium mb-2">
              Faça upload da sua foto
            </p>
            <p className="text-text-muted text-sm mb-4">
              Clique para selecionar ou arraste e solte
            </p>
            <Button variant="outline" type="button">
              Selecionar Foto
            </Button>
          </div>
        ) : (
          <div className="relative">
            <div className="ai-card border-2 border-ai-primary shadow-ai-glow overflow-hidden">
              <div className="aspect-square overflow-hidden">
                <img
                  src={preview}
                  alt="Preview"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
            
            <div className="absolute top-2 right-2 flex gap-2">
              <div className="bg-ai-primary text-white rounded-full p-1.5">
                <Check className="h-4 w-4" />
              </div>
              <button
                onClick={handleRemovePhoto}
                className="bg-red-500 text-white rounded-full p-1.5 hover:bg-red-600 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-3 flex justify-center">
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleClick}
              >
                Trocar Foto
              </Button>
            </div>
          </div>
        )}

        {preview && (
          <div className="flex items-center gap-2 text-sm text-ai-primary">
            <Check className="h-4 w-4" />
            Foto carregada e pronta para uso
          </div>
        )}
      </div>
    </Card>
  );
};
