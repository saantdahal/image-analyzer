from rest_framework import serializers
from crime_portal.models import CrimeTag, Complaint, ComplaintComment
 
class CrimeTagSerializer(serializers.ModelSerializer):
    class Meta:
        model = CrimeTag
        fields = ["id", "name", "slug", "color_hex", "created_at"]
        read_only_fields = ["id", "slug", "created_at"]
 
    def create(self, validated_data):
        from django.utils.text import slugify
        validated_data["slug"] = slugify(validated_data["name"])
        return super().create(validated_data)
 
 
class ComplaintCommentSerializer(serializers.ModelSerializer):
    author_name = serializers.SerializerMethodField()
 
    class Meta:
        model = ComplaintComment
        fields = ["id", "complaint", "author", "author_name", "body", "is_admin_note", "created_at"]
        read_only_fields = ["id", "author", "is_admin_note", "created_at"]
 
    def get_author_name(self, obj):
        complaint = obj.complaint
        if complaint.is_anonymous and not obj.is_admin_note:
            return "Anonymous"
        return obj.author.get_full_name() or obj.author.email
 
 
class ComplaintListSerializer(serializers.ModelSerializer):
    tags = CrimeTagSerializer(many=True, read_only=True)
    filed_by = serializers.SerializerMethodField()
 
    class Meta:
        model = Complaint
        fields = [
            "id", "title", "status", "tags", "ai_flagged",
            "is_anonymous", "crime_location", "filed_by", "created_at",
            "incident_date",
        ]
 
    def get_filed_by(self, obj):
        if obj.is_anonymous:
            return f"Anonymous #{obj.id:04d}"
        return obj.user.get_full_name() or obj.user.email
 
 
class ComplaintDetailSerializer(serializers.ModelSerializer):
    tags = CrimeTagSerializer(many=True, read_only=True)
    tag_ids = serializers.PrimaryKeyRelatedField(
        queryset=CrimeTag.objects.all(),
        many=True,
        write_only=True,
        source="tags",
        required=False,
    )
    comments = ComplaintCommentSerializer(many=True, read_only=True)
    filed_by = serializers.SerializerMethodField()
    evidence_image_url = serializers.SerializerMethodField()
    ai_heatmap_url = serializers.SerializerMethodField()
    report_available = serializers.SerializerMethodField()
 
    class Meta:
        model = Complaint
        fields = [
            "id",
            "title",
            "description",
            "status",
            "tags",
            "tag_ids",

            "victim_first_name",
            "victim_middle_name",
            "victim_last_name",
            "victim_phone_number",
            
            

            "is_anonymous",
            "is_self_accused",
            "perpetrator_first_name",
            "crime_location",

            "evidence_image",
            "evidence_image_url",

            "ai_flagged",
            "ai_confidence",
            "ai_is_fake",
            "ai_heatmap_url",
            "ai_model_version",
            "ai_lbp_score",
            "ai_verdict",
            "ai_recommended_decision",

            "filed_by",
            "created_at",
            "modified_at",

            "comments",
            "report_available",
            "incident_date",
            
        ]
        read_only_fields = [
            "id", "status", "ai_flagged", "ai_confidence", "ai_is_fake",
            "ai_heatmap_url", "ai_model_version", "filed_by",
            "created_at", "modified_at", "comments", "report_available",
        ]
        extra_kwargs = {
            "evidence_image": {"write_only": True, "required": False},
        }
        
    def get_filed_by(self, obj):
        if obj.is_anonymous:
            return {
                "is_anonymous": True,
                "display_name": f"Anonymous #{obj.id:04d}",
            }
        user = obj.user
        return {
            "is_anonymous": False,
            "id": user.id,
            "first_name": user.first_name,
            "middle_name": user.middle_name,
            "last_name": user.last_name,
            "email": user.email,
            "phone_number": getattr(user, "phone_number", None),  # if your User model has this
            "display_name": user.get_full_name() or user.email,
        }
 
    def get_evidence_image_url(self, obj):
        request = self.context.get("request")
        if obj.evidence_image and request:
            return request.build_absolute_uri(obj.evidence_image.url)
        return None
 
    def get_ai_heatmap_url(self, obj):
        request = self.context.get("request")
        if obj.ai_heatmap and request:
            return request.build_absolute_uri(obj.ai_heatmap.url)
        return None
 
    def get_report_available(self, obj):
        return hasattr(obj, "report") and bool(obj.report.pdf_file)
    
    def to_representation(self, instance):
        data = super().to_representation(instance)

        return {
            "id":             data["id"],
            "title":          data["title"],
            "description":    data["description"],
            "status":         data["status"],
            "tags":           data["tags"],
            "incident_date":  data["incident_date"],
            "created_at":     data["created_at"],
            "modified_at":    data["modified_at"],
            "report_available": data["report_available"],
            "is_anonymous":   data["is_anonymous"],

            "victim": {
                "victim_first_name":              data["victim_first_name"],
                "victim_middle_name":              data["victim_middle_name"],
                "victim_last_name":              data["victim_last_name"],
                "phone_number":      data.get("victim_phone_number"),
                "is_self_accused":   data["is_self_accused"],
            },

            "suspect": {
                "name":          data["perpetrator_first_name"],
                "crime_location": data["crime_location"],
            },

            "evidence": {
                "image_url":  data["evidence_image_url"],
            },

            "ai_analysis": {
                "flagged":              data["ai_flagged"],
                "confidence":           data["ai_confidence"],
                "is_fake":              data["ai_is_fake"],
                "heatmap_url":          data["ai_heatmap_url"],
                "model_version":        data["ai_model_version"],
                "lbp_score":            data["ai_lbp_score"],
                "verdict":              data["ai_verdict"],
                "recommended_decision": data["ai_recommended_decision"],
            },

            "reporter": data["filed_by"],
            "comments": data["comments"],
        }
 
    def create(self, validated_data):
        tags = validated_data.pop("tags", [])
        complaint = Complaint.objects.create(**validated_data)
        complaint.tags.set(tags)
        return complaint
 
    def update(self, instance, validated_data):
        tags = validated_data.pop("tags", None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        if tags is not None:
            instance.tags.set(tags)
        return instance

 
class ComplaintStatusUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Complaint
        fields = ["status"]
 
    def validate_status(self, value):
        allowed = [c[0] for c in Complaint.Status.choices]
        if value not in allowed:
            raise serializers.ValidationError(f"Status must be one of: {allowed}")
        return value
 

class AdminCommentSerializer(serializers.ModelSerializer):
    class Meta:
        model = ComplaintComment
        fields = ["id", "body", "created_at"]
        read_only_fields = ["id", "created_at"]