<?php
/**
 * Decode base64 or quoted printable strings.
 *
 * @param string $string
 *   An encoded input string.
 * @param string $dest_encode
 *   Destination character encoding.
 *
 * @return string
 *   The decoded string.
 */
function decode($string, $dest_encode = 'UTF-8') {
  preg_match('/"([^"]+)"/', $string, $match);

  $parts = preg_split('/=\?([^?]+)\?([^?]+)\?([^?]+)\?=/i', $string, 0, PREG_SPLIT_DELIM_CAPTURE);

  if (count($parts) == 1) {
    return $string;
  }

  $start_quote = strpos($string, '"');
  $end_quote = strrpos($string, '"');

  $end_string = '';
  if ($start_quote != $end_quote) {
    $end_string = substr($string, $end_quote + 1);
  }

  $decoded = '';
  for ($i = 0; $i < count($parts) - 1; $i += 4) {
    $text = '';
    switch ($parts[$i + 2]) {
      case 'B':
        $text = base64_decode($parts[$i+3]);
        break;
      case 'Q':
        $text = quoted_printable_decode($parts[$i+3]);
        break;
    }
    $decoded .= iconv($parts[$i+1], $dest_encode, $text);
  }

  return $decoded . $end_string;
}

/**
 * Create an array in which the the values are keyed.
 *
 * @param string $data
 *   A line from the header.
 *
 * @return array
 *   Associated array.
 */
function get_header_data($data) {
  $return = array();

  $data_array = explode("\n", $data);
  $last_key = '';
  foreach ($data_array as $value) {
    if (!empty($value)) {
      $key_value = explode (':', $value);

      if (!isset($key_value[1])) {
        $return[$last_key] .= trim($key_value[0]);
      }
      else {
        $last_key = strtolower($key_value[0]);
        $return[strtolower($key_value[0])] = trim($key_value[1]);
      }
    }
  }

  foreach ($return as &$r) {
    $r = htmlspecialchars(decode($r), ENT_NOQUOTES);
  }

  return $return;
}

/**
 * Determine newline character in the mail.
 *
 * @param string $string
 *   A string which has at least one newline.
 * @return mixed
 *   The newline character if found or null if not.
 */
function get_new_line_character($string) {
  for ($i = 0; $i < strlen($string); $i++) {
    if ($string[$i] == "\r" || $string[$i] == "\n" || $string[$i] == "\r\n") {
      return $string[$i];
    }
  }

  return null;
}
