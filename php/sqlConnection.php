<?php
    $host = "localhost";
    $user = "Travis";
    $passwd = "test1234";
    $dbname = "steam_new";

    $mysqli = new mysqli($host, $user, $passwd, $dbname);
    $error = "";
    if ($mysqli->connect_errno) {
        $error .= "Failed to connect to MySQL: " . $mysqli->connect_error . "<br/>Error number: ". $mysqli->connect_errno;
    }
?>