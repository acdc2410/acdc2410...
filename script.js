const arena = document.getElementById("arena");
const player = document.getElementById("player");
const crosshair = document.getElementById("crosshair");

const scoreText = document.getElementById("score");
const healthText = document.getElementById("health");
const levelText = document.getElementById("level");
const weaponNameText = document.getElementById("weaponName");
const specialShotsText = document.getElementById("specialShots");

const pauseBtn = document.getElementById("pauseBtn");
const restartBtn = document.getElementById("restartBtn");
const playAgainBtn = document.getElementById("playAgainBtn");
const resumeBtn = document.getElementById("resumeBtn");

const messageScreen = document.getElementById("messageScreen");
const messageTitle = document.getElementById("messageTitle");
const messageText = document.getElementById("messageText");
const finalScore = document.getElementById("finalScore");

const pauseScreen = document.getElementById("pauseScreen");
const bonusMessage = document.getElementById("bonusMessage");

const playNowBtn = document.getElementById("playNowBtn");
const weaponBtn = document.getElementById("weaponBtn");
const factBtn = document.getElementById("factBtn");
const addReviewBtn = document.getElementById("addReviewBtn");

let score = 0;
let health = 3;
let level = 1;

let missiles = [];
let enemies = [];

let paused = false;
let gameOver = false;
let enemyTimer;
let animationId;
let loopRunning = false;

let currentWeaponName = "Normal";
let currentDamage = 1;
let specialShots = 0;

const levelTargets = [5, 12, 20];

playNowBtn.addEventListener("click", function() {
  document.getElementById("play").scrollIntoView({
    behavior: "smooth"
  });
});

weaponBtn.addEventListener("click", randomWeapon);
factBtn.addEventListener("click", showFact);
addReviewBtn.addEventListener("click", addReview);

pauseBtn.addEventListener("click", togglePause);
resumeBtn.addEventListener("click", togglePause);
restartBtn.addEventListener("click", restartGame);
playAgainBtn.addEventListener("click", restartGame);

arena.addEventListener("mousemove", function(event) {
  const rect = arena.getBoundingClientRect();
  const mouseX = event.clientX - rect.left;
  const mouseY = event.clientY - rect.top;

  crosshair.style.display = "block";
  crosshair.style.left = mouseX - 14 + "px";
  crosshair.style.top = mouseY - 14 + "px";
});

arena.addEventListener("mouseleave", function() {
  crosshair.style.display = "none";
});

arena.addEventListener("mousedown", function(event) {
  if (event.button !== 0) {
    return;
  }

  if (event.target.tagName === "BUTTON") {
    return;
  }

  if (event.target.closest("#pauseScreen") || event.target.closest("#messageScreen")) {
    return;
  }

  if (paused || gameOver) {
    return;
  }

  const rect = arena.getBoundingClientRect();
  const targetX = event.clientX - rect.left;
  const targetY = event.clientY - rect.top;

  shootMissile(targetX, targetY);
});

document.addEventListener("keydown", function(event) {
  if (event.target.tagName === "INPUT") {
    return;
  }

  if (event.key === "p" || event.key === "P") {
    togglePause();
  }
});

function startGame() {
  document.querySelectorAll(".missile, .enemy, .explosion").forEach(function(item) {
    item.remove();
  });

  score = 0;
  health = 3;
  level = 1;

  missiles = [];
  enemies = [];

  paused = false;
  gameOver = false;
  loopRunning = false;

  currentWeaponName = "Normal";
  currentDamage = 1;
  specialShots = 0;

  scoreText.textContent = score;
  healthText.textContent = health;
  levelText.textContent = level;
  pauseBtn.textContent = "Pause";
  updateWeaponHUD();

  messageScreen.classList.add("hidden");
  pauseScreen.classList.add("hidden");
  bonusMessage.classList.add("hidden");

  clearInterval(enemyTimer);
  cancelAnimationFrame(animationId);

  enemyTimer = setInterval(createEnemy, 1200);
  gameLoop();
}

function restartGame() {
  startGame();
}

function togglePause() {
  if (gameOver) {
    return;
  }

  paused = !paused;

  if (paused) {
    pauseBtn.textContent = "Resume";
    pauseScreen.classList.remove("hidden");
  } else {
    pauseBtn.textContent = "Pause";
    pauseScreen.classList.add("hidden");

    if (!loopRunning) {
      gameLoop();
    }
  }
}

function shootMissile(targetX, targetY) {
  const arenaWidth = arena.clientWidth;
  const arenaHeight = arena.clientHeight;

  const startX = arenaWidth / 2;
  const startY = arenaHeight - 70;

  let distanceX = targetX - startX;
  let distanceY = targetY - startY;

  const distance = Math.sqrt(distanceX * distanceX + distanceY * distanceY);

  if (distance < 5) {
    distanceX = 0;
    distanceY = -100;
  }

  const newDistance = Math.sqrt(distanceX * distanceX + distanceY * distanceY);
  const speed = 9;

  const velocityX = (distanceX / newDistance) * speed;
  const velocityY = (distanceY / newDistance) * speed;

  const shotDamage = useWeaponDamage();

  const missile = document.createElement("div");
  missile.className = "missile";
  missile.textContent = getMissileEmoji(shotDamage);

  missile.style.left = startX - 14 + "px";
  missile.style.top = startY - 14 + "px";

  arena.appendChild(missile);

  missiles.push({
    element: missile,
    x: startX,
    y: startY,
    vx: velocityX,
    vy: velocityY,
    damage: shotDamage
  });
}

function useWeaponDamage() {
  if (specialShots > 0) {
    const damage = currentDamage;

    specialShots--;

    if (specialShots === 0) {
      currentWeaponName = "Normal";
      currentDamage = 1;
    }

    updateWeaponHUD();
    return damage;
  }

  return 1;
}

function getMissileEmoji(damage) {
  if (damage === 100) {
    return "🌟";
  }

  if (damage === 3) {
    return "🍝";
  }

  if (damage === 2) {
    return "🍩";
  }

  if (Math.random() > 0.5) {
    return "🍩";
  } else {
    return "🍝";
  }
}

function createEnemy() {
  if (paused || gameOver) {
    return;
  }

  const enemy = document.createElement("div");
  enemy.className = "enemy";

  let enemyEmoji;

  if (level === 1) {
    enemyEmoji = "👾";
  } else if (level === 2) {
    enemyEmoji = "👹";
  } else {
    enemyEmoji = "🐉";
  }

  const enemyHP = level;

  if (enemyHP === 1) {
    enemy.textContent = enemyEmoji;
  } else {
    enemy.textContent = enemyEmoji + enemyHP;
  }

  const enemyX = Math.random() * (arena.clientWidth - 50);

  enemy.style.left = enemyX + "px";
  enemy.style.top = "0px";

  arena.appendChild(enemy);

  enemies.push({
    element: enemy,
    x: enemyX,
    y: 0,
    hp: enemyHP,
    emoji: enemyEmoji
  });
}

function updateMissiles() {
  for (let i = missiles.length - 1; i >= 0; i--) {
    missiles[i].x += missiles[i].vx;
    missiles[i].y += missiles[i].vy;

    missiles[i].element.style.left = missiles[i].x - 14 + "px";
    missiles[i].element.style.top = missiles[i].y - 14 + "px";

    if (
      missiles[i].x < -40 ||
      missiles[i].x > arena.clientWidth + 40 ||
      missiles[i].y < -40 ||
      missiles[i].y > arena.clientHeight + 40
    ) {
      missiles[i].element.remove();
      missiles.splice(i, 1);
    }
  }
}

function updateEnemies() {
  for (let i = enemies.length - 1; i >= 0; i--) {
    enemies[i].y += 1.2 + level * 0.8;
    enemies[i].element.style.top = enemies[i].y + "px";

    if (enemies[i].y > arena.clientHeight - 50) {
      enemies[i].element.remove();
      enemies.splice(i, 1);

      health--;
      healthText.textContent = health;

      if (health <= 0) {
        showDefeat();
        return;
      }
    }
  }
}

function checkCollisions() {
  for (let missileIndex = missiles.length - 1; missileIndex >= 0; missileIndex--) {
    for (let enemyIndex = enemies.length - 1; enemyIndex >= 0; enemyIndex--) {
      const enemyCenterX = enemies[enemyIndex].x + 20;
      const enemyCenterY = enemies[enemyIndex].y + 20;

      const distanceX = missiles[missileIndex].x - enemyCenterX;
      const distanceY = missiles[missileIndex].y - enemyCenterY;

      if (Math.abs(distanceX) < 35 && Math.abs(distanceY) < 35) {
        createExplosion(missiles[missileIndex].x, missiles[missileIndex].y);

        const damage = missiles[missileIndex].damage;

        missiles[missileIndex].element.remove();
        missiles.splice(missileIndex, 1);

        enemies[enemyIndex].hp -= damage;

        if (enemies[enemyIndex].hp <= 0) {
          enemies[enemyIndex].element.remove();
          enemies.splice(enemyIndex, 1);

          score++;
          scoreText.textContent = score;

          if (score % 5 === 0) {
            giveSpecialWeapon();
          }

          checkLevel();

          if (gameOver) {
            return;
          }
        } else {
          const hitEnemy = enemies[enemyIndex];

          hitEnemy.element.textContent = hitEnemy.emoji + hitEnemy.hp;
          hitEnemy.element.classList.add("hit");

          setTimeout(function() {
            hitEnemy.element.classList.remove("hit");
          }, 150);
        }

        break;
      }
    }
  }
}

function giveSpecialWeapon() {
  const specialWeapons = [
    {
      name: "Double Doughnut",
      damage: 2,
      shots: 5
    },
    {
      name: "Triple Spaghetti",
      damage: 3,
      shots: 5
    },
    {
      name: "Mega Sugar Blast",
      damage: 100,
      shots: 5
    }
  ];

  const randomNumber = Math.floor(Math.random() * specialWeapons.length);
  const weapon = specialWeapons[randomNumber];

  currentWeaponName = weapon.name + " - " + weapon.damage + " damage";
  currentDamage = weapon.damage;
  specialShots = weapon.shots;

  updateWeaponHUD();

  showBonusMessage("Special Weapon Unlocked: " + currentWeaponName + "!");
}

function updateWeaponHUD() {
  weaponNameText.textContent = currentWeaponName;
  specialShotsText.textContent = specialShots;
}

function showBonusMessage(text) {
  bonusMessage.textContent = text;
  bonusMessage.classList.remove("hidden");

  setTimeout(function() {
    bonusMessage.classList.add("hidden");
  }, 1800);
}

function createExplosion(x, y) {
  const explosion = document.createElement("div");
  explosion.className = "explosion";
  explosion.textContent = "💥";
  explosion.style.left = x - 18 + "px";
  explosion.style.top = y - 18 + "px";

  arena.appendChild(explosion);

  setTimeout(function() {
    explosion.remove();
  }, 250);
}

function checkLevel() {
  if (score >= levelTargets[0] && level === 1) {
    level = 2;
    levelText.textContent = level;

    clearInterval(enemyTimer);
    enemyTimer = setInterval(createEnemy, 1000);
  }

  if (score >= levelTargets[1] && level === 2) {
    level = 3;
    levelText.textContent = level;

    clearInterval(enemyTimer);
    enemyTimer = setInterval(createEnemy, 850);
  }

  if (score >= levelTargets[2] && level === 3) {
    showVictory();
  }
}

function showVictory() {
  gameOver = true;
  loopRunning = false;

  clearInterval(enemyTimer);
  cancelAnimationFrame(animationId);

  messageTitle.textContent = "🏆 Victory!";
  messageText.textContent = "You completed all 3 levels and saved the Candy Kingdom!";
  finalScore.textContent = score;

  messageScreen.classList.remove("hidden");
}

function showDefeat() {
  gameOver = true;
  loopRunning = false;

  clearInterval(enemyTimer);
  cancelAnimationFrame(animationId);

  messageTitle.textContent = "💀 Defeat!";
  messageText.textContent = "The monsters reached your wizard tower. Try again!";
  finalScore.textContent = score;

  messageScreen.classList.remove("hidden");
}

function gameLoop() {
  if (paused || gameOver) {
    loopRunning = false;
    return;
  }

  loopRunning = true;

  updateMissiles();
  updateEnemies();

  if (gameOver) {
    return;
  }

  checkCollisions();

  animationId = requestAnimationFrame(gameLoop);
}

function randomWeapon() {
  const weapons = [
    "🍩 Double Doughnut selected - 2 damage!",
    "🍝 Triple Spaghetti selected - 3 damage!",
    "🌟 Mega Sugar Blast selected - 100 damage!",
    "🧁 Cupcake Cannon selected - bonus idea!"
  ];

  const randomNumber = Math.floor(Math.random() * weapons.length);
  document.getElementById("weaponResult").textContent = weapons[randomNumber];
}

function showFact() {
  const facts = [
    "Every 5 kills gives you a special weapon.",
    "Special weapons last for 5 shots.",
    "Double Doughnut does 2 damage.",
    "Triple Spaghetti does 3 damage.",
    "Mega Sugar Blast does 100 damage.",
    "Level 3 enemies normally take 3 damage to defeat."
  ];

  const randomNumber = Math.floor(Math.random() * facts.length);
  document.getElementById("factText").textContent = facts[randomNumber];
}

function addReview() {
  const name = document.getElementById("reviewName").value;
  const reviewText = document.getElementById("reviewText").value;
  const newReviews = document.getElementById("newReviews");

  if (name === "" || reviewText === "") {
    alert("Please enter your name and review.");
    return;
  }

  const reviewBox = document.createElement("div");
  reviewBox.className = "new-review";

  const reviewName = document.createElement("h3");
  reviewName.textContent = name;

  const stars = document.createElement("p");
  stars.textContent = "⭐⭐⭐⭐⭐";

  const review = document.createElement("p");
  review.textContent = '"' + reviewText + '"';

  reviewBox.appendChild(reviewName);
  reviewBox.appendChild(stars);
  reviewBox.appendChild(review);

  newReviews.appendChild(reviewBox);

  document.getElementById("reviewName").value = "";
  document.getElementById("reviewText").value = "";
}

startGame();
