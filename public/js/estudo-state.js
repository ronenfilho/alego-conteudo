// UI State Management
export let studyContent = {};
export let progressData = {};
export let currentProcessId = null;
export let currentProcesso = null;
export let topicNotebooks = {};

export let expansionState = {
    categories: {},
    disciplines: {}
};

export function setStudyContent(content) {
    studyContent = content;
}

export function setProgressData(data) {
    progressData = data;
}

export function setCurrentProcess(id, processo) {
    currentProcessId = id;
    currentProcesso = processo;
}

export function setTopicNotebooks(notebooks) {
    topicNotebooks = notebooks;
}

export function updateProgress(key, value) {
    progressData[key] = value;
}

export function getProgress(key) {
    return progressData[key] || 0;
}

// Expansion state management
export function saveExpansionState() {
    try {
        localStorage.setItem('expansionState', JSON.stringify(expansionState));
    } catch (error) {
        console.error('Erro ao salvar estado de expansão:', error);
    }
}

export function loadExpansionState() {
    try {
        const saved = localStorage.getItem('expansionState');
        if (saved) {
            expansionState = JSON.parse(saved);
        }
    } catch (error) {
        console.error('Erro ao carregar estado de expansão:', error);
        expansionState = { categories: {}, disciplines: {} };
    }
}

export function applyExpansionState() {
    // Aplicar estado das categorias
    for (const [categoryTitle, isExpanded] of Object.entries(expansionState.categories)) {
        const categoryHeaders = document.querySelectorAll('.category-header');
        categoryHeaders.forEach(header => {
            const title = header.querySelector('.category-title').textContent;
            if (title === categoryTitle) {
                const container = header.parentElement;
                const content = container.querySelector('.category-content');
                const toggle = container.querySelector('.category-toggle');
                
                if (isExpanded) {
                    content.classList.remove('collapsed');
                    toggle.classList.remove('collapsed');
                } else {
                    content.classList.add('collapsed');
                    toggle.classList.add('collapsed');
                }
            }
        });
    }
    
    // Aplicar estado das disciplinas
    for (const [disciplineKey, isExpanded] of Object.entries(expansionState.disciplines)) {
        const disciplineHeaders = document.querySelectorAll('.discipline-header');
        disciplineHeaders.forEach(header => {
            const title = header.querySelector('.discipline-title').textContent;
            const categoryContainer = header.closest('.category-container');
            const categoryTitle = categoryContainer?.querySelector('.category-title')?.textContent;
            const key = `${categoryTitle}|${title}`;
            
            if (key === disciplineKey) {
                const discipline = header.parentElement;
                const content = discipline.querySelector('.discipline-content');
                const toggle = discipline.querySelector('.discipline-toggle-icon');
                
                if (isExpanded) {
                    content.classList.remove('collapsed');
                    toggle.classList.remove('collapsed');
                } else {
                    content.classList.add('collapsed');
                    toggle.classList.add('collapsed');
                }
            }
        });
    }
}

// Parse Markdown to structured content
export function parseMarkdownToContent(markdown) {
    const content = {};
    const lines = markdown.split('\n');
    let currentCategory = null;
    let currentCategoryFull = null;
    let currentDiscipline = null;
    let currentDisciplineFull = null;

    for (let line of lines) {
        line = line.trim();
        if (!line) continue;

        if (line.startsWith('#') && !line.startsWith('## ') && !line.startsWith('### ')) {
            continue;
        }

        // Detectar categoria (## TÍTULO)
        if (line.startsWith('## ') && !line.startsWith('### ')) {
            const fullTitle = line.replace(/^##\s+/, '').trim();
            const match = fullTitle.match(/^(.+?)(?:\s+-\s+(\d+))?$/);
            const baseName = match ? match[1].trim() : fullTitle;

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

        // Detectar disciplina (### TÍTULO)
        if (line.startsWith('### ') && currentCategory) {
            const fullTitle = line.replace(/^###\s+/, '').trim();
            const match = fullTitle.match(/^(.+?)(?:\s+-\s+(\d+))?$/);
            const baseName = match ? match[1].trim() : fullTitle;

            currentDisciplineFull = fullTitle;
            currentDiscipline = baseName;

            if (!content[currentCategory].disciplines[currentDiscipline]) {
                content[currentCategory].disciplines[currentDiscipline] = {
                    _fullTitle: currentDisciplineFull,
                    topics: []
                };
            }
            continue;
        }

        // Tópicos
        if (currentCategory) {
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

            let topicLine = line.replace(/^[\-\*\u2022]\s+/, '').trim();
            if (!topicLine) topicLine = line;

            content[currentCategory].disciplines[currentDiscipline].topics.push(topicLine);
        }
    }

    return content;
}

// Save status indicator
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

// Calculate statistics
export function calculateStatistics() {
    let total = 0;
    let completed = 0;
    let sum = 0;

    for (const [category, categoryData] of Object.entries(studyContent)) {
        for (const [discipline, disciplineData] of Object.entries(categoryData.disciplines)) {
            disciplineData.topics.forEach(topic => {
                const key = `${category}|${discipline}|${topic}`;
                const value = progressData[key] || 0;
                total++;
                sum += value;
                if (value === 10) completed++;
            });
        }
    }

    const percent = total > 0 ? Math.round((sum / (total * 10)) * 100) : 0;
    const average = total > 0 ? (sum / total).toFixed(1) : '0.0';

    return { total, completed, percent, average };
}
