from django.apps import AppConfig


class CrimePortalConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = 'crime_portal'

    def ready(self):
        import crime_portal.signals
