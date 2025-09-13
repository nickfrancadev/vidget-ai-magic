import { useState } from 'react';
import { Check, Upload, ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import sampleBag from '@/assets/sample-product-bag.jpg';
import sampleShoes from '@/assets/sample-product-shoes.jpg';
import sampleWatch from '@/assets/sample-product-watch.jpg';

interface Product {
  id: string;
  name: string;
  image: string;
  category: string;
}

const sampleProducts: Product[] = [
  {
    id: '1',
    name: 'Bolsa de Couro Premium',
    image: sampleBag,
    category: 'Acessórios'
  },
  {
    id: '2',
    name: 'Tênis Esportivo Branco',
    image: sampleShoes,
    category: 'Calçados'
  },
  {
    id: '3',
    name: 'Relógio de Luxo',
    image: sampleWatch,
    category: 'Acessórios'
  }
];

interface ProductSelectorProps {
  selectedProducts: string[];
  onProductSelect: (productId: string) => void;
}

export const ProductSelector = ({ selectedProducts, onProductSelect }: ProductSelectorProps) => {
  const [uploadMode, setUploadMode] = useState<'ecommerce' | 'upload'>('ecommerce');

  return (
    <Card className="ai-card p-6">
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <ShoppingBag className="h-5 w-5 text-ai-primary" />
          <h3 className="text-lg font-semibold text-text-primary">
            Selecione os Produtos
          </h3>
        </div>

        <div className="flex gap-2">
          <Button
            variant={uploadMode === 'ecommerce' ? 'default' : 'outline'}
            onClick={() => setUploadMode('ecommerce')}
            className="flex-1"
          >
            <ShoppingBag className="h-4 w-4 mr-2" />
            E-commerce
          </Button>
          <Button
            variant={uploadMode === 'upload' ? 'default' : 'outline'}
            onClick={() => setUploadMode('upload')}
            className="flex-1"
          >
            <Upload className="h-4 w-4 mr-2" />
            Upload
          </Button>
        </div>

        {uploadMode === 'ecommerce' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {sampleProducts.map((product) => {
              const isSelected = selectedProducts.includes(product.id);
              
              return (
                <div
                  key={product.id}
                  className={`relative cursor-pointer transition-all duration-300 ${
                    isSelected ? 'scale-105' : 'hover:scale-102'
                  }`}
                  onClick={() => onProductSelect(product.id)}
                >
                  <div className={`ai-card border-2 overflow-hidden ${
                    isSelected 
                      ? 'border-ai-primary shadow-ai-glow' 
                      : 'border-transparent hover:border-ai-primary/30'
                  }`}>
                    <div className="aspect-square overflow-hidden">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
                      />
                    </div>
                    <div className="p-3">
                      <p className="font-medium text-text-primary text-sm">{product.name}</p>
                      <p className="text-xs text-text-muted">{product.category}</p>
                    </div>
                  </div>
                  
                  {isSelected && (
                    <div className="absolute top-2 right-2 bg-ai-primary text-white rounded-full p-1">
                      <Check className="h-3 w-3" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="border-2 border-dashed border-ai-primary/30 rounded-xl p-8 text-center hover:border-ai-primary/50 transition-colors">
            <Upload className="h-12 w-12 text-ai-primary mx-auto mb-4" />
            <p className="text-text-primary font-medium mb-2">
              Faça upload das suas imagens
            </p>
            <p className="text-text-muted text-sm mb-4">
              Arraste e solte ou clique para selecionar
            </p>
            <Button variant="outline">
              Selecionar Arquivos
            </Button>
          </div>
        )}

        {selectedProducts.length > 0 && (
          <div className="flex items-center gap-2 text-sm text-ai-primary">
            <Check className="h-4 w-4" />
            {selectedProducts.length} produto(s) selecionado(s)
          </div>
        )}
      </div>
    </Card>
  );
};