from django.db import models
from core.models import BaseModel 
from crime_portal.models.complaint import Complaint
from core.utils.report_mixin import ReportGenerationMixin

class ComplaintReport(BaseModel, ReportGenerationMixin):
    report_template_name = "reports/complaint_report.html"
    report_upload_path   = "reports"

    complaint    = models.OneToOneField(Complaint, on_delete=models.CASCADE, related_name='report')
    pdf_file     = models.FileField(upload_to='reports/', null=True, blank=True)
    generated_by = models.ForeignKey('users.User', on_delete=models.SET_NULL, null=True)

    @property
    def report_filename(self):
        return f"complaint_report_{self.complaint_id}.pdf"
    
    def get_report_context(self, for_admin: bool = False) -> dict:
        import os
        from django.conf import settings
        from urllib.request import pathname2url

        def to_file_uri(relative_name):
            abs_path = os.path.join(settings.MEDIA_ROOT, relative_name)
            return 'file:///' + pathname2url(abs_path).lstrip('/')

        context = {
            "complaint": self.complaint,
            "report": self,
            "comments": self.complaint.comments.order_by("created_at"),
            "evidence_url": to_file_uri(self.complaint.evidence_image.name) if self.complaint.evidence_image else None,
            "heatmap_url": to_file_uri(self.complaint.ai_heatmap.name) if self.complaint.ai_heatmap else None,
            "for_admin": for_admin,
        }

        if for_admin:
            context.update({
                "investigator_notes": getattr(self.complaint, "investigator_notes", None),
                "reporter_contact": self.complaint.user.email if self.complaint.user else None,
                "internal_flags": getattr(self.complaint, "internal_flags", None),
            })

        return context
