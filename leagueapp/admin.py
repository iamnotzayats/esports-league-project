from .models import *
from django.contrib import admin
from django.contrib.auth.admin import UserAdmin

class PostsAdmin(admin.ModelAdmin):
    list_display = [ 'user', 'date_pub']
    
class PostsImagesAdmin(admin.ModelAdmin):
    list_display = ['post', 'image']
    
class PostLikesAdmin(admin.ModelAdmin):
    list_display = ['post', 'user']
    
class UsersAdmin(UserAdmin):
    list_display = ['username']
    
class ProfileAdmin(admin.ModelAdmin):
    list_display = ['user', 'surname', 'name']
    
    
admin.site.register(Posts, PostsAdmin)
admin.site.register(PostsImages, PostsImagesAdmin)
admin.site.register(PostLikes, PostLikesAdmin)
admin.site.register(User, UsersAdmin)
admin.site.register(Profile, ProfileAdmin)