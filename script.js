// Car Racing Game - script.js

// Canvas and context
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

let car, obstacles, score, lives, speed, gameOver, boostActive, paused;

// Responsive resize
function resizeCanvas() {
  canvas.width = window.innerWidth < 600 ? window.innerWidth : 400;
  canvas.height = window.innerHeight < 700 ? window.innerHeight : 600;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

// Initialize game state
function init() {
  const laneWidth = canvas.width / 3;
  car = {
    x: laneWidth, // middle lane
    y: canvas.height - 120,
    width: 40,
    height: 80,
    laneWidth: laneWidth
  };
  obstacles = [];
  score = 0;
  lives = 3;
  speed = 4;
  gameOver = false;
  boostActive = false;
  paused = false;
}
init();

// Handle input
document.addEventListener('keydown', e => {
  if (e.key === 'ArrowLeft') moveCar(-1);
  if (e.key === 'ArrowRight') moveCar(1);
  if (e.key === ' ') boostActive = true;
  if (e.key.toLowerCase() === 'p') paused = !paused;
});
document.addEventListener('keyup', e => {
  if (e.key === ' ') boostActive = false;
});

// Touch buttons
document.getElementById('leftBtn').addEventListener('touchstart', () => moveCar(-1));
document.getElementById('rightBtn').addEventListener('touchstart', () => moveCar(1));
document.getElementById('boostBtn').addEventListener('touchstart', () => boostActive = true);
document.getElementById('boostBtn').addEventListener('touchend', () => boostActive = false);
document.getElementById('brakeBtn').addEventListener('touchstart', () => speed = Math.max(2, speed - 1));

function moveCar(direction) {
  const lane = Math.round(car.x / car.laneWidth);
  const newLane = Math.min(2, Math.max(0, lane + direction));
  car.x = newLane * car.laneWidth + 10;
}

// Game loop
function gameLoop() {
  if (!paused && !gameOver) update();
  draw();
  requestAnimationFrame(gameLoop);
}
requestAnimationFrame(gameLoop);

function update() {
  // Speed boost
  const currentSpeed = boostActive ? speed * 1.8 : speed;

  // Spawn obstacles
  if (Math.random() < 0.02) {
    const lane = Math.floor(Math.random() * 3);
    obstacles.push({
      x: lane * car.laneWidth + 10,
      y: -100,
      width: 40,
      height: 80
    });
  }

  // Move obstacles
  for (let obs of obstacles) {
    obs.y += currentSpeed;
  }

  // Remove off-screen obstacles
  obstacles = obstacles.filter(o => o.y < canvas.height + 100);

  // Collision detection
  for (let obs of obstacles) {
    if (
      car.x < obs.x + obs.width &&
      car.x + car.width > obs.x &&
      car.y < obs.y + obs.height &&
      car.y + car.height > obs.y
    ) {
      lives--;
      obs.y = canvas.height + 200; // remove after collision
      if (lives <= 0) {
        gameOver = true;
      }
    }
  }

  // Increase score and speed
  score++;
  if (score % 500 === 0) speed += 0.5;
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Background road
  ctx.fillStyle = '#333';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Lane lines
  ctx.strokeStyle = '#fff';
  ctx.lineWidth = 2;
  for (let i = 1; i < 3; i++) {
    ctx.beginPath();
    ctx.setLineDash([20, 15]);
    ctx.moveTo(i * car.laneWidth, 0);
    ctx.lineTo(i * car.laneWidth, canvas.height);
    ctx.stroke();
  }
  ctx.setLineDash([]);

  // Car
  ctx.fillStyle = '#ff0000';
  ctx.fillRect(car.x, car.y, car.width, car.height);

  // Obstacles
  ctx.fillStyle = '#0000ff';
  for (let obs of obstacles) {
    ctx.fillRect(obs.x, obs.y, obs.width, obs.height);
  }

  // HUD
  ctx.fillStyle = '#fff';
  ctx.font = '20px Arial';
  ctx.fillText(`Score: ${score}`, 10, 30);
  ctx.fillText(`Lives: ${lives}`, 10, 60);

  if (paused) {
    ctx.fillStyle = 'rgba(0,0,0,0.5)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#fff';
    ctx.font = '30px Arial';
    ctx.fillText('Paused', canvas.width / 2 - 50, canvas.height / 2);
  }

  if (gameOver) {
    ctx.fillStyle = 'rgba(0,0,0,0.7)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#fff';
    ctx.font = '30px Arial';
    ctx.fillText('Game Over!', canvas.width / 2 - 80, canvas.height / 2);
    ctx.font = '20px Arial';
    ctx.fillText('Refresh to Restart', canvas.width / 2 - 80, canvas.height / 2 + 40);
  }
}
