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


if ($('.count')) {

  $('.count').each(function () {
    $(this).prop('Counter', 0).animate({
      Counter: $(this).text()
    }, {
      duration: 4000,
      easing: 'swing',
      step: function (now) {
        $(this).text(Math.ceil(now));
      }
    });
  });

}

$('.btn').on('click',function() {
  $('.btn').append(`<span class="spinner-grow spinner-grow-sm d-none" role="status" aria-hidden="true">Loading... </span>`);
  console.log(this)
});