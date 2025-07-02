window.onscroll = function() {
    var navbar = document.querySelector('.navbar');
    if (window.scrollY > 0) {
        navbar.classList.add('fixed-top');  // Fix navbar to the top
    } else {
        navbar.classList.remove('fixed-top');  // Remove fixed navbar when at the top
    }
};

window.onload = function() {
    setTimeout(() => {
        document.getElementById('curtain').classList.add('slide-up'); // Slide the entire curtain up

        setTimeout(() => {
            document.getElementById('curtain').style.display = 'none'; // Hide the curtain

            // Start Navbar Drunk Effect (with delays)
            document.querySelectorAll('.animated-drunk').forEach((item, index) => {
                setTimeout(() => {
                    item.style.opacity = "1";
                    item.style.animation = "drunkMove 1s ease-out forwards";
                }, (index + 1) * 200); // 200ms delay between each navbar item
            });

            // Start Text Slide Animation (with delays)
            document.querySelectorAll('.animated-slide').forEach((item, index) => {
                setTimeout(() => {
                    item.style.opacity = "1";
                    item.style.animation = "slideUp 1s ease-out forwards";
                }, (index + 1) * 300); // 300ms delay between each word
            });

            // Start Developer Images Sliding In (with delays)
            document.querySelectorAll('.developer-img').forEach((item, index) => {
                setTimeout(() => {
                    item.style.opacity = "1";
                    item.style.animation = "slideInLeft 1s ease-out forwards";
                }, (index + 1) * 400); // 400ms delay between each image
            });

            // Start Developer Info Text Sliding In (with delays)
            document.querySelectorAll('.info-div p').forEach((item, index) => {
                setTimeout(() => {
                    item.style.opacity = "1";
                    item.style.animation = "slideInBottom 1s ease-out forwards";
                }, (index + 1) * 500); // 500ms delay between each paragraph
            });

        }, 2000); // Delay before revealing the content
    }, 2000); // Curtain stays for 2s before sliding up
};

setTimeout(() => {
    document.body.classList.add('curtain-hidden'); // Adds class after the curtain is gone
}, 4000); // Adjust timing based on your curtain animation duration

  // JavaScript function to toggle the "expanded" class
  function toggleExpand(element) {
    element.classList.toggle("expanded");
}

document.getElementById('battery-form').addEventListener('submit', function(event) {
    event.preventDefault();

    // 📥 Collect form inputs
    let formData = {
        "Model_Year": parseInt(document.getElementById('model-year').value),
        "Motor_(kW)": parseFloat(document.getElementById('motor-power').value),
        "Range_(km)": parseFloat(document.getElementById('range').value),
        "terminal_voltage": parseFloat(document.getElementById('voltage').value),
        "terminal_current": parseFloat(document.getElementById('current').value),
        "temperature": parseFloat(document.getElementById('temperature').value),
        "charge_current": parseFloat(document.getElementById('charge-current').value),
        "charge_voltage": parseFloat(document.getElementById('charge-voltage').value),
        "capacity": parseFloat(document.getElementById('capacity').value),
        "cycle": parseInt(document.getElementById('cycle').value)
    };

    // 🚀 Send data to Django API
    fetch('/battery/predict-soh/', {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
    })
    .then(response => response.json())
    .then(data => {
        console.log("🔹 RESPONSE RECEIVED:", data);

        if (data.predicted_soh !== undefined) {
            let soh = (data.predicted_soh * 100).toFixed(2); // Convert to percentage
            document.getElementById("soh-result").innerHTML = `<strong>${soh}%</strong>`;
            document.getElementById("soh-result-container").style.display = "block";
            // ✅ FIX: Ensure "Download Report" is displayed
        document.getElementById("download-report-container").style.display = "block";

            // 🛠 Declare variables once (REMOVE DUPLICATE DECLARATIONS)
            let chargeVoltage = parseFloat(document.getElementById("charge-voltage").value) || 0;
            let chargeCurrent = parseFloat(document.getElementById("charge-current").value) || 0;
            let temperature = parseFloat(document.getElementById("temperature").value) || 25;
            let terminalVoltage = parseFloat(document.getElementById("voltage").value) || 0;
            let terminalCurrent = parseFloat(document.getElementById("current").value) || 0;
            let capacity = parseFloat(document.getElementById("capacity").value) || 0;
            let cycleCount = parseInt(document.getElementById("cycle").value) || 0;
            let rangeKm = parseFloat(document.getElementById("range").value) || 0;

            // ⚡ Fast-Charging Suitability
            let isFastChargeCapable = " Not Suitable";
            let color = "red";
            if (soh >= 80 && chargeVoltage >= 400 && chargeCurrent >= 50 && (temperature >= 15 && temperature <= 45)) {
                isFastChargeCapable = " Suitable for Fast Charging";
                color = "green";
            } else if (soh >= 70 && chargeVoltage >= 350 && chargeCurrent >= 40 && (temperature >= 10 && temperature <= 50)) {
                isFastChargeCapable = "Partially Suitable (Monitor Temperature)";
                color = "orange";
            }
            document.getElementById("fast-charging-status").innerText = isFastChargeCapable;
            document.getElementById("fast-charging-status").style.color = color;
            document.getElementById("fast-charging-container").style.display = "block";

            // 🌍 Carbon Footprint Reduction Calculation
            let fuelEfficiency = 8; 
            let carbonPerLiter = 2.31; 
            let evEfficiency = 15; 
            let gridCarbonFactor = 0.4; 
            let fuelCarbon = (rangeKm / 100) * fuelEfficiency * carbonPerLiter;
            let evCarbon = (rangeKm / 100) * evEfficiency * gridCarbonFactor;
            let carbonReduction = ((fuelCarbon - evCarbon) / fuelCarbon * 100).toFixed(2);
            document.getElementById("carbon-footprint").innerText = carbonReduction;
            document.getElementById("carbon-footprint-container").style.display = "block";

         




            // 🔋 Self-Discharge Rate
            let baseDischargeRate = 0.05; 
            let selfDischargeRate = (baseDischargeRate * Math.exp(0.05 * (temperature - 25))).toFixed(3);
            selfDischargeRate = Math.min(selfDischargeRate, 0.5);
            selfDischargeRate = Math.max(selfDischargeRate, 0.01);
            document.getElementById("self-discharge").innerText = selfDischargeRate;
            document.getElementById("self-discharge-container").style.display = "block";

            // 🚨 Battery Risk Assessment
            let chargePower = chargeVoltage * chargeCurrent;
            let dischargePower = terminalVoltage * terminalCurrent;
            let imbalance = Math.abs(chargePower - dischargePower);
            let batteryRisk = "Safe";
            if (soh < 60 || temperature > 50 || imbalance > chargePower * 0.3) {
                batteryRisk = "🚨 Danger!";
            } else if (soh < 75 || temperature > 40 || imbalance > chargePower * 0.2) {
                batteryRisk = "⚠ Warning!";
            }
            document.getElementById("battery-risk").innerText = batteryRisk;
            document.getElementById("battery-risk").style.color = batteryRisk === "🚨 Danger!" ? "red" : batteryRisk === "⚠ Warning!" ? "orange" : "green";
            document.getElementById("battery-risk-container").style.display = "block";

            // ⚡ Battery Energy Storage Capacity
            let energyStorage = (capacity * terminalVoltage).toFixed(2);
            document.getElementById("battery-energy").innerText = energyStorage;
            document.getElementById("battery-energy-container").style.display = "block";

            // 🔢 Battery Performance Score
            let maxCycles = 1000;
            let performanceScore = (soh * (1 - (cycleCount / maxCycles))) / 1.2;
            performanceScore = Math.max(0, Math.round(performanceScore));
            document.getElementById("battery-score").innerText = performanceScore;
            document.getElementById("battery-score-container").style.display = "block";

            // 📌 Estimated Remaining Battery Life
            let degradationRate = 2.5;
            let remainingLife = (soh - 70) / degradationRate;
            remainingLife = remainingLife > 0 ? remainingLife.toFixed(1) : "End of Life";
            document.getElementById("battery-life").innerHTML = remainingLife;
            document.getElementById("battery-life-container").style.display = "block";





            // ⚠ Charge/Discharge Imbalance
            let imbalanceIndicator = imbalance > chargePower * 0.2 ? "⚠ Imbalance Detected!" : "Normal";
            document.getElementById("imbalance-indicator").innerText = imbalanceIndicator;
            document.getElementById("imbalance-indicator-container").style.display = "block";
       



        // ⚠ Charge/Discharge Imbalance Calculation
            
      

    
  

        if (imbalance > chargePower * 0.2) { // More than 20% difference
            imbalanceIndicator = "⚠ Imbalance Detected!";
        }

        // Display Charge/Discharge Imbalance Indicator
        document.getElementById("imbalance-indicator").innerText = imbalanceIndicator;
        document.getElementById("imbalance-indicator-container").style.display = "block";



             // 🔍 Determine battery condition
        let batteryCondition = "";
        let conditionStyle = "";

        if (soh >= 90) {
            batteryCondition = "Battery condition is good.";
            conditionStyle = "color: green; font-weight: bold;";
        } else if (soh >= 70) {
            batteryCondition = "Battery condition is average and may need replacement soon.";
            conditionStyle = "color: orange; font-weight: bold;";
        } else if (soh >= 60) {
            batteryCondition = "Battery condition is below average and needs replacement.";
            conditionStyle = "color: red; font-weight: bold;";
        } else {
            batteryCondition = "Battery needs urgent replacement.";
            conditionStyle = "color: darkred; font-weight: bold;";
        }

        // Update condition message
        let conditionElement = document.getElementById("battery-condition");
        if (conditionElement) {
            conditionElement.innerText = batteryCondition;
            conditionElement.style = conditionStyle;
            document.getElementById("battery-condition-container").style.display = "block"; // Show the div
        } else {
            console.error("❌ ERROR: 'battery-condition' element not found!");
        }

            // 🔍 Validate abnormal input features
            const thresholds = {
            "Model_Year": { min: 2012, max: 2025 },
            "Motor_(kW)": { min: 35, max: 829 },
            "Range_(km)": { min: 92, max: 837 },
            "terminal_voltage": { min: 3.0, max: 5.0 },
            "terminal_current": { min: -3, max: 1 },
            "temperature": { min: 20, max: 45 },
            "charge_current": { min: -2, max: 2 },
            "charge_voltage": { min: 0, max: 5 },
            "capacity": { min: 1.2, max: 2 },
            "cycle": { min: 1, max: 1000 }
            };


            let abnormalFeatures = [];
            for (const key in thresholds) {
                let value = formData[key];
                let { min, max } = thresholds[key];

                if (value < min || value > max) {
                    abnormalFeatures.push(`${key} (${value})`);
                }
            }

            const abnormalContainer = document.getElementById("abnormal-features");

            if (abnormalFeatures.length > 0) {
                abnormalContainer.innerHTML = `<strong>Abnormal Inputs:</strong><br> ${abnormalFeatures.join(', ')}`;
                abnormalContainer.style.display = "block";
            } else {
                abnormalContainer.innerHTML = "<strong>No abnormalities in input values.</strong>";
                abnormalContainer.style.display = "block";
            }



       

            // 📊 Histogram Chart
            const histogramCtx = document.getElementById('histogram').getContext('2d');
            new Chart(histogramCtx, {
                type: 'bar',
                data: {
                    labels: Object.keys(formData),
                    datasets: [{
                        label: 'Input Features',
                        data: Object.values(formData),
                        backgroundColor: 'rgba(54, 162, 235, 0.5)',
                        borderColor: 'rgba(54, 162, 235, 1)',
                        borderWidth: 1
                    }]
                },
                options: {
                    scales: { y: { beginAtZero: true } }
                }
            });

            // 🥧 Pie Chart
            const pieChartCtx = document.getElementById('pie-chart').getContext('2d');
            new Chart(pieChartCtx, {
                type: 'pie',
                data: {
                    labels: Object.keys(formData),
                    datasets: [{
                        data: Object.values(formData),
                        backgroundColor: [
                            'rgba(75, 192, 192, 0.7)', 'rgba(255, 99, 132, 0.7)', 'rgba(54, 162, 235, 0.7)',
                            'rgba(153, 102, 255, 0.7)', 'rgba(255, 159, 64, 0.7)', 'rgba(255, 205, 86, 0.7)',
                            'rgba(201, 203, 207, 0.7)', 'rgba(100, 149, 237, 0.7)', 'rgba(144, 238, 144, 0.7)',
                            'rgba(255, 140, 0, 0.7)'
                        ],
                        borderColor: 'rgba(0, 0, 0, 0.2)',
                        borderWidth: 2
                    }]
                },
                options: {
                    responsive: true,
                    plugins: {
                        legend: { position: 'top', labels: { font: { size: 14 } } },
                        tooltip: {
                            callbacks: {
                                label: function(tooltipItem) {
                                    let percentage = Math.round((tooltipItem.raw / Object.values(formData).reduce((acc, value) => acc + value, 0)) * 100);
                                    return tooltipItem.label + ': ' + percentage + '%';
                                }
                            }
                        }
                    }
                }
            });
        } else {
            console.error("❌ API ERROR:", data);
        }
    })
    .catch(error => {
        console.error("❌ FETCH ERROR:", error);
    });
});


document.getElementById('download-report').addEventListener('click', function() {
    // 📥 Get input values
    const modelYear = document.getElementById('model-year').value;
    const motorPower = document.getElementById('motor-power').value;
    const range = document.getElementById('range').value;
    const voltage = document.getElementById('voltage').value;
    const current = document.getElementById('current').value;
    const temperature = document.getElementById('temperature').value;
    const chargeCurrent = document.getElementById('charge-current').value;
    const chargeVoltage = document.getElementById('charge-voltage').value;
    const capacity = document.getElementById('capacity').value;
    const cycle = document.getElementById('cycle').value;

    // 📊 Get prediction results
    const sohResult = document.getElementById('soh-result').textContent;
    const batteryCondition = document.getElementById('battery-condition').textContent;
    const batteryLife = document.getElementById('battery-life').textContent;
    const batteryScore = document.getElementById('battery-score').textContent;
    const imbalanceIndicator = document.getElementById('imbalance-indicator').textContent;
    const batteryRisk = document.getElementById('battery-risk').textContent;
    const batteryEnergy = document.getElementById('battery-energy').textContent;
    const selfDischarge = document.getElementById('self-discharge').textContent;
    const carbonFootprint = document.getElementById('carbon-footprint').textContent;
    const fastCharging = document.getElementById('fast-charging-status').textContent;

    // 🚨 Get abnormal feature warnings
    let abnormalText = document.getElementById('abnormal-features').textContent.trim() || "No abnormalities in input values.";

    // 📄 Create a new jsPDF instance
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    // 🎯 Add centered title
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text('Battery SOH Prediction Report', doc.internal.pageSize.width / 2, 20, { align: 'center' });

    // 🔹 Define initial text position
    let yPosition = 30;
    const lineSpacing = 10;

    // 📝 Add input values
    doc.setFont("helvetica", "normal");
    doc.setFontSize(12);
    doc.text(`Model Year: ${modelYear}`, 20, yPosition); yPosition += lineSpacing;
    doc.text(`Motor Power (kW): ${motorPower}`, 20, yPosition); yPosition += lineSpacing;
    doc.text(`Range (km): ${range}`, 20, yPosition); yPosition += lineSpacing;
    doc.text(`Terminal Voltage (V): ${voltage}`, 20, yPosition); yPosition += lineSpacing;
    doc.text(`Terminal Current (A): ${current}`, 20, yPosition); yPosition += lineSpacing;
    doc.text(`Temperature (°C): ${temperature}`, 20, yPosition); yPosition += lineSpacing;
    doc.text(`Charge Current (A): ${chargeCurrent}`, 20, yPosition); yPosition += lineSpacing;
    doc.text(`Charge Voltage (V): ${chargeVoltage}`, 20, yPosition); yPosition += lineSpacing;
    doc.text(`Battery Capacity: ${capacity}`, 20, yPosition); yPosition += lineSpacing;
    doc.text(`Battery Cycle: ${cycle}`, 20, yPosition); yPosition += lineSpacing;

    // 📊 Add prediction results
    yPosition += 5;
    doc.setFont("helvetica", "bold");
    doc.text("Prediction Results:", 20, yPosition); 
    yPosition += lineSpacing;
    doc.setFont("helvetica", "normal");
    doc.text(`Predicted SOH: ${sohResult}`, 20, yPosition); yPosition += lineSpacing;
    doc.text(`Battery Condition: ${batteryCondition}`, 20, yPosition); yPosition += lineSpacing;
    doc.text(`Estimated Remaining Battery Life: ${batteryLife} years`, 20, yPosition); yPosition += lineSpacing;
    doc.text(`Battery Performance Score: ${batteryScore} / 100`, 20, yPosition); yPosition += lineSpacing;
    doc.text(`Charge/Discharge Imbalance: ${imbalanceIndicator}`, 20, yPosition); yPosition += lineSpacing;
    doc.text(`Battery Risk Assessment: ${batteryRisk}`, 20, yPosition); yPosition += lineSpacing;
    doc.text(`Battery Energy Storage Capacity: ${batteryEnergy} Wh`, 20, yPosition); yPosition += lineSpacing;
    doc.text(`Self-Discharge Rate: ${selfDischarge} % per day`, 20, yPosition); yPosition += lineSpacing;
    doc.text(`Carbon Footprint Reduction: ${carbonFootprint} %`, 20, yPosition); yPosition += lineSpacing;
    doc.text(`Fast-Charging Suitability: ${fastCharging}`, 20, yPosition); yPosition += lineSpacing;

    // 🚨 Add "Abnormal Inputs" section (only if abnormalities exist)
    yPosition += 5;
    doc.setFont("helvetica", "bold");
    doc.text("Abnormal Inputs:", 20, yPosition);
    yPosition += lineSpacing;
    doc.setFont("helvetica", "normal");

    // Wrap long text to fit the PDF
    const splitAbnormalText = doc.splitTextToSize(abnormalText, 170);
    doc.text(splitAbnormalText, 20, yPosition);
    yPosition += splitAbnormalText.length * lineSpacing;

    // 📄 Create a new page for charts
    doc.addPage();

    // 📊 Title for the "Charts" section
    const titleGap = 20;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.text('Charts', doc.internal.pageSize.width / 2, titleGap, { align: 'center' });

    // 🎨 Underline the "Charts" title
    const textWidth = doc.getTextWidth('Charts');
    const textX = (doc.internal.pageSize.width / 2) - (textWidth / 2);
    doc.setLineWidth(0.8);
    doc.line(textX, titleGap + 2, textX + textWidth, titleGap + 2);

    // 📊 Define chart sizes
    const histogramSize = { width: 180, height: 100 };
    const pieChartSize = { width: 180, height: 80 };
    const topMargin = titleGap + 30;
    const marginBetween = 30;

    // 📈 Add Histogram Chart
    const histogramImg = document.getElementById('histogram').toDataURL('image/png');
    doc.addImage(histogramImg, 'PNG', 15, topMargin, histogramSize.width, histogramSize.height);

    // 🥧 Add Pie Chart
    const pieChartImg = document.getElementById('pie-chart').toDataURL('image/png');
    doc.addImage(
        pieChartImg,
        'PNG',
        25,
        topMargin + histogramSize.height + marginBetween,
        pieChartSize.width,
        pieChartSize.height
    );

    // 💾 Save the PDF report
    doc.save('soh_report.pdf');
});
function openImage() {
    var modal = document.getElementById('imageModal');
    var image = document.getElementById('batteryImage');
    var modalImage = document.getElementById('modalImage');
    modal.style.display = 'flex';
    modalImage.src = image.src;
}

function closeImage() {
    var modal = document.getElementById('imageModal');
    modal.style.display = 'none';
}

function openImage1() {
    var modal = document.getElementById('imageModal1');
    var image = document.getElementById('batteryImage1');
    var modalImage = document.getElementById('modalImage1');
    modal.style.display = 'flex';
    modalImage.src = image.src;
}

function closeImage1() {
    var modal = document.getElementById('imageModal1');
    modal.style.display = 'none';
}
// Close the modal when the Escape key is pressed
document.addEventListener('keydown', function(event) {
    if (event.key === "Escape") {
        closeImage();
    }
});
