from django.urls import path
from . import views

urlpatterns = [
    path('', views.index, name='index'),
    
    # Endpoints for accessing and editing collections
    path('collection/<int:collection_id>/', views.display_collection, name='display_collection'),
    path('collection/new', views.create_collection, name='create_collection'),

    # Edpoints for accessing and editing documents
    path('document/<int:document_id>/', views.render_document, name='render_document'),
    path('document/new', views.create_document, name='create_document'),
    path('document/<int:document_id>/edit', views.edit_document, name='edit_document'),
    path('document/<int:document_id>/rename', views.rename_document, name='rename_document'),
    path('document/<int:document_id>/visibility', views.set_document_visibility, name='set_document_visibility'),
]