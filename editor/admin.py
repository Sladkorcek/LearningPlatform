from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import *

class CustomUserAdmin(UserAdmin):
    fieldsets = (
        *UserAdmin.fieldsets,
        ('User profile', { 'fields': ('bio', 'image') }),
    )

class DocumentAdmin(admin.ModelAdmin):
    list_display = ('title', 'visibility', 'owner')
    list_display_links = ('title', )

class CollectionAdmin(admin.ModelAdmin):
    list_display = ('title', 'description', 'owner')
    list_display_links = ('title', )

admin.site.register(UserProfile, CustomUserAdmin)
admin.site.register(Document, DocumentAdmin)
admin.site.register(Collection, CollectionAdmin)