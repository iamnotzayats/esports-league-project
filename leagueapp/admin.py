from django.contrib import admin
from .models import *

class PostsAdmin(admin.ModelAdmin):
    list_display = [ 'user', 'date_pub']
    
class PostsImagesAdmin(admin.ModelAdmin):
    list_display = ['post', 'image']
    
class PostLikesAdmin(admin.ModelAdmin):
    list_display = ['post', 'user']
    
    
    
admin.site.register(Posts, PostsAdmin)
admin.site.register(PostsImages, PostsImagesAdmin)
admin.site.register(PostLikes, PostLikesAdmin)