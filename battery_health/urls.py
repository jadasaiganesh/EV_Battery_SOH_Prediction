
from django.urls import path
from .views import deployment_page, predict_soh_api  # Import predict_soh_api

urlpatterns = [
    path('deployment/', deployment_page, name='deployment_page'),
    path('predict-soh/', predict_soh_api, name='predict_soh_api'),  # This must exist!
]

