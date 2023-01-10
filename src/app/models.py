from datetime import datetime
from django.db import models
from django.contrib.auth.models import AbstractUser

from django.contrib import admin


class CustomUser(AbstractUser):
    address = models.CharField(max_length=100)
    city = models.CharField(max_length=100)
    state = models.CharField(max_length=100)
    zip = models.CharField(max_length=100)
    company = models.CharField(max_length=100)
    registration_random_code = models.CharField(max_length=100)

    def __str__(self):
        return "{} {}".format(self.first_name, self.last_name)

    class Meta(AbstractUser.Meta):
        swappable = 'AUTH_USER_MODEL'
        ordering = ["id"]


class Lyrics(models.Model):
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE)
    name = models.CharField(max_length=100, blank=True)
    date_added = models.DateField()
    all_paragraphs = models.JSONField()

    def __str__(self):
        return "Spreadsheet {}".format(self.name)

    class Meta:
        ordering = ["id"]


admin.site.register(CustomUser)
admin.site.register(Lyrics)
