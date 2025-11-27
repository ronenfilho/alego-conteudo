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

    for (let line of lines) {
        line = line.trim();
        if (!line) continue;

        if (line.startsWith('#') && !line.startsWith('## ') && !line.startsWith('### ')) {
            continue;
        }

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
