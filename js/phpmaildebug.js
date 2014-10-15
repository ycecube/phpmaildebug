/*
 * JS for PHPMailDebug.
 */

var mailId = null;

$(document).ready(function() {
  // Set mail list height to the max of the window height.
  setContentListHeight();
  $(window).resize(setContentListHeight);

  // Auto refresh mails list.
  var autoRefresh = function() {
    $.ajax({
      url: 'ajax.php',
      type: 'POST',
      dataType: 'json',
      data: {
        cmd: 'getNewMails',
        timestampMax: PMD.timestampMax,
      },
      success: function(data) {
        for (var key in data.mails) {
          // Assemble mail list item.
          var mail = '<div class="mail" data-id="' + data.mails[key].id + '">' +
              '<div class="mail-from">' + data.mails[key].from + '</div>' +
              '<div class="mail-subject">' + data.mails[key].subject + '</div>' +
              '<div class="mail-timestamp">' + data.mails[key].date + '</div>' +
            '</div>';

          // Append before the first mail in the list.
          $('#mails .mail:first-child').before(mail);
        }

        // Update with the last timestamp.
        if (data.length != []) {
          PMD.timestampMax = data.timestampMax;
        }
      }
    });
  }
  // Start only if auto refresh was set.
  if (PMD.autoRefresh == 1) {
    setInterval(autoRefresh, PMD.autoRefreshInterval);
  }

  // Load mail from database.
  jQuery('#mails').on('click', '.mail', mailOnClickAction);

  // Get mail's source.
  $('#read-mail #source').click(function() {
    if (mailId !== null) {
      $.ajax({
        url: 'ajax.php',
        type: 'POST',
        dataType: 'json',
        data: {
          cmd: 'getSource',
          id: mailId
        },
        success: function(data) {
          var win = window.open();
          win.document.write(data);
        }
      });
    }
  });
});

function mailOnClickAction(event) {
  mailId = $(this).attr('data-id');

  $.ajax({
    url: 'ajax.php',
    type: 'POST',
    dataType: 'json',
    data: {
      cmd: 'getMailById',
      id: mailId
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
                cmd: 'getMailById',
                id: mailId,
                ctType: type
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
}

function setContentListHeight() {
  var headerHeight = $('#header').height() + 2 * $('#header').offset().top;
  $('#mails, #read-mail').height($(window).height() - headerHeight);
}
