from rest_framework import serializers
from .models import BookCatalog, Category


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = '__all__'


class BookCatalogSerializer(serializers.ModelSerializer):
    class Meta:
        model = BookCatalog
        fields = '__all__'
