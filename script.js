// Define different object types
const objectTypes = [
  { type: "object", points: 1, life: 0 },   // normal
  { type: "candy", points: 0, life: 1 },      // extra life
  { type: "hat", points: 0, life: -1 }     // lose life
];
    let highScore = localStorage.getItem("highScore") | 0;
    const audio = document.getElementById("bg-audio");
    const gameArea = document.getElementById("gameArea");
    const basket = document.getElementById("basket");
    const scoreboard = document.getElementById("scoreboard");
    const gameOverScreen = document.getElementById("gameOver");
    const restartBtn = document.getElementById("restartBtn");     
    const startBox = document.getElementById("startBox");
    const playBtn = document.getElementById("playBtn");
    const startVideo = document.getElementById("start-video");
    let gameRunning = false;
    gameArea.style.display = "none";
    scoreboard.style.display = "none";
    basket.style.display = "none";
    playBtn.style.display="none" ;
startVideo.addEventListener("timeupdate", () => {
  if (startVideo.currentTime >= 10) {
    startVideo.pause();
   playBtn.style.display="block" ;// optional: reset to beginning
  }
})

playBtn.addEventListener("click", () => {
  startBox.style.display = "none";
  gameArea.style.display = "block";
  scoreboard.style.display = "block";
  basket.style.display = "block";
     gameRunning = true;
  audio.play().catch(err => console.log("Audio play blocked:", err));
      // Start spawning objects
    spawnObjects();
});
    // Use window size instead of fixed container size
    let gameWidth = window.innerWidth;
    let gameHeight = window.innerHeight;

    // Update when window resizes
    window.addEventListener("resize", () => {
    gameWidth = window.innerWidth;
    gameHeight = window.innerHeight;
    });

    let basketSpeed = 16.5;
    let basketPos = basket.offsetLeft;
    let score = 0;
    let lives = 3;

    // Falling speed settings
    let fallSpeed = 3; 
    let speedIncreaseInterval = 5; // every 5 points, speed increases

    // Move basket with arrow keys
    let moveLeft = false;
    let moveRight = false;

    // Listen for key press
    document.addEventListener("keydown", (e) => {
    if (e.key === "ArrowLeft") moveLeft = true;
    if (e.key === "ArrowRight") moveRight = true;
    });

    // Listen for key release
    document.addEventListener("keyup", (e) => {
    if (e.key === "ArrowLeft") moveLeft = false;
    if (e.key === "ArrowRight") moveRight = false;
    });

    // Basket sliding movement loop
    function moveBasket() {
    let basketLeft = basket.offsetLeft;

    if (moveLeft && basketLeft > 0) {
        basket.style.left = basketLeft - basketSpeed + "px";
    }
    if (moveRight && basketLeft < gameWidth - basket.offsetWidth) {
        basket.style.left = basketLeft + basketSpeed + "px";
    }

    requestAnimationFrame(moveBasket);
    }

    // Start basket movement loop once
    moveBasket();

    // Create falling objects
    function createObject() {
      if (!gameRunning) return;

  let rand = Math.random();
  let objData;
  if (rand < 0.7) {
    objData = objectTypes.find(o => o.type === "object");
  } else if (rand < 0.8) {
    objData = objectTypes.find(o => o.type === "candy");
  } else {
    objData = objectTypes.find(o => o.type === "hat");
  }

  const obj = document.createElement("div");

    obj.classList.add(objData.type); // class: object, candy, or hat
    obj.dataset.points = objData.points;
    obj.dataset.life = objData.life;
    obj.dataset.type = objData.type

    obj.style.left = Math.random() * (gameWidth - 60) + "px";
    obj.style.right = Math.random() * (gameWidth - 70) + "px";
    obj.style.top = "0px";
    gameArea.appendChild(obj);

      // Each object gets its own speed at spawn
      let objSpeed = fallSpeed;

      function fall() {
        if (!gameRunning) return;

        let objTop = parseInt(obj.style.top);
        obj.style.top = objTop + objSpeed + "px";

        const objRect = obj.getBoundingClientRect();
        const basketRect = basket.getBoundingClientRect();

        // Collision detection
        if (
          objRect.bottom >= basketRect.top &&
          objRect.right >= basketRect.left &&
          objRect.left <= basketRect.right &&
          objRect.bottom <= basketRect.bottom
        ) {
          
      score += parseInt(obj.dataset.points);
      lives += parseInt(obj.dataset.life);
          updateScoreboard();
           if (lives <= 0) {
          endGame();
        }
          if (score % speedIncreaseInterval === 0) {
            fallSpeed += 0.5;
          }
          obj.remove();
          return;
        }

        // Ground check — move this inside the loop
        if (objTop >= gameHeight - obj.offsetHeight) {    
       if (obj.dataset.type === "object") {
        lives--;
        updateScoreboard();
        if (lives <= 0) {
          endGame();
        }
      }
          obj.remove();
          return; // Stop falling
        }

        requestAnimationFrame(fall);
      }
        requestAnimationFrame(fall);
          }

    // Update scoreboard
    function updateScoreboard() {
     scoreboard.textContent = `Score: ${score} | Lives: ${lives} | High Score: ${highScore}`;
    }

    // End game
    function endGame() {
      gameRunning = false;
      gameOverScreen.style.display = "block";
      basketSpeed=0;
      //update highscore
      if (score > highScore) {
        highScore = score;
        localStorage.setItem("highScore", highScore);
      }
      document.getElementById("finalScore").textContent = `Your Score: ${score}`;
      document.getElementById("finalHighScore").textContent = `High Score: ${highScore}`;
    }

    // Restart game
    restartBtn.addEventListener("click", () => {
      basketSpeed=14;
      score = 0;
      lives = 3;
      fallSpeed = 3; // reset speed
      gameRunning = true;
      updateScoreboard();
      gameOverScreen.style.display = "none";
      spawnObjects(); // restart spawning
      document.querySelectorAll(".object, .candy, .hat").forEach(obj => obj.remove());
      audio.currentTime = 0;
      audio.play().catch(err => console.log("Audio play blocked:", err));
    });

    // Randomized object spawning
    function spawnObjects() {
      if (!gameRunning) return;

      // Create an object
      createObject();

      // Random delay before next object (0.8s to 2s)
      const delay = Math.random() * 1000 + 800;

      setTimeout(spawnObjects, delay);
    }
