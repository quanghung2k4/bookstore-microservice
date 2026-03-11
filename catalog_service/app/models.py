from django.db import models


class Category(models.Model):
	name = models.CharField(max_length=100, unique=True)
	description = models.TextField(blank=True)

	def __str__(self):
		return self.name


class BookCatalog(models.Model):
	book_id = models.IntegerField()
	category = models.ForeignKey(Category, on_delete=models.CASCADE, related_name='books')
	featured = models.BooleanField(default=False)

	class Meta:
		unique_together = ('book_id', 'category')
