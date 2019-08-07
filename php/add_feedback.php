<?php
header("Content-Type: text/html; charset=utf-8");
require '../config/config.php';
define('DB_HOST', $config['host_address']);
define('DB_DBNAME', $config['name']);
define('DB_USER', $config['username']);
define('DB_PASSWORD', $config['password']);

$feedback = $_POST['feedback'];
$con = mysqli_connect(DB_HOST, DB_USER, DB_PASSWORD , DB_DBNAME);
if (!$con) {
    die('Connect Error (' . mysqli_connect_errno() . ') '
            . mysqli_connect_error());
}
mysqli_set_charset($con, "utf8");
$sql = "INSERT INTO feedback VALUES (NULL, '"
        . $feedback . "')";
mysqli_query($con, $sql);
echo mysqli_affected_rows($con);

mysqli_close($con);

?> 
    
