import os
import json
import numpy as np
import joblib
import traceback
from django.shortcuts import render
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth.decorators import login_required

# ✅ Define Model Path
MODEL_PATH = r"F:\ev_battery\ev_django\battery_health\models\lgbm_soh_model.pkl"


# ✅ Load LightGBM Model
try:
    lgbm_model = joblib.load(MODEL_PATH)
    print("✅ LightGBM Model Loaded Successfully")
except Exception as e:
    print(f"❌ ERROR Loading Model: {e}")
    lgbm_model = None  # Prevent using an invalid model

# ✅ Define expected input features (from your dataset)
EXPECTED_FEATURES = [
    "Model_Year", "Motor_(kW)", "Range_(km)", "terminal_voltage", 
    "terminal_current", "temperature", "charge_current", 
    "charge_voltage", "capacity", "cycle"
]

# ✅ Deployment Page (Protected)
@login_required(login_url='/auth/login/')
def deployment_page(request):
    return render(request, "deployment.html")

# ✅ SOH Prediction API
@csrf_exempt
@login_required(login_url='/auth/login/')
def predict_soh_api(request):
    if request.method == 'POST':
        if lgbm_model is None:
            return JsonResponse({"error": "Model not loaded correctly"}, status=500)

        try:
            # 📥 Parse JSON request
            data = json.loads(request.body.decode('utf-8'))
            print("📥 DEBUG: Received Data:", data)

            # 🔍 Check for missing features
            missing_features = [f for f in EXPECTED_FEATURES if f not in data]
            if missing_features:
                print(f"❌ DEBUG: Missing Features - {missing_features}")
                return JsonResponse({"error": f"Missing features: {missing_features}"}, status=400)

            # 🧩 Convert Inputs to Float & Reshape
            input_vector = np.array([float(data[feature]) for feature in EXPECTED_FEATURES]).reshape(1, -1)

            # ✅ Ensure proper data type conversion
            input_vector = input_vector.astype(np.float32)

            # ✅ Debugging Input Shape
            print(f"📊 DEBUG: Input Shape: {input_vector.shape}")
            print(f"📊 DEBUG: Model expects shape: {lgbm_model.n_features_in_}")

            # 🚀 Get prediction from LightGBM model
            predicted_soh = lgbm_model.predict(input_vector)[0]

            return JsonResponse({"predicted_soh": float(predicted_soh)})  # ✅ Ensure JSON serializable format

        except Exception as e:
            error_details = traceback.format_exc()
            print(f"❌ SERVER ERROR: {error_details}")
            return JsonResponse({"error": f"Server Error: {str(e)}"}, status=500)

    return JsonResponse({"error": "Invalid request method"}, status=400)
