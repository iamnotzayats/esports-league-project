from .models import *
from django.shortcuts import render
from django.db.models import Count

def NewsPageView(request):
    # Фильтруем посты только от пользователей с is_staff=True
    # Используем prefetch_related для оптимизации запросов к связанным моделям
    # Сортируем по дате публикации (новые сначала)
    # Добавляем аннотацию для подсчета лайков
    posts = Posts.objects.filter(
        user__is_superuser=True  # Только посты от staff пользователей
    ).prefetch_related(
        'images', 
        'tags',
        'likes',
        'user__profile'  # Добавляем prefetch для профилей пользователей
    ).select_related('user').annotate(
        likes_count=Count('likes', filter=models.Q(likes__likes=True))
    ).order_by('-date_pub')
    
    return render(request, 'html/news.html', {
        'page_title': 'Новости', 
        'posts': posts
    })