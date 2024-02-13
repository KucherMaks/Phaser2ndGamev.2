var config = {
    // налаштування вигляду гри
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    // фізика гри
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 300 },
            debug: false
        }
    },
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};

var game = new Phaser.Game(config);

function preload() {
    // передзавантаження хмар, землі, зірочок та бомб, налаштування виду гравця
    this.load.image('sky', 'assets/sky.png');
    this.load.image('ground', 'assets/platform.png');
    this.load.image('star', 'assets/star.png');
    this.load.image('bomb', 'assets/bomb.png');
    this.load.spritesheet('dude',
        'assets/dude.png',
        { frameWidth: 32, frameHeight: 48 }
    );
}

var platforms;

function create() {
    // тло
    this.add.image(400, 300, 'sky');

    platforms = this.physics.add.staticGroup();

    // земля
    platforms.create(400, 568, 'ground').setScale(2).refreshBody();

    //платформи
    platforms.create(600, 400, 'ground');
    platforms.create(50, 250, 'ground');
    platforms.create(750, 220, 'ground');

    // про гравця
    player = this.physics.add.sprite(100, 450, 'dude');

    player.setBounce(0.2);
    player.setCollideWorldBounds(true);

    this.anims.create({
        key: 'left',
        frames: this.anims.generateFrameNumbers('dude', { start: 0, end: 3 }),
        frameRate: 10,
        repeat: -1
    });

    this.anims.create({
        key: 'turn',
        frames: [{ key: 'dude', frame: 4 }],
        frameRate: 20
    });

    this.anims.create({
        key: 'right',
        frames: this.anims.generateFrameNumbers('dude', { start: 5, end: 8 }),
        frameRate: 10,
        repeat: -1
    });

    // коллайдер гравця та платформ
    this.physics.add.collider(player, platforms);

    //  задання управління
    cursors = this.input.keyboard.createCursorKeys();

    // зірочки
    stars = this.physics.add.group({
        key: 'star',
        repeat: 11,
        setXY: { x: 12, y: 0, stepX: 70 }
    });

    stars.children.iterate(function (child) {

        child.setBounceY(Phaser.Math.FloatBetween(0.4, 0.8));

    });

    // коллайдер зірочок та платформ
    this.physics.add.collider(stars, platforms);

    //  стикання колайдера гравця з колайдером зірочок
    this.physics.add.overlap(player, stars, collectStar, null, this);

    //  рахунок
    scoreText = this.add.text(16, 16, 'score: 0', { fontSize: '32px', fill: '#000' });

    // бомбочки
    bombs = this.physics.add.group();

    // коллайдер бомбочок і платформ
    this.physics.add.collider(bombs, platforms);

    // коллайдер гравця і бомбочок
    this.physics.add.collider(player, bombs, hitBomb, null, this);
}

function update() {
    // саме управління
    if (cursors.left.isDown) {
        player.setVelocityX(-160);

        player.anims.play('left', true);
    }
    else if (cursors.right.isDown) {
        player.setVelocityX(160);

        player.anims.play('right', true);
    }
    else {
        player.setVelocityX(0);

        player.anims.play('turn');
    }

    if (cursors.up.isDown && player.body.touching.down) {
        player.setVelocityY(-330);
    }
}

/*
function collectStar (player, star)
{
    star.disableBody(true, true);

    score += 10;
    scoreText.setText('Score: ' + score);

    if (stars.countActive(true) === 0)
    {
        stars.children.iterate(function (child) {

            child.enableBody(true, child.x, 0, true, true);

        });

        var x = (player.x < 400) ? Phaser.Math.Between(400, 800) : Phaser.Math.Between(0, 400);

        var bomb = bombs.create(x, 16, 'bomb');
        bomb.setBounce(1);
        bomb.setCollideWorldBounds(true);
        bomb.setVelocity(Phaser.Math.Between(-200, 200), 20);
    }
}
*/

//функція збір зірочок
function collectStar(player, star) {
    star.disableBody(true, true);
    
    score += 10;
    scoreText.setText('Score: ' + score);

    if (stars.countActive(true) > 0) {
        var firstStar = stars.getFirstAlive();

        var x = firstStar.x;
        var y = firstStar.y;

        var bomb = bombs.create(x, y, 'bomb');
        bomb.setBounce(1);
        bomb.setCollideWorldBounds(true);
        bomb.setVelocity(Phaser.Math.Between(-200, 200), 20);
    }
}

// змінні для рахунку
var score = 0;
var scoreText;

// опис бомбочок
function hitBomb (player, bomb)
{
    this.physics.pause();

    player.setTint(0xff0000);

    player.anims.play('turn');

    gameOver = true;
}