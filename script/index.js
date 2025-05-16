document.addEventListener('DOMContentLoaded', () => {
  // Pop in all body children on page load
  document.body.querySelectorAll('*').forEach(el => {
    el.classList.add('pop-in');
  });

  // Replace your takePhoto function or wrap it:
  const captureBtn = document.querySelector('.capture-btn');
  captureBtn.addEventListener('click', () => {
    // Remove pop-in and add pop-out on all elements
    document.body.querySelectorAll('*').forEach(el => {
      el.classList.remove('pop-in');
      el.classList.add('pop-out');
    });

    // Wait for animation to finish (~300ms), then call your photo logic
    setTimeout(() => {
      takePhoto();  // your existing photo capture function
    }, 300);
  });
});
