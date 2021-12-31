let id = 0;

class Snake {
    constructor(scene, config) {
        this.scene = scene;
        
        // Load config
        this.name = config.name;
        this.key = config.key;
        this.control = config.control;

        // Flag
        this.isDie = false;
        this.isEat = false;
        this.isBoostSpeed = false;
        this.isFollow = false;

        // Properties
        this.x = Math.floor(Math.random() * (scene.config.width - 400) + 200);
        this.y = Math.floor(Math.random() * (scene.config.height - 400) + 200);
        this.length = 10;
        this.scale = 1;
        this.speed = 3;
        this.rotation = 0;
        this.bRotation = 0;
        this.fRotation = 0;
        this.score = 0;
        this.rootScore = 0;
        this.id = id++;
        this.shadowGroup = this.scene.add.group();
        this.effGroup = this.scene.add.group();
        this.bodyGroup = this.scene.add.group();

        // Create Object
        this.createShadow();
        this.createEffect();
        this.createBody();

        if (this.control) this.createControl();
    }

    createShadow() {
        for (let i = 0; i < this.length; i ++) {
            this.shadowGroup.add(this.scene.add.image(
                this.x - (16 * this.scale * i),
                this.y + 8,
                "shadow"
            ));
        }
    }

    createEffect() {

    }

    createBody() {
        for (let i = this.length - 2; i >= 0; i --) {
            let body = this.scene.physics.add.image(
                this.x - (16 * this.scale * i),
                this.y,
                this.key + "Body"
            ).setCollideWorldBounds().setCircle(16);
            
            body.name = this.id;
            body.class = this;

            this.bodyGroup.add(body);
            this.scene.bodys.add(body);
        }

        let head = this.scene.physics.add.image(this.x, this.y, this.key + "Head").setCollideWorldBounds().setCircle(16);
        head.name = this.id;
        head.class = this;
        this.bodyGroup.add(head);
        this.scene.heads.add(head);

        this.name = this.scene.add.text(head.x, head.y - 16, this.name, {fontSize: "12px", fontFamily: "monospace"}).setOrigin(0.5, 1);

        if (this.control) {
            this.scene.cameras.main.startFollow(head);
            this.isFollow = true;
        }
    }

    createControl() {
        window.addEventListener("click", () => {
            this.boostSpeed();
        });
    }

    die() {
        this.isDie = true;

        let body = this.bodyGroup.getChildren();
        let foods = this.scene.foods.getChildren();

        for (let i = 0; i < body.length; i ++) {
            if (i % 2 == 0) {
                let rand = Math.floor(Math.random() * foods.length);
                foods[rand].x = body[i].x;
                foods[rand].y = body[i].y;
                foods[rand].class.shadow.x = foods[rand].x;
                foods[rand].class.shadow.y = foods[rand].y + 8;
            }
        }

        if (!this.control) this.scene.names.push(this.name.text);

        this.bodyGroup.destroy(true);
        this.shadowGroup.destroy(true);
        this.name.destroy();

        if (!this.control) this.scene.addBot();

        if (this.control) gameover(this.rootScore, this.scene);

        if (this.isFollow) {
            this.scene.randFollow();
            this.isFollow = false;
        }
    }

    hurt() {
        if (!this.isDie) {
            let body = this.bodyGroup.getChildren();
            let shadow = this.shadowGroup.getChildren();

            body.shift().destroy();
            shadow.pop().destroy();

            this.length --;
            this.rootScore -= 50;
        }
    }

    addDot() {
        if (!this.isDie) {
            let body = this.bodyGroup.getChildren();
            this.shadowGroup.add(this.scene.add.image(body[0].x, body[0].y, "shadow"));
            let dot = this.scene.physics.add.image(body[0].x, body[0].y, this.key + "Body").setCollideWorldBounds().setCircle(16);
            dot.name = this.id;
            body.unshift(dot);
            this.scene.bodys.add(dot);

            this.shadowGroup.setDepth(0);
            
            for (let i = body.length - 1; i >= 0; i --) {
                body[i].depth = i + 1;
            }

            this.length ++;
        }
    }

    setScale(scale) {
        let body = this.bodyGroup.getChildren();
        let shadow = this.shadowGroup.getChildren();

        for (let i = 0; i < body.length; i ++) {
            if (i > 0) {
                let h = 16 * scale;
                let speedX = Math.cos(body[i].rotation) * h;
                let speedY = Math.sin(body[i].rotation) * h;
                body[i].x = body[i - 1].x - speedX;
                body[i].y = body[i - 1].y - speedY;
            }

            body[i].setScale(scale);
            body[i].depth = body.length - i;
        }

        this.updateShadowPosition();
    }

    updateShadowPosition() {
        let body = this.bodyGroup.getChildren();
        let shadow = this.shadowGroup.getChildren();

        for (let i = 0; i < body.length; i ++) {
            shadow[i].x = body[i].x;
            shadow[i].y = body[i].y + 8;
        }
    }

    updateScore() {
        if (this.score > 50 && !this.isDie) {
            this.score -= 50;
            this.addDot();
        }
    }

    getFoodPos(x, y) {
        let foods = this.scene.foods.getChildren().sort(function(a, b) {
            let ha = (a.x - x) ** 2 + (a.y - y) ** 2;
            let hb = (b.x - x) ** 2 + (b.y - y) ** 2;
            return ha - hb;
        });

        this.fRotation = Math.atan2(foods[0].y - y, foods[0].x - x);
        this.isEat = true;
    }

    boostSpeed() {
        if (!this.isBoostSpeed && this.rootScore > 50 && !this.isDie) {
            this.isBoostSpeed = true;
            this.speed += 3;
            this.hurt();

            setTimeout(() => {
                this.isBoostSpeed = false;
                this.speed -= 3;
            }, 2000);
        }
    }

    update() {
        if (!this.isDie) {
            let body = this.bodyGroup.getChildren();

            if (this.control) { // Get control
                let canvas = this.scene.sys.game.canvas;
                let centerX = canvas.width / 2;
                let centerY = canvas.height / 2;
                let d = this.scene.game.input.mousePointer.y - centerY;
                let k = this.scene.game.input.mousePointer.x - centerX;
                this.rotation = Math.atan2(d, k);
            }
            else { // Bot
                let head = body[body.length - 1];
                
                // Ăn thức ăn
                this.getFoodPos(head.x, head.y);
                this.rotation = this.fRotation;

                // Quay đầu nếu gặp rắn khác
                this.scene.bodys.getChildren().forEach(b => {
                    if (b.name != head.name) if (((b.y - head.y) ** 2 + (b.x - head.x) ** 2) < 22500) {
                        this.rotation = Math.atan2(b.y - head.y, b.x - head.x) - Math.PI;
                        if (Math.random() * 100 < 0.5) this.boostSpeed();
                    }
                });

                // Quay đầu nếu gặp tường
                if (head.x <= 60) this.rotation = 0;
                if (head.x >= (this.scene.config.width - 60)) this.rotation = Math.PI;
                if (head.y <= 60) this.rotation = Math.PI / 2;
                if (head.y >= (this.scene.config.width - 60)) this.rotation = -Math.PI / 2;
            }

            // Giới hạn góc độ xoay
            if (!(this.rotation - this.bRotation > 7 / 4 * Math.PI || this.rotation - this.bRotation < -7 / 4 * Math.PI)) {
                if (this.rotation - this.bRotation > Math.PI / 32) this.rotation = this.bRotation + Math.PI / 32;
                else if (this.rotation - this.bRotation < -Math.PI / 32) this.rotation = this.bRotation - Math.PI / 32;
            }
            this.bRotation = this.rotation;

            // Move
            let speedX = Math.cos(this.rotation) * this.speed;
            let speedY = Math.sin(this.rotation) * this.speed;

            for (let i = 0; i < (body.length - 1); i ++) {
                if (Math.sqrt(Math.pow(body[i + 1].y - body[i].y, 2) + Math.pow(body[i + 1].x - body[i].x, 2)) > 16) {
                    let r = Math.atan2(body[i + 1].y - body[i].y, body[i + 1].x - body[i].x);
                    let sx = Math.cos(r) * this.speed;
                    let sy = Math.sin(r) * this.speed;

                    body[i].x += sx;
                    body[i].y += sy;
                    body[i].rotation = r;
                }
            }

            body[body.length - 1].x += speedX;
            body[body.length - 1].y += speedY;
            body[body.length - 1].rotation = this.rotation;
            this.name.x = body[body.length - 1].x;
            this.name.y = body[body.length - 1].y - 20;
            this.name.depth = body[body.length - 1].depth + 1;

            this.updateShadowPosition();

            if (body[body.length - 1].x <= 12 || body[body.length - 1].x >= (this.scene.config.width - 12) || body[body.length - 1].y <= 12 || body[body.length - 1].y >= (this.scene.config.height - 12)) {
                if (!this.isDie) this.die();
            }
        }
    }
}

class Food {
    constructor(scene, config) {
        this.scene = scene;

        this.name = config.name;
        this.key = config.key;

        this.x = Math.floor(Math.random() * (scene.config.width - 200) + 100);
        this.y = Math.floor(Math.random() * (scene.config.height - 200) + 100);
        this.scale = Math.random() * 1.5 + 0.5;

        this.createShadow();
        this.createEntities();
    }

    createShadow() {
        this.shadow = this.scene.add.image(this.x, this.y + 8, "shadow").setScale(this.scale * 0.5);
    }

    createEntities() {
        this.entities = this.scene.physics.add.image(this.x, this.y, this.key).setScale(this.scale);
        this.entities.setCircle(this.entities.width / 2);
        this.entities.class = this;
        this.scene.foods.add(this.entities);
        this.score = Math.floor(this.scale * 10);
    }

    die(snake) {
        snake.class.score += this.score;
        snake.class.rootScore += this.score;
        snake.class.isEat = false;
        snake.class.scene.updateRank();

        this.x = Math.floor(Math.random() * (this.scene.config.width - 200) + 100);
        this.y = Math.floor(Math.random() * (this.scene.config.height - 200) + 100);
        this.scale = Math.random() * 1.5 + 0.5;

        this.entities.x = this.x;
        this.entities.y = this.y;
        this.entities.scale = this.scale;
        this.shadow.x = this.x;
        this.shadow.y = this.y + 8;
        this.shadow.scale = this.scale * 0.5;
        this.score = Math.floor(this.scale * 10);
    }
}

class Egg extends Food {
    constructor(scene) {
        super(scene, {
            name: "Egg",
            key: "food0"
        });
    }
}

// ------------------------------------------------------------
// DarkKMS
// ------------------------------------------------------------

const WIDTH = 960;
const HEIGHT = 480;

window.onload = () => {
    let game = new Phaser.Game({
        type: Phaser.AUTO,
        width: WIDTH,
        height: HEIGHT,

        scale: {
            mode: Phaser.Scale.FIT,
            autoCenter: Phaser.Scale.CENTER_BOTH
        },

        // fps: {
        //     target: 120,
        //     forceSetTimeOut: true
        // },

        physics: {
            default: "arcade",
            arcade: {
                debug: false
            }
        },

        scene: [Preload, Map1]
    });
}

class Preload extends Phaser.Scene {
    constructor() {
        super("preload");
    }

    preload() {
        this.add.text(20, 20, "Loading...");

        // Backgrounds
        this.load.image("bg0", "/assets/bg/bg0.png");

        // Object
        this.load.image("brick", "/assets/obj/brick.png");
        this.load.image("food0", "/assets/obj/food0.png");

        // Characters
        skins.forEach(skin => {
            this.load.image("snake" + skin.id + "Head", skin.url + "/head.png");
            this.load.image("snake" + skin.id + "Body", skin.url + "/body.png");
        });

        // Effects
        this.load.image("shadow", "/assets/eff/shadow.png");
    }

    create() {
        this.scene.start("map1");
    }
}

class Map1 extends Phaser.Scene {
    constructor() {
        super("map1");

        this.config = {
            tile: "bg0",
            width: 6000,
            height: 6000,
            foods: 300,
            bots: botLength
        }

        this.score = 0;
        this.bots = [];
        this.ranks = [];
        this.skins = [];

        this.names = ["An", "Trung", "Sinh", "Mạnh", "Tuấn", "Hiếu", "Long", "Hiệu", "Dương", "Quyết", "Phương", "Vi", "Nhật", "Thái", "Vương", "Tiến", "Phúc", "Trung Hiếu", "Vũ", "Huế", "Thầy Khuy", "Cô Thúy", "Cô Tâm", "Thầy Ánh", "Thầy Trung", "Thầy Toản", "Lớp Trưởng", "Hiệu Trưởng", "Wibu Chúa", "Gà"];
    }

    create() {
        this.foods = this.add.group();
        this.heads = this.add.group();
        this.bodys = this.add.group();

        this.physics.world.setBounds(0, 0, this.config.width, this.config.height);

        this.createSnakeList();
        this.createGround();
        this.createFoods();
        this.createPlayer();
        this.createBots();
        this.handlingCollision();
        this.createRank();
    }

    createSnakeList() {
        skins.forEach(skin => {
            this.skins.push("snake" + skin.id);
        });

        this.skins.reverse();
    }

    createGround() {
        this.bg = this.add.tileSprite(0, 0, this.config.width, this.config.height, this.config.tile).setOrigin(0);
        this.add.tileSprite(0, 0, this.config.width, 64, "brick").setOrigin(0, 1);
        this.add.tileSprite(0, this.config.height, this.config.width, 64, "brick").setOrigin(0, 0);
        this.add.tileSprite(0, 0, 64, this.config.height, "brick").setOrigin(1, 0);
        this.add.tileSprite(this.config.width, 0, 64, this.config.height, "brick").setOrigin(0, 0);
    }

    createPlayer() {
        this.player = new Snake(this, {
            name: name,
            key: this.skins[skinUsed],
            control: true
        });
    }

    createFoods() {
        for (let i = 0; i < this.config.foods; i ++) {
            new Egg(this);
        }
    }

    createItems() {

    }

    createBots() {
        for (let i = 0; i < this.config.bots; i++) {
            this.addBot();
        }
    }

    addBot() {        
        this.bots.push(new Snake(this, {
            name: this.names.splice(Math.floor(Math.random() * this.names.length), 1),
            key: this.skins[Math.floor(Math.random() * this.skins.length)],
            control: false
        }));
    }

    handlingCollision() {
        this.physics.add.overlap(this.heads, this.foods, (head, food) => {
            food.class.die(head);
            head.class.updateScore();
        });

        this.physics.add.overlap(this.heads, this.bodys, (head, body) => {
            if (head.name != body.name) {
                if (head.class.isFollow) {
                    try {
                        let b = body.class.bodyGroup.getChildren();
                        this.cameras.main.startFollow(b[b.length - 1]);
                        body.class.isFollow = true;
                        head.class.isFollow = false;
                    }
                    catch (err) {
                        head.class.isFollow = false;
                        this.randFollow();
                    }
                }
                
                head.class.die();
            }
        });
    }

    createRank() {
        for (let i = 0; i < 10; i++) {
            this.ranks.push(this.add.text(15, 15 + 15 * i, "", {fontSize: "12px", fontFamily: "monospace"}).setScrollFactor(0).setDepth(500));
        }

        this.score = this.add.text(960 - 15, 15, "", {fontSize: "12px", color: "#fff"}).setScrollFactor(0).setDepth(500).setOrigin(1, 0);

        this.updateRank();
    }

    updateRank() {
        let rank = this.heads.getChildren().sort(function(a, b) {
            return b.class.rootScore - a.class.rootScore;
        });

        for (let i = 0; i < this.ranks.length; i ++) {
            let color = rank[i].class.id == this.player.id ? "#00f2ff" : (i < 3 ? "#ffef75" : "white");
            this.ranks[i].text = (i + 1) + ". " + rank[i].class.name.text + ": " + rank[i].class.rootScore;
            this.ranks[i].setColor(color);
        }

        this.score.text = this.player.rootScore;
    }

    update() {
        this.player.update();
        this.bots.forEach(bot => bot.update());
    }

    randFollow() {
        let arr = this.heads.getChildren();
        let head = arr[Math.floor(Math.random() * arr.length)];
        head.class.isFollow = true;
        this.cameras.main.startFollow(head);
    }
}

function gameover(score, scene) {
    let bg = document.createElement("div");
    bg.style.position = "fixed";
    bg.style.background = "rgba(0, 0, 0, .3)";
    bg.style.top = "0px";
    bg.style.left = "0px";
    bg.style.width = "100%";
    bg.style.height = "100%";
    bg.style.display = "flex";
    bg.style.justifyContent = "center";
    bg.style.alignItems = "center";

    let pop = document.createElement("div");
    pop.style.background = "rgba(0, 0, 0, .3)";
    pop.style.padding = "2rem";
    pop.style.color = "#fff";
    pop.style.textAlign = "center";
    pop.innerHTML += "<h1>Game Over</h1>";
    pop.innerHTML += "<p><b>Your Score: " + score + "</b></p>";
    pop.innerHTML += "<p>Click to exit!</p>";

    bg.appendChild(pop);
    document.body.appendChild(bg);

    bg.onclick = () => {
        scene.sys.game.destroy(true);
        window.top.postMessage(score, '*');
    }

    setTimeout(() => {
        bg.style.opacity = "0";
    }, 5000);
}