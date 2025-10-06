# 📦 Vidget Widget - Guia de Instalação

## O que é o Vidget Widget?

O Vidget Widget permite que seus clientes experimentem produtos virtualmente diretamente na página do produto, sem sair do seu e-commerce. Funciona com qualquer plataforma (Shopify, WooCommerce, VTEX, Nuvemshop, etc).

---

## 🚀 Instalação Rápida (3 minutos)

### 1. Copie e cole este código antes do `</body>` do seu site:

```html
<!-- Vidget Widget -->
<script src="https://SEU-DOMINIO.lovable.app/vidget-widget.js"></script>
<script>
  VidgetWidget.init({
    // O widget detecta automaticamente a imagem do produto!
    autoDetectProduct: true
  });
</script>
```

**Substitua `SEU-DOMINIO.lovable.app` pelo domínio publicado da sua aplicação Vidget.**

### 2. Pronto! 🎉

O widget agora aparecerá em todas as páginas do seu site com um botão flutuante roxo.

---

## ⚙️ Configurações Avançadas

### Personalizar aparência e comportamento:

```html
<script src="https://SEU-DOMINIO.lovable.app/vidget-widget.js"></script>
<script>
  VidgetWidget.init({
    // Posição do botão
    position: 'bottom-right', // ou 'bottom-left'
    
    // Cores personalizadas
    primaryColor: '#667eea', // Cor principal do botão
    
    // Texto do botão
    buttonText: 'Experimente em você',
    buttonIcon: '✨',
    
    // Especificar imagem do produto manualmente (opcional)
    productImage: 'https://seusite.com/produto.jpg',
    
    // Prompt customizado para a IA (opcional)
    customPrompt: 'Apply this clothing item naturally on the person',
    
    // Callbacks (opcional)
    onSuccess: function(result) {
      console.log('Imagem gerada!', result);
      // Você pode enviar eventos para Google Analytics, etc
    },
    onError: function(error) {
      console.error('Erro:', error);
    }
  });
</script>
```

---

## 🛍️ Instalação por Plataforma

### Shopify

1. Vá em: **Loja Online → Temas → Ações → Editar Código**
2. Abra o arquivo `theme.liquid`
3. Cole o código do widget antes de `</body>`
4. Clique em **Salvar**

### WooCommerce (WordPress)

1. Vá em: **Aparência → Editor de Temas**
2. Selecione `footer.php`
3. Cole o código do widget antes de `</body>`
4. Clique em **Atualizar Arquivo**

**OU use um plugin de "Insert Headers and Footers":**
1. Instale o plugin "Insert Headers and Footers"
2. Vá em **Configurações → Insert Headers and Footers**
3. Cole o código na seção **Footer**
4. Salve

### Nuvemshop

1. Vá em: **Minha Nuvemshop → Design → Personalizar**
2. Clique em **Configurações Avançadas → Código HTML**
3. Cole o código do widget no campo **Código HTML adicional no </body>**
4. Clique em **Salvar**

### VTEX

1. Vá em: **CMS → Layout → Código HTML → Editar**
2. Cole o código do widget antes de `</body>` no template principal
3. Salve as alterações

### Outro E-commerce / Site Customizado

1. Localize o template principal do seu site (geralmente `footer.php`, `layout.html`, `index.html`)
2. Cole o código do widget antes da tag `</body>`
3. Salve e publique

---

## 🎯 Como funciona?

1. **Detecção Automática**: O widget detecta automaticamente a imagem do produto na página
2. **Botão Flutuante**: Aparece um botão elegante no canto da tela
3. **Upload Simples**: Cliente clica, faz upload de uma foto
4. **IA Instantânea**: Em segundos, mostra o produto aplicado na foto do cliente
5. **Resultado**: Cliente pode baixar ou tirar nova foto

---

## 🔧 Detecção Automática de Produto

O widget detecta automaticamente a imagem do produto usando seletores inteligentes para:

- ✅ Shopify
- ✅ WooCommerce
- ✅ Nuvemshop
- ✅ VTEX
- ✅ Magento
- ✅ Sites customizados

Se a detecção automática não funcionar no seu site, você pode especificar manualmente:

```javascript
VidgetWidget.init({
  productImage: document.querySelector('.sua-classe-de-imagem').src
});
```

Ou passar a URL diretamente:

```javascript
VidgetWidget.init({
  productImage: 'https://seusite.com/imagem-produto.jpg'
});
```

---

## 📱 Responsivo e Compatível

- ✅ Funciona em desktop, tablet e mobile
- ✅ Compatível com todos os navegadores modernos
- ✅ Não conflita com outros scripts
- ✅ CSS isolado (não afeta design do seu site)
- ✅ Z-index alto (sempre visível)

---

## 🎨 Exemplos de Uso

### Apenas em páginas de produto:

```html
<!-- Adicione apenas em product.liquid, single-product.php, etc -->
<script src="https://SEU-DOMINIO.lovable.app/vidget-widget.js"></script>
<script>
  VidgetWidget.init({
    productImage: '{{ product.featured_image.src }}' // Shopify
  });
</script>
```

### Com Google Analytics:

```javascript
VidgetWidget.init({
  onSuccess: function(result) {
    // Enviar evento para GA
    gtag('event', 'virtual_try_on', {
      'event_category': 'engagement',
      'event_label': 'success'
    });
  }
});
```

### Diferentes cores por categoria:

```javascript
// Roupas = roxo, acessórios = azul
const isAccessory = document.body.classList.contains('category-accessories');

VidgetWidget.init({
  primaryColor: isAccessory ? '#3b82f6' : '#667eea'
});
```

---

## ❓ Solução de Problemas

### O widget não aparece
- ✅ Verifique se a URL do script está correta
- ✅ Abra o Console (F12) e procure por erros
- ✅ Certifique-se de que o código está antes de `</body>`

### O produto não é detectado
- ✅ Especifique manualmente com `productImage`
- ✅ Verifique se a imagem está visível na página

### Erro ao gerar imagem
- ✅ Verifique se a imagem do usuário é válida (JPG, PNG, HEIC)
- ✅ Verifique se o tamanho é menor que 10MB
- ✅ Certifique-se de que a API backend está funcionando

---

## 🌐 CORS e Segurança

O widget já está configurado para aceitar requisições de qualquer domínio. Não é necessário configurar CORS no seu lado.

---

## 📞 Suporte

Precisa de ajuda? Entre em contato:
- 📧 Email: suporte@vidget.com
- 💬 Chat: vidget.com/suporte
- 📚 Documentação: docs.vidget.com

---

## 📊 Testando o Widget

Antes de instalar no seu site, você pode testar em:
**https://SEU-DOMINIO.lovable.app/demo.html**

---

## 🎉 Dicas para Melhores Resultados

1. **Fotos de qualidade**: Incentive clientes a usar fotos com boa iluminação
2. **Fundo neutro**: Fundos simples geram melhores resultados
3. **Pose adequada**: Para roupas superiores, foto de busto; para vestidos, corpo inteiro
4. **Produto destacado**: Certifique-se de que a imagem do produto está clara

---

**Versão**: 1.0.0  
**Última atualização**: 2025

---

Made with ❤️ by Vidget
