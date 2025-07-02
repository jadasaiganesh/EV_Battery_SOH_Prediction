from django.shortcuts import render, redirect
from django.contrib.auth.models import User
from django.contrib.auth import authenticate, login, logout
from django.contrib import messages
import random
from django.core.mail import send_mail
from django.conf import settings

# Temporary dictionary to store OTPs (Use a database model in production)
otp_storage = {}

# User Registration View
def user_register(request):
    if request.method == "POST":
        username = request.POST["username"]
        email = request.POST["email"]
        password = request.POST["password"]
        confirm_password = request.POST["confirm_password"]

        if password == confirm_password:
            if User.objects.filter(username=username).exists():
                messages.error(request, "Username already exists.")
            elif User.objects.filter(email=email).exists():
                messages.error(request, "Email already registered.")
            else:
                user = User.objects.create_user(username=username, email=email, password=password)
                user.save()
                messages.success(request, "Registration successful! You can now log in.")
                return redirect("login")
        else:
            messages.error(request, "Passwords do not match.")

    return render(request, "auth_app/register.html")


# User Login View
def user_login(request):
    if request.method == "POST":
        username = request.POST["username"]
        password = request.POST["password"]
        user = authenticate(request, username=username, password=password)

        if user is not None:
            login(request, user)
            return redirect("deployment_page")  # Ensure this matches urls.py
        else:
            messages.error(request, "Invalid username or password.")

    return render(request, "auth_app/login.html")


# User Logout View
def user_logout(request):
    logout(request)
    return redirect("login")  # Redirect to login page after logout


import random
from django.conf import settings
from django.core.mail import send_mail
from django.contrib import messages
from django.contrib.auth.models import User
from django.shortcuts import render, redirect

# Store OTPs temporarily (you may use cache or DB in production)
otp_storage = {}

def send_otp(request):
    if request.method == "POST":
        email = request.POST.get("email")
        user = User.objects.filter(email=email).first()

        if user:
            otp = random.randint(100000, 999999)
            otp_storage[email] = otp

            # Professional email content
            subject = "Password Reset Verification Code"
            message = (
                f"Dear {user.username},\n\n"
                f"Your One-Time Password (OTP) for resetting your account password is:\n\n"
                f"🔐 OTP: {otp}\n\n"
                f"Please enter this code within the next 10 minutes to proceed with the password reset process.\n\n"
                f"If you did not request a password reset, please ignore this message.\n\n"
                f"Thank you,\n"
                f"EV Health Prediction Team"
            )

            send_mail(
                subject,
                message,
                settings.EMAIL_HOST_USER,
                [email],
                fail_silently=False,
            )

            messages.success(request, "A verification code has been sent to your email.")
            return redirect("verify_otp")
        else:
            messages.error(request, "This email is not registered in our system.")

    return render(request, "auth_app/password_reset.html")



# Verify OTP and Reset Password
def verify_otp(request):
    if request.method == "POST":
        email = request.POST.get("email")
        entered_otp = request.POST.get("otp")
        new_password = request.POST.get("new_password")
        
        if email in otp_storage and otp_storage[email] == int(entered_otp):
            user = User.objects.filter(email=email).first()
            if user:
                user.set_password(new_password)  # Update password
                user.save()
                del otp_storage[email]  # Remove OTP after successful reset
                messages.success(request, "Password reset successful. You can now log in.")
                return redirect("login")  # Redirect to login page
            else:
                messages.error(request, "User not found.")
        else:
            messages.error(request, "Invalid OTP. Please try again.")

    return render(request, "auth_app/verify_otp.html")
