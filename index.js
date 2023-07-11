document.addEventListener("DOMContentLoaded", () => {
  const canvas = document.getElementById("canvas");
  const ctx = canvas.getContext("2d");

  const CANVAS_WIDTH = 800;
  const CANVAS_HEIGHT = 700;
  canvas.width = CANVAS_WIDTH;
  canvas.height = CANVAS_HEIGHT;

  const road = new Image();
  road.src = "./img/road.png";

  const playerCar = new Image();
  playerCar.src = "./img/player-car.png";

  const enemyCar = new Image();
  enemyCar.src = "./img/enemy-car.png";

  const roadBarrier = new Image();
  roadBarrier.src = "./img/barricade.png";

  const lifeImg = new Image();
  lifeImg.src = "./img/life.png";

  const bulletImg = new Image();
  bulletImg.src = "./img/bullet.png";

  const gameOverImg = new Image();
  gameOverImg.src = "./img/game-over.png";

  const carCrashBoom = new Image();
  carCrashBoom.src = "./img/car-crash-boom.png";

  let offsetY = 0;
  const scrollSpeed = 1;

  let playerX = 400;
  let speed = 10;
  let enemies = [];
  let maxEnemies = 2;
  let roadBarricade = [];
  let maxRoadBarricade = 2;
  let score = 0;
  let gameOver = false;
  let life = 3;
  let bullets = [];
  let canShootBullet = true;
  const bulletCooldown = 500;
  const keysPressed = new Set();

  document.addEventListener("keydown", (e) => {
    keysPressed.add(e.code);
    handlePlayerMovement();
  });

  document.addEventListener("keyup", (e) => {
    keysPressed.delete(e.code);
    handlePlayerMovement();
  });

  function handlePlayerMovement() {
    if (keysPressed.has("ArrowLeft") || keysPressed.has("KeyA")) {
      if (playerX < 305) {
        playerX = 305;
      }

      if (playerX > 305) {
        playerX -= 1 * speed;
      }
    }

    if (keysPressed.has("ArrowRight") || keysPressed.has("KeyD")) {
      if (playerX < 535) {
        playerX += 1 * speed;
      }

      if (playerX > 535) {
        playerX = 535;
      }
    }

    if (keysPressed.has("ArrowUp")) {
      if (canShootBullet) {
        shootBullet();

        canShootBullet = false;
        setTimeout(() => {
          canShootBullet = true;
        }, bulletCooldown);
      }
    }
  }

  function shootBullet() {
    const bulletWidth = 10;
    const bulletHeight = 20;
    const bulletSpeed = 5;

    const bullet = {
      x: playerX + 44 / 2 - bulletWidth / 2,
      y: 550,
      width: bulletWidth,
      height: bulletHeight,
      speed: bulletSpeed,
    };
    const gunFireSound = new Audio("audio/thompson-fire.wav");
    gunFireSound.currentTime = 0;
    gunFireSound.play();
    bullets.push(bullet);
  }

  function player(x) {
    ctx.drawImage(playerCar, 0, 0, 44, 88, x, 550, 44, 88);

    for (let i = 0; i < bullets.length; i++) {
      const bullet = bullets[i];
      ctx.drawImage(bulletImg, bullet.x, bullet.y, bullet.width, bullet.height);
    }
  }

  function spawnEnemy() {
    if (enemies.length < maxEnemies) {
      let enemyX = Math.floor(Math.random() * (535 - 305 + 1)) + 305;
      let enemyY = Math.floor(Math.random() * (10 - -200 + 1)) + -200;
      let enemy = {
        x: enemyX,
        y: enemyY,
        passed: false,
      };

      const overlapping = enemies.some((existingEnemy) => {
        return (
          enemy.x < existingEnemy.x + 44 &&
          enemy.x + 44 > existingEnemy.x &&
          enemy.y < existingEnemy.y + 88 &&
          enemy.y + 88 > existingEnemy.y
        );
      });

      if (!overlapping) {
        enemies.push(enemy);
      }
    }
  }

  function moveEnemies() {
    for (let i = 0; i < enemies.length; i++) {
      enemies[i].y += 2;
      if (enemies[i].y > CANVAS_HEIGHT) {
        enemies.splice(i, 1);
        i--;
      } else {
        if (enemies[i].y > 550 && !enemies[i].passed) {
          enemies[i].passed = true;
        }
      }
    }
  }

  function drawEnemies() {
    for (let i = 0; i < enemies.length; i++) {
      ctx.drawImage(enemyCar, enemies[i].x, enemies[i].y, 44, 88);
    }
  }

  function spawnBarricade() {
    if (roadBarricade.length < maxRoadBarricade) {
      let barricadeX = Math.floor(Math.random() * (535 - 305 + 1)) + 305;
      let barricadeY = Math.floor(Math.random() * (0 - -200 + 1)) + -200;
      let barricade = {
        x: barricadeX,
        y: barricadeY,
        passed: false,
      };

      const overlapping = roadBarricade.some((existingBarricade) => {
        return (
          barricade.x < existingBarricade.x + 80 &&
          barricade.x + 80 > existingBarricade.x &&
          barricade.y < existingBarricade.y + 22 &&
          barricade.y + 22 > existingBarricade.y
        );
      });
      const overlappingWithEnemies = enemies.some((enemy) => {
        return (
          barricade.x < enemy.x + 44 &&
          barricade.x + 80 > enemy.x &&
          barricade.y < enemy.y + 88 &&
          barricade.y + 22 > enemy.y
        );
      });

      if (!overlapping && !overlappingWithEnemies) {
        roadBarricade.push(barricade);
      }
    }
  }

  function moveBarricade() {
    for (let i = 0; i < roadBarricade.length; i++) {
      roadBarricade[i].y += 1;
      if (roadBarricade[i].y > CANVAS_HEIGHT) {
        roadBarricade.splice(i, 1);
        i--;
      } else {
        if (roadBarricade[i].y > 550 && !roadBarricade[i].passed) {
          roadBarricade[i].passed = true;
        }
      }
    }
  }

  function drawBarricade() {
    for (let i = 0; i < roadBarricade.length; i++) {
      ctx.drawImage(
        roadBarrier,
        roadBarricade[i].x,
        roadBarricade[i].y,
        80,
        22
      );
    }
  }

  function checkCollision() {
    const playerWidth = 44;
    const playerHeight = 88;
    const enemyWidth = 44;
    const enemyHeight = 88;
    const barricadeWidth = 80;
    const barricadeHeight = 22;

    let collided = false;

    for (let i = 0; i < enemies.length; i++) {
      const enemy = enemies[i];

      if (
        playerX < enemy.x + enemyWidth &&
        playerX + playerWidth > enemy.x &&
        550 < enemy.y + enemyHeight &&
        550 + playerHeight > enemy.y
      ) {
        enemies.splice(i, 1);
        ctx.drawImage(
          carCrashBoom,
          0,
          0,
          100,
          56,
          enemy.x - 20,
          enemy.y,
          100,
          56
        );
        const carCrashAudio = new Audio("./audio/car-crash.mp3");
        carCrashAudio.currentTime = 0;
        carCrashAudio.play();
        i--;

        collided = true;
      }
    }
    for (let i = 0; i < roadBarricade.length; i++) {
      const barricade = roadBarricade[i];

      if (
        playerX < barricade.x + barricadeWidth &&
        playerX + playerWidth > barricade.x &&
        550 < barricade.y + barricadeHeight &&
        550 + playerHeight > barricade.y
      ) {
        roadBarricade.splice(i, 1);
        ctx.drawImage(
          carCrashBoom,
          0,
          0,
          100,
          56,
          barricade.x - 20,
          barricade.y,
          100,
          56
        );
        const collisionSound = new Audio("./audio/car-explosion-barracade.wav");
        collisionSound.currentTime = 0;
        collisionSound.play();
        i--;

        collided = true;
      }
    }

    for (let i = 0; i < bullets.length; i++) {
      const bullet = bullets[i];

      for (let j = 0; j < enemies.length; j++) {
        const enemy = enemies[j];

        if (
          bullet.x < enemy.x + enemyWidth &&
          bullet.x + bullet.width > enemy.x &&
          bullet.y < enemy.y + enemyHeight &&
          bullet.y + bullet.height > enemy.y
        ) {
          bullets.splice(i, 1);
          enemies.splice(j, 1);
          ctx.drawImage(
            carCrashBoom,
            0,
            0,
            100,
            56,
            enemy.x - 20,
            enemy.y,
            100,
            56
          );
          i--;
          j--;
          score += 100;
          break;
        }
      }

      for (let j = 0; j < roadBarricade.length; j++) {
        const barricade = roadBarricade[j];

        if (
          bullet.x < barricade.x + barricadeWidth &&
          bullet.x + bullet.width > barricade.x &&
          bullet.y < barricade.y + barricadeHeight &&
          bullet.y + bullet.height > barricade.y
        ) {
          bullets.splice(i, 1);
          ctx.drawImage(
            carCrashBoom,
            0,
            0,
            100,
            56,
            barricade.x - 20,
            barricade.y,
            100,
            56
          );
          i--;
          j--;
          break;
        }
      }
    }

    if (collided) {
      life -= 1;
      if (life === 0) {
        gameOver = true;
        console.log("Game Over");
      }
    }

    return collided;
  }

  function moveBullets() {
    for (let i = 0; i < bullets.length; i++) {
      bullets[i].y -= bullets[i].speed;

      // Remove bullets that are off-screen
      if (bullets[i].y < 0) {
        bullets.splice(i, 1);
        i--;
      }
    }
  }

  let scoreBoard = document.getElementById("score-board");
  let lifeBoard = document.getElementById("life-board");

  function animate() {
    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    offsetY += scrollSpeed;
    if (offsetY >= CANVAS_HEIGHT) {
      offsetY = 0;
    }

    ctx.drawImage(road, 0, offsetY, CANVAS_WIDTH, CANVAS_HEIGHT);
    ctx.drawImage(
      road,
      0,
      offsetY - CANVAS_HEIGHT,
      CANVAS_WIDTH,
      CANVAS_HEIGHT
    );

    player(playerX);

    spawnBarricade();
    moveBarricade();
    drawBarricade();

    drawEnemies();
    spawnEnemy();
    moveEnemies();

    scoreBoard.innerHTML =
      '<img src="./img/coin.png" alt="" class="icon">' +
      "<h1>" +
      score +
      "</h1>";
    lifeBoard.innerHTML =
      '<img src="./img/life.png" alt="" class="icon">' +
      "<h1>" +
      life +
      "</h1>";

    checkCollision();
    moveBullets();

    if (gameOver) {
      const gameOverAudio = new Audio("./audio/game-over.wav");
      gameOverAudio.currentTime = 0;
      gameOverAudio.play();
      ctx.drawImage(
        gameOverImg,
        CANVAS_WIDTH / 2 - 247 / 2,
        CANVAS_HEIGHT / 2 - 143 / 2
      );
      if (score > localStorage.getItem("score")) {
        localStorage.setItem("score", score);
      }
      ctx.fillStyle = "white";
      ctx.textAlign = "center";
      ctx.font = "30px Poppins";
      ctx.fillText(
        "Your high score: " + localStorage.getItem("score"),
        CANVAS_WIDTH / 2,
        30
      );
      return;
    }
    requestAnimationFrame(animate);
  }

  animate();

  document.getElementById("restart").addEventListener("click", restartGame);
  function restartGame() {
    offsetY = 0;
    playerX = 400;
    speed = 10;
    enemies = [];
    roadBarricade = [];
    score = 0;
    gameOver = false;
    life = 3;
    bullets = [];

    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    animate();
  }
});

//Road start = 305
//Road end = 535
