from .models import *
from django.shortcuts import render, redirect
from django.db.models import Count, Q
from django.contrib.auth import authenticate, login, logout
from django.contrib import messages
from django.http import JsonResponse
from django.views.decorators.http import require_POST
from django.contrib.auth.decorators import login_required

def NewsPageView(request):
    posts = Posts.objects.filter(
        user__is_superuser=True
    ).prefetch_related(
        'images', 
        'tags',
        'likes',
        'user__profile'
    ).select_related('user').annotate(
        likes_count=Count('likes', filter=Q(likes__likes=True))
    ).order_by('-date_pub')
    
    # Добавляем информацию о лайках текущего пользователя
    for post in posts:
        if request.user.is_authenticated:
            post.user_liked = post.likes.filter(user=request.user, likes=True).exists()
        else:
            post.user_liked = False
    
    return render(request, 'html/news.html', {
        'page_title': 'Новости', 
        'posts': posts
    })

@require_POST
@login_required
def toggle_like(request, post_id):
    try:
        post = Posts.objects.get(id=post_id)
        
        # Проверяем, существует ли уже лайк от пользователя
        existing_like = PostLikes.objects.filter(
            post=post,
            user=request.user
        ).first()
        
        if existing_like:
            # Если лайк существует - удаляем его (убираем лайк)
            existing_like.delete()
            user_liked = False
        else:
            # Если лайка нет - создаем новый
            PostLikes.objects.create(
                post=post,
                user=request.user,
                likes=True
            )
            user_liked = True
        
        # Получаем обновленное количество лайков
        likes_count = post.likes.filter(likes=True).count()
        
        return JsonResponse({
            'success': True,
            'likes_count': likes_count,
            'user_liked': user_liked
        })
        
    except Posts.DoesNotExist:
        return JsonResponse({'success': False, 'error': 'Пост не найден'})
    except Exception as e:
        return JsonResponse({'success': False, 'error': str(e)})

def UserLoginView(request):
    if request.method == 'POST':
        username = request.POST.get('username')
        password = request.POST.get('password')
        
        user = authenticate(request, username=username, password=password)
        
        if user is not None:
            login(request, user)
            # Убрано сообщение о успешном входе
            return redirect('news_url')
        else:
            # Оставляем только сообщение об ошибке
            messages.error(request, 'Неверное имя пользователя или пароль')
    
    return render(request, 'html/login.html')

def UserLogoutView(request):
    logout(request)
    # Убрано сообщение о успешном выходе
    return redirect('news_url')