PHPMailDebug
============
This script intended to capture all emails coming from the PHP's sendmail
output. This should be used only for debugging in a developement environment.

Note: This project is in a very early stage, so bugs highly possible.
      Any contributions are welcomed :)

Requirements
============
An already installed webserver (eg.: Apache), a MySQL server and a PHP
with MySQL PDO module enabled.
PHP version must be at least 5.3.

Installation
============
1. Copy phpmaildebug to a folder where you can access it from the web browser.
   For example in Ubuntu the default folder for apache is /var/www/ and if you
   copy phpmaildebug into it, then you should be able to access it like:
   http://localhost/phpmaildebug
2. Create a database
3. Import the database.sql into your database.
4. Copy settings.php-example to settings.php
5. In settings.php change variables to be able to connect to your database.
6. In php.ini uncomment "sendmail_path" and set like this:
   sendmail_path = "php -f /path/to/phpmaildebug/cli.php"
   In some cases you may need to set the full path to the php execution.
7. Done, by default you can access it like: http://localhost/phpmaildebug
