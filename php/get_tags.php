<?php
header("Content-Type: text/html; charset=utf-8");
require '../config/config.php';
define('DB_HOST', $config['host_address']);
define('DB_DBNAME', $config['name']);
define('DB_USER', $config['username']);
define('DB_PASSWORD', $config['password']);

$compound = $_GET['compound'];

$con = mysqli_connect(DB_HOST, DB_USER, DB_PASSWORD , DB_DBNAME);
if (!$con) {
    die('Connect Error (' . mysqli_connect_errno() . ') '
            . mysqli_connect_error());
}
mysqli_set_charset($con, "utf8");
$sql = "SELECT tags.tag, tags.tag_id FROM tags "
        . "INNER JOIN tagged_compounds ON tagged_compounds.tag = tags.tag_id "
        . "INNER JOIN compounds ON compounds.compound_id = tagged_compounds.compound "
        . "WHERE compounds.compound = '" . $compound . "'";
$result = mysqli_query($con, $sql);
if(!$result) {die("Query failed");}
if(empty($result)) {echo"empty";}
$rows = array();
while($row= mysqli_fetch_assoc($result)) {
    $rows[] = $row;
    //echo $row['tag'];
}
echo json_encode($rows);

mysqli_close($con);

?> 
    