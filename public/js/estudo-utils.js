// ============= UTILITY FUNCTIONS =============

export function updateSaveStatus(status, text) {
    const indicator = document.getElementById('saveStatusIndicator');
    const statusText = document.getElementById('saveStatusText');
    
    if (!indicator || !statusText) return;
    
    indicator.className = 'save-status';
    if (status === 'saving') {
        indicator.classList.add('saving');
    }
    
    statusText.textContent = text;
    
    if (status === 'saved') {
        setTimeout(() => {
            if (statusText.textContent === text) {
                statusText.textContent = 'Salvo automaticamente';
            }
        }, 2000);
    }
}

export function scheduleAutoSave(delay = 1500, saveCallback) {
    if (window.autoSaveTimer) clearTimeout(window.autoSaveTimer);
    window.autoSaveTimer = setTimeout(() => {
        saveCallback();
    }, delay);
}

export function parseMarkdownToContent(markdown) {
    const content = {};
    const lines = markdown.split('\n');
    let currentCategory = null;
    let currentCategoryFull = null;
    let currentDiscipline = null;
    let currentDisciplineFull = null;
    let h1Title = null; // Para estruturas 1 e 3

    for (let line of lines) {
        line = line.trim();
        if (!line) continue;

        // H1 (# titulo) - Pode ser título do curso ou categoria principal
        if (line.startsWith('# ') && !line.startsWith('## ')) {
            const fullTitle = line.replace(/^#\s+/, '').trim();
            const match = fullTitle.match(/^(.+?)(?:\s+-\s+(\d+))?$/);
            const baseName = match ? match[1].trim() : fullTitle;
            
            h1Title = baseName;
            
            // Estrutura 3: H1 é categoria, H2 será disciplina
            // Criar categoria imediatamente
            currentCategoryFull = fullTitle;
            currentCategory = baseName;
            
            if (!content[currentCategory]) {
                content[currentCategory] = {
                    _fullTitle: currentCategoryFull,
                    disciplines: {}
                };
            }
            currentDiscipline = null;
            continue;
        }

        // H2 (## titulo) - Pode ser área, categoria ou disciplina
        if (line.startsWith('## ') && !line.startsWith('### ')) {
            const fullTitle = line.replace(/^##\s+/, '').trim();
            const match = fullTitle.match(/^(.+?)(?:\s+-\s+(\d+))?$/);
            const baseName = match ? match[1].trim() : fullTitle;

            // Se já existe H1, H2 é uma área/categoria (Estrutura 1)
            // Se não existe H1, H2 é categoria (Estrutura 2)
            // Se H1 existe e foi definido como categoria, H2 é disciplina (Estrutura 3)
            
            if (h1Title && content[h1Title]) {
                // Estrutura 3: H1=categoria, H2=disciplina
                currentCategory = h1Title;
                currentCategoryFull = content[h1Title]._fullTitle;
                
                currentDisciplineFull = fullTitle;
                currentDiscipline = baseName;
                
                if (!content[currentCategory].disciplines[currentDiscipline]) {
                    content[currentCategory].disciplines[currentDiscipline] = {
                        _fullTitle: currentDisciplineFull,
                        topics: []
                    };
                }
            } else {
                // Estrutura 1 ou 2: H2 é categoria/área
                currentCategoryFull = fullTitle;
                currentCategory = baseName;

                if (!content[currentCategory]) {
                    content[currentCategory] = {
                        _fullTitle: currentCategoryFull,
                        disciplines: {}
                    };
                }
                currentDiscipline = null;
            }
            continue;
        }

        // H3 (### titulo) - Sempre é disciplina
        if (line.startsWith('### ')) {
            const fullTitle = line.replace(/^###\s+/, '').trim();
            const match = fullTitle.match(/^(.+?)(?:\s+-\s+(\d+))?$/);
            const baseName = match ? match[1].trim() : fullTitle;

            currentDisciplineFull = fullTitle;
            currentDiscipline = baseName;

            // Garantir que existe categoria
            if (!currentCategory) {
                currentCategory = 'Geral';
                currentCategoryFull = 'Geral';
                if (!content[currentCategory]) {
                    content[currentCategory] = {
                        _fullTitle: currentCategoryFull,
                        disciplines: {}
                    };
                }
            }

            if (!content[currentCategory].disciplines[currentDiscipline]) {
                content[currentCategory].disciplines[currentDiscipline] = {
                    _fullTitle: currentDisciplineFull,
                    topics: []
                };
            }
            continue;
        }

        // Conteúdo (itens de lista ou texto)
        if (currentCategory) {
            // Se não há disciplina definida, usar categoria como disciplina
            if (!currentDiscipline) {
                currentDiscipline = currentCategory;
                currentDisciplineFull = currentCategoryFull;

                if (!content[currentCategory].disciplines[currentDiscipline]) {
                    content[currentCategory].disciplines[currentDiscipline] = {
                        _fullTitle: currentDisciplineFull,
                        topics: []
                    };
                }
            }

            // Remover marcadores de lista (-, *, •, 1., 2., etc)
            let topicLine = line
                .replace(/^[\d]+\.\s+/, '')  // Números: 1. 2. 3.
                .replace(/^[\-\*\u2022]\s+/, '')  // Marcadores: - * •
                .trim();
            
            if (!topicLine) topicLine = line;

            // Adicionar apenas se não for vazio
            if (topicLine) {
                content[currentCategory].disciplines[currentDiscipline].topics.push(topicLine);
            }
        }
    }

    return content;
}
