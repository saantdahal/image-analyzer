from rest_framework import serializers
from crime_portal.models import ComplaintReport

class ComplaintReportSerializer(serializers.ModelSerializer):
    pdf_url = serializers.SerializerMethodField()
 
    class Meta:
        model = ComplaintReport
        fields = ["id", "complaint", "pdf_url", "created_at"]
        read_only_fields = ["id", "complaint", "pdf_url", "created_at"]
 
    def get_pdf_url(self, obj):
        request = self.context.get("request")
        if obj.pdf_file and request:
            return request.build_absolute_uri(obj.pdf_file.url)
        return None
