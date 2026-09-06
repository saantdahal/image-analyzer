
from rest_framework.pagination import PageNumberPagination


class CustomPagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = "page_size"

    def get_page_size(self, request):
        try:
            size = int(request.query_params.get("page_size", self.page_size))
            if size in [5, 10, 15, 25]:
                return size
        except (TypeError, ValueError):
            pass

        return self.page_size
    