from django.urls import path
from django.contrib.auth import views as auth_views
from .views import user_login, user_register, user_logout, send_otp, verify_otp

urlpatterns = [
    # User authentication URLs
    path("login/", user_login, name="login"),
    path("register/", user_register, name="register"),
    path("logout/", user_logout, name="logout"),

    # OTP-based password reset
    path("password-reset/", send_otp, name="password_reset"),  # Sends OTP
    path("verify-otp/", verify_otp, name="verify_otp"),  # Verifies OTP and resets password

    # Default Django password reset views
    path(
        "password-reset/done/",
        auth_views.PasswordResetDoneView.as_view(template_name="auth_app/password_reset_done.html"),
        name="password_reset_done",
    ),
    path(
        "password-reset-confirm/<uidb64>/<token>/",
        auth_views.PasswordResetConfirmView.as_view(template_name="auth_app/password_reset_confirm.html"),
        name="password_reset_confirm",
    ),
    path(
        "password-reset-complete/",
        auth_views.PasswordResetCompleteView.as_view(template_name="auth_app/password_reset_complete.html"),
        name="password_reset_complete",
    ),
]
