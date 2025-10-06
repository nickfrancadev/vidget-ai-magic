(function() {
  'use strict';
  
  // Namespace global
  window.VidgetWidget = {
    config: {},
    productImage: null,
    isOpen: false,
    currentResult: null,
    
    // Método de inicialização
    init: function(userConfig) {
      this.config = Object.assign({
        position: 'bottom-right',
        autoDetectProduct: true,
        apiEndpoint: 'https://hjpzteoizffhulgyvhha.supabase.co/functions/v1/generate-image',
        buttonText: 'Veja como fica em você',
        buttonIcon: '✨',
        primaryColor: '#667eea',
        onSuccess: null,
        onError: null,
        customPrompt: ''
      }, userConfig);
      
      // Detectar imagem do produto
      this.productImage = this.config.productImage || this.detectProductImage();
      
      if (!this.productImage) {
        console.error('Vidget Widget: Não foi possível detectar imagem do produto');
        return;
      }
      
      console.log('Vidget Widget initialized with product:', this.productImage);
      
      // Injetar elementos na página
      this.injectStyles();
      this.injectButton();
      this.injectModal();
      this.attachEventListeners();
    },
    
    // Detectar automaticamente a imagem do produto
    detectProductImage: function() {
      const selectors = [
        // Shopify
        '.product-single__photo img',
        '.product__main-photos img:first-child',
        '.product-featured-img',
        // WooCommerce
        '.woocommerce-product-gallery__image img',
        '.wp-post-image',
        // Nuvemshop
        '.product-image img',
        '.image-container img',
        // VTEX
        '.productImage img',
        // Magento
        '.product-image-photo',
        // Genéricos
        '[data-product-image]',
        '.main-product-image',
        '.product-gallery img:first-child',
        '.product-image-main img',
        '[itemtype*="Product"] img:first-of-type',
        'img[alt*="produto"]',
        'img[alt*="product"]'
      ];
      
      for (let selector of selectors) {
        const img = document.querySelector(selector);
        if (img && img.src && img.src.startsWith('http')) {
          console.log('Detected product image via selector:', selector);
          return img.src;
        }
      }
      
      // Fallback: pega a maior imagem da página
      const allImages = Array.from(document.querySelectorAll('img')).filter(img => 
        img.src && 
        img.src.startsWith('http') && 
        img.naturalWidth > 200 && 
        img.naturalHeight > 200
      );
      
      if (allImages.length > 0) {
        const largestImage = allImages.reduce((largest, img) => {
          const area = img.naturalWidth * img.naturalHeight;
          const largestArea = largest.naturalWidth * largest.naturalHeight;
          return area > largestArea ? img : largest;
        });
        console.log('Detected product image via fallback (largest)');
        return largestImage.src;
      }
      
      return null;
    },
    
    // Injetar CSS
    injectStyles: function() {
      const styles = `
        .vidget-trigger-btn {
          position: fixed;
          ${this.config.position.includes('right') ? 'right: 20px;' : 'left: 20px;'}
          bottom: 20px;
          background: linear-gradient(135deg, ${this.config.primaryColor} 0%, #764ba2 100%);
          color: white;
          border: none;
          padding: 16px 24px;
          border-radius: 50px;
          cursor: pointer;
          font-size: 16px;
          font-weight: 600;
          box-shadow: 0 4px 15px rgba(0,0,0,0.3);
          z-index: 999998;
          display: flex;
          align-items: center;
          gap: 8px;
          transition: all 0.3s ease;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }
        
        .vidget-trigger-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(0,0,0,0.4);
        }
        
        .vidget-modal {
          display: none;
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          z-index: 999999;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }
        
        .vidget-modal.active {
          display: block;
        }
        
        .vidget-overlay {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(0,0,0,0.7);
          backdrop-filter: blur(4px);
        }
        
        .vidget-content {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          background: white;
          border-radius: 20px;
          padding: 32px;
          max-width: 500px;
          width: 90%;
          max-height: 90vh;
          overflow-y: auto;
          box-shadow: 0 20px 60px rgba(0,0,0,0.3);
        }
        
        .vidget-close {
          position: absolute;
          top: 16px;
          right: 16px;
          background: #f3f4f6;
          border: none;
          width: 32px;
          height: 32px;
          border-radius: 50%;
          font-size: 20px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: background 0.2s;
        }
        
        .vidget-close:hover {
          background: #e5e7eb;
        }
        
        .vidget-content h2 {
          margin: 0 0 24px 0;
          font-size: 24px;
          color: #1f2937;
        }
        
        .vidget-upload-area {
          border: 2px dashed #d1d5db;
          border-radius: 12px;
          padding: 48px 24px;
          text-align: center;
          cursor: pointer;
          transition: all 0.3s;
        }
        
        .vidget-upload-area:hover {
          border-color: ${this.config.primaryColor};
          background: #f9fafb;
        }
        
        .vidget-upload-area input {
          display: none;
        }
        
        .vidget-upload-area label {
          cursor: pointer;
          font-size: 16px;
          color: #6b7280;
          display: block;
        }
        
        .vidget-upload-icon {
          font-size: 48px;
          margin-bottom: 16px;
        }
        
        .vidget-loading {
          text-align: center;
          padding: 48px 24px;
        }
        
        .vidget-spinner {
          border: 4px solid #f3f4f6;
          border-top: 4px solid ${this.config.primaryColor};
          border-radius: 50%;
          width: 48px;
          height: 48px;
          animation: vidget-spin 1s linear infinite;
          margin: 0 auto 16px;
        }
        
        @keyframes vidget-spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        .vidget-result {
          text-align: center;
        }
        
        .vidget-result img {
          max-width: 100%;
          border-radius: 12px;
          margin-bottom: 16px;
        }
        
        .vidget-result-actions {
          display: flex;
          gap: 12px;
          justify-content: center;
          flex-wrap: wrap;
        }
        
        .vidget-btn {
          padding: 12px 24px;
          border-radius: 8px;
          border: none;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }
        
        .vidget-btn-primary {
          background: ${this.config.primaryColor};
          color: white;
        }
        
        .vidget-btn-primary:hover {
          opacity: 0.9;
        }
        
        .vidget-btn-secondary {
          background: #f3f4f6;
          color: #374151;
        }
        
        .vidget-btn-secondary:hover {
          background: #e5e7eb;
        }
        
        .vidget-error {
          padding: 16px;
          text-align: center;
        }
        
        .vidget-error-message {
          color: #ef4444;
          margin-bottom: 12px;
        }
      `;
      
      const styleSheet = document.createElement('style');
      styleSheet.textContent = styles;
      document.head.appendChild(styleSheet);
    },
    
    // Injetar botão trigger
    injectButton: function() {
      const button = document.createElement('button');
      button.className = 'vidget-trigger-btn';
      button.innerHTML = `
        <span>${this.config.buttonIcon}</span>
        <span>${this.config.buttonText}</span>
      `;
      document.body.appendChild(button);
    },
    
    // Injetar modal
    injectModal: function() {
      const modal = document.createElement('div');
      modal.className = 'vidget-modal';
      modal.id = 'vidget-modal';
      modal.innerHTML = `
        <div class="vidget-overlay"></div>
        <div class="vidget-content">
          <button class="vidget-close" aria-label="Fechar">×</button>
          <h2>Veja como fica em você</h2>
          
          <div id="vidget-upload-area" class="vidget-upload-area">
            <input type="file" id="vidget-file-input" accept="image/*,image/heic" />
            <label for="vidget-file-input">
              <div class="vidget-upload-icon">📸</div>
              <div>Clique para fazer upload da sua foto</div>
              <div style="font-size: 12px; margin-top: 8px; color: #9ca3af;">
                JPG, PNG ou HEIC (máx. 10MB)
              </div>
            </label>
          </div>
          
          <div id="vidget-loading" class="vidget-loading" style="display:none">
            <div class="vidget-spinner"></div>
            <div style="color: #6b7280;">Criando sua visualização personalizada...</div>
          </div>
          
          <div id="vidget-result" class="vidget-result" style="display:none">
            <img id="vidget-result-img" alt="Resultado" />
            <div class="vidget-result-actions">
              <button class="vidget-btn vidget-btn-primary" onclick="VidgetWidget.downloadResult()">
                Baixar Imagem
              </button>
              <button class="vidget-btn vidget-btn-secondary" onclick="VidgetWidget.reset()">
                Nova Foto
              </button>
            </div>
          </div>
          
          <div id="vidget-error" class="vidget-error" style="display:none">
            <div id="vidget-error-message" class="vidget-error-message"></div>
            <button class="vidget-btn vidget-btn-secondary" onclick="VidgetWidget.reset()">
              Tentar Novamente
            </button>
          </div>
        </div>
      `;
      
      document.body.appendChild(modal);
    },
    
    // Event listeners
    attachEventListeners: function() {
      const self = this;
      
      // Botão trigger
      document.querySelector('.vidget-trigger-btn').addEventListener('click', function() {
        self.openModal();
      });
      
      // Fechar modal
      document.querySelector('.vidget-close').addEventListener('click', function() {
        self.closeModal();
      });
      
      document.querySelector('.vidget-overlay').addEventListener('click', function() {
        self.closeModal();
      });
      
      // Upload de arquivo
      document.getElementById('vidget-file-input').addEventListener('change', function(e) {
        self.handleFileUpload(e);
      });
      
      // ESC para fechar
      document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && self.isOpen) {
          self.closeModal();
        }
      });
    },
    
    // Abrir modal
    openModal: function() {
      document.getElementById('vidget-modal').classList.add('active');
      this.isOpen = true;
      document.body.style.overflow = 'hidden';
    },
    
    // Fechar modal
    closeModal: function() {
      document.getElementById('vidget-modal').classList.remove('active');
      this.isOpen = false;
      document.body.style.overflow = '';
    },
    
    // Upload de arquivo
    handleFileUpload: async function(event) {
      const file = event.target.files[0];
      if (!file) return;
      
      // Validar tamanho
      if (file.size > 10 * 1024 * 1024) {
        this.showError('Arquivo muito grande. Máximo: 10MB');
        return;
      }
      
      // Validar tipo
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/heic'];
      if (!validTypes.includes(file.type) && !file.name.toLowerCase().endsWith('.heic')) {
        this.showError('Formato inválido. Use JPG, PNG ou HEIC');
        return;
      }
      
      // Mostrar loading
      this.showLoading();
      
      try {
        // Converter para base64
        const base64 = await this.fileToBase64(file);
        
        // Gerar imagem
        const result = await this.generateImage(base64);
        
        // Mostrar resultado
        this.showResult(result);
        
        if (this.config.onSuccess) {
          this.config.onSuccess(result);
        }
        
      } catch (error) {
        console.error('Vidget Widget Error:', error);
        this.showError(error.message || 'Erro ao gerar imagem. Tente novamente.');
        
        if (this.config.onError) {
          this.config.onError(error);
        }
      }
    },
    
    // Converter arquivo para base64
    fileToBase64: function(file) {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
    },
    
    // Chamar API para gerar imagem
    generateImage: async function(userPhotoBase64) {
      console.log('Calling API:', this.config.apiEndpoint);
      
      const response = await fetch(this.config.apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productImage: this.productImage,
          userPhoto: userPhotoBase64,
          prompt: this.config.customPrompt || 'Apply the product naturally on the person'
        })
      });
      
      if (!response.ok) {
        let errorMessage = 'Erro ao gerar imagem';
        try {
          const error = await response.json();
          errorMessage = error.error || error.message || errorMessage;
        } catch (e) {
          console.error('Failed to parse error response:', e);
        }
        throw new Error(errorMessage);
      }
      
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Erro ao gerar imagem');
      }
      
      return data.data;
    },
    
    // Mostrar loading
    showLoading: function() {
      document.getElementById('vidget-upload-area').style.display = 'none';
      document.getElementById('vidget-loading').style.display = 'block';
      document.getElementById('vidget-result').style.display = 'none';
      document.getElementById('vidget-error').style.display = 'none';
    },
    
    // Mostrar resultado
    showResult: function(result) {
      document.getElementById('vidget-loading').style.display = 'none';
      document.getElementById('vidget-result').style.display = 'block';
      document.getElementById('vidget-result-img').src = result.url || result.imageUrl;
      this.currentResult = result;
    },
    
    // Mostrar erro
    showError: function(message) {
      document.getElementById('vidget-loading').style.display = 'none';
      document.getElementById('vidget-upload-area').style.display = 'none';
      document.getElementById('vidget-error').style.display = 'block';
      document.getElementById('vidget-error-message').textContent = message;
    },
    
    // Reset
    reset: function() {
      document.getElementById('vidget-upload-area').style.display = 'block';
      document.getElementById('vidget-loading').style.display = 'none';
      document.getElementById('vidget-result').style.display = 'none';
      document.getElementById('vidget-error').style.display = 'none';
      document.getElementById('vidget-file-input').value = '';
    },
    
    // Download resultado
    downloadResult: function() {
      if (!this.currentResult) return;
      
      const imageUrl = this.currentResult.url || this.currentResult.imageUrl;
      const link = document.createElement('a');
      link.href = imageUrl;
      link.download = 'vidget-try-on.png';
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };
})();
