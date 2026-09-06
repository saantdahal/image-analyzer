from django.db import migrations

TAGS = [
    ("Financial Fraud", "financial-fraud", "#ef4444"),
    ("Hacking", "hacking", "#6366f1"),
    ("Cyberbullying", "cyberbullying", "#f59e0b"),
    ("Identity Theft", "identity-theft", "#8b5cf6"),
    ("Phising", "phising", "#f59e0b"),
    ("Ransomware", "ransomware","#f59e0b"),
    ("Malware","malware","#f59e0b"),
    ("Data Breaches","data-breaches", "#f59e0b"),
]

def seed(apps, schema_editor):
    CrimeTag = apps.get_model('crime_portal', 'CrimeTag')
    for name, slug, color in TAGS:
        CrimeTag.objects.get_or_create(slug=slug, defaults={"name": name, "color_hex": color})

class Migration(migrations.Migration):
    dependencies = [('crime_portal', '0005_rename_perpetrator_name_complaint_perpetrator_first_name_and_more')]
    operations = [migrations.RunPython(seed, migrations.RunPython.noop)]