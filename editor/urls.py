from django.urls import path, include
from . import views

urlpatterns = [
    path('', views.landing_page, name='landing_page'),
    path('documents', views.documents, name='documents'),
    path('tutorial', views.help_center, name='help_center'),
    path('explore', views.explore, name='explore'),
    path('stars', views.stars, name='stars'),

    path('faq', views.frequent_asked_questions, name='frequent_asked_questions'),
    path('media', views.media, name='media'),
    path('pricing', views.pricing, name='pricing'),
    path('about', views.about, name='about'),
    path('contact', views.contact, name='contact'),
    path('privacy', views.privacy, name='privacy'),

    # Image upload and access
    path('image/upload', views.upload_image, name='upload_image'),
    path('image/<str:image_id>', views.get_image, name='get_image'),

    # Endpoints for users
    path('user/<str:username>/', views.user_profile, name='user_profile'),
    path('user/<str:username>/edit', views.edit_user_profile, name='edit_user_profile'),
    
    # Endpoints for accessing and editing collections
    path('collection/<str:collection_id>/', views.display_collection, name='display_collection'),
    path('collection/new', views.create_collection, name='create_collection'),
    path('collection/<str:collection_id>/edit', views.edit_collection, name='edit_collection'),
    path('collection/<str:collection_id>/delete', views.delete_collection, name='delete_collection'),
    path('collection/<str:collection_id>/clone', views.clone_collection, name='clone_collection'),
    path('collection/<str:collection_id>/star', views.star_collection, name='star_collection'),
    path('collection/<str:collection_id>/unstar', views.unstar_collection, name='unstar_collection'),

    # Edpoints for accessing and editing documents
    path('document/<str:document_id>/', views.render_document, name='render_document'),
    path('document/new', views.create_document, name='create_document'),
    path('document/<str:document_id>/edit', views.edit_document, name='edit_document'),
    path('document/<str:document_id>/delete', views.delete_document, name='delete_document'),
    path('document/<str:document_id>/clone', views.clone_document, name='clone_document'),
    path('document/<str:document_id>/raw', views.raw_document, name='raw_document'),
    path('document/<str:document_id>/star', views.star_document, name='star_document'),
    path('document/<str:document_id>/unstar', views.unstar_document, name='unstar_document'),
]
