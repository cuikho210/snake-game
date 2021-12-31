<?php
header('Content-Type: text/html; charset=utf-8');

class Database {
    private $sql;

    private function connect() {
        $this->sql = new mysqli("sql305.epizy.com", "epiz_27334931", "sbskms210", "epiz_27334931_snakeArena");
        $this->sql->set_charset("utf8");

        if ($this->sql->connect_errno) {
          echo "Failed to connect to MySQL: " . $this->sql->connect_error;
          exit();
        }
    }

    private function disconnect() {
        $this->sql->close();
    }

    public function newUser($name) {
        $this->connect();
        
        $query = "insert into user(name, score, coin, skins) values('$name', '0', '0', '[0]')";
        if ($this->sql->query($query)) {
            $result = $this->sql->query("select * from user where name='$name' order by id DESC");
            $row = $result->fetch_row();

            if ($row == null) {
                $this->disconnect();
                return false;
            }
            else {
                $this->disconnect();

                return $row[0];
            }
        }
        else {
            $this->disconnect();
            return false;
        }
    }

    public function getUser($id) {
        $this->connect();

        $result = $this->sql->query("select * from user where id='$id'");
        $row = $result->fetch_row();

        if ($row == null) {
            $this->disconnect();
            return false;
        }
        else {
            $this->disconnect();

            return [
                'id' => $row[0],
                'name' => $row[1],
                'score' => $row[2],
                'coin' => $row[3],
                'skins' => $row[4]
            ];
        }
    }

    public function saveScore($id, $score) {
        $this->connect();

        if ($this->sql->query("update user set score='$score' where id='$id'")) {
            $this->disconnect();
            return true;
        }
        else {
            $this->disconnect();
            return false;
        }
    }

    public function rename($id, $name) {
        $this->connect();

        if ($this->sql->query("update user set name='$name' where id='$id'")) {
            $this->disconnect();
            return true;
        }
        else {
            $this->disconnect();
            return false;
        }
    }

    public function saveCoin($id, $coin) {
        $this->connect();

        if ($this->sql->query("update user set coin='$coin' where id='$id'")) {
            $this->disconnect();
            return true;
        }
        else {
            $this->disconnect();
            return false;
        }
    }

    public function saveSkins($id, $skins) {
        $this->connect();

        if ($this->sql->query("update user set skins='$skins' where id='$id'")) {
            $this->disconnect();
            return true;
        }
        else {
            $this->disconnect();
            return false;
        }
    }

    public function getSkinList() {
        $this->connect();

        $list = [];
        $result = $this->sql->query("select * from skin order by id DESC");
        
        while ($row = $result->fetch_assoc()) {
            array_push($list, [
                "id" => $row["id"],
                "name" => $row["name"],
                "url" => $row["url"],
                "price" => $row["price"]
            ]);
        }

        $this->disconnect();
        return json_encode($list);
    }

    public function getSkin($id) {
        $this->connect();

        $result = $this->sql->query("select * from skin where id='$id'");
        $row = $result->fetch_row();

        if ($row == null) {
            $this->disconnect();
            return false;
        }
        else {
            $this->disconnect();

            return [
                'id' => $row[0],
                'name' => $row[1],
                'url' => $row[2],
                'price' => $row[3]
            ];
        }
    }

    public function getRank() {
        $this->connect();

        $list = [];
        $result = $this->sql->query("select id, name, score from user order by score DESC LIMIT 20");
        
        while ($row = $result->fetch_assoc()) {
            array_push($list, [
                "id" => $row["id"],
                "name" => $row["name"],
                "score" => $row["score"]
            ]);
        }

        $this->disconnect();
        return json_encode($list);
    }
}

$db = new Database();
?>