document.addEventListener('DOMContentLoaded', () => {
  const photos = JSON.parse(sessionStorage.getItem('photosTaken')) || [];
  const layoutCount = parseInt(sessionStorage.getItem('layoutCount')) || 1;
  const photoLayout = document.getElementById('photoLayout');
  const borderColorPicker = document.getElementById('borderColorPicker');
  const downloadBtn = document.getElementById('downloadBtn');

  // Get or create caption input and display inside photoReviewContainer but outside photoLayout
  let captionInput = document.getElementById('captionInput');
  let captionDisplay = document.getElementById('captionDisplay');

  if (!captionInput) {
    captionInput = document.createElement('input');
    captionInput.type = 'text';
    captionInput.placeholder = 'Add a caption for all photos...';
    captionInput.id = 'captionInput';

    captionDisplay = document.createElement('div');
    captionDisplay.id = 'captionDisplay';

    // Append captionInput outside photoLayout (you can keep this)
    photoLayout.parentElement.appendChild(captionInput);
  }

  // Append captionDisplay INSIDE photoLayout so it is captured together
  if (!captionDisplay.parentElement || captionDisplay.parentElement !== photoLayout) {
    photoLayout.appendChild(captionDisplay);
  }

  function isColorDark(color) {
    const c = color.charAt(0) === '#' ? color.substring(1) : color;
    const r = parseInt(c.substr(0, 2), 16);
    const g = parseInt(c.substr(2, 2), 16);
    const b = parseInt(c.substr(4, 2), 16);
    const luminance = 0.299 * r + 0.587 * g + 0.114 * b;
    return luminance < 128;
  }

  function buildPhotos() {
    photoLayout.innerHTML = ''; // clear all including previous captionDisplay

    // Append captionDisplay again inside photoLayout after clearing
    photoLayout.appendChild(captionDisplay);

    photoLayout.style.backgroundColor = borderColorPicker.value;

    // Adjust caption text color based on background
    if (isColorDark(borderColorPicker.value)) {
      captionDisplay.style.color = '#fff';
    } else {
      captionDisplay.style.color = '#000';
    }

    const photosToShow = photos.slice(0, layoutCount);
    photosToShow.forEach((src, i) => {
      const img = document.createElement('img');
      img.src = src;
      img.alt = `Photo ${i + 1}`;
      photoLayout.appendChild(img);
    });

    // Wrap caption text in quotes on load if there is text
    if (captionInput.value) {
      captionDisplay.textContent = `"${captionInput.value}"`;
    } else {
      captionDisplay.textContent = '';
    }
  }

  borderColorPicker.addEventListener('input', () => {
    photoLayout.style.backgroundColor = borderColorPicker.value;
    if (isColorDark(borderColorPicker.value)) {
      captionDisplay.style.color = '#fff';
    } else {
      captionDisplay.style.color = '#000';
    }
  });

  captionInput.addEventListener('input', (e) => {
    // Always wrap caption text in double quotes
    captionDisplay.textContent = e.target.value ? `"${e.target.value}"` : '';
  });

  downloadBtn.addEventListener('click', () => {
    downloadBtn.disabled = true;
    downloadBtn.textContent = 'Processing...';

    // Capture photoLayout only, since captionDisplay is inside it
    html2canvas(photoLayout).then(canvas => {
      const link = document.createElement('a');
      link.download = 'my_photos.png';
      link.href = canvas.toDataURL('image/png');
      link.click();

      downloadBtn.disabled = false;
      downloadBtn.textContent = 'Download All';
    }).catch(() => {
      alert('Failed to generate image. Try again.');
      downloadBtn.disabled = false;
      downloadBtn.textContent = 'Download All';
    });
  });

  buildPhotos();
});
