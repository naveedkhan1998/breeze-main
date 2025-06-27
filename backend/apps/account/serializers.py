from django.contrib.auth.tokens import PasswordResetTokenGenerator
from django.utils.encoding import DjangoUnicodeDecodeError, force_bytes, smart_str
from django.utils.http import urlsafe_base64_decode, urlsafe_base64_encode
from rest_framework import serializers

from apps.account.utils import Util
from main.settings.local import BASE_DIR, MAIN_URL_2

from .models import User


class UserRegistrationSerializer(serializers.ModelSerializer):

    password2 = serializers.CharField(style={"input_type": "password"}, write_only=True)

    class Meta:
        model = User
        fields = ["email", "name", "password", "password2", "tc"]
        extra_kwargs = {"password": {"write_only": True}}

    def validate(self, attrs):
        password = attrs.get("password")
        password2 = attrs.get("password2")
        attrs.get("email")
        if password != password2:
            raise serializers.ValidationError("Passwords don't match")
        return attrs

    def create(self, validate_data):
        return User.objects.create_user(**validate_data)


class UserLoginSerializer(serializers.ModelSerializer):
    email = serializers.EmailField(max_length=255)

    class Meta:
        model = User
        fields = ["email", "password"]


class UserProfileSerializer(serializers.ModelSerializer):
    @staticmethod
    def get_avatar(obj):
        try:
            return MAIN_URL_2 + obj.avatar.url
        except (AttributeError, ValueError):
            return None

    avatar = serializers.SerializerMethodField("get_avatar")

    class Meta:
        model = User
        fields = [
            "id",
            "email",
            "name",
            "avatar",
            "is_admin",
        ]


class UserChangePasswordSerializer(serializers.ModelSerializer):
    password = serializers.CharField(
        max_length=255, style={"input_type": "password"}, write_only=True
    )
    password2 = serializers.CharField(
        max_length=255, style={"input_type": "password"}, write_only=True
    )

    class Meta:
        model = User
        fields = ["password", "password2"]

    def validate(self, attrs):
        password = attrs.get("password")
        password2 = attrs.get("password2")
        user = self.context.get("user")
        if password != password2:
            raise serializers.ValidationError("Passwords don't match")
        user.set_password(password)
        user.save()
        return attrs


class SendPasswordResetEmailSerializer(serializers.Serializer):
    email = serializers.EmailField(max_length=255)

    class Meta:
        fields = ["email"]

    def validate(self, attrs):
        email = attrs.get("email")
        if User.objects.filter(email=email).exists():
            user = User.objects.get(email=email)
            uid = urlsafe_base64_encode(force_bytes(user.id))
            # print('Encoded UID ',uid)
            token = PasswordResetTokenGenerator().make_token(user)
            # print('Password token', token)
            link = (
                "https://naveedkhan1998.github.io/user-auth-react/#/api/user/reset/"
                + uid
                + "/"
                + token
                + "/"
            )
            ##print('Link reset',link)
            # body = 'Click Following Link to reset your password '+link
            # data = {
            #    'subject':'Password Reset link',
            #    'body':body,
            #    'to_email':user.email
            # }
            # Util.send_email(data)
            subject = "Reset LINK"
            to = user.email
            # path_to_html = STATIC_ROOT+"templates/email_otp.html"
            path_to_html = str(BASE_DIR) + "/home/templates/password_reset.html"
            Util.send_html_email(subject, to, path_to_html, link)
            return attrs
        raise serializers.ValidationError("You are not registered user.")


class UserPasswordResetSerializer(serializers.Serializer):
    password = serializers.CharField(
        max_length=255, style={"input_type": "password"}, write_only=True
    )
    password2 = serializers.CharField(
        max_length=255, style={"input_type": "password"}, write_only=True
    )

    class Meta:
        fields = ["password", "password2"]

    def validate(self, attrs):
        try:
            password = attrs.get("password")
            password2 = attrs.get("password2")
            uid = self.context.get("uid")
            token = self.context.get("token")
            if password != password2:
                raise serializers.ValidationError("Passwords don't match")
            id = smart_str(urlsafe_base64_decode(uid))
            user = User.objects.get(id=id)
            if not PasswordResetTokenGenerator().check_token(user, token):
                raise serializers.ValidationError("Token is not Valid or Expired")
            user.set_password(password)
            user.save()
            return attrs
        except DjangoUnicodeDecodeError:
            PasswordResetTokenGenerator().check_token(user, token)
            raise serializers.ValidationError("Token is not Valid or Expired")
