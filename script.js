const player = document.getElementById("player");
const fakeLetter = document.getElementById("fakeLetter");
const realLetter = document.getElementById("realLetter");
const popup = document.getElementById("popup");
const game = document.getElementById("game");

let realRevealed = false;
// Player settings
let x = 20;
let y = 220;
const size = 40;

// Physics
let velocityY = 0;
const gravity = 0.8;
const jumpPower = -11; // ❗UNCHANGED as requested
let onGround = false;

// Controls
const keys = {};

// Joystick
let moveX = 0;

// Obstacles (including floor)
const obstacles = [
    // FLOOR
    { x: 0, y: 260, width: 800, height: 40 },

    // LEFT START BLOCK (forces jump start)
    { x: 120, y: 220, width: 40, height: 20 },

    // GAP PLATFORM (requires j ump timing)
    { x: 220, y: 190, width: 60, height: 20 },

    // MID AIR BLOCK (forces upward progression)
    { x: 240, y: 70, width: 18, height: 10 },

    // Left SIDE STAIR (leads toward letter)
    { x: 240, y: 135, width: 20, height: 5  },
    // Left SIDE STAIR (leads toward letter)
    { x: 430, y: 105, width: 10, height: 10  },
  // Left SIDE STAIR (leads toward letter)
    { x: 560, y: 145, width: 4, height: 10  },
    // Left SIDE STAIR (leads toward letter)

 // Left SIDE STAIR (leads toward letter)
    { x: 620, y: 90, width: 4, height: 10  },
// Left SIDE STAIR (leads toward letter)
    { x: 700, y: 15, width: 10, height: 60  },
  // Left SIDE STAIR (leads toward letter)
    { x: 700, y: 120, width: 10, height: 60  }
    // FINAL SMALL PLATFORM (near letter)

];
// Render obstacles
obstacles.forEach(o => {
    const div = document.createElement("div");
    div.classList.add("obstacle");
    div.style.left = o.x + "px";
    div.style.top = o.y + "px";
    div.style.width = o.width + "px";
    div.style.height = o.height + "px";
    game.appendChild(div);
});

// Keyboard input (still works)
document.addEventListener("keydown", (e) => {
    keys[e.key] = true;

    if ((e.key === " " || e.key === "ArrowUp") && onGround) {
        velocityY = jumpPower;
        onGround = false;
    }
});

document.addEventListener("keyup", (e) => {
    keys[e.key] = false;
});

// Collision helper
function isColliding(px, py, o) {
    return (
        px < o.x + o.width &&
        px + size > o.x &&
        py < o.y + o.height &&
        py + size > o.y
    );
}

/* =======================
   JOYSTICK (FIXED)
======================= */

const joystick = document.getElementById("joystick");
const stick = document.getElementById("stick");

let dragging = false;

joystick.addEventListener("pointerdown", (e) => {
    dragging = true;
    joystick.setPointerCapture(e.pointerId);
});

joystick.addEventListener("pointerup", () => {
    dragging = false;
    moveX = 0;

    stick.style.left = "35px";
    stick.style.top = "35px";
});

joystick.addEventListener("pointermove", (e) => {
    if (!dragging) return;

    const rect = joystick.getBoundingClientRect();

    let dx = e.clientX - rect.left - rect.width / 2;
    let dy = e.clientY - rect.top - rect.height / 2;

    const max = 40;

    dx = Math.max(-max, Math.min(max, dx));
    dy = Math.max(-max, Math.min(max, dy));

    stick.style.left = 35 + dx + "px";
    stick.style.top = 35 + dy + "px";

    moveX = dx / max;
});

/* =======================
   GAME LOOP
======================= */

function gameLoop() {
    const speed = 5;

    let oldX = x;
    let oldY = y;

    // --- HORIZONTAL MOVEMENT (FIXED) ---
    if (keys["ArrowRight"]) x += speed;
    if (keys["ArrowLeft"]) x -= speed;

    // joystick movement
    x += moveX * speed;

    // --- GRAVITY ---
    velocityY += gravity;
    y += velocityY;

    onGround = false;

    // --- VERTICAL COLLISION ---
    for (let o of obstacles) {
        if (isColliding(x, y, o)) {

            // landing on top
            if (oldY + size <= o.y) {
                y = o.y - size;
                velocityY = 0;
                onGround = true;
            }

            // hitting head
            else if (oldY >= o.y + o.height) {
                y = o.y + o.height;
                velocityY = 0;
            }
        }
    }

    // --- HORIZONTAL COLLISION ---
    for (let o of obstacles) {
        if (isColliding(x, y, o)) {
            x = oldX;
        }
    }

    // --- SCREEN LIMITS ---
    x = Math.max(0, Math.min(x, 760));

    // --- APPLY ---
    player.style.left = x + "px";
    player.style.top = y + "px";

    checkWin();

    requestAnimationFrame(gameLoop);
}

/* =======================
   WIN CHECK
======================= */

function checkWin() {
    const playerRect = player.getBoundingClientRect();
    const fakeRect = fakeLetter.getBoundingClientRect();
    const realRect = realLetter.getBoundingClientRect();

    // 💥 FAKE LETTER (trigger)
    if (
        playerRect.left < fakeRect.right &&
        playerRect.right > fakeRect.left &&
        playerRect.top < fakeRect.bottom &&
        playerRect.bottom > fakeRect.top
    ) {
        fakeLetter.classList.add("hidden"); // hide fake
        realLetter.classList.remove("hidden"); // show real
        realRevealed = true;
    }

    // 💌 REAL LETTER (WIN)
    if (realRevealed) {
        if (
            playerRect.left < realRect.right &&
            playerRect.right > realRect.left &&
            playerRect.top < realRect.bottom &&
            playerRect.bottom > realRect.top
        ) {
            popup.classList.remove("hidden");
        }
    }
}
function revealRealLetter() {
    realLetter.classList.remove("hidden");
    realRevealed = true;
}
function closePopup() {
    popup.classList.add("hidden");
}

/* =======================
   JUMP BUTTON (UNCHANGED)
======================= */

function jump() {
    if (onGround) {
        velocityY = -5; // ❗UNCHANGED as requested
        onGround = false;
    }
}

gameLoop();
