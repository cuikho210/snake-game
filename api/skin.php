<?php
$action = isset($_GET['action']) ? $_GET['action'] : false;

if ($action) {
    if ($action == "get") {

    }

    if ($action == "getAll") {
        require "./db.php";

        echo $db->getSkinList();
    }
}
?>