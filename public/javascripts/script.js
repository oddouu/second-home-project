document.addEventListener('DOMContentLoaded', () => {

  console.log('IronGenerator JS imported successfully!');

}, false);
let editImageInput = $('#edit-image');
let listingImage = $('#listing-image');

$(document).ready(function () {
  $('[data-toggle="popover"]').popover('toggle');
});

$('#listing-image').on("mouseenter mouseleave", function () {
  $('#edit-image').removeClass('d-none');
});
