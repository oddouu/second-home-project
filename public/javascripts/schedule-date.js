// selects type dropdown, checkbox and date schedule div input

let typeSelect = $('#listing-type');
let pickupCheckbox = $('#offerTrigger');
let pickupSelect = $('#pickupTrigger');
let inputButton = $('');
let today = new Date();

$(typeSelect).change(function () {
  if (typeSelect[0].value === 'Offer') {
    console.log('offer was selected');
    $(pickupCheckbox).removeClass('d-none');
  } else {
    $(pickupCheckbox).addClass('d-none');
    $(pickupSelect).addClass('d-none');
  }
});

$('input:checkbox').change(function () {
  if ($(this).prop('checked')) {
    console.log('checkbox ticked');
    $(pickupSelect).removeClass('d-none');
    $('#pickup-date').attr("required", "true");
    console.log($('#pickup-date').val(''));
  } else {
    console.log('checkbox not ticked');
    $(pickupSelect).addClass('d-none');
    $('#pickup-date').attr("required", "false");
    $('#pickup-date').val('');
    console.log($('#pickup-date').val(''));

  }
});

$('#pickup-date').change(function () {
  console.log('date selected');
  let pickupDate = new Date($(this).val());
  if (pickupDate < today) {
    $('#submit').addClass('disabled');
    $('#error').removeClass('d-none');
    $(this).val('');
  } else {
    $('#submit').removeClass('disabled');
    $('#error').addClass('d-none');
  }
});