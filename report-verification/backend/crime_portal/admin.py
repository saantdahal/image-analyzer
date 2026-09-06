from django.contrib import admin
from crime_portal.models.complaint import Complaint, ComplaintComment, CrimeTag
from crime_portal.models.complaint_report import ComplaintReport

# Register your models here.
admin.site.register(ComplaintReport)
admin.site.register(CrimeTag)
admin.site.register(ComplaintComment)

@admin.register(Complaint)
class ComplaintAdmin(admin.ModelAdmin):
    ...
    def save_model(self, request, obj, form, change):
        if change and 'evidence_image' in form.changed_data:
            obj.ai_model_version = ''
            obj.ai_flagged = None
            obj.ai_is_fake = None
            obj.ai_confidence = None
        super().save_model(request, obj, form, change)