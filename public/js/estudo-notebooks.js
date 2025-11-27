// Notebooks management module
export let topicNotebooks = {};

export function setNotebooks(notebooks) {
    topicNotebooks = notebooks || {};
}

export async function addTopicNotebook(category, discipline, topic, topicKey, saveCallback, renderCallback, applyStateCallback) {
    const tipo = prompt(
        '📚 Que tipo de material deseja adicionar?\n\n' +
        '1️⃣ - NotebookLM\n' +
        '2️⃣ - Google Docs\n' +
        '3️⃣ - YouTube\n' +
        '4️⃣ - ChatGPT\n' +
        '5️⃣ - Gemini\n' +
        '0️⃣ - Outro (personalizado)\n\n' +
        'Digite o número da opção:'
    );
    
    if (tipo === null) return;
    
    let name, url;
    
    switch(tipo.trim()) {
        case '1':
            name = prompt('📝 Nome do NotebookLM:', 'NotebookLM');
            if (!name || name.trim() === '') return;
            url = prompt('🔗 Cole a URL do NotebookLM:', 'https://notebooklm.google.com/');
            break;
            
        case '2':
            name = prompt('📝 Nome do documento:', 'Doc');
            if (!name || name.trim() === '') return;
            url = prompt('🔗 Cole a URL do Google Docs:', 'https://docs.google.com/');
            break;
            
        case '3':
            name = prompt('📝 Nome do vídeo:', 'Vídeo');
            if (!name || name.trim() === '') return;
            url = prompt('🔗 Cole a URL do YouTube:', 'https://youtube.com/');
            break;
            
        case '4':
            name = prompt('📝 Nome da conversa:', 'ChatGPT');
            if (!name || name.trim() === '') return;
            url = prompt('🔗 Cole a URL do ChatGPT:', 'https://chat.openai.com/');
            break;
            
        case '5':
            name = prompt('📝 Nome da conversa:', 'Gemini');
            if (!name || name.trim() === '') return;
            url = prompt('🔗 Cole a URL do Gemini:', 'https://gemini.google.com/');
            break;
            
        case '0':
        case '':
            name = prompt('📝 Nome do material:', '');
            if (!name || name.trim() === '') return;
            url = prompt('🔗 Cole a URL:', '');
            break;
            
        default:
            alert('❌ Opção inválida');
            return;
    }
    
    if (!url || url.trim() === '') return;
    
    if (!topicNotebooks[topicKey]) {
        topicNotebooks[topicKey] = [];
    }
    
    topicNotebooks[topicKey].push({
        name: name.trim(),
        url: url.trim()
    });
    
    if (saveCallback) await saveCallback();
    if (renderCallback) renderCallback();
    if (applyStateCallback) applyStateCallback();
}

export async function editNotebook(topicKey, index, saveCallback, renderCallback, applyStateCallback) {
    const notebooks = topicNotebooks[topicKey];
    if (!notebooks || !notebooks[index]) return;
    
    const notebook = notebooks[index];
    
    const action = confirm(
        `📖 ${notebook.name}\n` +
        `🔗 ${notebook.url}\n\n` +
        `OK = Editar | Cancelar = Remover`
    );
    
    if (action) {
        const newName = prompt('📝 Novo nome:', notebook.name);
        if (newName && newName.trim()) {
            const newUrl = prompt('🔗 Nova URL:', notebook.url);
            if (newUrl && newUrl.trim()) {
                notebooks[index] = {
                    name: newName.trim(),
                    url: newUrl.trim()
                };
                if (saveCallback) await saveCallback();
                if (renderCallback) renderCallback();
                if (applyStateCallback) applyStateCallback();
            }
        }
    } else {
        if (confirm(`❌ Remover "${notebook.name}"?`)) {
            notebooks.splice(index, 1);
            if (notebooks.length === 0) {
                delete topicNotebooks[topicKey];
            }
            if (saveCallback) await saveCallback();
            if (renderCallback) renderCallback();
            if (applyStateCallback) applyStateCallback();
        }
    }
}
