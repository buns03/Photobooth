document.addEventListener("DOMContentLoaded", () => {
  let layoutCount = parseInt(sessionStorage.getItem("layoutCount")) || 1;
  let photoTaken = 0;
  let currentFilter = 'none';

  const video = document.getElementById("camera");
  const shotsContainer = document.getElementById("shots");
  const countdownDisplay = document.getElementById("countdown");
  const captureBtn = document.querySelector(".capture-btn");
  const flashOverlay = document.getElementById("flash");
  const layoutPreview = document.getElementById("layout-preview");

  if (!video) {
    console.error("Camera element not found.");
    return;
  }

  // Safe camera init
  navigator.mediaDevices.getUserMedia({ video: true })
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
    const displayWidth = video.clientWidth;
    const displayHeight = video.clientHeight;

    const videoWidth = video.videoWidth;
    const videoHeight = video.videoHeight;

    const canvas = document.createElement("canvas");
    canvas.width = videoWidth;
    canvas.height = videoHeight;

    const ctx = canvas.getContext("2d");
    ctx.filter = currentFilter;

    ctx.translate(canvas.width, 0);
    ctx.scale(-1, 1);

    const displayRatio = displayWidth / displayHeight;
    const videoRatio = videoWidth / videoHeight;

    let sx, sy, sWidth, sHeight;

    if (displayRatio > videoRatio) {
      sWidth = videoWidth;
      sHeight = videoWidth / displayRatio;
      sx = 0;
      sy = (videoHeight - sHeight) / 2;
    } else {
      sHeight = videoHeight;
      sWidth = videoHeight * displayRatio;
      sy = 0;
      sx = (videoWidth - sWidth) / 2;
    }

    const outputCanvas = document.createElement("canvas");
    outputCanvas.width = sWidth;
    outputCanvas.height = sHeight;
    const outputCtx = outputCanvas.getContext("2d");

    outputCtx.filter = currentFilter;
    outputCtx.drawImage(canvas, sx, sy, sWidth, sHeight, 0, 0, sWidth, sHeight);

    const imgData = outputCanvas.toDataURL("image/png");

    const img = new Image();
    img.src = imgData;
    img.className = "shot-preview";

    const borderedFrame = document.createElement("div");
    borderedFrame.className = "photo-border";
    borderedFrame.style.borderColor = sessionStorage.getItem("borderColor") || "#000";
    borderedFrame.appendChild(img);

    shotsContainer.appendChild(borderedFrame);

    let photos = JSON.parse(sessionStorage.getItem("photosTaken")) || [];
    photos.push(imgData);
    sessionStorage.setItem("photosTaken", JSON.stringify(photos));

    photoTaken++;

    if (photoTaken >= layoutCount) {
      const toast = document.getElementById("successToast");
      toast.classList.add("show");
      setTimeout(() => {
        toast.classList.remove("show");
        window.location.href = "preview.html";
      }, 1500);
    }
  }

  function renderFinalLayout() {
    layoutPreview.innerHTML = "";
    layoutPreview.style.display = "grid";

    if (layoutCount === 1) {
      layoutPreview.style.gridTemplateColumns = "1fr";
    } else if (layoutCount === 2) {
      layoutPreview.style.gridTemplateColumns = "1fr 1fr";
    } else if (layoutCount === 3 || layoutCount === 4) {
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

  // Expose takePhoto and applyFilter globally
  window.takePhoto = takePhoto;
  window.applyFilter = applyFilter;
});
