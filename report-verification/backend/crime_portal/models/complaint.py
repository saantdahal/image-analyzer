from django.db import models
from core.models import BaseModel  
from detection.models.detect import DetectionResult

class AIVerdict(models.TextChoices):
    AUTHENTIC          = 'authentic',           'Authentic'
    LIKELY_MANIPULATED = 'likely_manipulated',  'Likely Manipulated'
    FAKE               = 'fake',                'Fake'
    INCONCLUSIVE       = 'inconclusive',        'Inconclusive'

class RecommendedDecision(models.TextChoices):
    NO_ACTION              = 'no_action',              'No Action Required'
    FURTHER_REVIEW         = 'further_review',         'Further Review Recommended'
    ESCALATE               = 'escalate',               'Escalate to Investigator'
    REFER_FOR_PROSECUTION  = 'refer_for_prosecution',  'Refer for Prosecution'

class CrimeTag(BaseModel):
    name = models.CharField(max_length=100, unique=True)
    slug = models.SlugField(unique=True)
    color_hex = models.CharField(max_length=7, default='#6366f1')  

    def __str__(self):
        return self.name

class Complaint(BaseModel):
    detection_result = models.OneToOneField(
        DetectionResult,
        on_delete=models.SET_NULL,
        null=True, blank=True,
        related_name='complaint'
    )
    class Status(models.TextChoices):
        PENDING   = 'pending',   'Pending'
        ONGOING   = 'ongoing',   'Ongoing'
        APPROVED   = 'approved',   'Approved'
        REJECTED = 'rejected', 'Rejected'
        FAILED    = 'failed',    'Failed'

    user   = models.ForeignKey('users.User', on_delete=models.CASCADE, related_name='complaints')
    title  = models.CharField(max_length=255)
    description = models.TextField()
    tags   = models.ManyToManyField(CrimeTag, blank=True, related_name='complaints')

    status = models.CharField(max_length=20, choices=Status.choices, default=Status.PENDING)

    is_anonymous   = models.BooleanField(default=False)
    is_self_accused = models.BooleanField(default=False)  
    perpetrator_first_name = models.CharField(max_length=255, blank=True)
    perpetrator_middle_name = models.CharField(max_length=255, blank=True)
    perpetrator_last_name = models.CharField(max_length=255, blank=True)
    victim_first_name  = models.CharField(max_length=255, blank=True)
    victim_middle_name = models.CharField(max_length=255, blank=True)
    victim_last_name = models.CharField(max_length=255, blank=True)
    victim_phone_number  = models.CharField(max_length=20, blank=True)
    incident_date        = models.DateField(null=True, blank=True)

    crime_location = models.CharField(
        max_length=500,
        blank=True,
        help_text='Physical address OR name of digital platform where the crime occurred'
    )

    evidence_image = models.ImageField(upload_to='evidence/', null=True, blank=True)

    ai_flagged       = models.BooleanField(null=True, blank=True)
    ai_confidence    = models.FloatField(null=True, blank=True)
    ai_is_fake       = models.BooleanField(null=True, blank=True)
    ai_heatmap       = models.ImageField(upload_to='heatmaps/', null=True, blank=True)
    ai_model_version = models.CharField(max_length=50, blank=True)
    ai_lbp_score         = models.FloatField(null=True, blank=True)
    ai_verdict           = models.CharField(max_length=30, choices=AIVerdict.choices,
                               blank=True)
    ai_recommended_decision = models.CharField(max_length=30,
                                   choices=RecommendedDecision.choices, blank=True)

    def __str__(self):
        return f'[{self.status}] {self.title}'
    
    @property
    def victim_name(self):
            return " ".join(
                name for name in [
                    self.victim_first_name,
                    self.victim_middle_name,
                    self.victim_last_name,
                ]
                if name
            )
    
    @property
    def perpetrator_name(self):
            return " ".join(
                name for name in [
                    self.perpetrator_first_name,
                    self.perpetrator_middle_name,
                    self.perpetrator_last_name,
                ]
                if name
            )


class ComplaintComment(BaseModel):
    complaint    = models.ForeignKey(Complaint, on_delete=models.CASCADE, related_name='comments')
    author       = models.ForeignKey('users.User', on_delete=models.CASCADE)
    body         = models.TextField()
    is_admin_note = models.BooleanField(default=False)  

    def __str__(self):
        return f'Comment on #{self.complaint_id} by {self.author}.'
    