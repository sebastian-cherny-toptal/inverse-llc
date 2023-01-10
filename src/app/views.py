import json
from django.http import HttpResponse
from django.shortcuts import render
from rest_framework import status

from app.models import CustomUser

# Create your views here.


def index(request):
    context = {}
    return render(request, "index.html", context=context)


def login_view(request):
    context = {}
    return render(request, "login.html", context=context)


def register_view(request):
    context = {}
    return render(request, "register.html", context=context)


def profile_view(request):
    context = {}
    return render(request, "profile.html", context=context)


def collection_dashboard_view(request, spreadsheet_id):
    context = {"spreadsheet_id": spreadsheet_id}
    return render(request, "dashboard.html", context=context)


def collection_table_view(request, spreadsheet_id):
    context = {"spreadsheet_id": spreadsheet_id}
    return render(request, "spreadsheet_rows.html", context=context)


def lyrics_view(request, lyric_id=None):
    context = {}
    if lyric_id:
        context['lyrics_id'] = lyric_id
    return render(request, "lyrics.html", context=context)


def profile_view(request):
    context = {}
    return render(request, "profile.html", context=context)


def welcome(request, random_str):
    try:
        user = CustomUser.objects.get(registration_random_code=random_str)
    except:
        return HttpResponse(json.dumps({"detail": "Not found"}), status=status.HTTP_404_NOT_FOUND)
    context = {'username': user.username}
    return render(request, "user_validation.html", context=context)
