<?php
/**
 * PHPMailDebug for local developement.
 *
 * @author Tamas Nagy <ycecube@gmail.com>
 */

require_once 'common.php';

$mails = query('SELECT * FROM mail ORDER BY timestamp DESC')->fetchAll();
?>

<!DOCTYPE html>
<html>
  <head>
    <title>PHPMailDebug</title>
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
    <link href="css/style.css" rel="stylesheet" type="text/css" />
    <script src="js/jquery.js" type="text/javascript"></script>
    <script src="js/phpmaildebug.js" type="text/javascript"></script>
  </head>
  <body>
    <div id="header">
      <h1>PHPMailDebug</h1>
    </div>
    <div id="content">
      <div id="mails">
      <?php foreach ($mails as $mail): ?>
        <div class="mail" data-id="<?php echo $mail['id']; ?>">
          <?php $header = get_header_data($mail['header']); ?>
          <div class="mail-from"><?php echo $header['from']; ?></div>
          <div class="mail-subject"><?php echo $header['subject']; ?></div>
          <div class="mail-timstamp"><?php echo date('Y-m-d H:i:s', $mail['timestamp']); ?></div>
        </div>
      <?php endforeach; ?>
      </div>
      <div id="read-mail">
        <div id="mail-header">
          <div id="header-from">From: <span></span></div>
          <div id="header-to">To: <span></span></div>
          <div id="header-date">Date: <span></span></div>
          <div id="header-subject">Subject: <span></span></div>
          <div id="header-options">
            <a href="#" id="source">Source</a>
            <div id="header-content-type"></div>
          </div>
        </div>
        <div id="mail-body"></div>
      </div>
    </div>
  </body>
</html>
