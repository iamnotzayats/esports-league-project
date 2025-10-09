from django.urls import path
from django.contrib import admin
from django.conf import settings
from django.conf.urls.static import static

from . import views

urlpatterns = [
    path('', views.NewsPageView, name = 'news_url'),
]+ static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
