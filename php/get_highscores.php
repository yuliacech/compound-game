
<?php

require '../config/config.php';
define('DB_HOST', $config['host_address']);
define('DB_DBNAME', $config['name']);
define('DB_USER', $config['username']);
define('DB_PASSWORD', $config['password']);

$con = mysqli_connect(DB_HOST, DB_USER, DB_PASSWORD, DB_DBNAME);
if (!$con) {
    die('Connect Error (' . mysqli_connect_errno() . ') '
            . mysqli_connect_error());
}
// connection encoding should be utf8!
mysqli_set_charset($con, "utf8");
$sql = "SELECT name, highscore FROM highscores "
        . "ORDER BY highscore DESC";
$result = mysqli_query($con, $sql);
if(!$result) {die("Query failed");}
if(empty($result)) {echo"empty";}
$rows = array();
while($row= mysqli_fetch_assoc($result)) {
    $rows[] = $row;
}
echo json_encode($rows);

mysqli_close($con);
?> 
