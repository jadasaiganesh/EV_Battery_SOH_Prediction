
from django.contrib import admin
from django.urls import path, include
from django.shortcuts import redirect
from battery_health.views import deployment_page  # ✅ Ensure correct import

# Redirect root '/' to the login page
def home_redirect(request):
    return redirect('login')

urlpatterns = [
    path('admin/', admin.site.urls),
    path('auth/', include('auth_app.urls')),  # ✅ Authentication routes
    path('battery/', include('battery_health.urls')),  # ✅ Include battery_health URLs
    path('deployment/', deployment_page, name='deployment_page'),  # ✅ Deployment page
    path('', home_redirect, name='home_redirect'),  # ✅ Redirect root to login
]
