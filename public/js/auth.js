// auth.js - Gerenciamento de Autenticação
import { 
    signInWithEmailAndPassword, 
    createUserWithEmailAndPassword, 
    signInWithPopup, 
    GoogleAuthProvider,
    onAuthStateChanged
} from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';

const auth = window.firebaseAuth;
const loading = document.getElementById('loading');
const errorMessage = document.getElementById('errorMessage');

// Elementos do formulário
const loginForm = document.getElementById('loginForm');
const signupForm = document.getElementById('signupForm');
const googleLoginBtn = document.getElementById('googleLoginBtn');
const toggleSignup = document.getElementById('toggleSignup');
const backToLogin = document.getElementById('backToLogin');
const toggleLogin = document.getElementById('toggleLogin');

// Verificar se já está autenticado
onAuthStateChanged(auth, (user) => {
    if (user) {
        // Redirecionar para a página de processos
        window.location.href = 'processos.html';
    }
});

// Toggle entre login e cadastro
toggleSignup.addEventListener('click', (e) => {
    e.preventDefault();
    loginForm.style.display = 'none';
    document.querySelector('.toggle-form').style.display = 'none';
    signupForm.style.display = 'block';
    toggleLogin.style.display = 'block';
    errorMessage.classList.remove('show');
});

backToLogin.addEventListener('click', (e) => {
    e.preventDefault();
    signupForm.style.display = 'none';
    toggleLogin.style.display = 'none';
    loginForm.style.display = 'block';
    document.querySelector('.toggle-form').style.display = 'block';
    errorMessage.classList.remove('show');
});

// Login com Email e Senha
loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    
    showLoading();
    hideError();
    
    try {
        await signInWithEmailAndPassword(auth, email, password);
        // Redirecionamento será feito pelo onAuthStateChanged
    } catch (error) {
        hideLoading();
        showError(getErrorMessage(error.code));
    }
});

// Cadastro com Email e Senha
signupForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const email = document.getElementById('signupEmail').value;
    const password = document.getElementById('signupPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    
    if (password !== confirmPassword) {
        showError('As senhas não coincidem');
        return;
    }
    
    if (password.length < 6) {
        showError('A senha deve ter pelo menos 6 caracteres');
        return;
    }
    
    showLoading();
    hideError();
    
    try {
        await createUserWithEmailAndPassword(auth, email, password);
        // Redirecionamento será feito pelo onAuthStateChanged
    } catch (error) {
        hideLoading();
        showError(getErrorMessage(error.code));
    }
});

// Login com Google
googleLoginBtn.addEventListener('click', async () => {
    const provider = new GoogleAuthProvider();
    
    showLoading();
    hideError();
    
    try {
        await signInWithPopup(auth, provider);
        // Redirecionamento será feito pelo onAuthStateChanged
    } catch (error) {
        hideLoading();
        if (error.code !== 'auth/popup-closed-by-user') {
            showError(getErrorMessage(error.code));
        }
    }
});

// Funções auxiliares
function showLoading() {
    loading.style.display = 'flex';
}

function hideLoading() {
    loading.style.display = 'none';
}

function showError(message) {
    errorMessage.textContent = message;
    errorMessage.classList.add('show');
}

function hideError() {
    errorMessage.classList.remove('show');
}

function getErrorMessage(errorCode) {
    const messages = {
        'auth/invalid-email': 'Email inválido',
        'auth/user-disabled': 'Usuário desabilitado',
        'auth/user-not-found': 'Usuário não encontrado',
        'auth/wrong-password': 'Senha incorreta',
        'auth/email-already-in-use': 'Este email já está em uso',
        'auth/weak-password': 'Senha muito fraca',
        'auth/operation-not-allowed': 'Operação não permitida',
        'auth/invalid-credential': 'Credenciais inválidas',
        'auth/too-many-requests': 'Muitas tentativas. Tente novamente mais tarde',
        'auth/network-request-failed': 'Erro de conexão. Verifique sua internet'
    };
    
    return messages[errorCode] || 'Erro ao autenticar. Tente novamente';
}
