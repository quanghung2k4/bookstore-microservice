from django.urls import path
from .views import BookCatalogView, CategoryListCreateView

urlpatterns = [
    path('categories/', CategoryListCreateView.as_view()),
    path('catalog/books/', BookCatalogView.as_view()),
]
