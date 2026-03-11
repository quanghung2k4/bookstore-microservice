from django.urls import path
from .views import BookReviewSummaryView, ReviewByBookView, ReviewListCreateView

urlpatterns = [
    path('reviews/', ReviewListCreateView.as_view()),
    path('reviews/book/<int:book_id>/', ReviewByBookView.as_view()),
    path('reviews/summary/', BookReviewSummaryView.as_view()),
]
