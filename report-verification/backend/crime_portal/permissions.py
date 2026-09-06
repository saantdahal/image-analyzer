from rest_framework import permissions
from crime_portal.models import CrimeTag, Complaint

class IsAdmin(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and request.user.is_staff


class IsOwnerOrAdmin(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        if request.user.is_admin:
            return True
        complaint = obj if isinstance(obj, Complaint) else obj.complaint
        return complaint.user == request.user
