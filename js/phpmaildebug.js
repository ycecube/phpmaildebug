/*
 * JS for PHPMailDebug.
 */

var mailId = null;
var unreadMails = 0;

$(document).ready(function() {
  // Count unread mails and update title.
  updateTitle();

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
        timestampMax: PMD.timestampMax
      },
      success: function(data) {
        for (var key in data.mails) {
          // Assemble mail list item.
          var mail = '<div class="mail" data-id="' + data.mails[key].id + '">' +
              '<div class="mail-from">' +
                '<input type="checkbox">' +
                '<span class="unread">' + data.mails[key].from + '</span>' +
              '</div>' +
              '<div class="mail-subject">' + data.mails[key].subject + '</div>' +
              '<div class="mail-timestamp">' + data.mails[key].date + '</div>' +
            '</div>';

          // Append before the first mail in the list.
          if ($('#mails .mail').length > 0) {
            $('#mails .mail:first-child').before(mail);
          }
          else {
            $('#mails').html(mail);
          }

          updateTitle();

          notify(data.mails[key].from, data.mails[key].subject);
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

  /* *** Mail selection options. *** */

  // Select all mail in the list.
  $('#mail-options #select-all').click(function(event) {
    if ($('#mails .mail').length > 0) {
      $('#mails .mail .mail-from input[type="checkbox"]').prop('checked', true);

      $(this).css('display', 'none').removeClass("visible");
      $('#mail-options #deselect-all').css('display', 'inline-block').addClass('visible');
      $('#mail-options #delete-selected').css('display', 'inline-block').addClass('visible');
    }
  });

  // Deselect all mail in the list.
  $('#mail-options #deselect-all').click(function(event) {
    $('#mails .mail .mail-from input[type="checkbox"]').prop('checked', false);

    $(this).css('display', 'none');
    $('#mail-options #select-all').css('display', 'inline-block');
    $('#mail-options #delete-selected').css('display', 'none');
  });

  // Confirmation message for deleting mails.
  $('#mail-options #delete-selected').click(function(event) {
    var confirmMessage = '<div id="delete-all-confirm">' +
      'Are you sure you want to delete all selected messages?' +
    '</div>';

    $(confirmMessage).dialog({
      resizable: false,
      modal: true,
      minHeight: 0,
      closeOnEscape: false,
      dialogClass: 'no-close',
      title: 'Warning',
      buttons: [
        {
          text: 'Yes',
          'class': 'button-yes',
          click: function() {
            // Collect select mail ids.
            var ids = Array();
            $('#mails .mail .mail-from input[type="checkbox"]:checked').each(function() {
              ids.push($(this).closest('.mail').attr('data-id'));
            });

            $.ajax({
              url: 'ajax.php',
              type: 'POST',
              dataType: 'json',
              data: {
                cmd: 'deleteAllSelectedMessage',
                mailIds: ids
              },
              success: function(data) {
                // Remove mails form the list.
                $('#mails .mail .mail-from input[type="checkbox"]:checked').each(function() {
                  $(this).closest('.mail').remove();
                });

                if ($('#mails .mail .mail-from input[type="checkbox"]:checked').length == 0) {
                  PMD.timestampMax = 0;
                }

                // Remove values.
                if ($.inArray(mailId, ids) > -1) {
                  setValuesOnMainContent('','','','','');
                  $('#header-content-type').html('');
                }

                // Trigger deselect all to reset the buttons.
                $('#mail-options #deselect-all').click();
              }
            });

            $(this).dialog( "destroy" );
          }
        },
        {
          text: 'Cancel',
          'class': 'button-cancel',
          click: function() {
            $(this).dialog( "destroy" );
          }
        },
      ]
    });
  });

  // Act on mail selection.
  $('#mails').on('click', '.mail input[type="checkbox"]', function(event) {
    var selected = $('#mails .mail input[type="checkbox"]:checked').length;
    var notSelected = $('#mails .mail input[type="checkbox"]:not(:checked)').length;

    if (selected == 0) {
      $('#mail-options #select-all').css('display', 'inline-block');
      $('#mail-options #deselect-all').css('display', 'none');
      $('#mail-options #delete-selected').css('display', 'none');
    }
    else if (selected > 0 && notSelected != 0) {
      $('#mail-options #select-all').css('display', 'inline-block');
      $('#mail-options #deselect-all').css('display', 'inline-block');
      $('#mail-options #delete-selected').css('display', 'inline-block');
    }
    else if (notSelected == 0) {
      $('#mail-options #select-all').css('display', 'none');
      $('#mail-options #deselect-all').css('display', 'inline-block');
      $('#mail-options #delete-selected').css('display', 'inline-block');
    }
  });

  // Load mail from database.
  $('#mails').on('click', '.mail', mailOnClickAction);

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
          $(data).dialog({
            resizable: true,
            modal: true,
            maxHeight: 600,
            minHeight: 0,
            minWidth: 800,
            title: 'Mail source',
          });
        }
      });
    }
  });
});

/**
 * On mouse click action to load mail from database through ajax.
 *
 * @param event
 *   The jQuery's click event.
 */
function mailOnClickAction(event) {
  // Do nothing here, if we clicked on the input field.
  if ($(event.target).is('input')) {
    return;
  }

  // Get mail ID.
  mailId = $(this).attr('data-id');

  // Set currently clicked mail active.
  $('#mails .mail').removeClass('active');
  $(this).addClass('active');

  // Load mail with ID.
  $.ajax({
    url: 'ajax.php',
    type: 'POST',
    dataType: 'json',
    data: {
      cmd: 'getMailById',
      id: mailId
    },
    success: function(data) {
      // Set values in the main content.
      setValuesOnMainContent(data.header.from, data.header.to, data.datetime, data.header.subject, data.message);

      // Mark mail read.
      $('#mails .mail[data-id="' + mailId + '"] .mail-from span.unread').removeClass('unread').addClass('read');
      updateTitle();

      // If there is alternative content types, provide a dropdown list to be
      // able to choose between them.
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

          // Attach change action for selector, to load the mail with the
          // selected type.
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
                // Update mail body.
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

/**
 * Determine and set the real height of the content list.
 */
function setContentListHeight() {
  var headerHeight = $('#header').height() + 2 * $('#header').offset().top + $('#mail-options').height() + 25;
  $('#mails, #read-mail').height($(window).height() - headerHeight);
}

/**
 * Set mail values on the main content.
 *
 * @param from
 *   Mail from.
 * @param to
 *   Mail sent to.
 * @param date
 *   The date when the mails sent.
 * @param subject
 *   Subject of the mail.
 * @param message
 *   The body of the mail.
 */
function setValuesOnMainContent(from, to, date, subject, message) {
  $('#header-from span.value').html(from);
  $('#header-to span.value').html(to);
  $('#header-date span.value').html(date);
  $('#header-subject span.value').html(subject);
  $('#mail-body').html(message);
}

/**
 * Desktop notifications.
 *
 * Used source: http://stackoverflow.com/a/23974386
 */
function notify(from, subject) {
  // Check if notification is available.
  if (!("Notification" in window)) {
    return false;
  }

  var notification = null;
  var options = {
    icon: 'images/mail.png',
    body: 'From: ' + from + '\nSubject: ' + subject
  };
  var title = 'New message in PHPMailDebug';
  if (Notification.permission === "granted") {
    // If it's okay let's create a notification
    notification = new Notification(title, options);
  }
  // Otherwise, we need to ask the user for permission
  // Note, Chrome does not implement the permission static property
  // So we have to check for NOT 'denied' instead of 'default'
  else if (Notification.permission !== 'denied') {
    Notification.requestPermission(function (permission) {

      // Whatever the user answers, we make sure we store the information
      if(!('permission' in Notification)) {
        Notification.permission = permission;
      }

      // If the user is okay, let's create a notification
      if (permission === "granted") {
        notification = new Notification(title, options);
      }
    });
  }

  // Remove message after a while.
  setTimeout(function() {
    if (notification !== null) {
      notification.close();
    }
  }, 4000);
}

/**
 * Update title with the unread mail count.
 */
function updateTitle() {
  var title = $('title').html().split(' ')[0];
  var mailNum = $('#mails .mail .mail-from span.unread').length;

  if (mailNum === 0) {
    $('title').html(title);
  }
  else {
    $('title').html(title + ' ' + '(' + mailNum + ')');
  }
}
