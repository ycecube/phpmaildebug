/*
 * JS for PHPMailDebug.
 */

$(document).ready(function() {
  // Set mail list height to the max of the window height.
  setContentListHeight();
  $(window).resize(setContentListHeight);
  var mailId = null;

  // Load mail from database.
  $('#mails .mail').click(function(event) {
    mailId = $(this).attr('data-id');

    $.ajax({
      url: 'ajax.php',
      type: 'POST',
      dataType: 'json',
      data: {
        'cmd': 'getMailById',
        'id': mailId
      },
      success: function(data) {
        $('#header-from span').html(data.header.from);
        $('#header-to span').html(data.header.to);
        $('#header-date span').html(data.datetime);
        $('#header-subject span').html(data.header.subject);
        $('#mail-body').html(data.message);

        if (data.content_type !== undefined) {
          if ($('#header-content-type select').length === 0) {
            var options = '';
            $.each(data.content_type, function(key, value) {
              var selected = '';
              if (value === data.def_ct_type) {
                selected = ' selected="1"';
              }
              options += '<option value="' + value + '"' + selected + '>' + value + '</option>';
            });

            var ct_select = '<select>' + options + '</select>';

            $('#header-content-type').append(ct_select).change(function(event) {
              var type = $(this).find(':selected').val();
              $.ajax({
                url: 'ajax.php',
                type: 'POST',
                dataType: 'json',
                data: {
                  'cmd': 'getMailById',
                  'id': mailId,
                  'ctType': type
                },
                success: function(data) {
                  $('#mail-body').html(data.message);
                }
              });
            });
          }
        }
        else {
          $('#header-content-type').html('');
        }
      }
    });
  });

  // Get mail's source.
  $('#read-mail #source').click(function() {
    if (mailId !== null) {
      $.ajax({
        url: 'ajax.php',
        type: 'POST',
        dataType: 'json',
        data: {
          'cmd': 'getSource',
          'id': mailId
        },
        success: function(data) {
          win = window.open();
          win.document.write(data);
        }
      });
    }
  });
});

function setContentListHeight() {
  var headerHeight = $('#header').height() + 2 * $('#header').offset().top;
  $('#mails, #read-mail').height($(window).height() - headerHeight);
}
