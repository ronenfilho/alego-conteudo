/**
 * EmbedModal - Gerenciador de conteúdo incorporado por disciplina
 * Implementa modal seguro com iframe, postMessage, timeout e fallbacks
 */

class EmbedModal {
    constructor() {
        this.modal = null;
        this.iframe = null;
        this.currentConfig = null;
        this.loadingTimeout = null;
        this.messageHandlers = new Map();
        this.analyticsQueue = [];
        this.LOADING_TIMEOUT = 20000; // 20 segundos
        
        this.init();
    }

    init() {
        this.createModalStructure();
        this.setupEventListeners();
        this.setupPostMessageListener();
    }

    createModalStructure() {
        const modalHTML = `
            <div class="embed-modal-overlay" id="embedModal" role="dialog" aria-modal="true" aria-labelledby="embedModalTitle">
                <div class="embed-modal-content">
                    <div class="embed-modal-header">
                        <div class="embed-modal-title" id="embedModalTitle">
                            <span id="embedModalIcon">📚</span>
                            <span id="embedModalTitleText">Material de Estudo</span>
                        </div>
                        <div class="embed-modal-actions">
                            <button class="embed-btn embed-btn-secondary" id="embedOpenNewTab" aria-label="Abrir em nova aba">
                                <span>🔗</span>
                                <span>Nova Aba</span>
                            </button>
                            <button class="embed-btn embed-btn-close" id="embedCloseBtn" aria-label="Fechar modal">
                                <span>✕</span>
                            </button>
                        </div>
                    </div>
                    <div class="embed-modal-body">
                        <div class="embed-loading" id="embedLoading">
                            <div class="embed-spinner"></div>
                            <div class="embed-loading-text">Carregando material...</div>
                            <div class="embed-loading-progress">
                                <div class="embed-loading-progress-bar" id="embedLoadingBar"></div>
                            </div>
                        </div>
                        <div class="embed-fallback" id="embedFallback">
                            <div class="embed-fallback-icon">⚠️</div>
                            <div class="embed-fallback-title" id="embedFallbackTitle">Não foi possível carregar o conteúdo</div>
                            <div class="embed-fallback-message" id="embedFallbackMessage">
                                O material não pôde ser incorporado nesta página. 
                                Você pode abrir em uma nova aba para visualizar.
                            </div>
                            <div class="embed-fallback-actions">
                                <button class="embed-btn embed-btn-primary" id="embedFallbackOpen">
                                    <span>🔗</span>
                                    <span>Abrir em Nova Aba</span>
                                </button>
                                <button class="embed-btn embed-btn-outline" id="embedFallbackReport">
                                    <span>🐛</span>
                                    <span>Reportar Problema</span>
                                </button>
                            </div>
                        </div>
                        <iframe 
                            id="embedIframe" 
                            class="embed-iframe"
                            sandbox="allow-scripts allow-forms allow-popups allow-popups-to-escape-sandbox"
                            style="display: none;"
                            title="Conteúdo incorporado"
                        ></iframe>
                    </div>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        this.modal = document.getElementById('embedModal');
        this.iframe = document.getElementById('embedIframe');
    }

    setupEventListeners() {
        // Fechar modal
        document.getElementById('embedCloseBtn').addEventListener('click', () => this.close());
        
        // Fechar com ESC
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.modal.classList.contains('show')) {
                this.close();
            }
        });
        
        // Fechar clicando fora
        this.modal.addEventListener('click', (e) => {
            if (e.target === this.modal) {
                this.close();
            }
        });
        
        // Abrir em nova aba
        document.getElementById('embedOpenNewTab').addEventListener('click', () => {
            if (this.currentConfig?.url) {
                window.open(this.currentConfig.url, '_blank', 'noopener,noreferrer');
                this.trackAnalytics('opened_new_tab', this.currentConfig);
            }
        });
        
        // Fallback: abrir em nova aba
        document.getElementById('embedFallbackOpen').addEventListener('click', () => {
            if (this.currentConfig?.url) {
                window.open(this.currentConfig.url, '_blank', 'noopener,noreferrer');
                this.trackAnalytics('fallback_opened', this.currentConfig);
            }
        });
        
        // Reportar problema
        document.getElementById('embedFallbackReport').addEventListener('click', () => {
            this.reportProblem();
        });
    }

    setupPostMessageListener() {
        window.addEventListener('message', (event) => {
            // Validar origem (adicionar suas origens permitidas)
            const allowedOrigins = [
                'https://colab.research.google.com',
                'https://www.youtube.com',
                'https://alego-conteudo.web.app',
                'https://alego-conteudo.firebaseapp.com',
                window.location.origin
            ];
            
            if (!allowedOrigins.some(origin => event.origin.startsWith(origin))) {
                // Silenciar logs de origens não confiáveis (extensões do navegador, etc)
                // console.warn('Message from untrusted origin:', event.origin);
                return;
            }
            
            this.handlePostMessage(event.data, event.origin);
        });
    }

    handlePostMessage(data, origin) {
        if (!data || typeof data !== 'object') return;
        
        // Ignorar mensagens de extensões do navegador e outros scripts
        if (!data.type || data.source === 'react-devtools-content-script' || data.source === 'react-devtools-bridge') {
            return;
        }
        
        switch (data.type) {
            case 'ready':
                this.onIframeReady();
                this.trackAnalytics('iframe_ready', this.currentConfig);
                break;
                
            case 'height':
                if (data.height && typeof data.height === 'number') {
                    this.adjustIframeHeight(data.height);
                }
                break;
                
            case 'navigate':
                if (data.url) {
                    this.handleNavigation(data.url);
                }
                break;
                
            case 'annotation':
                this.handleAnnotation(data);
                break;
                
            case 'request-auth':
                this.handleAuthRequest(data);
                break;
                
            case 'analytics':
                this.trackAnalytics(data.event, data.properties);
                break;
                
            case 'exercise_completed':
                this.handleExerciseCompleted(data);
                break;
                
            default:
                // Silenciar logs de mensagens desconhecidas (podem ser de extensões)
                // console.log('Unknown message type:', data.type);
                break;
        }
    }

    async open(config) {
        // config: { url, title, icon, discipline, type, requiresAuth }
        this.currentConfig = config;
        
        // Atualizar título e ícone
        document.getElementById('embedModalTitleText').textContent = config.title || 'Material de Estudo';
        document.getElementById('embedModalIcon').textContent = config.icon || '📚';
        
        // Mostrar modal
        this.modal.classList.add('show');
        document.body.style.overflow = 'hidden';
        
        // Focar no modal para acessibilidade
        this.modal.focus();
        
        // Track analytics
        this.trackAnalytics('modal_opened', config);
        
        // Carregar conteúdo
        await this.loadContent(config);
    }

    async loadContent(config) {
        // Mostrar loading
        document.getElementById('embedLoading').style.display = 'flex';
        document.getElementById('embedFallback').classList.remove('show');
        this.iframe.style.display = 'none';
        
        // Iniciar timeout
        this.startLoadingTimeout();
        
        try {
            // Se requer autenticação, obter token
            let finalUrl = config.url;
            if (config.requiresAuth) {
                finalUrl = await this.getSignedUrl(config.url, config.discipline);
            }
            
            // Verificar se URL permite embed
            const canEmbed = await this.checkEmbedPermission(finalUrl);
            
            if (!canEmbed) {
                this.showFallback('embed_blocked', 
                    'Conteúdo não permite incorporação',
                    'Este material não pode ser exibido dentro da página por restrições de segurança. Abra em uma nova aba para visualizar.'
                );
                return;
            }
            
            // Carregar iframe
            this.iframe.src = finalUrl;
            
            // Aguardar carregamento
            this.iframe.onload = () => {
                // Verificar se iframe carregou com erro (403, X-Frame-Options, etc)
                setTimeout(() => {
                    try {
                        // Tentar acessar o conteúdo do iframe
                        const iframeDoc = this.iframe.contentDocument || this.iframe.contentWindow.document;
                        if (!iframeDoc || iframeDoc.body.innerHTML.includes('403') || iframeDoc.body.innerHTML.includes('Este é um erro')) {
                            this.showFallback('embed_403',
                                'Acesso Negado (403)',
                                'Este site não permite ser incorporado. Alguns serviços como o NotebookLM do Google bloqueiam a exibição em iframe por segurança. Clique no botão abaixo para abrir em uma nova aba.'
                            );
                            return;
                        }
                    } catch (e) {
                        // Se der erro ao acessar, provavelmente é X-Frame-Options
                        // Não fazer nada, iframe pode estar carregando normalmente
                    }
                    this.onIframeLoad();
                }, 500);
            };
            
            this.iframe.onerror = () => {
                this.onIframeError();
            };
            
        } catch (error) {
            console.error('Error loading content:', error);
            this.showFallback('load_error', 
                'Erro ao carregar',
                'Ocorreu um erro ao tentar carregar o material. Tente novamente ou abra em uma nova aba.'
            );
        }
    }

    async getSignedUrl(url, discipline) {
        // Implementar chamada ao backend para obter URL assinada
        try {
            const response = await fetch('/api/embed/sign-url', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${await this.getAuthToken()}`
                },
                body: JSON.stringify({ url, discipline })
            });
            
            if (!response.ok) throw new Error('Failed to sign URL');
            
            const data = await response.json();
            return data.signedUrl;
        } catch (error) {
            console.error('Error signing URL:', error);
            return url; // Fallback para URL original
        }
    }

    async getAuthToken() {
        // Obter token do Firebase Auth
        if (window.firebaseAuth && window.firebaseAuth.currentUser) {
            return await window.firebaseAuth.currentUser.getIdToken();
        }
        return null;
    }

    async checkEmbedPermission(url) {
        // Verificar se a URL permite embedding
        // Em produção, fazer isso no backend
        try {
            // IMPORTANTE: NotebookLM NÃO permite embed (retorna 403)
            // Verificar origens conhecidas que permitem embed
            const embedFriendlyDomains = [
                'colab.research.google.com',
                'youtube.com',
                'youtu.be',
                'vimeo.com',
                'docs.google.com'
            ];
            
            const urlObj = new URL(url);
            return embedFriendlyDomains.some(domain => urlObj.hostname.includes(domain));
        } catch {
            return false;
        }
    }

    startLoadingTimeout() {
        this.clearLoadingTimeout();
        
        this.loadingTimeout = setTimeout(() => {
            this.showFallback('timeout',
                'Tempo limite excedido',
                'O material está demorando muito para carregar. Verifique sua conexão ou tente abrir em uma nova aba.'
            );
        }, this.LOADING_TIMEOUT);
    }

    clearLoadingTimeout() {
        if (this.loadingTimeout) {
            clearTimeout(this.loadingTimeout);
            this.loadingTimeout = null;
        }
    }

    onIframeLoad() {
        this.clearLoadingTimeout();
        
        // Aguardar mensagem 'ready' do iframe ou timeout de 3s
        setTimeout(() => {
            if (document.getElementById('embedLoading').style.display !== 'none') {
                this.onIframeReady();
            }
        }, 3000);
    }

    onIframeReady() {
        this.clearLoadingTimeout();
        document.getElementById('embedLoading').style.display = 'none';
        this.iframe.style.display = 'block';
        
        // Enviar configuração para o iframe
        this.sendToIframe({
            type: 'config',
            userId: window.firebaseAuth?.currentUser?.uid,
            discipline: this.currentConfig?.discipline
        });
    }

    onIframeError() {
        this.clearLoadingTimeout();
        this.showFallback('load_error',
            'Erro ao carregar conteúdo',
            'Não foi possível carregar o material. Verifique sua conexão ou tente abrir em uma nova aba.'
        );
    }

    showFallback(reason, title, message) {
        this.clearLoadingTimeout();
        document.getElementById('embedLoading').style.display = 'none';
        this.iframe.style.display = 'none';
        
        const fallback = document.getElementById('embedFallback');
        document.getElementById('embedFallbackTitle').textContent = title;
        document.getElementById('embedFallbackMessage').textContent = message;
        fallback.classList.add('show');
        
        this.trackAnalytics('fallback_shown', { reason, ...this.currentConfig });
    }

    adjustIframeHeight(height) {
        if (height && height > 0) {
            this.iframe.style.height = `${height}px`;
        }
    }

    handleNavigation(url) {
        console.log('Navigation requested:', url);
        // Implementar lógica de navegação se necessário
    }

    handleAnnotation(data) {
        console.log('Annotation received:', data);
        // Implementar salvamento de anotações
    }

    handleAuthRequest(data) {
        console.log('Auth requested:', data);
        // Implementar renovação de token se necessário
    }

    handleExerciseCompleted(data) {
        console.log('Exercise completed:', data);
        this.trackAnalytics('exercise_completed', data);
        // Atualizar progresso no Firebase
    }

    sendToIframe(message) {
        if (this.iframe && this.iframe.contentWindow) {
            this.iframe.contentWindow.postMessage(message, '*');
        }
    }

    trackAnalytics(event, properties = {}) {
        const analyticsData = {
            event,
            timestamp: new Date().toISOString(),
            userId: window.firebaseAuth?.currentUser?.uid,
            ...properties
        };
        
        console.log('Analytics:', analyticsData);
        this.analyticsQueue.push(analyticsData);
        
        // Enviar para backend ou Firebase Analytics
        this.flushAnalytics();
    }

    async flushAnalytics() {
        if (this.analyticsQueue.length === 0) return;
        
        // Implementar envio para backend/analytics
        // Por enquanto, apenas log
        console.log('Analytics queue:', this.analyticsQueue);
        this.analyticsQueue = [];
    }

    reportProblem() {
        const problemData = {
            url: this.currentConfig?.url,
            discipline: this.currentConfig?.discipline,
            timestamp: new Date().toISOString(),
            userId: window.firebaseAuth?.currentUser?.uid,
            userAgent: navigator.userAgent
        };
        
        console.log('Problem reported:', problemData);
        alert('Obrigado por reportar o problema. Nossa equipe será notificada.');
        
        this.trackAnalytics('problem_reported', problemData);
    }

    close() {
        this.modal.classList.remove('show');
        document.body.style.overflow = '';
        
        // Limpar iframe
        if (this.iframe) {
            this.iframe.src = 'about:blank';
        }
        
        this.clearLoadingTimeout();
        
        // Track analytics
        this.trackAnalytics('modal_closed', this.currentConfig);
        
        this.currentConfig = null;
    }
}

// Inicializar quando o DOM estiver pronto
let embedModalInstance = null;

function initEmbedModal() {
    if (!embedModalInstance) {
        embedModalInstance = new EmbedModal();
    }
    return embedModalInstance;
}

// Função helper para abrir material incorporado
function openEmbeddedMaterial(config) {
    const modal = initEmbedModal();
    modal.open(config);
}

// Exportar para uso global
window.EmbedModal = EmbedModal;
window.openEmbeddedMaterial = openEmbeddedMaterial;
window.initEmbedModal = initEmbedModal;
