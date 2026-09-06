from rest_framework import generics, permissions
from rest_framework.parsers import MultiPartParser, FormParser
from django.shortcuts import get_object_or_404
from crime_portal.permissions import IsAdmin, IsOwnerOrAdmin
from crime_portal.models import CrimeTag, Complaint
from crime_portal.serializers.complaint_serializer import (
    CrimeTagSerializer,
    ComplaintListSerializer,
    ComplaintDetailSerializer,
    ComplaintStatusUpdateSerializer,
    AdminCommentSerializer,
)
from django.db.models import Q, Count 
from rest_framework.response import Response
from rest_framework.views import APIView



class CrimeTagListCreateView(generics.ListCreateAPIView):
    queryset = CrimeTag.objects.all().order_by("name")
    serializer_class = CrimeTagSerializer

    def get_permissions(self):
        if self.request.method == "GET":
            return [permissions.IsAuthenticated()]
        return [IsAdmin()]


class CrimeTagDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = CrimeTag.objects.all()
    serializer_class = CrimeTagSerializer
    permission_classes = [IsAdmin]


class ComplaintListCreateView(generics.ListCreateAPIView):
    """
    GET  /complaints/        → list own complaints (admin sees all)
    POST /complaints/        → file a new complaint
    """
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def get_serializer_class(self):
        if self.request.method == "GET":
            return ComplaintListSerializer
        return ComplaintDetailSerializer

    def get_queryset(self):
        user = self.request.user
        qs = Complaint.objects.select_related("user").prefetch_related("tags", "comments")

        # if user.is_admin:
        #     return qs.all()
        # return qs.filter(user=user)

        if user.is_admin:
            qs = qs.all()
        else:
            qs = qs.filter(user=user)

        page = int(self.request.query_params.get("page", 1))
        limit = int(self.request.query_params.get("limit", 25))
        
        status = self.request.query_params.get("status","")
        category = self.request.query_params.get("category","")
        from_date = self.request.query_params.get("fromDate","")
        to_date = self.request.query_params.get("toDate","")
        ai_flagged = self.request.query_params.get("aiFlagged","")
        
        search = self.request.query_params.get("search","")

        if status:
            qs=qs.filter(status=status)
        if category:
            qs=qs.filter(tags__category=category)
        if from_date:
            qs=qs.filter(incident_date__gte = from_date)
        if to_date:
            qs=qs.filter(incident_date__lte = to_date)
        if ai_flagged != "":
            qs = qs.filter(ai_flagged=ai_flagged.lower() == "true")
        if search:
            qs=qs.filter(
                Q(title__icontains=search) | 
                Q(victim_first_name__icontains=search) | 
                Q(victim_middle_name__icontains=search) | 
                Q(victim_last_name__icontains=search) | 
                Q(perpetrator_first_name__icontains=search) | 
                Q(perpetrator_middle_name__icontains=search) | 
                Q(perpetrator_last_name__icontains=search) )

        return qs

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class ComplaintDetailView(generics.RetrieveUpdateAPIView):
    """
    GET   /complaints/<id>/  → full detail (owner or admin)
    PATCH /complaints/<id>/  → edit complaint (owner or admin)
    """
    permission_classes = [permissions.IsAuthenticated, IsOwnerOrAdmin]
    parser_classes = [MultiPartParser, FormParser]
    serializer_class = ComplaintDetailSerializer

    def get_queryset(self):
        return Complaint.objects.prefetch_related("tags", "comments__author")

    def get_object(self):
        obj = get_object_or_404(self.get_queryset(), pk=self.kwargs["pk"])
        self.check_object_permissions(self.request, obj)
        return obj


class FlaggedComplaintListView(generics.ListAPIView):
    """
    GET /complaints/flagged/  → all AI-flagged, pending-review complaints
    """
    permission_classes = [IsAdmin]
    serializer_class = ComplaintListSerializer

    def get_queryset(self):
        return (
            Complaint.objects
            .filter(ai_flagged=True, status=Complaint.Status.PENDING)
            .select_related("user")
            .prefetch_related("tags")
            .order_by("-created_at")
        )


class ComplaintStatusUpdateView(generics.UpdateAPIView):
    """
    PATCH /complaints/<id>/status/  → admin updates complaint status
    """
    permission_classes = [IsAdmin]
    serializer_class = ComplaintStatusUpdateSerializer
    queryset = Complaint.objects.all()
    http_method_names = ["patch"]


class ComplaintCommentCreateView(generics.CreateAPIView):
    """
    POST /complaints/<id>/comments/
    Users add evidence/updates; admin adds notes (is_admin_note auto-set)
    """
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = AdminCommentSerializer

    def perform_create(self, serializer):
        complaint = get_object_or_404(Complaint, pk=self.kwargs["pk"])
        if not (self.request.user.is_admin or complaint.user == self.request.user):
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied("You can only comment on your own complaints.")
        serializer.save(
            complaint=complaint,
            author=self.request.user,
            is_admin_note=self.request.user.is_admin,
        )

class DashboardStatsView(APIView):
    """
    GET /dashboard/stats/
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user
        qs = Complaint.objects.all() if user.is_admin else Complaint.objects.filter(user=user)

        counts = qs.aggregate(
            total=Count("id"),
            pending=Count("id", filter=Q(status="pending")),
            ongoing=Count("id", filter=Q(status="ongoing")),
            closed=Count("id", filter=Q(status__in=["approved", "rejected"])),
        )

        return Response(counts)