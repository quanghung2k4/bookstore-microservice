from django.urls import path
from .views import StaffBookDetail, StaffBooksView, StaffListCreate

urlpatterns = [
    path('staff/', StaffListCreate.as_view()),
    path('staff/books/', StaffBooksView.as_view()),
    path('staff/books/<int:book_id>/', StaffBookDetail.as_view()),
]
