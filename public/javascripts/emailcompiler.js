let pickUpDateInput = $('#pickup-date');
let message = document.querySelector('#message');
let today = new Date();

$(document).ready(function () {
  $('#message').summernote({
    toolbar: [],

    placeholder: '',
    height: 250,
    minHeight: 100,
    maxHeight: 450,
  });

  $('.notifications').summernote();

  let sendToField = $('#send-to');
  let listingNameField = $('#listing-name');
  let pickUpDate;
  const url = listingNameField[0].baseURI;

  if ($('#pickupDateDefault').innerText) {
    pickUpDate = $('#pickupDateDefault').attr('pickupDate');

    let listingName = listingNameField[0].attributes.listing.value; //listingname => aaa
    let sendToName = sendToField[0].attributes.sendTo.value; //authormname => stefano

    if ($('#listing-type')[0].innerText === 'Offer') {
      HTMLstring = `Hi ${sendToName}, I would like to come pick-up your <a href="${url}">${listingName}</a> on the ${pickUpDate}. Where would you like to meet?`;
    } else {
      HTMLstring = `<p>Hi ${sendToName}, I actually have a spare <a href="${url}">${listingName}</a>, and I could give it to you on the ${pickUpDate}. Where would you like to meet?</p>`;
    }
    $('#message').summernote('pasteHTML', HTMLstring);
  }

});


$(pickUpDateInput).change(function () {
  let pickUpDate = pickUpDateInput[0].value;
  let sendToField = $('#send-to');
  let listingNameField = $('#listing-name');
  const url = listingNameField[0].baseURI;
  // console.log(listingNameField[0].baseURI)

  let listingName = listingNameField[0].attributes.listing.value; //listingname => aaa
  let sendToName = sendToField[0].attributes.sendTo.value; //authormname => stefano


  // console.log(sendToName);
  // console.log(pickUpDate);

  if ($('#listing-type')[0].innerText === 'Offer') {
    HTMLstring = `<p>Hi ${sendToName}, I would like to come pick-up your <a href="${url}">${listingName}</a> on the ${pickUpDate}. Where would you like to meet?</p>`;
  } else {
    HTMLstring = `<p>Hi ${sendToName}, I actually have a spare <a href="${url}">${listingName}</a>, and I could give it to you on the ${pickUpDate}. Where would you like to meet?</p>`;

  }

  $('#message').summernote('pasteHTML', HTMLstring);

  pickUpDate = new Date($(this).val());

  if (pickUpDate < today) {
    $('#send-email').prop('disabled')
    $('#send-email').removeClass('btn-primary');
    $('#send-email').addClass('btn-warning');
    console.log($('#send-email'))
    $('#error').removeClass('d-none');
  } else {
    $('#send-email').removeClass('btn-warning');
    $('#send-email').addClass('btn-primary');
    $('#error').addClass('d-none');
  }

});