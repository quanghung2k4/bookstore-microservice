from django.urls import path
from .views import ManagerDashboardView

urlpatterns = [
    path('reports/dashboard/', ManagerDashboardView.as_view()),
]
