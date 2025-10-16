from django.db import models
from django.dispatch import receiver
from taggit.managers import TaggableManager
from django.db.models.signals import post_save
from django.contrib.auth.models import AbstractUser


class User(AbstractUser):
    username = models.CharField(max_length=128, unique=True, null=False, blank=False, verbose_name='Имя пользователя')
    
    def __str__(self):
        return self.username
    
    class Meta:
        verbose_name_plural = 'Пользователи'
    

class Profile(models.Model):
    user = models.OneToOneField(
        User, 
        on_delete=models.CASCADE
    )
    surname = models.CharField(max_length=50, null = False, blank = False, verbose_name='Фамилия')
    name = models.CharField(max_length=50, null = False, blank = False, verbose_name= 'Имя')
    middlename = models.CharField(max_length=60, null=True, blank=True, verbose_name='Отчество(при наличии)')
    birthday = models.DateField(null=True, blank=True, verbose_name='Дата рождения')
    image = models.ImageField(upload_to='images/profiles/avatars', default='default/profile/avatar/no_photo.jpg')
    
    def __str__(self):
        return f'{self.surname} {self.name} {self.middlename}'
    
    class Meta:
        verbose_name_plural = 'Профиль пользователя'
    
    
@receiver(post_save, sender=User)
def create_or_update_user_profile(sender, instance, created, **kwargs):
    if created:
        Profile.objects.create(user=instance)
    instance.profile.save()
    

class Posts(models.Model):
    description = models.TextField(null=False, blank=False, verbose_name='Описание поста')
    tags = TaggableManager()
    user = models.ForeignKey(User, on_delete= models.DO_NOTHING)
    date_pub = models.DateTimeField(auto_now_add=True, null=False, blank=False, verbose_name='Дата публикации')

    def __str__(self):
        return self.description
    
    def likes_count(self):
        return self.likes.filter(likes=True).count()
    
    class Meta:
        verbose_name_plural = 'Посты'


class PostsImages(models.Model):
    post = models.ForeignKey(Posts, on_delete=models.CASCADE, verbose_name='Пост', related_name='images')  # Измените DO_NOTHING на CASCADE
    image = models.ImageField(upload_to='images/posts', null=False, blank=False, verbose_name='Фотографии поста')
    
    def __str__(self):
        return f"Image for {self.post.description}"
    
    class Meta:
        verbose_name_plural = 'Фотографии постов'
        
class PostLikes(models.Model):
    post = models.ForeignKey(Posts, on_delete=models.CASCADE, verbose_name='Пост', related_name='likes')
    user = models.ForeignKey(User, on_delete=models.CASCADE, verbose_name='Пользователь')
    likes = models.BooleanField(default=False, null=False, blank=False, verbose_name='Лайкнут ли?')
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='Дата лайка')

    class Meta:
        verbose_name_plural = 'Лайки постов'
        unique_together = ('post', 'user')  # Один пользователь может лайкнуть пост только один раз