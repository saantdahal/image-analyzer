import os
import logging
from django.conf import settings
from django.template.loader import render_to_string
 
logger = logging.getLogger(__name__)
 
 
class ReportGenerationMixin:
    """
    Mixin for Django models that generate downloadable PDF reports.
 
    Usage
    -----
    class ComplaintReport(BaseModel, ReportGenerationMixin):
        report_template_name = "reports/complaint_report.html"
        report_upload_path   = "reports"
 
        def get_report_context(self):
            return {"complaint": self.complaint, "report": self}
 
        @property
        def report_filename(self):
            return f"complaint_report_{self.complaint_id}.pdf"
 
    Then call:  report_instance.generate_pdf()
    The PDF is written to MEDIA_ROOT/<report_upload_path>/<report_filename>
    and self.pdf_file is updated automatically.
    """
 
    report_template_name: str = ""
    report_upload_path: str = "reports"
 
    @property
    def report_filename(self) -> str:
        raise NotImplementedError("Define report_filename as a property on your model.")
 
    def get_report_context(self, for_admin: bool = False) -> dict:
        context = {
            "complaint": self.complaint,
            "status": self.complaint.status,
            "for_admin": for_admin,
        }
        if for_admin:
            context.update({
                "investigator_notes": self.complaint.investigator_notes,
                "reporter_contact": self.complaint.user.email,
                "internal_flags": self.complaint.internal_flags,
            })
        return context

    def generate_pdf(self, for_admin: bool = False, persist: bool = True):
        """
        Renders the template to PDF.
        If persist=True, writes to disk and updates self.pdf_file (legacy behavior).
        If persist=False, returns raw PDF bytes without touching the database or disk —
        used when content varies by viewer and shouldn't be cached under one shared file.
        """
        try:
            from weasyprint import HTML
        except ImportError:
            raise RuntimeError(
                "WeasyPrint is not installed. Run: pip install weasyprint"
            )

        context = self.get_report_context(for_admin=for_admin)
        html_string = render_to_string("complaint_report.html", context)
        base_url = getattr(settings, "BASE_DIR", None)

        if not persist:
            return HTML(string=html_string, base_url=str(base_url)).write_pdf()

        relative_path = os.path.join(self.report_upload_path, self.report_filename)
        absolute_path = os.path.join(settings.MEDIA_ROOT, relative_path)
        os.makedirs(os.path.dirname(absolute_path), exist_ok=True)

        HTML(string=html_string, base_url=str(base_url)).write_pdf(absolute_path)

        self.pdf_file = relative_path
        self.save(update_fields=["pdf_file", "modified_at"])

        logger.info("PDF generated: %s", absolute_path)
        return relative_path