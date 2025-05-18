let layoutCount = parseInt(sessionStorage.getItem("layoutCount")) || 1;
let photoTaken = 0;
let currentFilter = 'none';

const video = document.getElementById("camera");
const shotsContainer = document.getElementById("shots");
const countdownDisplay = document.getElementById("countdown");
const captureBtn = document.querySelector(".capture-btn");
const flashOverlay = document.getElementById("flash");
const layoutPreview = document.getElementById("layout-preview");

// Request camera access
navigator.mediaDevices.getUserMedia({
  video: {
    width: { ideal: 1920 },
    height: { ideal: 1080 },
    facingMode: "user" // or "environment" for back camera
  }
})
.then(stream => {
  video.srcObject = stream;
})
.catch(err => {
  alert("Camera access denied: " + err);
});

function applyFilter(filter) {
  currentFilter = filter;
  video.style.filter = filter;
}

function takePhoto() {
  if (photoTaken >= layoutCount) {
    alert("All required photos have been taken!");
    return;
  }

  captureBtn.disabled = true;
  let countdown = 3;
  countdownDisplay.textContent = countdown;

  const countdownInterval = setInterval(() => {
    countdown--;
    if (countdown > 0) {
      countdownDisplay.textContent = countdown;
    } else {
      clearInterval(countdownInterval);
      countdownDisplay.textContent = "📸";

      flashOverlay.style.opacity = 1;

      setTimeout(() => {
        captureImage();
        flashOverlay.style.opacity = 0;
        countdownDisplay.textContent = "";
        captureBtn.disabled = false;
      }, 500);
    }
  }, 1000);
}


function captureImage() {
  const canvas = document.createElement("canvas");
  
  const width = video.videoWidth;
  const height = video.videoHeight;

  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext("2d");
  ctx.filter = currentFilter;

  ctx.translate(canvas.width, 0);
  ctx.scale(-1, 1);

  const videoRatio = video.videoWidth / video.videoHeight;
  const containerRatio = width / height;

  let sx, sy, sWidth, sHeight;

  if (containerRatio > videoRatio) {
    // container wider than video, so video is cropped vertically
    sWidth = video.videoWidth;
    sHeight = video.videoWidth / containerRatio;
    sx = 0;
    sy = (video.videoHeight - sHeight) / 2;
  } else {
    // container taller than video, so video is cropped horizontally
    sHeight = video.videoHeight;
    sWidth = video.videoHeight * containerRatio;
    sy = 0;
    sx = (video.videoWidth - sWidth) / 2;
  }

  ctx.drawImage(video, sx, sy, sWidth, sHeight, 0, 0, width, height);
  // ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

  const imgData = canvas.toDataURL("image/png");

  // Create image element for preview with border
  const img = new Image();
  img.src = imgData;
  img.className = "shot-preview";

  const borderedFrame = document.createElement("div");
  borderedFrame.className = "photo-border";
  borderedFrame.style.borderColor = sessionStorage.getItem("borderColor") || "#000"; // default black
  borderedFrame.appendChild(img);

  shotsContainer.appendChild(borderedFrame);

  // Save the captured photo data URL to sessionStorage array
  let photos = JSON.parse(sessionStorage.getItem("photosTaken")) || [];
  photos.push(imgData);
  sessionStorage.setItem("photosTaken", JSON.stringify(photos));

  photoTaken++;

  if (photoTaken >= layoutCount) {
  // Show toast
  const toast = document.getElementById("successToast");
  toast.classList.add("show");

  // Redirect to review/download page after short delay
  setTimeout(() => {
    toast.classList.remove("show");
    window.location.href = "preview.html"; // change filename if needed
  }, 1500); // show toast for 1.5 seconds
}
}



function renderFinalLayout() {
  layoutPreview.innerHTML = "";
  layoutPreview.style.display = "grid";

  if (layoutCount === 1) {
    layoutPreview.style.gridTemplateColumns = "1fr";
  } else if (layoutCount === 1) {
    layoutPreview.style.gridTemplateColumns = "1fr 1fr";
  } else if (layoutCount === 2) {
    layoutPreview.style.gridTemplateColumns = "1fr 1fr";
  } else if (layoutCount === 3) {
    layoutPreview.style.gridTemplateColumns = "1fr 1fr 1fr";
  } else if (layoutCount === 4) {
    layoutPreview.style.gridTemplateColumns = "1fr 1fr 1fr";
  } else {
    layoutPreview.style.gridTemplateColumns = `repeat(${Math.ceil(Math.sqrt(layoutCount))}, 1fr)`;
  }

  document.querySelectorAll('.shot-preview').forEach(preview => {
    const img = new Image();
    img.src = preview.src;
    img.className = "layout-photo";
    layoutPreview.appendChild(img);
  });

  layoutPreview.scrollIntoView({ behavior: "smooth" });
}

async function startCamera() {
  try {
    const constraints = {
      video: {
        facingMode: "environment",
        width: { ideal: 1280 },
        height: { ideal: 720 },
        advanced: [{ torch: true }]
      }
    };

    const stream = await navigator.mediaDevices.getUserMedia(constraints);
    video.srcObject = stream;

    const track = stream.getVideoTracks()[0];
    const capabilities = track.getCapabilities();

    if (capabilities.torch) {
      await track.applyConstraints({ advanced: [{ torch: true }] });
      console.log("Torch enabled");
    } else {
      console.log("Torch capability not supported");
    }
  } catch (err) {
    console.error("Camera/torch error:", err);
  }
}

document.addEventListener('click', function (e) {
  if (e.target.classList.contains('shot-preview')) {
    const modal = document.getElementById('photo-modal');
    const modalImg = document.getElementById('modal-img');
    modalImg.src = e.target.src;
    modal.style.display = 'flex';
  }
});

document.getElementById('close-modal').addEventListener('click', () => {
  document.getElementById('photo-modal').style.display = 'none';
});


