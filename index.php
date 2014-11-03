<?php
/**
 * PHPMailDebug for local developement.
 *
 * @author Tamas Nagy <ycecube@gmail.com>
 */

require_once 'common.php';

$mails = query('SELECT * FROM mail ORDER BY timestamp DESC')->fetchAll();

if (!isset($auto_refresh)) {
  $auto_refresh = 0;
}
$date_max = query('SELECT MAX(timestamp) FROM mail')->fetch(PDO::FETCH_COLUMN);

if (empty($date_max)) {
  $date_max = 0;
}
?>

<!DOCTYPE html>
<html>
  <head>
    <title>PHPMailDebug</title>
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
    <link href="css/style.css" rel="stylesheet" type="text/css" />
    <link href="css/jquery-ui.css" rel="stylesheet" type="text/css" />
    <script src="js/jquery.js" type="text/javascript"></script>
    <script src="js/jquery-ui.min.js" type="text/javascript"></script>
    <script type="text/javascript">
      PMD = {};
      PMD.autoRefresh = <?php echo $auto_refresh ? 1 : 0; ?>;

      if (PMD.autoRefresh == 1) {
        PMD.autoRefreshInterval = <?php echo $auto_refresh_interval; ?>;
        PMD.timestampMax = <?php echo $date_max; ?>;
      }
    </script>
    <script src="js/phpmaildebug.js" type="text/javascript"></script>
  </head>
  <body>
    <div id="header">
      <h1 id="title">PHPMailDebug</h1>
    </div>
    <div id="content">
      <div id="mail-options">
        <button id="select-all" class="visible">Select all</button>
        <button id="deselect-all">Deselect all</button>
        <button id="delete-selected">Delete selected</button>
      </div>
      <div id="mails">
      <?php foreach ($mails as $mail): ?>
        <div class="mail" data-id="<?php echo $mail['id']; ?>">
          <?php $header = get_header_data($mail['header']); ?>
          <div class="mail-from">
            <input type="checkbox">
            <span><?php echo $header['from']; ?></span>
          </div>
          <div class="mail-subject"><?php echo $header['subject']; ?></div>
          <div class="mail-timestamp"><?php echo date('Y-m-d H:i:s', $mail['timestamp']); ?></div>
        </div>
      <?php endforeach; ?>
      </div><!-- /mails -->
      <div id="read-mail">
        <div id="mail-header">
          <div id="header-from"><span class="label">From:</span> <span class="value"></span></div>
          <div id="header-to"><span class="label">To:</span> <span class="value"></span></div>
          <div id="header-date"><span class="label">Date:</span> <span class="value"></span></div>
          <div id="header-subject"><span class="label">Subject:</span> <span class="value"></span></div>
          <div id="header-options">
            <button id="source">Source</button>
            <div id="header-content-type"></div>
          </div>
        </div>
        <div id="mail-body"></div>
      </div><!-- /read-mail -->
    </div><!-- /content -->
  </body>
</html>
