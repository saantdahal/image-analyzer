from django.contrib.auth.models import AbstractUser
from django.db import models
from django.contrib.auth.models import AbstractUser, BaseUserManager


class UserManager(BaseUserManager):
    def create_user(self, email, citizenship_number, password=None, **extra_fields):
        if not email:
            raise ValueError("Email is required")
        email = self.normalize_email(email)
        user = self.model(email=email, citizenship_number=citizenship_number, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, citizenship_number, password=None, **extra_fields):
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)
        return self.create_user(email, citizenship_number, password, **extra_fields)


class User(AbstractUser):
    class Gender(models.TextChoices):
        MALE        = 'male',   'Male'
        FEMALE      = 'female', 'Female'
        OTHER       = 'other',  'Other'

    username = None

    email = models.EmailField(unique=True)
    middle_name = models.CharField(max_length=100, blank=True)
    citizenship_number = models.CharField(max_length=50, unique=True)
    profile_picture = models.ImageField(upload_to='profiles/', null=True, blank=True)
    gender = models.CharField(max_length=20, choices=Gender.choices)
    phone_number = models.CharField(max_length=20, blank=True)
    is_admin = models.BooleanField(default=False)

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['citizenship_number']

    objects = UserManager()

    @property
    def full_name(self):
        parts = [self.first_name, self.middle_name, self.last_name]
        return ' '.join(p for p in parts if p)

    def __str__(self):
        return self.email