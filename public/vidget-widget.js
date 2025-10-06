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
        console.warn('Vidget Widget: Não foi possível detectar imagem do produto automaticamente');
        // Não retornar - ainda podemos usar o widget manualmente
      }
      
      console.log('Vidget Widget initialized with product:', this.productImage);
      
      // Injetar elementos na página
      this.injectStyles();
      this.injectButton();
      this.injectModal();
      this.attachEventListeners();
      
      console.log('Vidget Widget ready!');
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
        /* Botão trigger flutuante */
        .vidget-trigger-btn {
          position: fixed;
          right: 20px;
          bottom: 20px;
          background: linear-gradient(135deg, ${this.config.primaryColor} 0%, #764ba2 100%);
          color: white;
          border: none;
          padding: 14px 24px;
          border-radius: 50px;
          cursor: pointer;
          font-size: 15px;
          font-weight: 600;
          box-shadow: 0 4px 20px rgba(102, 126, 234, 0.4);
          z-index: 999998;
          display: flex;
          align-items: center;
          gap: 8px;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Inter', sans-serif;
          letter-spacing: 0.3px;
        }
        
        .vidget-trigger-btn:hover {
          transform: translateY(-3px);
          box-shadow: 0 8px 30px rgba(102, 126, 234, 0.5);
        }
        
        /* Chat lateral container */
        .vidget-chat-panel {
          position: fixed;
          right: 20px;
          bottom: 80px;
          width: 420px;
          max-height: 650px;
          background: white;
          border-radius: 16px 16px 0 0;
          box-shadow: -4px 0 24px rgba(0,0,0,0.15);
          z-index: 999999;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Inter', sans-serif;
          display: none;
          flex-direction: column;
          transform: translateX(100%);
          transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          overflow: hidden;
        }
        
        .vidget-chat-panel.active {
          display: flex;
          transform: translateX(0);
        }
        
        /* Header do chat */
        .vidget-chat-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 20px 24px;
          border-bottom: 1px solid #e5e7eb;
          background: white;
        }
        
        .vidget-chat-title {
          font-size: 16px;
          font-weight: 600;
          color: #1f2937;
          margin: 0;
        }
        
        .vidget-close {
          background: transparent;
          border: none;
          width: 28px;
          height: 28px;
          border-radius: 6px;
          font-size: 20px;
          color: #6b7280;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s;
        }
        
        .vidget-close:hover {
          background: #f3f4f6;
          color: #1f2937;
        }
        
        /* Conteúdo do chat */
        .vidget-chat-body {
          flex: 1;
          overflow-y: auto;
          padding: 24px;
          background: white;
        }
        
        .vidget-chat-body::-webkit-scrollbar {
          width: 6px;
        }
        
        .vidget-chat-body::-webkit-scrollbar-track {
          background: #f9fafb;
        }
        
        .vidget-chat-body::-webkit-scrollbar-thumb {
          background: #d1d5db;
          border-radius: 3px;
        }
        
        /* Estado 1: Upload */
        .vidget-upload-state {
          text-align: center;
          padding: 32px 0;
        }
        
        .vidget-upload-icon {
          font-size: 56px;
          margin-bottom: 20px;
          opacity: 0.9;
        }
        
        .vidget-upload-title {
          font-size: 18px;
          font-weight: 600;
          color: #1f2937;
          margin-bottom: 8px;
        }
        
        .vidget-upload-subtitle {
          font-size: 14px;
          color: #6b7280;
          margin-bottom: 24px;
          line-height: 1.5;
        }
        
        .vidget-upload-area {
          border: 2px dashed #d1d5db;
          border-radius: 12px;
          padding: 40px 24px;
          cursor: pointer;
          transition: all 0.3s;
          background: #fafafa;
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
          display: block;
        }
        
        .vidget-upload-button {
          display: inline-block;
          background: ${this.config.primaryColor};
          color: white;
          padding: 12px 32px;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: opacity 0.2s;
        }
        
        .vidget-upload-button:hover {
          opacity: 0.9;
        }
        
        .vidget-upload-formats {
          font-size: 12px;
          color: #9ca3af;
          margin-top: 12px;
        }
        
        /* Estado 2: Loading */
        .vidget-loading-state {
          text-align: center;
          padding: 48px 24px;
        }
        
        .vidget-spinner {
          width: 56px;
          height: 56px;
          border: 4px solid #f3f4f6;
          border-top-color: ${this.config.primaryColor};
          border-radius: 50%;
          animation: vidget-spin 1s linear infinite;
          margin: 0 auto 24px;
        }
        
        @keyframes vidget-spin {
          to { transform: rotate(360deg); }
        }
        
        .vidget-loading-text {
          font-size: 15px;
          font-weight: 500;
          color: #374151;
          margin-bottom: 16px;
        }
        
        .vidget-progress-bar {
          width: 100%;
          height: 6px;
          background: #f3f4f6;
          border-radius: 3px;
          overflow: hidden;
          margin-top: 16px;
        }
        
        .vidget-progress-fill {
          height: 100%;
          background: linear-gradient(90deg, ${this.config.primaryColor}, #764ba2);
          width: 0%;
          animation: vidget-progress 2s ease-in-out infinite;
        }
        
        @keyframes vidget-progress {
          0%, 100% { width: 0%; }
          50% { width: 70%; }
        }
        
        /* Estado 3: Resultado */
        .vidget-result-state {
          text-align: center;
        }
        
        .vidget-result-image {
          width: 100%;
          border-radius: 8px;
          margin-bottom: 16px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }
        
        .vidget-result-title {
          font-size: 16px;
          font-weight: 600;
          color: #1f2937;
          margin-bottom: 16px;
        }
        
        .vidget-result-actions {
          display: flex;
          gap: 12px;
        }
        
        .vidget-btn {
          flex: 1;
          padding: 14px 24px;
          border-radius: 8px;
          border: none;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          font-family: inherit;
        }
        
        .vidget-btn-primary {
          background: ${this.config.primaryColor};
          color: white;
        }
        
        .vidget-btn-primary:hover {
          opacity: 0.9;
          transform: translateY(-1px);
        }
        
        .vidget-btn-secondary {
          background: white;
          color: #374151;
          border: 2px solid #e5e7eb;
        }
        
        .vidget-btn-secondary:hover {
          border-color: #d1d5db;
          background: #f9fafb;
        }
        
        /* Estado de erro */
        .vidget-error-state {
          text-align: center;
          padding: 32px 24px;
        }
        
        .vidget-error-icon {
          font-size: 48px;
          margin-bottom: 16px;
        }
        
        .vidget-error-message {
          color: #ef4444;
          font-size: 14px;
          margin-bottom: 20px;
        }
        
        /* Mobile responsivo */
        @media (max-width: 768px) {
          .vidget-chat-panel {
            width: 100%;
            max-width: 100vw;
            right: 0;
            bottom: 0;
            max-height: 85vh;
            border-radius: 16px 16px 0 0;
          }
          
          .vidget-trigger-btn {
            right: 16px;
            bottom: 16px;
            padding: 12px 20px;
            font-size: 14px;
          }
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
    
    // Injetar painel de chat lateral
    injectModal: function() {
      const chatPanel = document.createElement('div');
      chatPanel.className = 'vidget-chat-panel';
      chatPanel.id = 'vidget-chat-panel';
      chatPanel.innerHTML = `
        <div class="vidget-chat-header">
          <h2 class="vidget-chat-title">Experimente virtualmente</h2>
          <button class="vidget-close" aria-label="Fechar">×</button>
        </div>
        
        <div class="vidget-chat-body">
          <!-- Estado 1: Upload -->
          <div id="vidget-upload-state" class="vidget-upload-state">
            <div class="vidget-upload-icon">📸</div>
            <div class="vidget-upload-title">Envie sua foto</div>
            <div class="vidget-upload-subtitle">Veja como este produto fica em você</div>
            
            <div class="vidget-upload-area">
              <input type="file" id="vidget-file-input" accept="image/jpeg,image/jpg,image/png,image/heic" />
              <label for="vidget-file-input">
                <div class="vidget-upload-button">Escolher Foto</div>
                <div class="vidget-upload-formats">Formatos aceitos: JPG, PNG, HEIC</div>
              </label>
            </div>
          </div>
          
          <!-- Estado 2: Loading -->
          <div id="vidget-loading-state" class="vidget-loading-state" style="display:none">
            <div class="vidget-spinner"></div>
            <div class="vidget-loading-text">Criando sua visualização personalizada...</div>
            <div class="vidget-progress-bar">
              <div class="vidget-progress-fill"></div>
            </div>
          </div>
          
          <!-- Estado 3: Resultado -->
          <div id="vidget-result-state" class="vidget-result-state" style="display:none">
            <img id="vidget-result-img" class="vidget-result-image" alt="Resultado" />
            <div class="vidget-result-title">Veja como ficou em você!</div>
            <div class="vidget-result-actions">
              <button class="vidget-btn vidget-btn-primary" onclick="VidgetWidget.downloadResult()">
                Baixar imagem
              </button>
              <button class="vidget-btn vidget-btn-secondary" onclick="VidgetWidget.reset()">
                Tentar outra foto
              </button>
            </div>
          </div>
          
          <!-- Estado de Erro -->
          <div id="vidget-error-state" class="vidget-error-state" style="display:none">
            <div class="vidget-error-icon">⚠️</div>
            <div id="vidget-error-message" class="vidget-error-message"></div>
            <button class="vidget-btn vidget-btn-secondary" onclick="VidgetWidget.reset()">
              Tentar novamente
            </button>
          </div>
        </div>
      `;
      
      document.body.appendChild(chatPanel);
    },
    
    // Event listeners
    attachEventListeners: function() {
      const self = this;
      
      // Botão trigger
      document.querySelector('.vidget-trigger-btn').addEventListener('click', function() {
        self.openModal();
      });
      
      // Fechar chat
      document.querySelector('.vidget-close').addEventListener('click', function() {
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
    
    // Abrir chat
    openModal: function() {
      const panel = document.getElementById('vidget-chat-panel');
      panel.classList.add('active');
      this.isOpen = true;
      
      // Se já tem resultado, mostrar
      if (this.currentResult) {
        this.showResult(this.currentResult);
      }
    },
    
    // Fechar chat
    closeModal: function() {
      const panel = document.getElementById('vidget-chat-panel');
      panel.classList.remove('active');
      this.isOpen = false;
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
      
      // Converter a imagem do produto para base64
      let productImageBase64 = this.productImage;
      if (this.productImage && !this.productImage.startsWith('data:')) {
        try {
          const response = await fetch(this.productImage);
          const blob = await response.blob();
          productImageBase64 = await new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(blob);
          });
          console.log('Product image converted to base64');
        } catch (e) {
          console.error('Failed to convert product image to base64:', e);
        }
      }
      
      const response = await fetch(this.config.apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productImage: productImageBase64,
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
      document.getElementById('vidget-upload-state').style.display = 'none';
      document.getElementById('vidget-loading-state').style.display = 'block';
      document.getElementById('vidget-result-state').style.display = 'none';
      document.getElementById('vidget-error-state').style.display = 'none';
    },
    
    // Mostrar resultado
    showResult: function(result) {
      document.getElementById('vidget-upload-state').style.display = 'none';
      document.getElementById('vidget-loading-state').style.display = 'none';
      document.getElementById('vidget-result-state').style.display = 'block';
      document.getElementById('vidget-error-state').style.display = 'none';
      
      // Aceitar tanto result.url quanto result.data.url
      const imageUrl = result.url || (result.data && result.data.url) || result.imageUrl;
      document.getElementById('vidget-result-img').src = imageUrl;
      this.currentResult = result;
      
      // Scroll para o topo do resultado
      const chatBody = document.querySelector('.vidget-chat-body');
      if (chatBody) chatBody.scrollTop = 0;
    },
    
    // Mostrar erro
    showError: function(message) {
      document.getElementById('vidget-upload-state').style.display = 'none';
      document.getElementById('vidget-loading-state').style.display = 'none';
      document.getElementById('vidget-result-state').style.display = 'none';
      document.getElementById('vidget-error-state').style.display = 'block';
      document.getElementById('vidget-error-message').textContent = message;
    },
    
    // Reset
    reset: function() {
      document.getElementById('vidget-upload-state').style.display = 'block';
      document.getElementById('vidget-loading-state').style.display = 'none';
      document.getElementById('vidget-result-state').style.display = 'none';
      document.getElementById('vidget-error-state').style.display = 'none';
      document.getElementById('vidget-file-input').value = '';
      this.currentResult = null;
    },
    
    // Download resultado
    downloadResult: function() {
      if (!this.currentResult) return;
      
      const imageUrl = this.currentResult.url || 
                       (this.currentResult.data && this.currentResult.data.url) || 
                       this.currentResult.imageUrl;
      
      const link = document.createElement('a');
      link.href = imageUrl;
      link.download = 'vidget-virtual-try-on.png';
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };
})();
