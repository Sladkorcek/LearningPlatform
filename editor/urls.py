from django.urls import path
from . import views

urlpatterns = [
    path('document/<int:document_id>/', views.render_document, name='render_document'),
]
