let pickUpDateInput = $('#pickup-date')
let message = document.querySelector('#message')

$(document).ready(function () {
  $('#message').summernote({
    toolbar: [
      // [groupName, [list of button]]
      ['style', ['bold', 'italic', 'underline', 'clear']],
      ['color', ['color']],
      ['para', ['ul', 'ol', 'paragraph']]
    ],
    placeholder: '',
    height: 250,
    minHeight: 100,
    maxHeight: 450,
  });

  $('.notifications').summernote();
});


$(pickUpDateInput).change(function () {
  let pickUpDate = pickUpDateInput[0].value;
  let sendToField = $('#send-to');
  let listingNameField = $('#listing-name');

  console.log(listingNameField)

  let listingName = listingNameField[0].attributes.listing.value;
  let sendToName = sendToField[0].attributes.sendTo.value;
  console.log(sendToName);
  console.log(pickUpDate);
  HTMLstring = `Hi ${sendToName}, I would like to come pick-up your ${listingName} on the ${pickUpDate}.`;
  

  $('#message').summernote('pasteHTML', HTMLstring);

});