(() => {
  'use strict'
  
  // Fetch all the forms we want to apply custom Bootstrap validation styles to
  const forms = document.querySelectorAll('.needs-validation')
  
  // Loop over them and prevent submission
  Array.from(forms).forEach(form => {
    form.addEventListener('submit', event => {
      if (!form.checkValidity()) {
        event.preventDefault()
        event.stopPropagation()
      }
      form.classList.add('was-validated')
    }, false)
  })
})()

// Function to handle search
function handleSearch(event) {
  event.preventDefault();
  var search = document.querySelector('.search-input').value;
  var currentUrl = new URL(window.location.href);
  currentUrl.searchParams.set('search', search);
  window.location.href = currentUrl.toString();
}

// Add event listener to search form
document.addEventListener('DOMContentLoaded', () => {
  const searchForm = document.querySelector('.search-form');
  if (searchForm) {
    searchForm.addEventListener('submit', handleSearch);
  }
});
