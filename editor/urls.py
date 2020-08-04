from django.urls import path, include
from . import views

urlpatterns = [
    path('', views.landing_page, name='landing_page'),
    path('documents', views.documents, name='documents'),
    path('tutorial', views.help_center, name='help_center'),
    path('explore', views.explore, name='explore'),

    # Endpoints for users
    path('user/<int:user_id>/', views.user_profile, name='user_profile'),
    
    # Endpoints for accessing and editing collections
    path('collection/<int:collection_id>/', views.display_collection, name='display_collection'),
    path('collection/new', views.create_collection, name='create_collection'),
    path('collection/<int:collection_id>/edit', views.edit_collection, name='edit_collection'),
    path('collection/<int:collection_id>/delete', views.delete_collection, name='delete_collection'),
    path('collection/<int:collection_id>/clone', views.clone_collection, name='clone_collection'),
    path('collection/<int:collection_id>/star', views.star_collection, name='star_collection'),
    path('collection/<int:collection_id>/unstar', views.unstar_collection, name='unstar_collection'),

    # Edpoints for accessing and editing documents
    path('document/<int:document_id>/', views.render_document, name='render_document'),
    path('document/new', views.create_document, name='create_document'),
    path('document/<int:document_id>/edit', views.edit_document, name='edit_document'),
    path('document/<int:document_id>/rename', views.rename_document, name='rename_document'),
    path('document/<int:document_id>/visibility', views.set_document_visibility, name='set_document_visibility'),
    path('document/<int:document_id>/delete', views.delete_document, name='delete_document'),
    path('document/<int:document_id>/clone', views.clone_document, name='clone_document'),
    path('document/<int:document_id>/raw', views.raw_document, name='raw_document'),
    path('document/<int:document_id>/star', views.star_document, name='star_document'),
    path('document/<int:document_id>/unstar', views.unstar_document, name='unstar_document'),
]
