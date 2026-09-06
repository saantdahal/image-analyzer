from rest_framework import status, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from django.shortcuts import get_object_or_404
from django.http import FileResponse
from crime_portal.permissions import IsAdmin
from crime_portal.models import Complaint, ComplaintReport
from crime_portal.serializers.complaint_report import ComplaintReportSerializer
from django.http import HttpResponse

class GenerateReportView(APIView):
    permission_classes = [IsAdmin]

    def post(self, request, pk):
        complaint = get_object_or_404(Complaint, pk=pk)
        report, _ = ComplaintReport.objects.get_or_create(
            complaint=complaint,
            defaults={"generated_by": request.user},
        )
        try:
            report.generate_pdf(for_admin=False, persist=True)
        except Exception as e:
            return Response(
                {"error": f"PDF generation failed: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )
        serializer = ComplaintReportSerializer(report, context={"request": request})
        return Response(serializer.data, status=status.HTTP_200_OK)


class DownloadReportView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, pk):
        complaint = get_object_or_404(Complaint, pk=pk)
        is_admin = request.user.is_admin
        if not (is_admin or complaint.user == request.user):
            return Response({"error": "Permission denied."}, status=status.HTTP_403_FORBIDDEN)

        if complaint.status not in ("approved", "rejected"):
            return Response(
                {"error": "Report is only available once the complaint has been approved or rejected."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        report, _ = ComplaintReport.objects.get_or_create(
            complaint=complaint,
            defaults={"generated_by": request.user},
        )

        try:
            pdf_bytes = report.generate_pdf(for_admin=is_admin, persist=False)
        except Exception as e:
            return Response(
                {"error": f"PDF generation failed: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

        response = HttpResponse(pdf_bytes, content_type="application/pdf")
        response["Content-Disposition"] = f'attachment; filename="complaint_report_{complaint.id}.pdf"'
        return response


# class DownloadReportView(APIView):
#     """
#     GET /complaints/<id>/report/download/  → owner or admin downloads the PDF
#     """
#     permission_classes = [permissions.IsAuthenticated]

#     def get(self, request, pk):
#         complaint = get_object_or_404(Complaint, pk=pk)
#         if not (request.user.is_admin or complaint.user == request.user):
#             return Response({"error": "Permission denied."}, status=status.HTTP_403_FORBIDDEN)

#         report = get_object_or_404(ComplaintReport, complaint=complaint)
#         if not report.pdf_file:
#             return Response({"error": "Report not yet generated."}, status=status.HTTP_404_NOT_FOUND)

#         return FileResponse(
#             report.pdf_file.open("rb"),
#             as_attachment=True,
#             filename=f"complaint_report_{complaint.id}.pdf",
#             content_type="application/pdf",
#         )