/**
 * Samaj Sewa (समाज सेवा) - Citizen Portal Frontend Logic
 */

let citizenMap = null;
let citizenMarker = null;
let selectedImageFile = null;
let selectedVideoFile = null;
let activeCameraStream = null;

document.addEventListener('DOMContentLoaded', () => {
    initUserIdentity();
    initTimestampLive();
    initLeafletMap();
    initMediaUploadHandlers();
    initLocationHandlers();
    initFormSubmission();
    initTrackingHandler();
    loadRecentCommunityFeed();
});

/* =====================================================
   1. USER IDENTITY & TIMESTAMPS
===================================================== */
function initUserIdentity() {
    const userIdInput = document.getElementById('citizenUserId');
    const genBtn = document.getElementById('btnGenUserId');
    
    // Retrieve from localStorage or generate new
    let savedId = localStorage.getItem('samaj_sewa_user_id');
    if (!savedId) {
        savedId = generateCitizenId();
        localStorage.setItem('samaj_sewa_user_id', savedId);
    }
    if (userIdInput) {
        userIdInput.value = savedId;
    }

    if (genBtn) {
        genBtn.addEventListener('click', () => {
            const newId = generateCitizenId();
            userIdInput.value = newId;
            localStorage.setItem('samaj_sewa_user_id', newId);
            showToast('New Citizen ID generated: ' + newId);
        });
    }

    // Pre-fill contact details if saved
    const savedName = localStorage.getItem('samaj_sewa_name');
    const savedPhone = localStorage.getItem('samaj_sewa_phone');
    if (savedName && document.getElementById('citizenName')) document.getElementById('citizenName').value = savedName;
    if (savedPhone && document.getElementById('citizenPhone')) document.getElementById('citizenPhone').value = savedPhone;
}

function generateCitizenId() {
    const randNum = Math.floor(1000 + Math.random() * 9000);
    return `CITIZEN-${randNum}`;
}

function initTimestampLive() {
    const timeDisplay = document.getElementById('liveTimestampBadge');
    function updateClock() {
        const now = new Date();
        if (timeDisplay) {
            timeDisplay.innerHTML = `<i class="bi bi-clock-history me-1"></i> ${now.toLocaleDateString()} ${now.toLocaleTimeString()}`;
        }
    }
    updateClock();
    setInterval(updateClock, 1000);
}

/* =====================================================
   2. LEAFLET MAP & LOCATION HANDLING
===================================================== */
function initLeafletMap() {
    const mapContainer = document.getElementById('citizenMap');
    if (!mapContainer) return;

    // Default center (Pune / Central India default)
    const defaultLat = 18.5204;
    const defaultLng = 73.8567;

    citizenMap = L.map('citizenMap').setView([defaultLat, defaultLng], 13);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
        maxZoom: 19
    }).addTo(citizenMap);

    citizenMarker = L.marker([defaultLat, defaultLng], { draggable: true }).addTo(citizenMap);

    citizenMarker.on('dragend', function (e) {
        const pos = citizenMarker.getLatLng();
        updateCoordinates(pos.lat, pos.lng);
    });

    citizenMap.on('click', function (e) {
        const lat = e.latlng.lat;
        const lng = e.latlng.lng;
        citizenMarker.setLatLng([lat, lng]);
        updateCoordinates(lat, lng);
    });
}

function updateCoordinates(lat, lng) {
    const latInput = document.getElementById('citizenLatitude');
    const lngInput = document.getElementById('citizenLongitude');
    const badge = document.getElementById('locationStatusBadge');

    if (latInput) latInput.value = parseFloat(lat).toFixed(6);
    if (lngInput) lngInput.value = parseFloat(lng).toFixed(6);

    if (badge) {
        badge.className = 'badge bg-success-subtle text-success border border-success';
        badge.innerHTML = `<i class="bi bi-geo-alt-fill me-1"></i> ${parseFloat(lat).toFixed(4)}, ${parseFloat(lng).toFixed(4)}`;
    }
}

function initLocationHandlers() {
    const locateBtn = document.getElementById('btnUseLocation');
    const badge = document.getElementById('locationStatusBadge');

    if (!locateBtn) return;

    locateBtn.addEventListener('click', () => {
        if (!navigator.geolocation) {
            alert('Geolocation is not supported by your browser.');
            return;
        }

        locateBtn.disabled = true;
        locateBtn.innerHTML = `<span class="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span> Fetching GPS...`;

        navigator.geolocation.getCurrentPosition(
            (position) => {
                const lat = position.coords.latitude;
                const lng = position.coords.longitude;

                updateCoordinates(lat, lng);

                if (citizenMap && citizenMarker) {
                    citizenMap.setView([lat, lng], 16);
                    citizenMarker.setLatLng([lat, lng]);
                }

                locateBtn.disabled = false;
                locateBtn.innerHTML = `<i class="bi bi-crosshair me-1"></i> Update Location`;
                showToast('📍 GPS Location captured successfully!');
            },
            (error) => {
                locateBtn.disabled = false;
                locateBtn.innerHTML = `<i class="bi bi-geo-alt-fill me-1"></i> Use My Current Location`;
                let msg = 'Unable to retrieve your location.';
                if (error.code === error.PERMISSION_DENIED) {
                    msg = 'Location permission was denied. You can select your location by clicking on the map.';
                } else if (error.code === error.POSITION_UNAVAILABLE) {
                    msg = 'Location information is unavailable. Please click on the map.';
                } else if (error.code === error.TIMEOUT) {
                    msg = 'Location request timed out. Please try again or click the map.';
                }
                alert(msg);
            },
            { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
        );
    });
}

/* =====================================================
   3. MEDIA UPLOAD & LIVE CAMERA
===================================================== */
function initMediaUploadHandlers() {
    const dropzone = document.getElementById('citizenDropzone');
    const fileInput = document.getElementById('citizenMediaInput');
    const browseBtn = document.getElementById('btnBrowseMedia');
    const cameraBtn = document.getElementById('btnOpenCam');
    const captureBtn = document.getElementById('btnCaptureCam');
    const closeCamBtn = document.getElementById('btnCloseCam');
    const videoStream = document.getElementById('cameraVideo');
    const cameraSection = document.getElementById('liveCameraSection');
    const previewContainer = document.getElementById('mediaPreviewContainer');
    const previewImg = document.getElementById('citizenPreviewImg');
    const removeMediaBtn = document.getElementById('btnRemoveMedia');

    // Video specific input
    const videoFileInput = document.getElementById('citizenVideoInput');
    const videoPreview = document.getElementById('citizenPreviewVideo');

    if (browseBtn && fileInput) {
        browseBtn.addEventListener('click', () => fileInput.click());
    }

    if (dropzone && fileInput) {
        dropzone.addEventListener('click', (e) => {
            if (e.target !== browseBtn && e.target !== cameraBtn) {
                fileInput.click();
            }
        });

        dropzone.addEventListener('dragover', (e) => {
            e.preventDefault();
            dropzone.classList.add('dragover');
        });

        dropzone.addEventListener('dragleave', () => {
            dropzone.classList.remove('dragover');
        });

        dropzone.addEventListener('drop', (e) => {
            e.preventDefault();
            dropzone.classList.remove('dragover');
            if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                handleFileSelection(e.dataTransfer.files[0]);
            }
        });
    }

    if (fileInput) {
        fileInput.addEventListener('change', (e) => {
            if (e.target.files && e.target.files.length > 0) {
                handleFileSelection(e.target.files[0]);
            }
        });
    }

    if (videoFileInput) {
        videoFileInput.addEventListener('change', (e) => {
            if (e.target.files && e.target.files.length > 0) {
                handleVideoSelection(e.target.files[0]);
            }
        });
    }

    // Camera Handlers
    if (cameraBtn) {
        cameraBtn.addEventListener('click', async (e) => {
            e.stopPropagation();
            try {
                activeCameraStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' }, audio: false });
                videoStream.srcObject = activeCameraStream;
                cameraSection.classList.remove('d-none');
                dropzone.classList.add('d-none');
            } catch (err) {
                alert('Camera access error or permission denied: ' + err.message);
            }
        });
    }

    if (closeCamBtn) {
        closeCamBtn.addEventListener('click', () => {
            stopCamera();
            cameraSection.classList.add('d-none');
            dropzone.classList.remove('d-none');
        });
    }

    if (captureBtn) {
        captureBtn.addEventListener('click', () => {
            const canvas = document.createElement('canvas');
            canvas.width = videoStream.videoWidth || 640;
            canvas.height = videoStream.videoHeight || 480;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(videoStream, 0, 0, canvas.width, canvas.height);

            canvas.toBlob((blob) => {
                const file = new File([blob], `camera_capture_${Date.now()}.png`, { type: 'image/png' });
                handleFileSelection(file);
                stopCamera();
                cameraSection.classList.add('d-none');
                dropzone.classList.add('d-none');
            }, 'image/png');
        });
    }

    if (removeMediaBtn) {
        removeMediaBtn.addEventListener('click', () => {
            selectedImageFile = null;
            selectedVideoFile = null;
            if (fileInput) fileInput.value = '';
            if (videoFileInput) videoFileInput.value = '';
            previewContainer.classList.add('d-none');
            dropzone.classList.remove('d-none');
            hideAiResults();
        });
    }
}

function stopCamera() {
    if (activeCameraStream) {
        activeCameraStream.getTracks().forEach(track => track.stop());
        activeCameraStream = null;
    }
}

function handleFileSelection(file) {
    if (file.type.startsWith('video/')) {
        handleVideoSelection(file);
        return;
    }

    selectedImageFile = file;
    selectedVideoFile = null;

    const previewContainer = document.getElementById('mediaPreviewContainer');
    const previewImg = document.getElementById('citizenPreviewImg');
    const previewVideo = document.getElementById('citizenPreviewVideo');
    const dropzone = document.getElementById('citizenDropzone');

    const reader = new FileReader();
    reader.onload = (e) => {
        previewImg.src = e.target.result;
        previewImg.classList.remove('d-none');
        if (previewVideo) previewVideo.classList.add('d-none');
        previewContainer.classList.remove('d-none');
        dropzone.classList.add('d-none');

        // Automatically trigger AI Quick Scan
        runAiPreAnalysis(file);
    };
    reader.readAsDataURL(file);
}

function handleVideoSelection(file) {
    selectedVideoFile = file;
    selectedImageFile = null;

    const previewContainer = document.getElementById('mediaPreviewContainer');
    const previewImg = document.getElementById('citizenPreviewImg');
    const previewVideo = document.getElementById('citizenPreviewVideo');
    const dropzone = document.getElementById('citizenDropzone');

    const url = URL.createObjectURL(file);
    previewVideo.src = url;
    previewVideo.classList.remove('d-none');
    previewImg.classList.add('d-none');
    previewContainer.classList.remove('d-none');
    dropzone.classList.add('d-none');

    // Quick AI info update for video
    displayAiVideoNotice(file.name);
}

/* =====================================================
   4. AI PRE-ANALYSIS PIPELINE
===================================================== */
async function runAiPreAnalysis(file) {
    const aiPanel = document.getElementById('aiResultsPanel');
    const aiLoading = document.getElementById('aiAnalysisLoading');
    const aiDetails = document.getElementById('aiAnalysisDetails');

    aiPanel.classList.remove('d-none');
    aiLoading.classList.remove('d-none');
    aiDetails.classList.add('d-none');

    const formData = new FormData();
    formData.append('image', file);

    try {
        const response = await fetch('/api/citizen/analyze', {
            method: 'POST',
            body: formData
        });

        const data = await response.json();
        aiLoading.classList.add('d-none');
        aiDetails.classList.remove('d-none');

        if (response.ok) {
            renderAiAnalysisResults(data);
        } else {
            renderAiFallback('Analysis unavailable for this media format.');
        }
    } catch (err) {
        console.error('AI Analysis Error:', err);
        aiLoading.classList.add('d-none');
        aiDetails.classList.remove('d-none');
        renderAiFallback('Analysis unavailable (Network/Server error).');
    }
}

function displayAiVideoNotice(filename) {
    const aiPanel = document.getElementById('aiResultsPanel');
    const aiLoading = document.getElementById('aiAnalysisLoading');
    const aiDetails = document.getElementById('aiAnalysisDetails');

    aiPanel.classList.remove('d-none');
    aiLoading.classList.add('d-none');
    aiDetails.classList.remove('d-none');

    document.getElementById('aiDetectedIssue').innerText = `Video Media Attached: ${filename}`;
    document.getElementById('aiDetectedCategory').innerText = 'Multi-frame Civic Video Stream';
    
    const sevBadge = document.getElementById('aiSeverityBadge');
    sevBadge.className = 'badge severity-pill-medium px-3 py-2 rounded-pill';
    sevBadge.innerText = 'Pending Deep Frame Scan';

    document.getElementById('aiConfidenceScore').innerText = 'Analysis on Submit';
    document.getElementById('aiAssignedDept').innerText = 'Civic Operations';

    const annotatedContainer = document.getElementById('aiAnnotatedPreviewBox');
    if (annotatedContainer) annotatedContainer.classList.add('d-none');
}

function renderAiAnalysisResults(data) {
    const detectedElem = document.getElementById('aiDetectedIssue');
    const catElem = document.getElementById('aiDetectedCategory');
    const sevBadge = document.getElementById('aiSeverityBadge');
    const confElem = document.getElementById('aiConfidenceScore');
    const deptElem = document.getElementById('aiAssignedDept');
    const annotatedBox = document.getElementById('aiAnnotatedPreviewBox');
    const annotatedImg = document.getElementById('aiAnnotatedImg');

    const detected = data.detected || 'No severe road/garbage issues detected';
    detectedElem.innerText = detected;
    catElem.innerText = data.category || 'Civic Infrastructure';
    
    // Severity styling
    const severityStr = data.severity || 'Low';
    sevBadge.innerText = severityStr;
    if (severityStr.toLowerCase().includes('high')) {
        sevBadge.className = 'badge severity-pill-high px-3 py-2 rounded-pill';
    } else if (severityStr.toLowerCase().includes('medium')) {
        sevBadge.className = 'badge severity-pill-medium px-3 py-2 rounded-pill';
    } else {
        sevBadge.className = 'badge severity-pill-low px-3 py-2 rounded-pill';
    }

    confElem.innerText = data.confidence !== undefined ? `${data.confidence}%` : 'Analysis unavailable';
    deptElem.innerText = data.department || 'Municipal Corporation';

    if (data.annotated_image && annotatedBox && annotatedImg) {
        annotatedImg.src = `data:image/png;base64,${data.annotated_image}`;
        annotatedBox.classList.remove('d-none');
    } else if (annotatedBox) {
        annotatedBox.classList.add('d-none');
    }

    // Auto-select category radio button if high confidence match
    if (data.summary) {
        if (data.summary.pothole) {
            const rad = document.getElementById('cat_road');
            if (rad) rad.checked = true;
        } else if (data.summary.garbage) {
            const rad = document.getElementById('cat_garbage');
            if (rad) rad.checked = true;
        }
    }
}

function renderAiFallback(msg) {
    document.getElementById('aiDetectedIssue').innerText = msg || 'Analysis unavailable';
    document.getElementById('aiDetectedCategory').innerText = 'General Civic Complaint';
    
    const sevBadge = document.getElementById('aiSeverityBadge');
    sevBadge.className = 'badge bg-secondary text-light px-3 py-2 rounded-pill';
    sevBadge.innerText = 'Manual Review Required';

    document.getElementById('aiConfidenceScore').innerText = 'N/A';
    document.getElementById('aiAssignedDept').innerText = 'General Grievance Cell';

    const annotatedBox = document.getElementById('aiAnnotatedPreviewBox');
    if (annotatedBox) annotatedBox.classList.add('d-none');
}

function hideAiResults() {
    const aiPanel = document.getElementById('aiResultsPanel');
    if (aiPanel) aiPanel.classList.add('d-none');
}

/* =====================================================
   5. FORM SUBMISSION
===================================================== */
function initFormSubmission() {
    const form = document.getElementById('citizenComplaintForm');
    const submitBtn = document.getElementById('btnSubmitComplaint');

    if (!form) return;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const userId = document.getElementById('citizenUserId').value.trim();
        const name = document.getElementById('citizenName').value.trim();
        const phone = document.getElementById('citizenPhone').value.trim();
        const email = document.getElementById('citizenEmail')?.value.trim() || '';
        const description = document.getElementById('citizenDescription').value.trim();
        const categoryRadio = document.querySelector('input[name="category"]:checked');
        const category = categoryRadio ? categoryRadio.value : 'Other Civic Issue';
        const lat = document.getElementById('citizenLatitude')?.value || '';
        const lng = document.getElementById('citizenLongitude')?.value || '';
        const landmark = document.getElementById('citizenLandmark')?.value || '';

        // Validation
        if (!userId) {
            alert('Please provide or generate a Citizen User ID.');
            return;
        }
        if (!phone) {
            alert('Please provide your contact phone number for complaint updates.');
            return;
        }
        if (!description) {
            alert('Please enter a brief description of the civic problem.');
            return;
        }

        // Save contacts to localStorage for convenience
        localStorage.setItem('samaj_sewa_name', name);
        localStorage.setItem('samaj_sewa_phone', phone);

        // Build FormData
        const formData = new FormData();
        formData.append('user_id', userId);
        formData.append('contact_name', name);
        formData.append('contact_phone', phone);
        formData.append('contact_email', email);
        formData.append('category', category);
        formData.append('description', description);
        formData.append('latitude', lat);
        formData.append('longitude', lng);
        formData.append('landmark', landmark);

        if (selectedImageFile) {
            formData.append('image', selectedImageFile);
        } else if (selectedVideoFile) {
            formData.append('video', selectedVideoFile);
        }

        submitBtn.disabled = true;
        submitBtn.innerHTML = `<span class="spinner-border spinner-border-sm me-2"></span> Registering Complaint on Samaj Sewa...`;

        try {
            const res = await fetch('/api/citizen/report', {
                method: 'POST',
                body: formData
            });

            const result = await res.json();
            submitBtn.disabled = false;
            submitBtn.innerHTML = `<i class="bi bi-send-fill me-2"></i> Submit Civic Complaint`;

            if (res.ok && result.status === 'success') {
                // Show success modal
                displaySubmissionSuccessModal(result);

                // Save to local complaint history
                saveComplaintToLocalHistory(result.complaint_id);

                // Reset form
                form.reset();
                initUserIdentity();
                selectedImageFile = null;
                selectedVideoFile = null;
                document.getElementById('mediaPreviewContainer').classList.add('d-none');
                document.getElementById('citizenDropzone').classList.remove('d-none');
                hideAiResults();
                loadRecentCommunityFeed();
            } else {
                alert('Submission failed: ' + (result.error || 'Server error'));
            }
        } catch (err) {
            console.error('Submission Error:', err);
            submitBtn.disabled = false;
            submitBtn.innerHTML = `<i class="bi bi-send-fill me-2"></i> Submit Civic Complaint`;
            alert('Failed to submit complaint. Please check server connection.');
        }
    });
}

function displaySubmissionSuccessModal(data) {
    const modalEl = document.getElementById('complaintSuccessModal');
    if (!modalEl) return;

    document.getElementById('modalComplaintId').innerText = data.complaint_id;
    document.getElementById('modalTimestamp').innerText = data.created_at ? new Date(data.created_at).toLocaleString() : new Date().toLocaleString();
    document.getElementById('modalDepartment').innerText = data.department || 'Roads & Sanitation Dept';
    document.getElementById('modalStatus').innerText = data.complaint_status || 'Submitted';
    
    if (data.ai_results) {
        document.getElementById('modalAiDetected').innerText = data.ai_results.detected || 'Analysis Recorded';
        document.getElementById('modalAiSeverity').innerText = data.ai_results.severity || 'Recorded';
    }

    const modal = new bootstrap.Modal(modalEl);
    modal.show();

    // Copy ID button
    const copyBtn = document.getElementById('btnCopyComplaintId');
    if (copyBtn) {
        copyBtn.onclick = () => {
            navigator.clipboard.writeText(data.complaint_id);
            copyBtn.innerHTML = `<i class="bi bi-check2"></i> Copied!`;
            setTimeout(() => {
                copyBtn.innerHTML = `<i class="bi bi-copy"></i> Copy ID`;
            }, 2000);
        };
    }

    // Direct track button
    const trackDirectBtn = document.getElementById('btnTrackFromModal');
    if (trackDirectBtn) {
        trackDirectBtn.onclick = () => {
            modal.hide();
            // Switch to Track tab
            const trackTabBtn = document.getElementById('track-tab');
            if (trackTabBtn) {
                const tab = new bootstrap.Tab(trackTabBtn);
                tab.show();
            }
            document.getElementById('trackComplaintIdInput').value = data.complaint_id;
            performComplaintTracking(data.complaint_id);
        };
    }
}

function saveComplaintToLocalHistory(id) {
    let list = JSON.parse(localStorage.getItem('samaj_sewa_my_complaints') || '[]');
    if (!list.includes(id)) {
        list.unshift(id);
        if (list.length > 20) list.pop();
        localStorage.setItem('samaj_sewa_my_complaints', JSON.stringify(list));
    }
}

/* =====================================================
   6. COMPLAINT TRACKING
===================================================== */
function initTrackingHandler() {
    const searchBtn = document.getElementById('btnSearchTracking');
    const input = document.getElementById('trackComplaintIdInput');

    if (searchBtn && input) {
        searchBtn.addEventListener('click', () => {
            const query = input.value.trim();
            if (!query) {
                alert('Please enter a Complaint Tracking ID or Citizen User ID.');
                return;
            }
            performComplaintTracking(query);
        });

        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                searchBtn.click();
            }
        });
    }

    // Load recent IDs into quick badges
    renderMyComplaintBadges();
}

function renderMyComplaintBadges() {
    const container = document.getElementById('myRecentComplaintChips');
    if (!container) return;

    const list = JSON.parse(localStorage.getItem('samaj_sewa_my_complaints') || '[]');
    if (list.length === 0) {
        container.innerHTML = `<span class="text-muted small">No recent complaints filed from this device yet.</span>`;
        return;
    }

    container.innerHTML = '<span class="text-white-50 small me-2">Your Recent IDs:</span>';
    list.slice(0, 5).forEach(id => {
        const chip = document.createElement('button');
        chip.className = 'badge bg-primary-subtle text-primary border border-primary me-2 mb-1 p-2 rounded-pill btn-sm text-decoration-none';
        chip.innerText = id;
        chip.onclick = () => {
            document.getElementById('trackComplaintIdInput').value = id;
            performComplaintTracking(id);
        };
        container.appendChild(chip);
    });
}

async function performComplaintTracking(query) {
    const resultCard = document.getElementById('trackingResultCard');
    const notFoundCard = document.getElementById('trackingNotFoundCard');
    const loading = document.getElementById('trackingLoadingSpinner');

    resultCard.classList.add('d-none');
    notFoundCard.classList.add('d-none');
    loading.classList.remove('d-none');

    try {
        const res = await fetch(`/api/citizen/track/${encodeURIComponent(query)}`);
        const data = await res.json();

        loading.classList.add('d-none');

        if (res.ok && data.complaint) {
            renderComplaintTracker(data.complaint);
            resultCard.classList.remove('d-none');
        } else {
            notFoundCard.classList.remove('d-none');
        }
    } catch (err) {
        console.error('Tracking Error:', err);
        loading.classList.add('d-none');
        notFoundCard.classList.remove('d-none');
    }
}

function renderComplaintTracker(c) {
    document.getElementById('trackResId').innerText = c.complaint_id;
    document.getElementById('trackResUser').innerText = c.user_id;
    document.getElementById('trackResContact').innerText = `${c.contact_name || 'Citizen'} (${c.contact_phone || 'N/A'})`;
    document.getElementById('trackResCategory').innerText = c.category;
    document.getElementById('trackResDept').innerText = c.department || 'Municipal Grievance Cell';
    document.getElementById('trackResTimestamp').innerText = new Date(c.created_at).toLocaleString();
    document.getElementById('trackResDesc').innerText = c.description;

    // Location
    const locElem = document.getElementById('trackResLocation');
    if (c.latitude && c.longitude) {
        locElem.innerHTML = `<a href="https://maps.google.com/?q=${c.latitude},${c.longitude}" target="_blank" class="text-info text-decoration-none"><i class="bi bi-geo-alt-fill me-1"></i>${parseFloat(c.latitude).toFixed(4)}, ${parseFloat(c.longitude).toFixed(4)} (Open Map)</a>`;
    } else {
        locElem.innerText = c.landmark || 'Location not tagged';
    }

    // AI summary
    document.getElementById('trackResAiDetected').innerText = c.ai_detected_category || 'No hazard detected';
    document.getElementById('trackResAiSeverity').innerText = c.ai_severity || 'Low';
    document.getElementById('trackResAiConfidence').innerText = c.ai_confidence ? `${c.ai_confidence}%` : 'N/A';

    // Media Thumbnail
    const imgEl = document.getElementById('trackResMediaImg');
    if (c.image_path) {
        imgEl.src = `/${c.image_path}`;
        imgEl.classList.remove('d-none');
    } else {
        imgEl.classList.add('d-none');
    }

    // Stepper update
    updateTrackingStepper(c.status || 'Submitted');
}

function updateTrackingStepper(status) {
    const steps = ['step1', 'step2', 'step3', 'step4'];
    steps.forEach(s => {
        const el = document.getElementById(s);
        if (el) el.className = 'step-item';
    });

    const sLower = status.toLowerCase();

    const s1 = document.getElementById('step1');
    const s2 = document.getElementById('step2');
    const s3 = document.getElementById('step3');
    const s4 = document.getElementById('step4');

    if (sLower.includes('resolved') || sLower.includes('closed')) {
        s1?.classList.add('completed');
        s2?.classList.add('completed');
        s3?.classList.add('completed');
        s4?.classList.add('active', 'completed');
    } else if (sLower.includes('progress') || sLower.includes('assigned')) {
        s1?.classList.add('completed');
        s2?.classList.add('completed');
        s3?.classList.add('active');
    } else if (sLower.includes('review') || sLower.includes('verified')) {
        s1?.classList.add('completed');
        s2?.classList.add('active');
    } else {
        // Submitted
        s1?.classList.add('active');
    }
}

/* =====================================================
   7. RECENT COMMUNITY FEED
===================================================== */
async function loadRecentCommunityFeed() {
    const feedContainer = document.getElementById('communityFeedList');
    if (!feedContainer) return;

    try {
        const res = await fetch('/api/citizen/complaints?limit=6');
        const data = await res.json();

        if (res.ok && data.complaints && data.complaints.length > 0) {
            feedContainer.innerHTML = '';
            data.complaints.forEach(c => {
                const item = document.createElement('div');
                item.className = 'col-md-6 col-lg-4 mb-3';
                
                const sevClass = (c.ai_severity || '').toLowerCase().includes('high') ? 'severity-pill-high' : 
                                 (c.ai_severity || '').toLowerCase().includes('medium') ? 'severity-pill-medium' : 'severity-pill-low';

                item.innerHTML = `
                    <div class="citizen-card p-3 h-100 d-flex flex-column justify-content-between">
                        <div>
                            <div class="d-flex justify-content-between align-items-center mb-2">
                                <span class="badge bg-primary-subtle text-primary border border-primary font-monospace">${c.complaint_id}</span>
                                <span class="badge ${sevClass}">${c.status || 'Submitted'}</span>
                            </div>
                            <h6 class="text-white mb-1 text-truncate">${escapeHtml(c.category)}</h6>
                            <p class="text-white-50 small mb-2 text-truncate-2" style="font-size: 0.82rem; min-height: 2.4rem;">
                                ${escapeHtml(c.description)}
                            </p>
                        </div>
                        <div class="border-top border-secondary pt-2 mt-2 d-flex justify-content-between align-items-center">
                            <span class="text-muted small" style="font-size: 0.75rem;">
                                <i class="bi bi-clock me-1"></i>${new Date(c.created_at).toLocaleDateString()}
                            </span>
                            <button class="btn btn-outline-info btn-sm py-0 px-2" style="font-size: 0.75rem;" onclick="trackSpecificId('${c.complaint_id}')">
                                Track
                            </button>
                        </div>
                    </div>
                `;
                feedContainer.appendChild(item);
            });
        } else {
            feedContainer.innerHTML = `<div class="col-12 text-center py-4 text-muted">No public complaints filed yet. Be the first citizen to report an issue!</div>`;
        }
    } catch (err) {
        console.error('Community feed load error:', err);
    }
}

window.trackSpecificId = function(id) {
    const trackTabBtn = document.getElementById('track-tab');
    if (trackTabBtn) {
        const tab = new bootstrap.Tab(trackTabBtn);
        tab.show();
    }
    const input = document.getElementById('trackComplaintIdInput');
    if (input) input.value = id;
    performComplaintTracking(id);
};

/* =====================================================
   8. UTILITIES
===================================================== */
function showToast(msg) {
    const toast = document.createElement('div');
    toast.className = 'position-fixed bottom-0 end-0 p-3';
    toast.style.zIndex = '9999';
    toast.innerHTML = `
        <div class="toast show align-items-center text-white bg-dark border border-primary" role="alert">
            <div class="d-flex">
                <div class="toast-body">${msg}</div>
                <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
            </div>
        </div>
    `;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 4000);
}

function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
