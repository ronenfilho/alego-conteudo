/**
 * Configuração e gerenciamento de URLs de material incorporado
 * Este arquivo pode ser usado no admin para gerenciar as configurações
 */

// Estrutura de configuração no Firestore
const embedConfigSchema = {
    disciplina: 'string',           // Nome da disciplina
    url: 'string',                  // URL do material
    icon: 'string',                 // Emoji ou ícone
    title: 'string',                // Título exibido no modal
    type: 'string',                 // notebook, video, page, app
    requiresAuth: 'boolean',        // Se requer autenticação/token
    fallbackUrl: 'string',          // URL alternativa se embed falhar
    description: 'string',          // Descrição do material
    loadTimeout: 'number',          // Timeout em ms (default: 20000)
    sandbox: 'array',               // Permissões sandbox do iframe
    allowedOrigins: 'array',        // Origens permitidas para postMessage
    metadata: {
        createdAt: 'timestamp',
        updatedAt: 'timestamp',
        createdBy: 'string',
        active: 'boolean'
    }
};

// Exemplo de configuração completa
const exampleEmbedConfig = {
    disciplina: 'Língua Portuguesa',
    url: 'https://notebooklm.google.com/notebook/c5d7b567-acb0-43ca-80a0-51056e312d60?artifactId=73d5f19f-9345-4c71-b068-8ed60729d8d4',
    icon: '📖',
    title: 'Material Completo de Língua Portuguesa',
    type: 'notebook',
    requiresAuth: false,
    fallbackUrl: 'https://example.com/portugues-pdf',
    description: 'Notebook interativo com exercícios e teoria',
    loadTimeout: 25000,
    sandbox: [
        'allow-scripts',
        'allow-same-origin',
        'allow-forms',
        'allow-popups'
    ],
    allowedOrigins: [
        'https://notebooklm.google.com'
    ],
    metadata: {
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: 'admin@example.com',
        active: true
    }
};

// Função para salvar configuração no Firestore
async function saveEmbedConfig(config) {
    const { getFirestore, doc, setDoc } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');
    const db = window.firebaseDb;
    
    const docRef = doc(db, 'embedConfigs', config.disciplina);
    
    await setDoc(docRef, {
        ...config,
        metadata: {
            ...config.metadata,
            updatedAt: new Date()
        }
    });
    
    console.log('Configuração salva:', config.disciplina);
}

// Função para carregar configuração do Firestore
async function loadEmbedConfig(disciplina) {
    const { getFirestore, doc, getDoc } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');
    const db = window.firebaseDb;
    
    const docRef = doc(db, 'embedConfigs', disciplina);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
        return docSnap.data();
    }
    
    return null;
}

// Função para carregar todas as configurações
async function loadAllEmbedConfigs() {
    const { getFirestore, collection, getDocs, query, where } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');
    const db = window.firebaseDb;
    
    const q = query(
        collection(db, 'embedConfigs'),
        where('metadata.active', '==', true)
    );
    
    const snapshot = await getDocs(q);
    const configs = {};
    
    snapshot.forEach(doc => {
        configs[doc.id] = doc.data();
    });
    
    return configs;
}

// Função para gerar token de embed assinado (backend)
async function generateSignedEmbedUrl(originalUrl, userId, discipline) {
    // Esta função deve ser implementada no backend (Cloud Functions)
    // Aqui está apenas a estrutura
    
    const response = await fetch('/api/embed/sign-url', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${await getAuthToken()}`
        },
        body: JSON.stringify({
            url: originalUrl,
            userId: userId,
            discipline: discipline,
            expiresIn: 3600 // 1 hora
        })
    });
    
    if (!response.ok) {
        throw new Error('Failed to generate signed URL');
    }
    
    const data = await response.json();
    return data.signedUrl;
}

// Função helper para obter token
async function getAuthToken() {
    if (window.firebaseAuth && window.firebaseAuth.currentUser) {
        return await window.firebaseAuth.currentUser.getIdToken();
    }
    return null;
}

// Validação de configuração
function validateEmbedConfig(config) {
    const requiredFields = ['disciplina', 'url', 'title', 'type'];
    const errors = [];
    
    requiredFields.forEach(field => {
        if (!config[field]) {
            errors.push(`Campo obrigatório faltando: ${field}`);
        }
    });
    
    if (config.url && !isValidUrl(config.url)) {
        errors.push('URL inválida');
    }
    
    if (config.type && !['notebook', 'video', 'page', 'app'].includes(config.type)) {
        errors.push('Tipo inválido. Use: notebook, video, page ou app');
    }
    
    return {
        valid: errors.length === 0,
        errors: errors
    };
}

function isValidUrl(string) {
    try {
        new URL(string);
        return true;
    } catch (_) {
        return false;
    }
}

// Exportar funções
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        saveEmbedConfig,
        loadEmbedConfig,
        loadAllEmbedConfigs,
        generateSignedEmbedUrl,
        validateEmbedConfig,
        embedConfigSchema,
        exampleEmbedConfig
    };
}

// Para uso no browser
window.EmbedConfigManager = {
    save: saveEmbedConfig,
    load: loadEmbedConfig,
    loadAll: loadAllEmbedConfigs,
    validate: validateEmbedConfig,
    schema: embedConfigSchema,
    example: exampleEmbedConfig
};
