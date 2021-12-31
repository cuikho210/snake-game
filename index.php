<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Snake Arena Game</title>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/animate.css/4.1.1/animate.min.css" />
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <div id="header" class="animate__animated animate__fadeInDown">
        <h1><i class="fas fa-gamepad"></i> Snake Arena</h1>
        <div class="btn" onclick="play()"><i class="fas fa-play"></i> PLAY</div>
    </div>

    <div id="body"  class="animate__animated animate__fadeIn">
        <div id="user">
            <div id="stats" style="border-bottom: 1px solid #aaa; margin-bottom: 1rem; padding-bottom: 1rem;">
                <p id="statName" style="color: red;"></p>
                <p><i class="fas fa-signature"></i> ID: <i id="statID"></i></p>
                <p><i class="fas fa-coins"></i> Coin: <i id="statCoin"></i></p>
                <p><i class="fas fa-star"></i> High Score: <i id="statHighScore"></i></p>
            </div>

            <div id="setting">
                <i class="fas fa-cog"></i> Bot length: <input type="text" id="botLength" value="20">
            </div>
        </div>

        <div id="shop">
            <div id="mySkin">
                <p><i class="fas fa-suitcase"></i> My skin:</p>

                <div id="mySkinList" class="shop"></div>
            </div>

            <div id="shopSkin">
                <p><i class="fas fa-store"></i> Shop:</p>

                <div id="shopSkinList" class="shop"></div>
            </div>
        </div>

        <div id="rank">
            <p><i class="fas fa-trophy"></i> Rank:</p>

            <div id="rankList">
            
            </div>
        </div>
    </div>

    <div id="gameArea"></div>

    <div id="signupWindow"  class="animate__animated animate__fadeInUp">
        <div id="signupPopup">
            <div id="signupHeader">
                <h1><i class="fas fa-user"></i> Register </h1>
                <div class="btn" id="signupSubmit" onclick="signup()">OK</div>
            </div>

            <div id="signupBody">
                <i class="fas fa-pen"></i> Enter Your Name: <input type="text" id="signupName" placeholder="Your Name">
                <div id="signupLog" style="color: red;"></div>
            </div>
        </div>
    </div>

    <script>
        let el = {
            body: document.getElementById('body'),
            gameArea: document.getElementById('gameArea'),
            mySkin: document.getElementById('mySkin'),
            skinList: document.getElementById('skinList'),
            signupWindow: document.getElementById('signupWindow'),
            statName: document.getElementById('statName'),
            statID: document.getElementById('statID'),
            statCoin: document.getElementById('statCoin'),
            statHighScore: document.getElementById('statHighScore'),
            signupLog: document.getElementById('signupLog'),
            mySkinList: document.getElementById('mySkinList'),
            shopSkinList: document.getElementById('shopSkinList'),
            rankList: document.getElementById('rankList')
        };

        let data = {
            skin: [],
            stat: [],
            skinUsed: 0
        };

        function play() {
            let i = document.createElement('iframe');
            i.src = "/game?bots=" + document.getElementById("botLength").value + "&name=" + el.statName.innerHTML + "&skin=" + JSON.stringify(data.skin) + "&skinUsed=" + data.skinUsed;
            el.body.style.display = "none";
            el.gameArea.style.display = "block";
            el.gameArea.appendChild(i);
            history.pushState(2, "Gameplay", "/game");
        }

        function signup() {
            let name = document.getElementById('signupName').value;
            post("/api/id.php?action=signup", [["name", name]], res => {
                if (res == 0) {
                    el.signupLog.innerHTML = "Name is empty! Please enter your name and try again!";
                }
                else {
                    el.signupWindow.style.display = "none";
                    let id = JSON.parse(res).id;
                    localStorage.id = id;
                    updateStat(id);
                }
            });
        }

        function post(url, arr = [], callback) {
            let strs = "";
            arr.forEach((s, i) => {
                if (i == 0) strs += s[0] + "=" + s[1];
                else strs += "&" + s[0] + "=" + s[1];
            });
            
            let xhr = new XMLHttpRequest();
            xhr.open('post', url, true);
            xhr.onreadystatechange = () => {
                if (xhr.readyState == 4) callback(xhr.response);
            }
            xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
            xhr.send(strs);
        }

        function getSkinList() {
            post("/api/skin.php?action=getAll", [], res => {
                data.skin = JSON.parse(res);
                
                updateSkinList();
            });
        }

        function updateSkinList() {
            el.shopSkinList.innerHTML = "";
            el.mySkinList.innerHTML = "";

            data.skin.forEach(skin => {
                let isHave = false;

                data.stat.skins.forEach(s => {
                    if (skin.id == s) isHave = true;
                });

                let div = document.createElement('div');
                let name = document.createElement('div');
                let btn = document.createElement('div');
                let body = document.createElement('div');

                div.classList.add('skin', 'animate__animated', 'animate__fadeInUp');
                name.classList.add('skinName', 'animate__animated', 'animate__fadeInRight');
                btn.classList.add('skinBtn');
                body.classList.add('skinBody');

                name.innerHTML = '<i class="fas fa-fan fa-spin"></i> ' + skin.name;
                btn.id = skin.id;
                btn.name = "skinBtn";

                for (let i = 0; i <= 8; i ++) {
                    let dot = document.createElement('div');
                    dot.classList.add('skinDot');
                    dot.style.zIndex = i + 1;

                    if (i == 8) dot.style.backgroundImage = "url(" + skin.url + "/head.png)";
                    else dot.style.backgroundImage = "url(" + skin.url + "/body.png)";

                    body.prepend(dot);
                }

                div.appendChild(body);
                div.appendChild(name);
                div.appendChild(btn);

                if (isHave) {
                    el.mySkinList.appendChild(div);
                    btn.innerHTML = '<i class="fas fa-mouse-pointer"></i> Use';
                    useSkin(skin.id);

                    btn.onclick = () => useSkin(skin.id);
                }
                else {
                    el.shopSkinList.appendChild(div);
                    btn.innerHTML = '<i class="fas fa-dollar-sign"></i>' + skin.price;
                    btn.onclick = () => buySkin(skin.id);
                }
            });
        }

        function useSkin(id) {
            let b = document.querySelector(".skinBtnUsed");
            
            if (b) {
                b.innerHTML = '<i class="fas fa-mouse-pointer"></i> Use';
                b.classList.remove("skinBtnUsed");
            }
        
            let btn = document.getElementById(id);
            btn.innerHTML = '<i class="fas fa-check"></i> Used';
            btn.classList.add("skinBtnUsed");
            data.skinUsed = id;
        }

        function buySkin(id) {
            post(
                "/api/id.php?action=buy",
                [
                    ["id", data.stat.id],
                    ["skinID", id]
                ],
                res => {
                    if (res == 0) console.log("Error ID or SkinID");
                    if (res == 1) alert("Không đủ tiền!");
                    if (res == 2) {
                        updateStat(data.stat.id);
                    }
                }
            );
        }

        function updateStat(id) {
            post(
                "/api/id.php?action=get",
                [["id", id]],
                res => {
                    stat = JSON.parse(res);
                    el.statName.innerHTML = stat.name;
                    el.statID.innerHTML = stat.id;
                    el.statCoin.innerHTML = stat.coin;
                    el.statHighScore.innerHTML = stat.score;
                    data.stat = stat;
                    data.stat.skins = JSON.parse(data.stat.skins);
                    getSkinList();
                    updateRank()
                }
            );
        }

        function updateRank() {
            el.rankList.innerHTML = "";

            post("/api/rank.php", [], res => {
                let arr = JSON.parse(res);
                
                arr.forEach((stat, i) => {
                    let div = document.createElement('div');
                    div.classList.add('rank');

                    let stt = document.createElement('div');
                    stt.classList.add('number');
                    stt.innerHTML = i + 1;
                    if (i < 3) stt.style.color = "#ff0";

                    let name = document.createElement('div');
                    name.classList.add('name');
                    name.innerHTML = stat.name;
                    if (i < 3) {
                        name.style.color = "#f00";
                        name.style.fontWeight = "bold";
                        
                        if (i == 0) name.innerHTML = '<i class="fab fa-galactic-senate"></i> ' + stat.name;
                        else name.innerHTML = '<i class="fab fa-galactic-republic"></i> ' + stat.name;
                    }

                    let id = document.createElement('div');
                    id.classList.add('rankId');
                    id.innerHTML = "#" + stat.id;

                    let score = document.createElement('div');
                    score.classList.add('score');
                    score.innerHTML = stat.score;

                    div.appendChild(stt);
                    div.appendChild(name);
                    div.appendChild(id);
                    div.appendChild(score);
                    el.rankList.appendChild(div);
                });
            });
        }

        window.addEventListener('load', () => {
            let id = localStorage.getItem('id');
            if (!id) el.signupWindow.style.display = "flex";
            else {
                updateStat(id);
            }
        });

        window.addEventListener("message", e => {
            el.gameArea.style.display = "none";
            el.gameArea.innerHTML = "";
            el.body.style.display = "flex";
            
            post(
                "/api/id.php?action=saveScore",
                [
                    ["id", el.statID.innerHTML],
                    ["score", e.data]
                ],
                res => {
                    let obj = JSON.parse(res);
                    el.statHighScore.innerHTML = obj.score;
                    el.statCoin.innerHTML = obj.coin;
                    updateRank();
                }
            );
        });
    </script>
</body>
</html>