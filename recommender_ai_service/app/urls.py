from django.urls import path
from .views import RecommendationView

urlpatterns = [
    path('recommendations/<int:customer_id>/', RecommendationView.as_view()),
]
