from django.urls import path
from . import views

urlpatterns = [
    path('document/<int:document_id>/', views.render_document, name='render_document'),
    path('document/<int:document_id>/edit', views.edit_document, name='edit_document'),
]
