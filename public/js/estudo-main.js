// Main application entry point - integrates all modules
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import { getAuth } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';
import { getFirestore, doc, getDoc, setDoc, serverTimestamp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';
import { updateSaveStatus, scheduleAutoSave, parseMarkdownToContent } from './estudo-utils.js';

// State management
let studyContent = {};
let progressData = {};
let currentProcessId = null;
let currentProcesso = null;
let topicNotebooks = {};
let topicTimers = {};

let db = null;
let auth = null;

// Auto-save
let isSaving = false;

// Expansion state
let expansionState = {
    categories: {},
    disciplines: {}
};

// ============= FIREBASE OPERATIONS =============

async function loadStudyContent() {
    try {
        const urlParams = new URLSearchParams(window.location.search);
        currentProcessId = urlParams.get('id');
        
        if (!currentProcessId) {
            alert('❌ ID do processo não encontrado na URL');
            window.location.href = 'processos.html';
            return {};
        }

        const docRef = doc(db, 'processos', currentProcessId);
        const docSnap = await getDoc(docRef);
        
        if (!docSnap.exists()) {
            alert('❌ Processo não encontrado');
            window.location.href = 'processos.html';
            return {};
        }
        
        const processo = docSnap.data();
        currentProcesso = { id: currentProcessId, ...processo };
        const pageTitleEl = document.getElementById('pageTitle');
        pageTitleEl.className = 'page-title-compact page-title-loaded';
        pageTitleEl.innerHTML = processo.name;
        
        studyContent = parseMarkdownToContent(processo.content);
        
        const skeletonLoader = document.getElementById('skeletonLoader');
        if (skeletonLoader) {
            skeletonLoader.remove();
        }
        return studyContent;
    } catch (error) {
        console.error('Erro ao carregar processo:', error);
        alert('❌ Erro ao carregar o processo do Firebase');
        return {};
    }
}

async function saveToFirebase() {
    if (isSaving || !currentProcessId) return;
    
    try {
        isSaving = true;
        updateSaveStatus('saving', 'Salvando...');
        
        if (!auth.currentUser) {
            throw new Error('Usuário não autenticado');
        }
        
        const progressRef = doc(db, 'progress', `${auth.currentUser.uid}_${currentProcessId}`);
        await setDoc(progressRef, {
            userId: auth.currentUser.uid,
            processoId: currentProcessId,
            data: progressData,
            topicNotebooks: topicNotebooks,
            topicTimers: topicTimers,
            updatedAt: new Date()
        });
        
        updateSaveStatus('saved', 'Salvo automaticamente');
    } catch (error) {
        console.error('Erro ao salvar no Firebase:', error);
        updateSaveStatus('error', 'Erro ao salvar');
    } finally {
        isSaving = false;
    }
}

async function loadFromFirebase() {
    try {
        if (!auth.currentUser || !currentProcessId) return;
        
        const progressRef = doc(db, 'progress', `${auth.currentUser.uid}_${currentProcessId}`);
        const docSnap = await getDoc(progressRef);
        
        if (docSnap.exists()) {
            const data = docSnap.data();
            progressData = data.data || {};
            topicNotebooks = data.topicNotebooks || {};
            topicTimers = data.topicTimers || {};
        } else {
            progressData = {};
            for (const [category, categoryData] of Object.entries(studyContent)) {
                for (const [discipline, disciplineData] of Object.entries(categoryData.disciplines)) {
                    disciplineData.topics.forEach(topic => {
                        const key = `${category}|${discipline}|${topic}`;
                        progressData[key] = 0;
                    });
                }
            }
        }
        
        updateSaveStatus('saved', 'Carregado do Firebase');
    } catch (error) {
        console.error('Erro ao carregar do Firebase:', error);
        progressData = {};
        for (const [category, categoryData] of Object.entries(studyContent)) {
            for (const [discipline, disciplineData] of Object.entries(categoryData.disciplines)) {
                disciplineData.topics.forEach(topic => {
                    const key = `${category}|${discipline}|${topic}`;
                    progressData[key] = 0;
                });
            }
        }
    }
}

// ============= EXPANSION STATE =============

function saveExpansionState() {
    try {
        localStorage.setItem('expansionState', JSON.stringify(expansionState));
    } catch (error) {
        console.error('Erro ao salvar estado de expansão:', error);
    }
}

function loadExpansionState() {
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

function applyExpansionState() {
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

function toggleCategory(categoryContainer) {
    const content = categoryContainer.querySelector('.category-content');
    const toggle = categoryContainer.querySelector('.category-toggle');
    const categoryTitle = categoryContainer.querySelector('.category-title').textContent;
    
    content.classList.toggle('collapsed');
    toggle.classList.toggle('collapsed');
    
    expansionState.categories[categoryTitle] = !content.classList.contains('collapsed');
    saveExpansionState();
}

function toggleDiscipline(disciplineDiv) {
    const content = disciplineDiv.querySelector('.discipline-content');
    const icon = disciplineDiv.querySelector('.discipline-toggle-icon');
    const disciplineTitle = disciplineDiv.querySelector('.discipline-title').textContent;
    
    const categoryContainer = disciplineDiv.closest('.category-container');
    const categoryTitle = categoryContainer.querySelector('.category-title').textContent;
    const disciplineKey = `${categoryTitle}|${disciplineTitle}`;
    
    content.classList.toggle('collapsed');
    icon.classList.toggle('collapsed');
    
    expansionState.disciplines[disciplineKey] = !content.classList.contains('collapsed');
    saveExpansionState();
}

// ============= TIMER FUNCTIONS =============

function formatTime(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
        return `${hours}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    }
    return `${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

function updateTimerDisplay(topicKey) {
    const displayId = `timer-display-${topicKey.replace(/[|]/g, '-')}`;
    const display = document.getElementById(displayId);
    if (!display) return;
    
    const timer = topicTimers[topicKey];
    if (!timer) {
        display.textContent = formatTime(0);
        return;
    }
    
    let totalSeconds = 0;
    
    if (timer.sessions) {
        totalSeconds = timer.sessions.reduce((sum, session) => sum + session.duration, 0);
    }
    
    if (timer.active) {
        const elapsed = Math.floor((Date.now() - timer.active.start) / 1000);
        totalSeconds += timer.active.elapsed + elapsed;
    }
    
    display.textContent = formatTime(totalSeconds);
    
    if (timer.active) {
        display.classList.add('active');
    } else {
        display.classList.remove('active');
    }
}

function toggleTimer(topicKey) {
    if (!topicTimers[topicKey]) {
        topicTimers[topicKey] = { active: null, sessions: [] };
    }
    
    const timer = topicTimers[topicKey];
    const btnId = `timer-btn-${topicKey.replace(/[|]/g, '-')}`;
    const btn = document.getElementById(btnId);
    
    if (timer.active) {
        stopTimer(topicKey);
        btn.innerHTML = '▶️';
        btn.title = 'Iniciar temporizador';
    } else {
        startTimer(topicKey);
        btn.innerHTML = '⏸️';
        btn.title = 'Pausar temporizador';
    }
}

function startTimer(topicKey) {
    const timer = topicTimers[topicKey];
    timer.active = {
        start: Date.now(),
        elapsed: timer.active ? timer.active.elapsed : 0
    };
    
    setTimeout(() => updateTimerDisplay(topicKey), 1000);
    updateTimerDisplay(topicKey);
}

function stopTimer(topicKey) {
    const timer = topicTimers[topicKey];
    if (!timer.active) return;
    
    const now = Date.now();
    const sessionDuration = Math.floor((now - timer.active.start) / 1000) + timer.active.elapsed;
    
    timer.sessions.push({
        start: timer.active.start - (timer.active.elapsed * 1000),
        end: now,
        duration: sessionDuration
    });
    
    timer.active = null;
    updateTimerDisplay(topicKey);
    saveToFirebase();
}

function showTimerHistory(topicKey, topicName) {
    const timer = topicTimers[topicKey];
    if (!timer || !timer.sessions || timer.sessions.length === 0) {
        alert(`📊 Nenhuma sessão registrada para: ${topicName}`);
        return;
    }
    
    const modal = document.createElement('div');
    modal.className = 'timer-modal';
    modal.innerHTML = `
        <div class="timer-modal-content">
            <div class="timer-modal-header">
                <h3>📊 Histórico de Tempo</h3>
                <span class="timer-modal-close" onclick="window.closeTimerModal()">&times;</span>
            </div>
            <div class="timer-modal-topic">
                <strong>${topicName}</strong>
            </div>
            <div class="timer-modal-total">
                ⏱️ Tempo Total: <strong id="modal-total-time">${formatTime(timer.sessions.reduce((sum, s) => sum + s.duration, 0))}</strong>
            </div>
            <div class="timer-modal-sessions" id="timer-sessions-list">
                ${renderTimerSessions(timer.sessions, topicKey)}
            </div>
            <div class="timer-modal-footer">
                <button class="btn-modal-close" onclick="window.closeTimerModal()">Fechar</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    modal.addEventListener('click', (e) => {
        if (e.target === modal) window.closeTimerModal();
    });
}

function renderTimerSessions(sessions, topicKey) {
    return sessions.map((session, index) => {
        const date = new Date(session.start);
        const dateStr = date.toLocaleDateString('pt-BR');
        const timeStr = date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
        
        return `
            <div class="timer-session-item" data-index="${index}">
                <div class="timer-session-info">
                    <div class="timer-session-date">${dateStr} às ${timeStr}</div>
                    <div class="timer-session-duration">${formatTime(session.duration)}</div>
                </div>
                <div class="timer-session-actions">
                    <button class="btn-timer-edit" onclick="window.editTimerSession('${topicKey}', ${index})" title="Editar tempo">
                        ✏️
                    </button>
                    <button class="btn-timer-delete" onclick="window.deleteTimerSession('${topicKey}', ${index})" title="Deletar registro">
                        🗑️
                    </button>
                </div>
            </div>
        `;
    }).join('');
}

function closeTimerModal() {
    const modal = document.querySelector('.timer-modal');
    if (modal) {
        modal.remove();
    }
}

async function deleteTimerSession(topicKey, sessionIndex) {
    if (!confirm('❌ Deletar este registro de tempo?')) return;
    
    const timer = topicTimers[topicKey];
    if (!timer || !timer.sessions[sessionIndex]) return;
    
    timer.sessions.splice(sessionIndex, 1);
    
    if (timer.sessions.length === 0) {
        delete topicTimers[topicKey];
        closeTimerModal();
    } else {
        const sessionsList = document.getElementById('timer-sessions-list');
        if (sessionsList) {
            sessionsList.innerHTML = renderTimerSessions(timer.sessions, topicKey);
        }
        
        const totalTime = timer.sessions.reduce((sum, s) => sum + s.duration, 0);
        const totalElement = document.getElementById('modal-total-time');
        if (totalElement) {
            totalElement.textContent = formatTime(totalTime);
        }
    }
    
    updateTimerDisplay(topicKey);
    await saveToFirebase();
}

async function editTimerSession(topicKey, sessionIndex) {
    const timer = topicTimers[topicKey];
    if (!timer || !timer.sessions[sessionIndex]) return;
    
    const session = timer.sessions[sessionIndex];
    const currentMinutes = Math.floor(session.duration / 60);
    const currentSeconds = session.duration % 60;
    
    const input = prompt(
        `✏️ Editar tempo da sessão\n\n` +
        `Tempo atual: ${formatTime(session.duration)}\n\n` +
        `Digite o novo tempo em minutos (ou formato MM:SS):`,
        `${currentMinutes}:${String(currentSeconds).padStart(2, '0')}`
    );
    
    if (input === null) return;
    
    let newDuration = 0;
    if (input.includes(':')) {
        const parts = input.split(':').map(p => parseInt(p) || 0);
        if (parts.length === 2) {
            newDuration = (parts[0] * 60) + parts[1];
        } else if (parts.length === 3) {
            newDuration = (parts[0] * 3600) + (parts[1] * 60) + parts[2];
        }
    } else {
        newDuration = (parseInt(input) || 0) * 60;
    }
    
    if (newDuration <= 0) {
        alert('❌ Tempo inválido. Use formato MM:SS ou apenas minutos.');
        return;
    }
    
    const oldDuration = session.duration;
    session.duration = newDuration;
    
    const ratio = newDuration / oldDuration;
    const originalDiff = session.end - session.start;
    const newDiff = Math.floor(originalDiff * ratio);
    session.end = session.start + newDiff;
    
    const sessionsList = document.getElementById('timer-sessions-list');
    if (sessionsList) {
        sessionsList.innerHTML = renderTimerSessions(timer.sessions, topicKey);
    }
    
    const totalTime = timer.sessions.reduce((sum, s) => sum + s.duration, 0);
    const totalElement = document.getElementById('modal-total-time');
    if (totalElement) {
        totalElement.textContent = formatTime(totalTime);
    }
    
    updateTimerDisplay(topicKey);
    await saveToFirebase();
}

// ============= NOTEBOOKS FUNCTIONS =============

async function addTopicNotebook(category, discipline, topic, topicKey) {
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
    
    await saveToFirebase();
    renderDisciplines();
    applyExpansionState();
}

async function editNotebook(topicKey, index) {
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
                await saveToFirebase();
                renderDisciplines();
                applyExpansionState();
            }
        }
    } else {
        if (confirm(`❌ Remover "${notebook.name}"?`)) {
            notebooks.splice(index, 1);
            if (notebooks.length === 0) {
                delete topicNotebooks[topicKey];
            }
            await saveToFirebase();
            renderDisciplines();
            applyExpansionState();
        }
    }
}

// ============= PROGRESS FUNCTIONS =============

function updateProgress() {
    let totalTopics = 0;
    let totalScore = 0;
    let completedTopics = 0;

    for (const [key, value] of Object.entries(progressData)) {
        totalTopics++;
        totalScore += value;
        if (value === 10) completedTopics++;
    }

    const totalPercent = totalTopics > 0 ? (totalScore / (totalTopics * 10) * 100).toFixed(1) : 0;
    const averageScore = totalTopics > 0 ? (totalScore / totalTopics).toFixed(1) : 0;

    document.getElementById('totalProgress').style.width = totalPercent + '%';
    document.getElementById('totalProgress').textContent = totalPercent + '%';
    document.getElementById('totalPercent').textContent = totalPercent + '%';
    document.getElementById('totalTopics').textContent = totalTopics;
    document.getElementById('completedTopics').textContent = completedTopics;
    document.getElementById('averageScore').textContent = averageScore;

    for (const [category, categoryData] of Object.entries(studyContent)) {
        for (const [discipline, disciplineData] of Object.entries(categoryData.disciplines)) {
            const topics = disciplineData.topics;
            let disciplineScore = 0;
            topics.forEach(topic => {
                disciplineScore += progressData[`${category}|${discipline}|${topic}`] || 0;
            });
            const disciplinePercent = (disciplineScore / (topics.length * 10) * 100).toFixed(1);
            
            const miniBar = document.getElementById(`mini-${category}-${discipline}`);
            const percentSpan = document.getElementById(`percent-${category}-${discipline}`);
            
            if (miniBar) miniBar.style.width = disciplinePercent + '%';
            if (percentSpan) percentSpan.textContent = disciplinePercent + '%';
        }
    }
}

// ============= RENDER FUNCTIONS =============

function renderDisciplines() {
    const container = document.getElementById('disciplinesContainer');
    container.innerHTML = '';
    
    const skeletonProgress = document.getElementById('skeletonProgressOverview');
    if (skeletonProgress) {
        skeletonProgress.style.display = 'none';
    }
    
    const progressOverview = document.getElementById('progressOverview');
    if (progressOverview) {
        progressOverview.style.display = 'block';
        progressOverview.style.opacity = '1';
    }

    for (const [category, categoryData] of Object.entries(studyContent)) {
        const categoryContainer = document.createElement('div');
        categoryContainer.className = 'category-container';
        
        const categoryHeader = document.createElement('div');
        categoryHeader.className = 'category-header';
        categoryHeader.onclick = () => toggleCategory(categoryContainer);
        
        const categoryToggle = document.createElement('span');
        categoryToggle.className = 'category-toggle collapsed';
        categoryToggle.textContent = '▼';
        
        const categoryTitle = document.createElement('div');
        categoryTitle.className = 'category-title';
        categoryTitle.textContent = categoryData._fullTitle || category;
        
        categoryHeader.appendChild(categoryToggle);
        categoryHeader.appendChild(categoryTitle);
        categoryContainer.appendChild(categoryHeader);
        
        const categoryContent = document.createElement('div');
        categoryContent.className = 'category-content collapsed';

        for (const [discipline, disciplineData] of Object.entries(categoryData.disciplines)) {
            const topics = disciplineData.topics;
            const disciplineDiv = document.createElement('div');
            disciplineDiv.className = 'discipline';

            const header = document.createElement('div');
            header.className = 'discipline-header';
            header.onclick = () => toggleDiscipline(disciplineDiv);

            const titleContainer = document.createElement('div');
            titleContainer.className = 'discipline-title-container';
            
            const toggleIcon = document.createElement('span');
            toggleIcon.className = 'discipline-toggle-icon collapsed';
            toggleIcon.textContent = '▼';
            
            const titleDiv = document.createElement('div');
            titleDiv.className = 'discipline-title';
            titleDiv.textContent = disciplineData._fullTitle || discipline;

            titleContainer.appendChild(toggleIcon);
            titleContainer.appendChild(titleDiv);

            const progressDiv = document.createElement('div');
            progressDiv.className = 'discipline-progress';
            
            const miniProgress = document.createElement('div');
            miniProgress.className = 'mini-progress';
            const miniBar = document.createElement('div');
            miniBar.className = 'mini-progress-bar';
            miniBar.id = `mini-${category}-${discipline}`;
            miniProgress.appendChild(miniBar);
            
            const percentSpan = document.createElement('span');
            percentSpan.id = `percent-${category}-${discipline}`;
            percentSpan.textContent = '0%';
            percentSpan.style.fontWeight = 'bold';

            progressDiv.appendChild(miniProgress);
            progressDiv.appendChild(percentSpan);

            header.appendChild(titleContainer);
            header.appendChild(progressDiv);

            const content = document.createElement('div');
            content.className = 'discipline-content collapsed';

            topics.forEach(topic => {
                const topicDiv = document.createElement('div');
                topicDiv.className = 'topic';

                const nameDiv = document.createElement('div');
                nameDiv.className = 'topic-name';
                nameDiv.textContent = topic;

                const controlDiv = document.createElement('div');
                controlDiv.className = 'topic-control';

                const sliderContainer = document.createElement('div');
                sliderContainer.className = 'slider-container';

                const slider = document.createElement('input');
                slider.type = 'range';
                slider.min = '0';
                slider.max = '10';
                slider.value = progressData[`${category}|${discipline}|${topic}`] || 0;
                
                const valueDisplay = document.createElement('span');
                valueDisplay.className = 'value-display';
                valueDisplay.textContent = slider.value;

                slider.oninput = function() {
                valueDisplay.textContent = this.value;
                progressData[`${category}|${discipline}|${topic}`] = parseInt(this.value);
                updateProgress();
                scheduleAutoSave(1500, saveToFirebase);
            };                sliderContainer.appendChild(slider);
                sliderContainer.appendChild(valueDisplay);
                
                // Timer UI
                const topicKey = `${category}|${discipline}|${topic}`;
                const timerContainer = document.createElement('div');
                timerContainer.className = 'topic-timer-container';
                
                const timerDisplay = document.createElement('div');
                timerDisplay.className = 'topic-timer-display';
                timerDisplay.id = `timer-display-${topicKey.replace(/[|]/g, '-')}`;
                
                const timer = topicTimers[topicKey];
                let initialTime = 0;
                if (timer && timer.sessions) {
                    initialTime = timer.sessions.reduce((sum, s) => sum + s.duration, 0);
                }
                timerDisplay.textContent = formatTime(initialTime);
                
                const timerButton = document.createElement('button');
                timerButton.className = 'topic-timer-btn';
                timerButton.id = `timer-btn-${topicKey.replace(/[|]/g, '-')}`;
                timerButton.innerHTML = '▶️';
                timerButton.title = 'Iniciar temporizador';
                timerButton.onclick = (e) => {
                    e.stopPropagation();
                    toggleTimer(topicKey);
                };
                
                const timerHistoryBtn = document.createElement('button');
                timerHistoryBtn.className = 'topic-timer-history-btn';
                timerHistoryBtn.innerHTML = '📊';
                timerHistoryBtn.title = 'Ver histórico de tempo';
                timerHistoryBtn.onclick = (e) => {
                    e.stopPropagation();
                    showTimerHistory(topicKey, topic);
                };
                
                timerContainer.appendChild(timerDisplay);
                timerContainer.appendChild(timerButton);
                timerContainer.appendChild(timerHistoryBtn);
                
                // Notebooks UI
                const notebooks = topicNotebooks[topicKey] || [];
                const notebookBtnsContainer = document.createElement('div');
                notebookBtnsContainer.className = 'topic-notebook-buttons';
                
                notebooks.forEach((notebook, index) => {
                    const notebookWrapper = document.createElement('div');
                    notebookWrapper.className = 'notebook-btn-wrapper';
                    
                    const viewNotebookBtn = document.createElement('button');
                    viewNotebookBtn.className = 'topic-notebook-btn topic-notebook-btn-view';
                    viewNotebookBtn.innerHTML = `<span>📖</span><span>${notebook.name}</span>`;
                    viewNotebookBtn.title = `Abrir: ${notebook.name}`;
                    viewNotebookBtn.onclick = (e) => {
                        e.stopPropagation();
                        window.open(notebook.url, '_blank', 'noopener,noreferrer');
                    };
                    viewNotebookBtn.oncontextmenu = (e) => {
                        e.preventDefault();
                        editNotebook(topicKey, index);
                    };
                    
                    const optionsBtn = document.createElement('button');
                    optionsBtn.className = 'topic-notebook-btn-options';
                    optionsBtn.innerHTML = '⋮';
                    optionsBtn.title = 'Editar ou remover';
                    optionsBtn.onclick = (e) => {
                        e.stopPropagation();
                        editNotebook(topicKey, index);
                    };
                    
                    notebookWrapper.appendChild(viewNotebookBtn);
                    notebookWrapper.appendChild(optionsBtn);
                    notebookBtnsContainer.appendChild(notebookWrapper);
                });
                
                const addNotebookBtn = document.createElement('button');
                addNotebookBtn.className = 'topic-notebook-btn topic-notebook-btn-add';
                addNotebookBtn.innerHTML = '<span>➕</span>';
                addNotebookBtn.title = 'Adicionar novo notebook/material';
                addNotebookBtn.onclick = (e) => {
                    e.stopPropagation();
                    addTopicNotebook(category, discipline, topic, topicKey);
                };
                
                notebookBtnsContainer.appendChild(addNotebookBtn);
                
                controlDiv.appendChild(sliderContainer);
                controlDiv.appendChild(timerContainer);
                controlDiv.appendChild(notebookBtnsContainer);
                
                topicDiv.appendChild(nameDiv);
                topicDiv.appendChild(controlDiv);
                content.appendChild(topicDiv);
            });

            disciplineDiv.appendChild(header);
            disciplineDiv.appendChild(content);
            categoryContent.appendChild(disciplineDiv);
        }

        categoryContainer.appendChild(categoryContent);
        container.appendChild(categoryContainer);
    }

    updateProgress();
}

// ============= UTILITY ACTIONS =============

function toggleActionsMenu() {
    const dropdown = document.getElementById('actionsDropdown');
    dropdown.classList.toggle('show');
}

async function resetProgress() {
    const dropdown = document.getElementById('actionsDropdown');
    dropdown.classList.remove('show');
    
    if (confirm('⚠️ Tem certeza que deseja resetar todo o progresso? Esta ação não pode ser desfeita.')) {
        progressData = {};
        for (const [category, categoryData] of Object.entries(studyContent)) {
            for (const [discipline, disciplineData] of Object.entries(categoryData.disciplines)) {
                disciplineData.topics.forEach(topic => {
                    progressData[`${category}|${discipline}|${topic}`] = 0;
                });
            }
        }
        await saveToFirebase();
        renderDisciplines();
        updateSaveStatus('saved', 'Progresso resetado');
    }
}

function exportProgress() {
    const dropdown = document.getElementById('actionsDropdown');
    dropdown.classList.remove('show');
    
    const dataStr = JSON.stringify(progressData, null, 2);
    const dataBlob = new Blob([dataStr], {type: 'application/json'});
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `progresso-estudos-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
}

function importProgress(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = async function(e) {
            try {
                const imported = JSON.parse(e.target.result);
                progressData = imported;
                await saveToFirebase();
                renderDisciplines();
                updateSaveStatus('saved', 'Progresso importado');
            } catch (error) {
                alert('❌ Erro ao importar arquivo. Verifique se é um arquivo JSON válido.');
            }
        };
        reader.readAsText(file);
    }
    event.target.value = '';
}

// ============= INITIALIZATION =============

async function initPage() {
    try {
        const { firebaseConfig } = await import('./firebase-config.js');
        
        const app = initializeApp(firebaseConfig);
        window.firebaseAuth = getAuth(app);
        window.firebaseDb = getFirestore(app);
        auth = window.firebaseAuth;
        db = window.firebaseDb;
        
        auth.onAuthStateChanged(async (user) => {
            if (!user) {
                window.location.href = 'login.html';
                return;
            }
            
            await loadStudyContent();
            
            if (Object.keys(studyContent).length > 0) {
                loadExpansionState();
                await loadFromFirebase();
                renderDisciplines();
                applyExpansionState();
            } else {
                alert('⚠️ Não foi possível carregar o conteúdo de estudos');
            }
        });
    } catch (error) {
        console.error('Erro ao inicializar:', error);
        alert('❌ Erro ao carregar a aplicação');
    }
}

// ============= EVENT LISTENERS =============

window.addEventListener('load', initPage);

window.addEventListener('click', function(e) {
    if (!e.target.matches('.btn-actions') && !e.target.closest('.btn-actions')) {
        const dropdown = document.getElementById('actionsDropdown');
        if (dropdown && dropdown.classList.contains('show')) {
            dropdown.classList.remove('show');
        }
    }
});

window.addEventListener('beforeunload', () => {
    Object.keys(topicTimers).forEach(topicKey => {
        if (topicTimers[topicKey].active) {
            stopTimer(topicKey);
        }
    });
    
    if (window.autoSaveTimer) {
        clearTimeout(window.autoSaveTimer);
        if (!isSaving && currentProcessId) {
            navigator.sendBeacon && saveToFirebase();
        }
    }
});

// Expose functions to window for onclick handlers
window.toggleActionsMenu = toggleActionsMenu;
window.resetProgress = resetProgress;
window.exportProgress = exportProgress;
window.importProgress = importProgress;
window.closeTimerModal = closeTimerModal;
window.editTimerSession = editTimerSession;
window.deleteTimerSession = deleteTimerSession;
