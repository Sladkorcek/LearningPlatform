from django.contrib import admin
from .models import *

class DocumentAdmin(admin.ModelAdmin):
    list_display = ('title', 'visibility', 'owner')
    list_display_links = ('title', )

class CollectionAdmin(admin.ModelAdmin):
    list_display = ('title', 'description', 'owner')
    list_display_links = ('title', )

admin.site.register(Document, DocumentAdmin)
admin.site.register(Collection, CollectionAdmin)