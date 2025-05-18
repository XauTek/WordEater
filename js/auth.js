// Функция для сохранения данных пользователя
function saveUserData(userData) {
    localStorage.setItem('user', JSON.stringify(userData));
}

// Функция для получения данных пользователя
function getUserData() {
    const userData = localStorage.getItem('user');
    return userData ? JSON.parse(userData) : null;
}

// Функция для проверки авторизации
function isAuthenticated() {
    return !!getUserData();
}

// Функция для выхода
function logout() {
    localStorage.removeItem('user');
    window.location.href = 'login.html';
}

// Обработка формы регистрации
const registerForm = document.querySelector('.js-register-form');
if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const formData = new FormData(registerForm);
        const userData = {
            name: formData.get('name'),
            email: formData.get('email'),
            password: formData.get('password'),
            passwordConfirm: formData.get('password_confirm')
        };

        // Проверка паролей
        if (userData.password !== userData.passwordConfirm) {
            showError('Пароли не совпадают');
            return;
        }

        try {
            // Здесь будет запрос к серверу для регистрации
            // Пока сохраняем в localStorage
            saveUserData({
                name: userData.name,
                email: userData.email
            });
            
            window.location.href = 'index.html';
        } catch (error) {
            showError('Ошибка при регистрации');
        }
    });
}

// Обработка формы входа
const loginForm = document.querySelector('.js-login-form');
if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const formData = new FormData(loginForm);
        const userData = {
            email: formData.get('email'),
            password: formData.get('password')
        };

        try {
            // Здесь будет запрос к серверу для авторизации
            // Пока проверяем в localStorage
            const savedUser = getUserData();
            if (savedUser && savedUser.email === userData.email) {
                window.location.href = 'index.html';
            } else {
                showError('Неверный email или пароль');
            }
        } catch (error) {
            showError('Ошибка при входе');
        }
    });
}

// Функция для отображения ошибок
function showError(message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.textContent = message;

    const form = document.querySelector('.auth-form');
    const existingError = form.querySelector('.error-message');
    if (existingError) {
        existingError.remove();
    }
    form.insertBefore(errorDiv, form.firstChild);

    setTimeout(() => {
        errorDiv.remove();
    }, 3000);
}

// Добавляем кнопку входа/выхода в шапку сайта
function updateAuthButton() {
    const authContainer = document.querySelector('.auth-container-header');
    if (!authContainer) return;

    const existingAuthItem = authContainer.querySelector('.auth-item');
    if (existingAuthItem) {
        existingAuthItem.remove();
    }

    const authItem = document.createElement('div');
    authItem.className = 'auth-item';

    if (isAuthenticated()) {
        const user = getUserData();
        authItem.innerHTML = `
            <div class="user-menu">
                <span class="user-name">${user.name}</span>
                <button class="logout-button">Выйти</button>
            </div>
        `;
        authItem.querySelector('.logout-button').addEventListener('click', logout);
    } else {
        authItem.innerHTML = '<a href="login.html">Войти</a>';
    }

    authContainer.appendChild(authItem);
}

// Обновляем кнопку при загрузке страницы и при изменении localStorage
document.addEventListener('DOMContentLoaded', updateAuthButton);
window.addEventListener('storage', updateAuthButton); 