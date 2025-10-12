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

// Функция для обработки клика на лайк
function handleLikeClick(postId) {
    // Проверяем авторизацию пользователя
    const isAuthenticated = checkUserAuthentication();
    
    if (!isAuthenticated) {
        openAuthModal();
        return;
    }
    
    // Если пользователь авторизован, обрабатываем лайк
    processLike(postId);
}

// Функция для проверки авторизации пользователя
function checkUserAuthentication() {
    // Временная заглушка - всегда возвращает false (неавторизован)
    // В реальном приложении здесь должна быть проверка через Django
    return false;
}

// Функция для обработки лайка
function processLike(postId) {
    // Здесь будет логика для отправки AJAX запроса на сервер
    console.log(`Лайк для поста ${postId}`);
    
    // Временная демонстрация - переключаем состояние лайка
    const likeElement = document.querySelector(`[onclick="handleLikeClick(${postId})"]`);
    const heartIcon = likeElement.querySelector('i.bi-heart');
    const likesCountElement = likeElement.querySelector('.likes-count');
    
    if (likeElement.classList.contains('liked')) {
        // Убираем лайк
        likeElement.classList.remove('liked');
        heartIcon.classList.remove('bi-heart-fill');
        heartIcon.classList.add('bi-heart');
        
        // Уменьшаем счетчик
        if (likesCountElement) {
            const currentCount = parseInt(likesCountElement.textContent);
            if (currentCount > 1) {
                likesCountElement.textContent = currentCount - 1;
            } else {
                likesCountElement.remove();
            }
        }
    } else {
        // Ставим лайк
        likeElement.classList.add('liked');
        heartIcon.classList.remove('bi-heart');
        heartIcon.classList.add('bi-heart-fill');
        
        // Увеличиваем счетчик
        if (likesCountElement) {
            const currentCount = parseInt(likesCountElement.textContent);
            likesCountElement.textContent = currentCount + 1;
        } else {
            // Создаем счетчик если его нет
            const newLikesCount = document.createElement('span');
            newLikesCount.className = 'likes-count';
            newLikesCount.textContent = '1';
            heartIcon.parentNode.insertBefore(newLikesCount, heartIcon.nextSibling);
        }
    }
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