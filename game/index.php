<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Snake Game</title>
    <style>
        * {
            margin: 0px;
            padding: 0px;
        }

        body {
            background: #000;
        }
    </style>
</head>
<body>
    <script>
        let botLength = <?php echo isset($_GET['bots']) ? $_GET['bots'] : 20; ?>;
        if (botLength < 12) botLength = 12;

        let name = "<?php echo $_GET['name']; ?>";
        let skins = JSON.parse('<?php echo $_GET['skin']; ?>');
        let skinUsed = "<?php echo $_GET['skinUsed']; ?>";
    </script>
    <script src="./phaser.min.js"></script>
    <script src="./game.js"></script>
</body>
</html>