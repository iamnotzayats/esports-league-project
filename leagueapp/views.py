from .models import *
from django.shortcuts import render
from django.db.models import Count

def NewsPageView(request):
    # Используем prefetch_related для оптимизации запросов к связанным моделям
    # Сортируем по дате публикации (новые сначала)
    # Добавляем аннотацию для подсчета лайков
    posts = Posts.objects.all().prefetch_related(
        'images', 
        'tags',
        'likes'
    ).select_related('user').annotate(
        likes_count=Count('likes', filter=models.Q(likes__likes=True))
    ).order_by('-date_pub')
    
    return render(request, 'html/news.html', {'page_title': 'Новости', 'posts': posts})