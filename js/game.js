// js/game.js
import { dbOperations } from "./firebase-config.js";

export class RUCGame {
  constructor() {
    this.timeLimit = 60; // 60 seconds for Stage 1
    this.isGameActive = false;
    this.gameStage = 1;
    this.score = 0;
    this.lives = 3;
    this.bubbles = [];
    this.lastBubbleTime = 0;
    this.bubbleInterval = 2000;
    this.difficultyLevel = 1;
    this.scrollProgress = 0;
    this.lastTouchY = null;

    // Initialize DOM elements
    this.canvas = document.getElementById("gameCanvas");
    this.ctx = this.canvas.getContext("2d");
    this.progressBarElement = document.getElementById("progressBar");
    this.progressFillElement = document.getElementById("progressFill");

    // Get screen elements
    this.screens = {
      home: document.getElementById("homeScreen"),
      setup: document.getElementById("setupScreen"),
      game: document.getElementById("gameScreen"),
      gameOver: document.getElementById("gameOverScreen"),
    };

    // Set up event listeners
    this.setupEventListeners();
    this.initializeGame();
    this.loadLeaderboard();
  }

  async loadLeaderboard() {
    try {
      const highScores = await dbOperations.getHighScores();
      const leaderboardList = document.getElementById("leaderboardList");
      leaderboardList.innerHTML = highScores
        .map(
          (score, index) => `
                    <div class="leaderboard-entry">
                        <span>${index + 1}. ${score.username} (${
            score.city
          })</span>
                        <span>${score.score}</span>
                    </div>
                `
        )
        .join("");
    } catch (error) {
      console.error("Error loading leaderboard:", error);
    }
  }

  setupEventListeners() {
    document.getElementById("playBtn").addEventListener("click", () => {
      this.showScreen("setup");
    });

    document.getElementById("startGameBtn").addEventListener("click", () => {
      this.startGame();
    });

    this.canvas.addEventListener("click", (e) => this.handleBubbleClick(e));
    this.canvas.addEventListener("touchstart", (e) => {
      e.preventDefault();
      const touch = e.touches[0];
      this.handleBubbleClick(touch);
    });

    this.handleScroll = (e) => {
      e.preventDefault();
      const scrollAmount = Math.abs(e.deltaY);
      this.updateScrollProgress(scrollAmount);
    };

    this.handleTouchScroll = (e) => {
      e.preventDefault();
      const touch = e.touches[0];
      if (this.lastTouchY) {
        const deltaY = this.lastTouchY - touch.clientY;
        this.updateScrollProgress(Math.abs(deltaY) * 2);
      }
      this.lastTouchY = touch.clientY;
    };

    document.getElementById("playAgainBtn")?.addEventListener("click", () => {
      this.showScreen("setup");
    });

    document.getElementById("homeBtn")?.addEventListener("click", () => {
      this.showScreen("home");
    });
  }

  initializeGame() {
    this.resizeCanvas();
    window.addEventListener("resize", () => this.resizeCanvas());

    const citySelect = document.getElementById("citySelect");
    const cities = ["New York", "London", "Tokyo", "Paris", "Berlin", "Sydney"];
    cities.forEach((city) => {
      const option = document.createElement("option");
      option.value = city;
      option.textContent = city;
      citySelect.appendChild(option);
    });
  }

  resizeCanvas() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  showScreen(screenName) {
    Object.entries(this.screens).forEach(([name, element]) => {
      element.classList.toggle("hidden", name !== screenName);
    });
  }

  showGame() {
    this.showScreen("game");
    this.canvas.style.display = "block";

    if (this.progressBarElement) {
      this.progressBarElement.style.display = "block";
      this.progressBarElement.style.position = "absolute";
      this.progressBarElement.style.top = "50%";
      this.progressBarElement.style.left = "50%";
      this.progressBarElement.style.transform = "translate(-50%, -50%)";
      this.progressBarElement.style.width = "80%";
      this.progressBarElement.style.height = "30px";
      this.progressBarElement.style.backgroundColor = "#333";
      this.progressBarElement.style.borderRadius = "15px";
      this.progressBarElement.style.overflow = "hidden";
      this.progressBarElement.style.zIndex = "1000";
    }

    if (this.progressFillElement) {
      this.progressFillElement.style.width = "0%";
      this.progressFillElement.style.height = "100%";
      this.progressFillElement.style.backgroundColor = "#4CAF50";
      this.progressFillElement.style.transition = "width 0.1s ease";
    }
  }

  startGame() {
    const username = document.getElementById("username").value;
    const city = document.getElementById("citySelect").value;

    if (!username || !city) {
      alert("Please enter your username and select your city!");
      return;
    }

    this.username = username;
    this.city = city;
    this.score = 0;
    this.lives = 3;
    this.isGameActive = true;
    this.gameStage = 1;
    this.scrollProgress = 0;
    this.startTime = Date.now();
    this.difficultyLevel = 1;
    this.bubbles = [];

    this.updateScore();
    this.updateLives();
    this.showGame();

    window.addEventListener("wheel", this.handleScroll);
    window.addEventListener("touchmove", this.handleTouchScroll, {
      passive: false,
    });

    this.gameLoop();
  }

  updateScore() {
    const scoreElement = document.getElementById("score");
    if (scoreElement) {
      scoreElement.textContent = `Score: ${this.score}`;
    }
  }

  updateLives() {
    const heartsElement = document.getElementById("hearts");
    if (heartsElement) {
      heartsElement.textContent = "❤️".repeat(this.lives);
    }
  }

  updateScrollProgress(amount) {
    const now = Date.now();
    const timeDiff = (now - this.startTime) / 1000;

    if (timeDiff <= this.timeLimit) {
      this.scrollProgress += amount * 0.05;
      this.scrollProgress = Math.min(this.scrollProgress, 100);

      if (this.progressFillElement) {
        this.progressFillElement.style.width = `${this.scrollProgress}%`;
      }

      this.score += Math.floor(amount * 0.1);
      this.updateScore();

      if (this.scrollProgress >= 100) {
        this.startStage2();
      }
    } else {
      if (this.scrollProgress < 100) {
        this.lives--;
        this.updateLives();
        if (this.lives <= 0) {
          this.gameOver();
        } else {
          this.resetStage();
        }
      }
    }
  }

  startStage2() {
    console.log("Starting Stage 2");
    this.gameStage = 2;
    this.score += 1000;
    this.updateScore();

    this.lastBubbleTime = Date.now();
    this.bubbleInterval = 2000;
    this.difficultyLevel = 1;
    this.bubbles = [];

    window.removeEventListener("wheel", this.handleScroll);
    window.removeEventListener("touchmove", this.handleTouchScroll);

    if (this.progressBarElement) {
      this.progressBarElement.style.display = "none";
    }
  }

  createBubble() {
    const sizes = {
      large: { radius: 40, points: 1 },
      medium: { radius: 25, points: 5 },
      small: { radius: 15, points: 10 },
    };

    const colors = {
      red: { multiplier: 1, color: "#ff0000" },
      blue: { multiplier: 2, color: "#0000ff" },
    };

    const size = Object.keys(sizes)[Math.floor(Math.random() * 3)];
    const color = Object.keys(colors)[Math.floor(Math.random() * 2)];

    return {
      x: Math.random() * (this.canvas.width - 50) + 25,
      y: -50,
      radius: sizes[size].radius,
      basePoints: sizes[size].points,
      color: colors[color].color,
      multiplier: colors[color].multiplier,
      speed: 2 + this.difficultyLevel * 0.5,
      clicks: 3,
    };
  }

  handleBubbleClick(e) {
    if (this.gameStage !== 2) return;

    const rect = this.canvas.getBoundingClientRect();
    const x = (e.clientX || e.pageX) - rect.left;
    const y = (e.clientY || e.pageY) - rect.top;

    this.bubbles.forEach((bubble, index) => {
      const distance = Math.sqrt(
        Math.pow(x - bubble.x, 2) + Math.pow(y - bubble.y, 2)
      );

      if (distance < bubble.radius) {
        bubble.clicks--;
        if (bubble.clicks <= 0) {
          const points = bubble.basePoints * bubble.multiplier;
          this.score += points;
          this.updateScore();
          this.bubbles.splice(index, 1);
        }
      }
    });
  }

  updateStage2() {
    const now = Date.now();

    if (now - this.lastBubbleTime > this.bubbleInterval) {
      console.log("Creating new bubble");
      const bubblesCount = Math.min(Math.floor(this.difficultyLevel / 2), 4);
      for (let i = 0; i < bubblesCount; i++) {
        this.bubbles.push(this.createBubble());
      }
      this.lastBubbleTime = now;

      this.difficultyLevel += 0.1;
      this.bubbleInterval = Math.max(500, 2000 - this.difficultyLevel * 100);
    }

    this.bubbles = this.bubbles.filter((bubble) => {
      bubble.y += bubble.speed;

      if (bubble.y > this.canvas.height + bubble.radius) {
        this.lives--;
        this.updateLives();
        if (this.lives <= 0) {
          this.gameOver();
        }
        return false;
      }

      this.ctx.beginPath();
      this.ctx.arc(bubble.x, bubble.y, bubble.radius, 0, Math.PI * 2);
      this.ctx.fillStyle = bubble.color;
      this.ctx.fill();
      this.ctx.strokeStyle = "white";
      this.ctx.stroke();
      this.ctx.closePath();

      this.ctx.fillStyle = "white";
      this.ctx.fillText(bubble.clicks, bubble.x, bubble.y);

      return true;
    });
  }

  resetStage() {
    this.scrollProgress = 0;
    this.startTime = Date.now();
    if (this.progressFillElement) {
      this.progressFillElement.style.width = "0%";
    }
  }

  async gameOver() {
    this.isGameActive = false;
    window.removeEventListener("wheel", this.handleScroll);
    window.removeEventListener("touchmove", this.handleTouchScroll);

    try {
      await dbOperations.saveScore(this.username, this.score, this.city);
      await this.loadLeaderboard();
    } catch (error) {
      console.error("Error saving score:", error);
    }

    const finalScoreDiv = document.getElementById("finalScore");
    if (finalScoreDiv) {
      finalScoreDiv.textContent = `Final Score: ${this.score}`;
    }

    this.showScreen("gameOver");
  }

  gameLoop() {
    if (!this.isGameActive) return;

    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    if (this.gameStage === 1) {
      const timeLeft = Math.max(
        0,
        this.timeLimit - (Date.now() - this.startTime) / 1000
      );

      this.ctx.fillStyle = "white";
      this.ctx.font = "40px Arial";
      this.ctx.textAlign = "center";
      this.ctx.fillText(
        `Time Left: ${Math.ceil(timeLeft)}s`,
        this.canvas.width / 2,
        100
      );

      this.ctx.font = "36px Arial";
      this.ctx.fillText(
        "Stage 1: Scroll Challenge!",
        this.canvas.width / 2,
        this.canvas.height / 2 - 60
      );

      this.ctx.font = "30px Arial";
      this.ctx.fillText(
        "Scroll to fill the bar!",
        this.canvas.width / 2,
        this.canvas.height / 2
      );

      this.ctx.font = "24px Arial";
      this.ctx.fillText(
        "(Use mouse wheel or touch scroll)",
        this.canvas.width / 2,
        this.canvas.height / 2 + 40
      );

      this.ctx.font = "28px Arial";
      this.ctx.fillText(
        `Progress: ${Math.floor(this.scrollProgress)}%`,
        this.canvas.width / 2,
        this.canvas.height / 2 + 100
      );
    } else if (this.gameStage === 2) {
      this.ctx.fillStyle = "white";
      this.ctx.font = "24px Arial";
      this.ctx.textAlign = "left";
      this.ctx.fillText(`Score: ${this.score}`, 20, 40);
      this.ctx.fillText(`Lives: ${this.lives}`, 20, 70);

      this.updateStage2();
    }

    requestAnimationFrame(() => this.gameLoop());
  }
}
