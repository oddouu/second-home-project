document.addEventListener('DOMContentLoaded', () => {

  console.log('IronGenerator JS imported successfully!');

}, false);


$(document).ready(function () {
  $('[data-toggle="popover"]').popover('toggle');

  $('#message').summernote({
    toolbar: [
      // [groupName, [list of button]]
      ['style', ['bold', 'italic', 'underline', 'clear']],
      ['color', ['color']],
      ['para', ['ul', 'ol', 'paragraph']]
    ],
    placeholder: 'Write here your email.',
    height: 250,
    minHeight: 100,
    maxHeight: 450,
  });

  $('.notifications').summernote();
});


// firstDropdown for main categories
let firstDropdown = $('#category');
let secondDropdown = $('#subCategory');


firstDropdown.empty();
secondDropdown.empty();

firstDropdown.append('<option selected="true" disabled>Choose Category</option>');
firstDropdown.prop('selectedIndex', 0);

secondDropdown.append('<option selected="true" disabled>Choose sub Category (optional)</option>');
secondDropdown.prop('selectedIndex', 0);

const url = '/categories.JSON';
let subCategories = [];

// Populate firstDropdown with list of categories
$.getJSON(url, function (data) {
  $.each(data, function (key, entry) {
    if (entry.L2) {
      subCategories.push(entry);
    }

    if (entry.L2 === undefined) {
      firstDropdown
        .append($('<option></option>')
          .attr('value', entry.L1)
          .text(entry.L1));
    }

  });
});


$(firstDropdown).change(function () {
  const L2index = firstDropdown[0].value;
  console.log("L2index", L2index);
  //Populate secondDropdown with list of sub-categories
  $.getJSON(url, function (data) {
    $.each(data, function (key, entry) {
      if (entry.L2 && L2index === entry.L1) {
          console.log(L2index);
          console.log(entry);
          secondDropdown
            .append($('<option></option>')
              .attr('value', entry.L2)
              .text(entry.L2));
      }

    });
  });

});