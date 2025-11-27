// Timer management module
export let topicTimers = {};

export function formatTime(seconds) {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hrs > 0) {
        return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

export function startTimer(topicKey) {
    if (!topicTimers[topicKey]) {
        topicTimers[topicKey] = { active: null, sessions: [] };
    }
    
    const timer = topicTimers[topicKey];
    if (timer.active) return; // Já está ativo
    
    timer.active = {
        start: Date.now(),
        elapsed: 0
    };
    
    updateTimerDisplay(topicKey);
}

export function stopTimer(topicKey) {
    const timer = topicTimers[topicKey];
    if (!timer || !timer.active) return;
    
    const now = Date.now();
    const duration = Math.floor((now - timer.active.start) / 1000);
    
    timer.sessions.push({
        start: timer.active.start,
        end: now,
        duration: duration
    });
    
    timer.active = null;
    updateTimerDisplay(topicKey);
}

export function toggleTimer(topicKey) {
    const timer = topicTimers[topicKey];
    if (!timer || !timer.active) {
        startTimer(topicKey);
    } else {
        stopTimer(topicKey);
    }
}

export function updateTimerDisplay(topicKey) {
    const displayEl = document.getElementById(`timer-display-${topicKey}`);
    const btnEl = document.getElementById(`timer-btn-${topicKey}`);
    
    if (!displayEl || !btnEl) return;
    
    const timer = topicTimers[topicKey];
    if (!timer) {
        displayEl.textContent = '00:00';
        return;
    }
    
    let totalSeconds = 0;
    
    // Somar sessões completas
    if (timer.sessions) {
        totalSeconds = timer.sessions.reduce((sum, session) => sum + session.duration, 0);
    }
    
    // Adicionar tempo da sessão ativa
    if (timer.active) {
        const elapsed = Math.floor((Date.now() - timer.active.start) / 1000);
        totalSeconds += elapsed;
        
        displayEl.classList.add('active');
        btnEl.textContent = '⏸️';
        btnEl.classList.add('active');
        
        // Atualizar a cada segundo
        setTimeout(() => updateTimerDisplay(topicKey), 1000);
    } else {
        displayEl.classList.remove('active');
        btnEl.textContent = '▶️';
        btnEl.classList.remove('active');
    }
    
    displayEl.textContent = formatTime(totalSeconds);
}

export function showTimerHistory(topicKey, topicName) {
    const timer = topicTimers[topicKey];
    if (!timer || !timer.sessions || timer.sessions.length === 0) {
        alert('⏱️ Nenhum tempo registrado ainda para este tópico.');
        return;
    }
    
    const modal = document.getElementById('timerModal');
    const modalTitle = document.getElementById('modalTopicName');
    const sessionsContainer = document.getElementById('timerSessions');
    
    modalTitle.textContent = topicName;
    
    renderTimerSessions(timer.sessions, topicKey);
    
    modal.style.display = 'flex';
}

export function renderTimerSessions(sessions, topicKey) {
    const sessionsContainer = document.getElementById('timerSessions');
    sessionsContainer.innerHTML = '';
    
    if (!sessions || sessions.length === 0) {
        sessionsContainer.innerHTML = '<p style="text-align:center; color:#666;">Nenhuma sessão registrada</p>';
        return;
    }
    
    const sortedSessions = [...sessions].sort((a, b) => b.start - a.start);
    
    sortedSessions.forEach((session, index) => {
        const div = document.createElement('div');
        div.className = 'timer-session-item';
        
        const startDate = new Date(session.start);
        const endDate = new Date(session.end);
        
        const dateStr = startDate.toLocaleDateString('pt-BR');
        const startTime = startDate.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
        const endTime = endDate.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
        const duration = formatTime(session.duration);
        
        div.innerHTML = `
            <div class="session-info">
                <div class="session-date">📅 ${dateStr}</div>
                <div class="session-time">⏰ ${startTime} - ${endTime}</div>
                <div class="session-duration">⏱️ <strong>${duration}</strong></div>
            </div>
            <div class="session-actions">
                <button class="session-edit-btn" onclick="window.editTimerSession('${topicKey}', ${sessions.indexOf(session)})">✏️</button>
                <button class="session-delete-btn" onclick="window.deleteTimerSession('${topicKey}', ${sessions.indexOf(session)})">🗑️</button>
            </div>
        `;
        
        sessionsContainer.appendChild(div);
    });
    
    const totalSeconds = sessions.reduce((sum, s) => sum + s.duration, 0);
    const totalDiv = document.createElement('div');
    totalDiv.className = 'timer-total';
    totalDiv.innerHTML = `
        <strong>Total:</strong> ${formatTime(totalSeconds)}
        <span style="margin-left: 15px; opacity: 0.7;">(${sessions.length} sessão${sessions.length > 1 ? 'ões' : ''})</span>
    `;
    sessionsContainer.appendChild(totalDiv);
}

export function editTimerSession(topicKey, sessionIndex) {
    const timer = topicTimers[topicKey];
    if (!timer || !timer.sessions[sessionIndex]) return;
    
    const session = timer.sessions[sessionIndex];
    const currentDuration = formatTime(session.duration);
    
    const newDurationStr = prompt(
        `⏱️ Editar duração da sessão\n\nDuração atual: ${currentDuration}\n\nDigite a nova duração:\n- Formato MM:SS (ex: 25:30)\n- Ou apenas minutos (ex: 25)`,
        currentDuration
    );
    
    if (!newDurationStr) return;
    
    let newDurationSeconds;
    if (newDurationStr.includes(':')) {
        const [mins, secs] = newDurationStr.split(':').map(Number);
        newDurationSeconds = (mins * 60) + secs;
    } else {
        newDurationSeconds = parseInt(newDurationStr) * 60;
    }
    
    if (isNaN(newDurationSeconds) || newDurationSeconds < 0) {
        alert('❌ Duração inválida');
        return;
    }
    
    const ratio = newDurationSeconds / session.duration;
    const newEnd = session.start + (newDurationSeconds * 1000);
    
    session.duration = newDurationSeconds;
    session.end = newEnd;
    
    renderTimerSessions(timer.sessions, topicKey);
    updateTimerDisplay(topicKey);
    
    if (window.saveTimersToFirebase) {
        window.saveTimersToFirebase();
    }
}

export function deleteTimerSession(topicKey, sessionIndex) {
    const timer = topicTimers[topicKey];
    if (!timer || !timer.sessions[sessionIndex]) return;
    
    if (!confirm('🗑️ Deseja realmente excluir esta sessão?')) return;
    
    timer.sessions.splice(sessionIndex, 1);
    
    if (timer.sessions.length === 0 && !timer.active) {
        delete topicTimers[topicKey];
        const timerContainer = document.getElementById(`topic-timer-${topicKey}`);
        if (timerContainer) {
            timerContainer.style.display = 'none';
        }
        closeTimerModal();
    } else {
        renderTimerSessions(timer.sessions, topicKey);
        updateTimerDisplay(topicKey);
    }
    
    if (window.saveTimersToFirebase) {
        window.saveTimersToFirebase();
    }
}

export function closeTimerModal() {
    const modal = document.getElementById('timerModal');
    modal.style.display = 'none';
}

export function loadTimers(timersData) {
    topicTimers = timersData || {};
    
    // Atualizar displays de todos os timers
    Object.keys(topicTimers).forEach(topicKey => {
        updateTimerDisplay(topicKey);
    });
}
