<?php
/**
 * Database related stuff.
 *
 * @TODO: Add support for other database types.
 */

// Database connection.
$db = new PDO("mysql:host={$host};dbname={$name}", $user, $pass, array(\PDO::ATTR_PERSISTENT  => true));

/**
 * Database query.
 *
 * Executes a query with the given arguments if there is any.
 * Fields can be fetched with the PHP's functions.
 * @see http://php.net/manual/en/class.pdostatement.php#class.pdostatement
 *
 * @global PDO $db
 *
 * @param string $query
 * @param array $arguments
 *
 * @return PDOStatement
 */
function query($query, array $arguments = array()) {
  global $db;

  $ps = $db->prepare($query);

  foreach ($arguments as $key => $argument) {
    if (is_integer($argument)) {
      $ps->bindValue($key, $argument, \PDO::PARAM_INT);
    }
    else if (is_bool($argument)) {
      $ps->bindValue($key, $argument, \PDO::PARAM_BOOL);
    }
    else if (is_null($argument)) {
      $ps->bindValue($key, $argument, \PDO::PARAM_NULL);
    }
    else {
      $ps->bindValue($key, $argument, \PDO::PARAM_STR);
    }
  }
  $ps->execute();

  return $ps;
}
