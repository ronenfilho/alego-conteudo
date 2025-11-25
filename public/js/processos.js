// processos.js - Gerenciamento de Processos Seletivos
import { 
    collection, 
    addDoc, 
    getDocs, 
    getDoc,
    doc, 
    updateDoc, 
    deleteDoc,
    query,
    where,
    orderBy,
    Timestamp
} from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';
import { onAuthStateChanged, signOut } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';

const auth = window.firebaseAuth;
const db = window.firebaseDb;

let currentUser = null;
let editingProcessId = null;

// Elementos do DOM
const userName = document.getElementById('userName');
const logoutBtn = document.getElementById('logoutBtn');
const processosGrid = document.getElementById('processosGrid');
const emptyState = document.getElementById('emptyState');
const newProcessBtn = document.getElementById('newProcessBtn');
const processModal = document.getElementById('processModal');
const closeModal = document.getElementById('closeModal');
const cancelBtn = document.getElementById('cancelBtn');
const processForm = document.getElementById('processForm');
const modalTitle = document.getElementById('modalTitle');

// Verificar autenticação
onAuthStateChanged(auth, (user) => {
    if (!user) {
        window.location.href = 'login.html';
        return;
    }
    
    currentUser = user;
    userName.textContent = user.email;
    loadProcessos();
});

// Logout
logoutBtn.addEventListener('click', async () => {
    try {
        await signOut(auth);
        window.location.href = 'login.html';
    } catch (error) {
        console.error('Erro ao fazer logout:', error);
        alert('Erro ao sair. Tente novamente');
    }
});

// Abrir modal para novo processo
newProcessBtn.addEventListener('click', () => {
    editingProcessId = null;
    modalTitle.textContent = 'Novo Processo Seletivo';
    processForm.reset();
    openModal();
});

// Fechar modal
closeModal.addEventListener('click', closeModalHandler);
cancelBtn.addEventListener('click', closeModalHandler);

function closeModalHandler() {
    processModal.classList.remove('show');
}

function openModal() {
    processModal.classList.add('show');
}

// Fechar modal ao clicar fora
processModal.addEventListener('click', (e) => {
    if (e.target === processModal) {
        closeModalHandler();
    }
});

// Salvar processo
processForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const name = document.getElementById('processName').value.trim();
    const description = document.getElementById('processDescription').value.trim();
    const content = document.getElementById('processContent').value.trim();
    
    if (!name || !content) {
        alert('Nome e Conteúdo são obrigatórios');
        return;
    }
    
    try {
        const processData = {
            name,
            description,
            content,
            userId: currentUser.uid,
            updatedAt: Timestamp.now()
        };
        
        if (editingProcessId) {
            // Atualizar processo existente
            const docRef = doc(db, 'processos', editingProcessId);
            await updateDoc(docRef, processData);
            alert('✅ Processo atualizado com sucesso!');
        } else {
            // Criar novo processo
            processData.createdAt = Timestamp.now();
            await addDoc(collection(db, 'processos'), processData);
            alert('✅ Processo criado com sucesso!');
        }
        
        closeModalHandler();
        loadProcessos();
    } catch (error) {
        console.error('Erro ao salvar processo:', error);
        alert('❌ Erro ao salvar processo. Tente novamente');
    }
});

// Carregar processos
async function loadProcessos() {
    try {
        processosGrid.innerHTML = `
            <div class="loading-state">
                <div class="spinner"></div>
                <p>Carregando processos...</p>
            </div>
        `;
        
        const q = query(
            collection(db, 'processos'),
            where('userId', '==', currentUser.uid),
            orderBy('updatedAt', 'desc')
        );
        
        const querySnapshot = await getDocs(q);
        
        if (querySnapshot.empty) {
            processosGrid.innerHTML = '';
            emptyState.style.display = 'block';
            return;
        }
        
        emptyState.style.display = 'none';
        processosGrid.innerHTML = '';
        
        querySnapshot.forEach((doc) => {
            const processo = doc.data();
            const card = createProcessoCard(doc.id, processo);
            processosGrid.appendChild(card);
        });
    } catch (error) {
        console.error('Erro ao carregar processos:', error);
        processosGrid.innerHTML = `
            <div class="loading-state">
                <p style="color: #e74c3c;">❌ Erro ao carregar processos</p>
            </div>
        `;
    }
}

// Criar card de processo
function createProcessoCard(id, processo) {
    const card = document.createElement('div');
    card.className = 'processo-card';
    
    const description = processo.description || 'Sem descrição';
    const truncatedDesc = description.length > 150 
        ? description.substring(0, 150) + '...' 
        : description;
    
    const updatedAt = processo.updatedAt?.toDate 
        ? processo.updatedAt.toDate().toLocaleDateString('pt-BR')
        : 'Data desconhecida';
    
    card.innerHTML = `
        <h3>${processo.name}</h3>
        <p>${truncatedDesc}</p>
        <div class="processo-meta">
            <span>Atualizado em ${updatedAt}</span>
            <div class="processo-actions">
                <button class="btn-icon btn-edit" onclick="editProcesso('${id}')" title="Editar">
                    ✏️
                </button>
                <button class="btn-icon btn-delete" onclick="deleteProcesso('${id}')" title="Excluir">
                    🗑️
                </button>
            </div>
        </div>
    `;
    
    // Clicar no card abre a página de estudo
    card.addEventListener('click', (e) => {
        // Não abrir se clicou em um botão
        if (e.target.closest('.btn-icon')) return;
        
        window.location.href = `estudo.html?id=${id}`;
    });
    
    return card;
}

// Editar processo
window.editProcesso = async function(id) {
    try {
        editingProcessId = id;
        
        const docRef = doc(db, 'processos', id);
        const docSnap = await getDoc(docRef);
        
        if (!docSnap.exists()) {
            alert('❌ Processo não encontrado');
            return;
        }
        
        const processo = docSnap.data();
        
        document.getElementById('processName').value = processo.name;
        document.getElementById('processDescription').value = processo.description || '';
        document.getElementById('processContent').value = processo.content;
        
        modalTitle.textContent = 'Editar Processo Seletivo';
        openModal();
    } catch (error) {
        console.error('Erro ao carregar processo:', error);
        alert('❌ Erro ao carregar processo');
    }
};

// Excluir processo
window.deleteProcesso = async function(id) {
    if (!confirm('⚠️ Tem certeza que deseja excluir este processo? Esta ação não pode ser desfeita.')) {
        return;
    }
    
    try {
        await deleteDoc(doc(db, 'processos', id));
        alert('✅ Processo excluído com sucesso!');
        loadProcessos();
    } catch (error) {
        console.error('Erro ao excluir processo:', error);
        alert('❌ Erro ao excluir processo');
    }
};
