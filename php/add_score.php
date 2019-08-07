<?php

header("Content-Type: text/html; charset=utf-8");
require '../config/config.php';
define('DB_HOST', $config['host_address']);
define('DB_DBNAME', $config['name']);
define('DB_USER', $config['username']);
define('DB_PASSWORD', $config['password']);

$id = \intval($_POST['id']);
$table = $_POST['table'];

$con = mysqli_connect(DB_HOST, DB_USER, DB_PASSWORD, DB_DBNAME);
if (!$con) {
    die('Connect Error (' . mysqli_connect_errno() . ') '
            . mysqli_connect_error());
}
if ($table == "sentences") {
    $sql = "SELECT score FROM sentence_scores "
            . "WHERE sentence_id = '" . $id . "'";
} else if ($table == "tags") {
    $sql = "SELECT score FROM tags "
            . "WHERE tag_id = '" . $id . "'";
}

$result = mysqli_query($con, $sql);
if (!$result) {
    die("Query failed");
}
if (empty($result)) {
    echo"empty";
}
$row = mysqli_fetch_array($result);

$score = $row['score'];

$new_score = $score + 1;


if ($table == "sentences") {
    $sql = "UPDATE sentence_scores SET score='" . $new_score
            . "' WHERE sentence_id = '" . $id . "'";
} else if ($table == "tags") {
    $sql = "UPDATE tags SET score='" . $new_score
            . "' WHERE tag_id = '" . $id . "'";
}
mysqli_query($con, $sql);
echo mysqli_affected_rows($con);

mysqli_close($con);
?> 
