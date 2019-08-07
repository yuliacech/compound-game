<?php

require '../config/config.php';
define('DB_HOST', $config['host_address']);
define('DB_DBNAME', $config['name']);
define('DB_USER', $config['username']);
define('DB_PASSWORD', $config['password']);

$length = \intval($_GET['length']);

$con = mysqli_connect(DB_HOST, DB_USER, DB_PASSWORD, DB_DBNAME);
if (!$con) {
    die('Connect Error (' . mysqli_connect_errno() . ') '
            . mysqli_connect_error());
}
// connection encoding should be utf8!
mysqli_set_charset($con, "utf8");
// index between 1 and 100 will be used 
$rand_ind = rand(1, $config['compound_range']);

$sql = "SELECT compound FROM compounds WHERE compound_id = '" . $rand_ind . "'";
$result = mysqli_query($con, $sql);
$row = mysqli_fetch_array($result);
$compound = $row['compound'];
while (strlen($compound) > $length) {
    // choose new index in the same range
    $rand_ind = rand(1, $config['compound_range']);
    $sql = "SELECT compound FROM compounds WHERE compound_id = '" . $rand_ind . "'";
    $result = mysqli_query($con, $sql);
    $row = mysqli_fetch_array($result);
    $compound = $row['compound'];
}
echo $compound;

mysqli_close($con);
?> 
