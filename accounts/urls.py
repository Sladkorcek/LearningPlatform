from django.urls import path, include
from . import views

urlpatterns = [
    path('register', views.register, name='register'),
    path('begin_tutorial', views.begin_tutorial, name='begin_tutorial'),
    path('end_tutorial', views.end_tutorial, name='end_tutorial'),
]
