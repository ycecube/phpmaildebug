<?php
/**
 * PHPMailDebug for local developement.
 *
 * Capture sendmail output.
 * Do nothing if it is not called from cli.
 */
if (php_sapi_name() == 'cli') {
  require_once 'common.php';

  // Get content from the standard input.
  $pointer = fopen('php://stdin', 'r');

  $header = '';
  $message = '';
  $message_data = false;

  while ($line = fgets($pointer)) {
    // Collect header data.
    if (!$message_data) {
      $header .= $line;
    }

    // Collect message data.
    if (!$message_data && ($line == "\n" || $line == "\r" || $line == "\n\r")) {
      $message_data = true;
      continue;
    }
    else if ($message_data) {
      $message .= $line;
    }
  }

  // Prepare statement.
  $args = array(
    ':message' => $message,
    ':header' => $header,
    ':timestamp' => REQUEST_TIME,
  );
  // Execute query, save mail data.
  query('INSERT INTO mail(header, message, timestamp) VALUES(:header, :message, :timestamp)', $args);
}
