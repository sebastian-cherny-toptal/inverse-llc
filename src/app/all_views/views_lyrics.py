import datetime
from rest_framework.decorators import api_view
from django.shortcuts import HttpResponse
from rest_framework import status
from app.mail_sender import send_mail
from app.models import Lyrics
import json
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

from django_files.settings import MAIL_SENDER_USER, SEND_MAIL_NEW_USER, URL_PREFIX_FOR_LINK


@api_view(['GET', 'POST', 'PUT'])
def lyrics(request):
    if request.user.is_anonymous:
        return HttpResponse(json.dumps({"detail": "Not authorized"}), status=status.HTTP_401_UNAUTHORIZED)

    if request.method == "GET":
        lyrics = Lyrics.objects.all()
        #l = [serialize_rate(rate) for rate in rates]
        return HttpResponse(json.dumps({"data": lyrics}), status=status.HTTP_200_OK)

    if request.method == "POST":
        print(request.data.get("allParagraphs", ""))
        print(type(request.data.get("allParagraphs", "")))
        lyric = Lyrics()
        lyric.user = request.user
        lyric.name = request.data.get("name", "") or "Default name"
        lyric.date_added = datetime.datetime.now()
        lyric.all_paragraphs = request.data.get("allParagraphs", "")
        lyric.save()
        return HttpResponse(json.dumps({'data': {'id': lyric.id}}), status=status.HTTP_201_CREATED)

    return HttpResponse(json.dumps({"detail": "Wrong method"}), status=status.HTTP_501_NOT_IMPLEMENTED)


@api_view(['GET', 'PUT'])
def lyric(request, lyric_id):
    if request.user.is_anonymous:
        return HttpResponse(json.dumps({"detail": "Not authorized"}), status=status.HTTP_401_UNAUTHORIZED)

    if request.method == "GET":
        lyrics = Lyrics.objects.get(pk=lyric_id)
        #l = [serialize_rate(rate) for rate in rates]
        return HttpResponse(json.dumps({"data": {
            'id': lyrics.id,
            'allParagraphs': lyrics.all_paragraphs
        }}), status=status.HTTP_200_OK)

    if request.method == "PUT":
        lyric = Lyrics.objects.get(pk=lyric_id)
        lyric.all_paragraphs = request.data.get("allParagraphs", "")
        lyric.save()
        return HttpResponse(json.dumps({'data': {'id': lyric.id}}), status=status.HTTP_200_OK)

    return HttpResponse(json.dumps({"detail": "Wrong method"}), status=status.HTTP_501_NOT_IMPLEMENTED)
