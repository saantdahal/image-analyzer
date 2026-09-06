from rest_framework import serializers
from django.contrib.auth import get_user_model

User = get_user_model()

class RegisterSerializer(serializers.ModelSerializer):
    password   = serializers.CharField(write_only=True, min_length=8)
    first_name = serializers.CharField(required=True)
    last_name  = serializers.CharField(required=True)
 
    class Meta:
        model  = User
        fields = [
            "id", "email", "password",
            "first_name", "middle_name", "last_name",
            "citizenship_number", "profile_picture",
            "gender", "phone_number"
        ]
        extra_kwargs = {
            "profile_picture": {"required": False},
            "middle_name":     {"required": False, "allow_blank": True},
        }
 
    def create(self, validated_data):
        password = validated_data.pop("password")
        user = User(**validated_data)
        user.set_password(password)
        user.save()
        return user
 
 
class UserProfileSerializer(serializers.ModelSerializer):
    full_name = serializers.SerializerMethodField()
    role = serializers.SerializerMethodField()
 
    class Meta:
        model = User
        fields = [
            "id", "email",
            "first_name", "middle_name", "last_name", "full_name",
            "citizenship_number", "profile_picture", "is_admin", "role", "phone_number"
        ]
        read_only_fields = ["id", "citizenship_number", "is_admin", "role"]
 
    def get_full_name(self, obj):
        return obj.full_name
    
    def get_role(self, obj):
        return 'admin' if obj.is_staff else 'user'
 
