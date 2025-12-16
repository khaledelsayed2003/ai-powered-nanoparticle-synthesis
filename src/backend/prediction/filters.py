import django_filters
from .models import MeanSizePrediction

class MeanSizePredictionFilter(django_filters.FilterSet):
    min_size = django_filters.NumberFilter(field_name="predicted_mean_size_nm", lookup_expr='gte')
    max_size = django_filters.NumberFilter(field_name="predicted_mean_size_nm", lookup_expr='lte')
    start_date = django_filters.DateFilter(field_name='created_at', lookup_expr='date__gte')
    end_date = django_filters.DateFilter(field_name='created_at', lookup_expr='date__lte')

    class Meta:
        model = MeanSizePrediction
        fields = ['min_size', 'max_size', 'start_date', 'end_date']
