// Переменная для модального окна
let authModal = null;

// Функция для переключения состояния текста
function toggleText(postId) {
    const textElement = document.getElementById(`post-text-${postId}`);
    const fadeElement = document.getElementById(`text-fade-${postId}`);
    const buttonElement = document.getElementById(`toggle-btn-${postId}`);
    
    if (textElement && fadeElement && buttonElement) {
        const buttonText = buttonElement.querySelector('span');
        const buttonIcon = buttonElement.querySelector('i');
        
        if (textElement.classList.contains('collapsed')) {
            // Разворачиваем текст
            textElement.classList.remove('collapsed');
            textElement.classList.add('expanded');
            fadeElement.classList.add('hidden');
            buttonText.textContent = 'Свернуть';
            buttonElement.classList.add('expanded');
        } else {
            // Сворачиваем текст
            textElement.classList.remove('expanded');
            textElement.classList.add('collapsed');
            fadeElement.classList.remove('hidden');
            buttonText.textContent = 'Читать дальше';
            buttonElement.classList.remove('expanded');
        }
    }
}

// Функция для открытия модального окна авторизации
function openAuthModal() {
    if (!authModal) {
        authModal = new bootstrap.Modal(document.getElementById('authModal'));
    }
    authModal.show();
}

// Функция для закрытия модального окна авторизации
function closeAuthModal() {
    if (authModal) {
        authModal.hide();
    }
}

// Функция для проверки авторизации пользователя
function checkUserAuthentication() {
    // Используем глобальную переменную, переданную из Django
    return window.userIsAuthenticated || false;
}

// Функция для обработки клика на лайк
function handleLikeClick(postId) {
    const isAuthenticated = checkUserAuthentication();
    
    if (!isAuthenticated) {
        openAuthModal();
        return;
    }
    
    processLike(postId);
}

// Функция для обработки лайка
async function processLike(postId) {
    try {
        const response = await fetch(`/post/${postId}/like/`, {
            method: 'POST',
            headers: {
                'X-CSRFToken': getCSRFToken(),
                'Content-Type': 'application/json',
            },
        });

        const data = await response.json();

        if (data.success) {
            updateLikeUI(postId, data.likes_count, data.user_liked);
        } else {
            console.error('Ошибка при установке лайка:', data.error);
            showError('Не удалось поставить лайк');
        }
    } catch (error) {
        console.error('Ошибка:', error);
        showError('Произошла ошибка при отправке запроса');
    }
}


// Функция для обновления UI лайка
function updateLikeUI(postId, likesCount, userLiked) {
    const likeElement = document.querySelector(`[onclick="handleLikeClick(${postId})"]`);
    const heartIcon = likeElement.querySelector('i');
    let likesCountElement = likeElement.querySelector('.likes-count');

    // Обновляем состояние лайка
    if (userLiked) {
        likeElement.classList.add('liked');
        heartIcon.classList.remove('bi-heart');
        heartIcon.classList.add('bi-heart-fill');
    } else {
        likeElement.classList.remove('liked');
        heartIcon.classList.remove('bi-heart-fill');
        heartIcon.classList.add('bi-heart');
    }

    // Обновляем счетчик лайков
    if (likesCount > 0) {
        if (likesCountElement) {
            likesCountElement.textContent = likesCount;
        } else {
            likesCountElement = document.createElement('span');
            likesCountElement.className = 'likes-count';
            likesCountElement.textContent = likesCount;
            heartIcon.parentNode.insertBefore(likesCountElement, heartIcon.nextSibling);
        }
    } else if (likesCountElement) {
        likesCountElement.remove();
    }

    // Добавляем анимацию
    heartIcon.style.transform = 'scale(1.3)';
    setTimeout(() => {
        heartIcon.style.transform = 'scale(1)';
    }, 200);
}

// Функция для показа ошибок
function showError(message) {
    // Можно реализовать красивый показ ошибок
    console.error(message);
    alert(message); // Временное решение
}


// Функция для получения CSRF токена
function getCSRFToken() {
    const name = 'csrftoken';
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}

// Функции для кнопок в модальном окне
function handleLogin() {
    window.location.href = "{% url 'login_url' %}";
}

function handleRegister() {
    window.location.href = "{% url 'login_url' %}";
}

// Функция для загрузки дополнительных постов
function loadMorePosts() {
    const loadMoreBtn = document.getElementById('loadMoreBtn');
    const hiddenPosts = document.querySelectorAll('.post-hidden');
    
    if (loadMoreBtn && hiddenPosts.length > 0) {
        // Добавляем класс loading
        loadMoreBtn.classList.add('loading');
        
        // Имитируем загрузку
        setTimeout(() => {
            // Показываем следующие 4 поста
            const postsToShow = Array.from(hiddenPosts).slice(0, 4);
            
            postsToShow.forEach(post => {
                post.classList.remove('post-hidden');
                // Инициализируем функционал для новых постов
                initializePost(post);
            });
            
            // Обновляем текст кнопки или скрываем её
            const remainingPosts = document.querySelectorAll('.post-hidden').length;
            
            if (remainingPosts === 0) {
                loadMoreBtn.style.display = 'none';
            } else {
                const btnText = loadMoreBtn.querySelector('span');
                btnText.textContent = `Показать еще (${remainingPosts})`;
                loadMoreBtn.classList.remove('loading');
            }
        }, 800);
    }
}

// Функция для инициализации поста
function initializePost(post) {
    const postId = post.getAttribute('data-post-id');
    const textElement = document.getElementById(`post-text-${postId}`);
    const toggleBtn = document.getElementById(`toggle-btn-${postId}`);
    const fadeElement = document.getElementById(`text-fade-${postId}`);
    
    if (textElement && toggleBtn && fadeElement) {
        // Проверяем, превышает ли текст максимальную высоту
        const lineHeight = parseInt(getComputedStyle(textElement).lineHeight);
        const maxLines = 4;
        const maxHeight = lineHeight * maxLines;
        
        if (textElement.scrollHeight <= maxHeight) {
            // Текст короткий, скрываем кнопку и градиент
            toggleBtn.style.display = 'none';
            fadeElement.style.display = 'none';
            textElement.classList.remove('collapsed');
        }
    }
}

// Функция для принудительного скролла наверх
function scrollToTop() {
    window.scrollTo(0, 0);
}

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', function() {
    // Принудительно скроллим наверх при каждой загрузке
    scrollToTop();
    
    // Находим все посты по data-атрибуту или классу
    const posts = document.querySelectorAll('.post[data-post-id]');
    
    posts.forEach(function(post) {
        initializePost(post);
    });
    
    // Добавляем обработчик для кнопки загрузки
    const loadMoreBtn = document.getElementById('loadMoreBtn');
    if (loadMoreBtn) {
        loadMoreBtn.addEventListener('click', loadMorePosts);
        
        // Обновляем текст кнопки
        const hiddenPostsCount = document.querySelectorAll('.post-hidden').length;
        const btnText = loadMoreBtn.querySelector('span');
        btnText.textContent = `Показать еще (${hiddenPostsCount})`;
    }
});

// Дополнительно: скролл наверх при загрузке страницы
window.addEventListener('load', scrollToTop);

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', function() {
    // Принудительно скроллим наверх при каждой загрузке
    scrollToTop();
    
    // Находим все посты по data-атрибуту или классу
    const posts = document.querySelectorAll('.post[data-post-id]');
    
    posts.forEach(function(post) {
        initializePost(post);
    });
    
    // Добавляем обработчик для кнопки загрузки
    const loadMoreBtn = document.getElementById('loadMoreBtn');
    if (loadMoreBtn) {
        loadMoreBtn.addEventListener('click', loadMorePosts);
        
        // Обновляем текст кнопки
        const hiddenPostsCount = document.querySelectorAll('.post-hidden').length;
        const btnText = loadMoreBtn.querySelector('span');
        btnText.textContent = `Показать еще (${hiddenPostsCount})`;
    }
    
    // Добавляем обработчик для кнопки создания поста
    const newPostBtn = document.getElementById('newPostBtn');
    if (newPostBtn) {
        newPostBtn.addEventListener('click', handleNewPost);
    }
});