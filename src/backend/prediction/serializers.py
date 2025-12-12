from rest_framework import serializers
from django.contrib.auth.models import User
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.contrib.auth import get_user_model
from .models import MeanSizePrediction # Import MeanSizePrediction model


class UserRegisterSerializer(serializers.ModelSerializer):
    password2 = serializers.CharField(style={'input_type': 'password'}, write_only=True)

    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'password2']
        extra_kwargs = {
            'password': {'write_only': True}
        }

    def validate(self, data):
        if data['password'] != data['password2']:
            raise serializers.ValidationError({"password": "Password fields didn't match."})
        return data

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password']
        )
        return user

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token['username'] = user.username
        return token

    def validate(self, attrs):
        User = get_user_model()
        username = attrs.get(self.username_field)
        
        # Allow authentication with either username or email
        try:
            # Check if the provided 'username' is an email of an existing user
            user = User.objects.get(email=username)
            attrs[self.username_field] = user.username # Use the actual username for authentication
        except User.DoesNotExist:
            # If no user is found by email, proceed with the original 'username'
            pass

        data = super().validate(attrs)

        # Add custom claims to the response, which will be included in the token payload
        data['username'] = self.user.username
        
        return data


class MeanSizePredictionSerializer(serializers.ModelSerializer):
    image_url = serializers.SerializerMethodField() # Add image_url field

    class Meta:
        model = MeanSizePrediction
        fields = [
            'id',
            'predicted_mean_size_nm', # Corrected field name
            'created_at',
            'image_url',
            'original_filename',
        ]
        read_only_fields = ['id', 'created_at', 'image_url'] # These fields are read-only

    def get_image_url(self, obj):
        request = self.context.get('request')
        if obj.image and request:
            return request.build_absolute_uri(obj.image.url)
        return None