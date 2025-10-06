import { useEffect } from 'react';

const Demo = () => {
  useEffect(() => {
    // Inicializar o widget quando a página carregar
    if (window.VidgetWidget) {
      window.VidgetWidget.init({
        autoDetectProduct: true,
        position: 'bottom-right',
        primaryColor: '#667eea',
        buttonText: 'Veja como fica em você',
        buttonIcon: '✨',
        onSuccess: (result: any) => {
          console.log('✅ Imagem gerada com sucesso!', result);
        },
        onError: (error: any) => {
          console.error('❌ Erro ao gerar imagem:', error);
        }
      });
    }
  }, []);

  const handleTryVirtual = () => {
    if (window.VidgetWidget) {
      window.VidgetWidget.openModal();
    }
  };

  return (
    <div style={{
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      minHeight: '100vh',
      padding: '40px 20px'
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        background: 'white',
        borderRadius: '20px',
        padding: '40px',
        boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
      }}>
        <header style={{ textAlign: 'center', marginBottom: '40px' }}>
          <h1 style={{ fontSize: '48px', color: '#1f2937', marginBottom: '16px' }}>
            ✨ Vidget Widget Demo
          </h1>
          <p style={{ fontSize: '20px', color: '#6b7280' }}>
            Experimente produtos virtualmente em você
          </p>
        </header>
        
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '30px',
          marginTop: '40px'
        }}>
          {/* Produto 1 */}
          <div style={{
            border: '1px solid #e5e7eb',
            borderRadius: '12px',
            overflow: 'hidden',
            transition: 'transform 0.3s, box-shadow 0.3s'
          }}>
            <div style={{ width: '100%', height: '400px', overflow: 'hidden', background: '#f9fafb' }}>
              <img 
                src="https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800&auto=format&fit=crop" 
                alt="Vestido Floral Elegante"
                data-product-image
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </div>
            <div style={{ padding: '20px' }}>
              <h3 style={{ fontSize: '24px', fontWeight: 600, color: '#1f2937', marginBottom: '8px' }}>
                Vestido Floral Elegante
              </h3>
              <p style={{ fontSize: '28px', fontWeight: 700, color: '#667eea', marginBottom: '16px' }}>
                R$ 299,90
              </p>
              <p style={{ fontSize: '14px', color: '#6b7280', lineHeight: 1.6 }}>
                Vestido midi com estampa floral delicada, perfeito para ocasiões especiais. 
                Tecido leve e confortável com caimento elegante.
              </p>
              <span 
                onClick={handleTryVirtual}
                style={{
                  display: 'inline-block',
                  background: '#10b981',
                  color: 'white',
                  padding: '6px 12px',
                  borderRadius: '6px',
                  fontSize: '12px',
                  fontWeight: 600,
                  marginTop: '12px',
                  cursor: 'pointer',
                  transition: 'background 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = '#059669'}
                onMouseLeave={(e) => e.currentTarget.style.background = '#10b981'}
              >
                ✨ Experimente Virtual
              </span>
            </div>
          </div>

          {/* Produto 2 */}
          <div style={{
            border: '1px solid #e5e7eb',
            borderRadius: '12px',
            overflow: 'hidden'
          }}>
            <div style={{ width: '100%', height: '400px', overflow: 'hidden', background: '#f9fafb' }}>
              <img 
                src="https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=800&auto=format&fit=crop" 
                alt="Blusa Branca Premium"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </div>
            <div style={{ padding: '20px' }}>
              <h3 style={{ fontSize: '24px', fontWeight: 600, color: '#1f2937', marginBottom: '8px' }}>
                Blusa Branca Premium
              </h3>
              <p style={{ fontSize: '28px', fontWeight: 700, color: '#667eea', marginBottom: '16px' }}>
                R$ 189,90
              </p>
              <p style={{ fontSize: '14px', color: '#6b7280', lineHeight: 1.6 }}>
                Blusa social em tecido premium com acabamento impecável. 
                Ideal para looks profissionais e elegantes.
              </p>
              <span 
                onClick={handleTryVirtual}
                style={{
                  display: 'inline-block',
                  background: '#10b981',
                  color: 'white',
                  padding: '6px 12px',
                  borderRadius: '6px',
                  fontSize: '12px',
                  fontWeight: 600,
                  marginTop: '12px',
                  cursor: 'pointer',
                  transition: 'background 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = '#059669'}
                onMouseLeave={(e) => e.currentTarget.style.background = '#10b981'}
              >
                ✨ Experimente Virtual
              </span>
            </div>
          </div>

          {/* Produto 3 */}
          <div style={{
            border: '1px solid #e5e7eb',
            borderRadius: '12px',
            overflow: 'hidden'
          }}>
            <div style={{ width: '100%', height: '400px', overflow: 'hidden', background: '#f9fafb' }}>
              <img 
                src="https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=800&auto=format&fit=crop" 
                alt="Jaqueta Jeans Clássica"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </div>
            <div style={{ padding: '20px' }}>
              <h3 style={{ fontSize: '24px', fontWeight: 600, color: '#1f2937', marginBottom: '8px' }}>
                Jaqueta Jeans Clássica
              </h3>
              <p style={{ fontSize: '28px', fontWeight: 700, color: '#667eea', marginBottom: '16px' }}>
                R$ 249,90
              </p>
              <p style={{ fontSize: '14px', color: '#6b7280', lineHeight: 1.6 }}>
                Jaqueta jeans oversized com lavagem moderna. 
                Peça versátil que combina com diversos estilos.
              </p>
              <span 
                onClick={handleTryVirtual}
                style={{
                  display: 'inline-block',
                  background: '#10b981',
                  color: 'white',
                  padding: '6px 12px',
                  borderRadius: '6px',
                  fontSize: '12px',
                  fontWeight: 600,
                  marginTop: '12px',
                  cursor: 'pointer',
                  transition: 'background 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = '#059669'}
                onMouseLeave={(e) => e.currentTarget.style.background = '#10b981'}
              >
                ✨ Experimente Virtual
              </span>
            </div>
          </div>
        </div>
        
        <div style={{
          background: '#f0f9ff',
          border: '2px solid #0ea5e9',
          borderRadius: '12px',
          padding: '24px',
          marginTop: '40px'
        }}>
          <h2 style={{ color: '#0369a1', marginBottom: '16px' }}>
            📸 Como usar o Vidget Widget
          </h2>
          <ol style={{ marginLeft: '20px', color: '#075985' }}>
            <li style={{ marginBottom: '8px', lineHeight: 1.6 }}>
              Clique no botão roxo "Veja como fica em você" no canto inferior direito
            </li>
            <li style={{ marginBottom: '8px', lineHeight: 1.6 }}>
              Faça upload de uma foto sua (de corpo inteiro ou busto, dependendo do produto)
            </li>
            <li style={{ marginBottom: '8px', lineHeight: 1.6 }}>
              Aguarde alguns segundos enquanto a IA aplica o produto na sua foto
            </li>
            <li style={{ marginBottom: '8px', lineHeight: 1.6 }}>
              Veja o resultado e baixe a imagem se desejar!
            </li>
          </ol>
          <p style={{ marginTop: '16px', color: '#075985' }}>
            <strong>Dica:</strong> Para melhores resultados, use fotos com boa iluminação e fundo neutro.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Demo;

// Declaração de tipos para o window
declare global {
  interface Window {
    VidgetWidget: {
      init: (config: any) => void;
      openModal: () => void;
    };
  }
}
