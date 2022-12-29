import uuid
from rest_framework.decorators import api_view
from django.shortcuts import HttpResponse
from rest_framework import status
from app.mail_sender import send_mail
from app.models import CustomUser
import json
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

from django_files.settings import MAIL_SENDER_USER, SEND_MAIL_NEW_USER, URL_PREFIX_FOR_LINK


def serialize_user(user):
    return {
        "username": user.username,
        "email": user.email,
        "name": user.first_name,
        "address": user.address,
        "is_admin": user.is_staff,
        "is_active": user.is_active
    }


@api_view(['GET'])
def user_info(request):
    if request.user.is_anonymous:
        return HttpResponse(json.dumps({"detail": "Not authorized"}), status=status.HTTP_401_UNAUTHORIZED)
    return HttpResponse(json.dumps({"data": serialize_user(request.user)}))


@api_view(['POST'])
def resend_mail(request):
    request_mail = request.data.get("email")
    try:
        user = CustomUser.objects.get(email=request_mail)
    except:
        return HttpResponse(json.dumps({"success": False, "detail": "Incorrect user"}), status=status.HTTP_403_FORBIDDEN)
    send_mail(_get_new_user_mail_content(
        user.registration_random_code), "Welcome to Cinc Labs", request_mail)
    return HttpResponse(json.dumps({"success": True}), status=status.HTTP_200_OK)


@api_view(['POST'])
def ask_question(request):
    if request.user.is_anonymous:
        return HttpResponse(json.dumps({"detail": "Not authorized"}), status=status.HTTP_401_UNAUTHORIZED)
    message = request.data.get("message")
    print(request.data)
    collection_id = request.data.get("collectionId")
    send_mail(message, "New question from user {} (id {}) about collection_id {}".format(
        request.user.username, request.user.id, collection_id), MAIL_SENDER_USER)
    return HttpResponse(json.dumps({"data": {"success": True}}), status=status.HTTP_200_OK)


def _get_new_user_mail_content(random_str):
    link = "{}/welcome/{}".format(URL_PREFIX_FOR_LINK, random_str)
    return """<h2>Congratulations!</h2>
You have registered your mail in our system.
To start monitoring your spreadsheets and information, click <a href='{}'>here</a>

""".format(link)


@api_view(['POST'])
def register_user(request):
    password = request.data.get("password")
    email = request.data.get("email")
    username = request.data.get("username")
    if (not username) or (not password):
        return HttpResponse(json.dumps({"success": False, "detail": "Username and password are required"}), status=status.HTTP_400_BAD_REQUEST)
    if (not isinstance(password, str)) or (not isinstance(password, str)):
        return HttpResponse(json.dumps({"success": False, "detail": "Username and password must be strings"}), status=status.HTTP_400_BAD_REQUEST)
    try:
        CustomUser.objects.get(email=email)
        return HttpResponse(json.dumps({"success": False, "detail": "Email already exists"}), status=status.HTTP_403_FORBIDDEN)
    except CustomUser.DoesNotExist:
        try:
            CustomUser.objects.get(username=username)
            return HttpResponse(json.dumps({"success": False, "detail": "Username already exists"}), status=status.HTTP_403_FORBIDDEN)
        except CustomUser.DoesNotExist:
            random_str = str(uuid.uuid4())
            new_user = CustomUser.objects.create(username=username,
                                                 email=email,
                                                 is_active=False,
                                                 registration_random_code=random_str)
            new_user.set_password(password)
            new_user.save()
            if SEND_MAIL_NEW_USER:
                send_mail(_get_new_user_mail_content(
                    random_str), "Welcome to Cinc Labs", email)
            return HttpResponse(json.dumps({"success": True,
                                            "registration_random_code": random_str}), status=status.HTTP_200_OK)


@api_view(['POST'])
def validate_user(request):
    try:
        user = CustomUser.objects.get(username=request.data.get("username"))
    except:
        return HttpResponse(json.dumps({"success": False, "detail": "Incorrect user"}), status=status.HTTP_403_FORBIDDEN)
    first_name = request.data.get("name")
    last_name = request.data.get("lastName") or ""
    address = request.data.get("address")
    state = request.data.get("state")
    city = request.data.get("city")
    zip_code = request.data.get("zipCode")
    company = request.data.get("company")
    user.first_name = first_name
    user.last_name = last_name
    user.address = address
    user.state = state
    user.city = city
    user.zip = zip_code
    user.company = company
    user.is_active = True
    user.save()
    new_user_token = TokenObtainPairSerializer.get_token(user)
    return HttpResponse(json.dumps({"success": True,
                                    "access": str(new_user_token.access_token),
                                    "refresh": str(new_user_token),
                                    "username": user.username,
                                    'is_admin': user.is_staff,
                                    }), status=status.HTTP_200_OK)
