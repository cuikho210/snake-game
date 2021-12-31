<?php
$action = isset($_GET['action']) ? $_GET['action'] : false;

if ($action) {
    if ($action == "signup") {
        $name = isset($_POST['name']) ? $_POST['name'] : false;
        if (!$name) die("0");

        require "./db.php";
        $id = $db->newUser($name);
        
        echo json_encode($db->getUser($id));
    }

    if ($action == "get") {
        $id = isset($_POST['id']) ? $_POST['id'] : false;
        if (!$id) die("0");

        require "./db.php";
        $result = $db->getUser($id);

        if ($result) echo json_encode($result);
    }

    if ($action == "saveScore") {
        $id = isset($_POST['id']) ? $_POST['id'] : false;
        if (!$id) die("0");

        $score = isset($_POST['score']) ? $_POST['score'] : false;
        if (!$score) die("0");

        require "./db.php";
        $stat = $db->getUser($id);

        $db->saveCoin($id, $stat["coin"] + $score);
        if ($score > $stat["score"]) $db->saveScore($id, $score);

        $stat = $db->getUser($id);

        echo json_encode([
            "score" => $stat["score"],
            "coin" => $stat["coin"]
        ]);
    }

    if ($action == "buy") {
        $id = isset($_POST['id']) ? $_POST['id'] : false;
        if (!$id) die("0");

        $skinID = isset($_POST['skinID']) ? $_POST['skinID'] : false;
        if (!$skinID) die("0");

        require "./db.php";
        $stat = $db->getUser($id);
        $skin = $db->getSkin($skinID);

        if ($stat['coin'] >= $skin['price']) {
            $db->saveCoin($id, $stat['coin'] - $skin['price']);
            $skins = json_decode($stat['skins']);
            array_push($skins, $skinID);
            $db->saveSkins($id, json_encode($skins));
            die("2");
        }
        else die("1");
    }
}
?>