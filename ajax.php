<?php
/**
 * AJAX callback functions for PHPMailDebug.
 */
require_once 'common.php';

$post = filter_input_array(INPUT_POST);

if (empty($post)) {
  header('Location: index.php');
}

switch ($post['cmd']) {
  case 'getNewMails':
    // Gather new mails.
    $query = query('SELECT * FROM mail WHERE timestamp > :timestamp ORDER BY timestamp ASC',
      array(':timestamp' => $post['timestampMax']))->fetchAll(PDO::FETCH_CLASS);

    // Assemble a data array for js.
    $data = array();
    foreach ($query as $q) {
      $header = get_header_data($q->header);
      $data['mails'][] = array(
        'id' => $q->id,
        'from' => $header['from'],
        'subject' => $header['subject'],
        'date' => date('Y-m-d H:i:s', $q->timestamp),
      );
    }

    // The last mail from the query is the latest mail, so we remember
    // its timestamp.
    if (!empty($data)) {
      $data['timestampMax'] = $q->timestamp;
    }

    echo json_encode($data);
    break;

  case 'getMailById':
    $query = query('SELECT * FROM `mail` WHERE `id` = :id', array(':id' => $post['id']))->fetchObject();
    // Mark mail read.
    query('UPDATE mail SET `read` = :read WHERE `id` = :id', array(':read' => 1, ':id' => $post['id']));

    $data['header'] = get_header_data($query->header);
    $data['datetime'] = date('Y-m-d H:i:s', $query->timestamp);

    if (isset($data['header']['content-type'])) {
      $content_type = explode(';', $data['header']['content-type']);
      if ($content_type[0] == 'multipart/mixed') {
        preg_match('/"(.*)"/i', $content_type[1], $match);
        $boundary = $match[1];
      }
    }
    $msg = $query->message;

    if (isset($boundary)) {
      $mail_ct_type = isset($post['ctType']) ? $post['ctType'] : 'text/html';
      $data['def_ct_type'] = $mail_ct_type;
      $nl = get_new_line_character($msg);
      $lines = explode($nl, $msg);

      $ct = '';
      $boundary_found = false;
      $boundary_header = '';
      $read_data = false;
      $message = '';

      foreach ($lines as $line) {
        if (!$read_data) {
          if (strpos($line, $boundary) !== FALSE && !$boundary_found) {
            $boundary_found = true;
            continue;
          }

          if ($boundary_found) {
            $boundary_header .= $line . $nl;
          }

          if (strlen($line) == 0 && $boundary_found) {
            $bh = get_header_data($boundary_header);

            $ct_array = explode(';', $bh['content-type']);
            if (!isset($data['content_type'])) {
              $data['content_type'] = array();
            }

            if (!in_array($ct_array[0], $data['content_type']) && strpos($ct_array[0], 'text') === 0) {
              $data['content_type'][] = $ct_array[0];
            }

            if ($ct_array[0] == $mail_ct_type) {
              $read_data = true;
            }

            $content_type = explode(';', $bh['content-type']);
            if ($content_type[0] == 'multipart/alternative') {
              preg_match('/"(.*)"/i', $content_type[1], $match);
              $boundary = $match[1];
              $boundary_found = false;
            }
          }
        }
        else {
          if (strpos($line, $boundary) !== FALSE) {
            break;
          }

          $message .= $line . ($mail_ct_type == 'text/plain' ? '<br>' : '');
        }
      }
    }

    if (!empty($message)) {
      $msg = $message;
    }
    else {
      $msg = nl2br($msg);
    }

    $data['message'] = $msg;

    echo json_encode($data);
    break;

  case 'getSource':
    $query = query('SELECT * FROM mail WHERE id = :id', array(':id' => $post['id']))->fetchObject();

    if (empty($query)) {
      echo 'No such message with the given id of ' . $post['id'];
      exit();
    }

    echo json_encode('<pre>' . htmlspecialchars($query->header . $query->message) . '</pre>');
    break;

  case 'deleteAllSelectedMessage':
    foreach ($post['mailIds'] as $id) {
      query('DELETE FROM mail WHERE id = (:id)', array(':id' => $id));
    }
    echo json_encode(true);
    break;

  default:
    echo 'Invalid command!';
    break;
}
