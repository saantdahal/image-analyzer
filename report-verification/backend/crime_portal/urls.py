from django.urls import path
from crime_portal.views.complaint_views import (
    CrimeTagListCreateView,
    CrimeTagDetailView,
    ComplaintListCreateView,
    ComplaintDetailView,
    FlaggedComplaintListView,
    ComplaintStatusUpdateView,
    ComplaintCommentCreateView,
    DashboardStatsView
)
from crime_portal.views.complaint_report_views import GenerateReportView, DownloadReportView
 
urlpatterns = [
    path("tags/",           CrimeTagListCreateView.as_view(), name="tag-list"),
    path("tags/<int:pk>/",  CrimeTagDetailView.as_view(),     name="tag-detail"),
 
    path("",                ComplaintListCreateView.as_view(),   name="complaint-list"),
    path("<int:pk>/",       ComplaintDetailView.as_view(),       name="complaint-detail"),
 
    path("flagged/",        FlaggedComplaintListView.as_view(),        name="complaint-flagged"),
    path("<int:pk>/status/",ComplaintStatusUpdateView.as_view(),       name="complaint-status"),
 
    path("<int:pk>/comments/", ComplaintCommentCreateView.as_view(),   name="complaint-comment"),
 
    path("<int:pk>/report/generate/", GenerateReportView.as_view(),    name="report-generate"),
    path("<int:pk>/report/download/", DownloadReportView.as_view(),    name="report-download"),

    path('dashboard/stats/', DashboardStatsView.as_view(), name='dashboard-stats'),
]
 
