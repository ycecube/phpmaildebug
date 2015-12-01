<?php
/**
 * Common stuff for both cli and website.
 */

require_once 'settings.php';
require_once 'database.php';
require_once 'functions.php';

date_default_timezone_set($default_timezone);

define('REQUEST_TIME', time());
