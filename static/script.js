/* =====================================================
   DOM ELEMENT REFERENCES
===================================================== */

/* File upload */
const imageInput = document.getElementById("imageInput");
const uploadBtn = document.getElementById("uploadBtn");

/* Camera controls */
const cameraBtn = document.getElementById("cameraBtn");
const cameraContainer = document.getElementById("cameraContainer");
const captureBtn = document.getElementById("captureBtn");
const closeCameraBtn = document.getElementById("closeCameraBtn");

/* Media elements */
const video = document.getElementById("camera");
const canvas = document.getElementById("captureCanvas");
const ctx = canvas.getContext("2d");

/* UI output */
const loadingDiv = document.getElementById("loading");
const outputDiv = document.getElementById("output");
const outputImage = document.getElementById("outputImage");
const summaryText = document.getElementById("summaryText");
const severityBadge = document.getElementById("severityBadge");

/* User confirmation */
const confirmationBox = document.getElementById("confirmationBox");

/* Project info modal */
const projectInfoBtn = document.getElementById("projectInfoBtn");
const projectModal = document.getElementById("projectModal");
const projectModalOverlay = document.getElementById("projectModalOverlay");
const projectModalClose = document.getElementById("projectModalClose");

/* Camera stream reference */
let cameraStream = null;
let currentReportId = null;

function openProjectModal() {
    projectModal.classList.remove("d-none");
    projectModalOverlay.classList.remove("d-none");
}

function closeProjectModal() {
    projectModal.classList.add("d-none");
    projectModalOverlay.classList.add("d-none");
}

if (projectInfoBtn && projectModal && projectModalOverlay && projectModalClose) {
    projectInfoBtn.addEventListener("click", openProjectModal);
    projectModalOverlay.addEventListener("click", closeProjectModal);
    projectModalClose.addEventListener("click", closeProjectModal);

    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape" && !projectModal.classList.contains("d-none")) {
            closeProjectModal();
        }
    });
}


/* =====================================================
   IMAGE UPLOAD HANDLING
===================================================== */

/* Trigger hidden file input */
if (uploadBtn) {
    uploadBtn.onclick = () => imageInput.click();
}

/* Handle file selection */
if (imageInput) {
    imageInput.onchange = () => {
        const file = imageInput.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append("image", file);

        sendToServer(formData);
    };
}


/* =====================================================
   CAMERA CAPTURE FLOW
===================================================== */

/* Open camera */
if (cameraBtn) {
    cameraBtn.onclick = () => {
        navigator.mediaDevices.getUserMedia({ video: true })
            .then(stream => {
                cameraStream = stream;
                video.srcObject = stream;
                video.play();
                cameraContainer.classList.remove("d-none");
            })
            .catch(() => alert("Camera access denied"));
    };
}

/* Capture frame from camera */
if (captureBtn) {
    captureBtn.onclick = () => {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        ctx.drawImage(video, 0, 0);

        /* Stop camera stream */
        cameraStream.getTracks().forEach(track => track.stop());
        cameraStream = null;

        cameraContainer.classList.add("d-none");

        /* Convert canvas to image blob */
        canvas.toBlob(blob => {
            const formData = new FormData();
            formData.append("image", blob, "camera.jpg");

            sendToServer(formData);
        });
    };
}

/* Close camera without capture */
if (closeCameraBtn) {
    closeCameraBtn.onclick = () => {
        if (cameraStream) {
            cameraStream.getTracks().forEach(track => track.stop());
            cameraStream = null;
        }
        cameraContainer.classList.add("d-none");
    };
}


/* =====================================================
   SEND IMAGE + LOCATION TO SERVER
===================================================== */

function sendToServer(formData) {
    loadingDiv.classList.remove("d-none");
    outputDiv.classList.add("d-none");

    /* Attach GPS coordinates if available */
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            position => {
                formData.append("latitude", position.coords.latitude);
                formData.append("longitude", position.coords.longitude);
                send(formData);
            },
            () => send(formData),
            { timeout: 5000 }
        );
    } else {
        send(formData);
    }
}

/* Actual API request */
function send(formData) {
    fetch("/predict", {
        method: "POST",
        body: formData
    })
        .then(res => res.json())
        .then(data => {
            loadingDiv.classList.add("d-none");
            outputDiv.classList.remove("d-none");

            outputImage.src = "data:image/png;base64," + data.image;
            summaryText.innerText = formatSummary(data.summary);
            updateSeverity(data.severity);

            // Update Department Badge
            if (data.department) {
                const deptBadge = document.getElementById("departmentBadge");
                if (deptBadge) {
                    deptBadge.innerText = data.department;
                    deptBadge.className = "badge"; // reset
                    if (data.department.includes("Roads")) {
                        deptBadge.classList.add("bg-warning", "text-dark");
                    } else if (data.department.includes("Sanitation")) {
                        deptBadge.classList.add("bg-danger");
                    } else {
                        deptBadge.classList.add("bg-secondary");
                    }
                }
            }

            // Highlight: Store report ID for feedback
            currentReportId = data.report_id;

            // Render scoring details if available
            const scoringDetails = document.getElementById("scoringDetails");
            if (scoringDetails && data.scoring) {
                scoringDetails.innerHTML = `
                    <div class="mb-1 text-light"><strong>Severity Score:</strong> ${data.scoring.combined_score}/100</div>
                    <div class="d-flex justify-content-between"><span>Objects:</span> <span class="text-light">${data.scoring.objects}</span></div>
                    <div class="d-flex justify-content-between"><span>Confidence:</span> <span class="text-light">${data.scoring.confidence}%</span></div>
                    <div class="d-flex justify-content-between"><span>Area Covered:</span> <span class="text-light">${data.scoring.area_covered}%</span></div>
                    <div class="d-flex justify-content-between"><span>Object Size:</span> <span class="text-light">${data.scoring.object_size}%</span></div>
                    <div class="d-flex justify-content-between"><span>Distance Score:</span> <span class="text-light">${data.scoring.distance}%</span></div>
                `;
                scoringDetails.classList.remove("d-none");
            } else if (scoringDetails) {
                scoringDetails.classList.add("d-none");
            }

            // Update Explainable AI Box
            const explainabilityBox = document.getElementById("explainabilityBox");
            if (explainabilityBox && data.explainability) {
                document.getElementById("expDetected").innerText = data.explainability.detected;
                document.getElementById("expConfidence").innerText = data.explainability.confidence;
                document.getElementById("expReason").innerText = data.explainability.reason;
                document.getElementById("expDepartment").innerText = data.explainability.recommended_department;
                document.getElementById("expPriority").innerText = data.explainability.priority;
                document.getElementById("expTime").innerText = data.explainability.estimated_cleanup_time;
                explainabilityBox.classList.remove("d-none");
            } else if (explainabilityBox) {
                explainabilityBox.classList.add("d-none");
            }

            // Reset confirmation box
            resetConfirmationBox();

            /* Show user confirmation UI */
            confirmationBox.classList.remove("d-none");
        })
        .catch((err) => {
            console.error(err);
            loadingDiv.classList.add("d-none");
            alert("Prediction failed");
        });
}


/* =====================================================
   UI HELPER FUNCTIONS
===================================================== */

/* Format detected issues summary */
function formatSummary(summary) {
    if (!summary || Object.keys(summary).length === 0) {
        return "No major issues detected.";
    }

    return "Detected Issues: " +
        Object.entries(summary)
            .map(([key, value]) => `${value} ${key}`)
            .join(", ");
}

/* Update severity badge */
function updateSeverity(level) {
    severityBadge.className = "severity";
    severityBadge.innerText = "Severity: " + level;
    
    // Extract base level (e.g., "high" from "HIGH (SCORE: 85/100)")
    let baseLevel = level.split(" ")[0].toLowerCase();
    severityBadge.classList.add(baseLevel);
    severityBadge.classList.remove("d-none");
}

/* Reset confirmation box to initial state */
function resetConfirmationBox() {
    confirmationBox.innerHTML = `
        <p class="text-white-50 small mb-2">Confirm Accuracy:</p>
        <div class="d-flex gap-2">
            <button class="btn btn-success btn-sm flex-grow-1" id="confirmYes">✔ Valid</button>
            <button class="btn btn-outline-danger btn-sm flex-grow-1" id="confirmNo">✖ Incorrect</button>
        </div>
    `;

    // Re-attach listeners
    document.getElementById("confirmYes").addEventListener("click", () => sendFeedback("correct"));
    document.getElementById("confirmNo").addEventListener("click", () => sendFeedback("incorrect"));
}


/* =====================================================
   COUNT-UP ANIMATION (STATS)
===================================================== */

document.addEventListener("DOMContentLoaded", () => {
    const counters = document.querySelectorAll(".count");

    counters.forEach(counter => {
        const target = +counter.dataset.target;
        const duration = 900;
        const startTime = performance.now();

        function update(currentTime) {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);

            /* Ease-out animation */
            const eased = 1 - Math.pow(1 - progress, 3);
            counter.textContent = Math.floor(eased * target);

            if (progress < 1) {
                requestAnimationFrame(update);
            } else {
                counter.textContent = target;
            }
        }

        requestAnimationFrame(update);
    });

    // Initial attach of listeners if confirmation box is static in DOM
    // (It is static in index.html, but we reset innerHTML in JS, so logic handles it)
    const yesBtn = document.getElementById("confirmYes");
    const noBtn = document.getElementById("confirmNo");
    if (yesBtn) yesBtn.addEventListener("click", () => sendFeedback("correct"));
    if (noBtn) noBtn.addEventListener("click", () => sendFeedback("incorrect"));
});


/* =====================================================
   USER FEEDBACK HANDLING
===================================================== */

function sendFeedback(status) {
    if (!currentReportId) return;

    fetch("/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            report_id: currentReportId,
            feedback: status
        })
    })
        .then(res => res.json())
        .then(data => {
            if (status === "correct") {
                confirmationBox.innerHTML = `
                <span class="text-success fw-semibold">
                    ✔ Detection confirmed. Thank you!
                </span>
            `;
            } else {
                confirmationBox.innerHTML = `
                <span class="text-warning fw-semibold">
                    ✖ Marked as incorrect. We'll improve.
                </span>
            `;
            }
        })
        .catch(err => console.error("Feedback error:", err));
}
const departmentBadge = document.getElementById("departmentBadge");

function filterDepartment(dept) {
    // Update active button state
    const buttons = document.querySelectorAll(".btn-group button");
    buttons.forEach(btn => btn.classList.remove("active"));
    event.target.classList.add("active");

    const cardPotholes = document.getElementById("card-potholes");
    const cardGarbage = document.getElementById("card-garbage");

    const valTotal = document.getElementById("val-total");
    const valPotholes = document.getElementById("val-potholes");
    const valGarbage = document.getElementById("val-garbage");

    // Get original counts from data-target if available, else parsed text
    const countPotholes = parseInt(valPotholes.getAttribute("data-target")) || 0;
    const countGarbage = parseInt(valGarbage.getAttribute("data-target")) || 0;

    if (dept === 'roads') {
        if (cardPotholes) cardPotholes.classList.remove("d-none");
        if (cardGarbage) cardGarbage.classList.add("d-none");
        if (valTotal) valTotal.innerText = countPotholes;
    } else if (dept === 'sanitation') {
        if (cardPotholes) cardPotholes.classList.add("d-none");
        if (cardGarbage) cardGarbage.classList.remove("d-none");
        if (valTotal) valTotal.innerText = countGarbage;
    } else {
        // All
        if (cardPotholes) cardPotholes.classList.remove("d-none");
        if (cardGarbage) cardGarbage.classList.remove("d-none");
        // Sum or original total. Note: Total might include other things, but here it's likely independent sum.
        // Let's use the original total from its own data-target to be safe
        const total = parseInt(valTotal.getAttribute("data-target")) || (countPotholes + countGarbage);
        if (valTotal) valTotal.innerText = total;
    }
}
