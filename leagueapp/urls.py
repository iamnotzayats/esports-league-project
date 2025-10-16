from django.urls import path
from django.contrib import admin
from django.conf import settings
from django.conf.urls.static import static

from . import views

urlpatterns = [
    path('', views.NewsPageView, name='news_url'),
    path('login/', views.UserLoginView, name='login_url'),
    path('logout/', views.UserLogoutView, name='logout_url'),
    path('post/<int:post_id>/like/', views.toggle_like, name='toggle_like'),
    path('addpost/', views.AddNewPostView, name='add_new_post_url'),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)