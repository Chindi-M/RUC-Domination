// social-sharing.js
export class SocialSharing {
  constructor(username, city, score) {
    this.username = username;
    this.city = city;
    this.score = score;
    this.gameUrl = window.location.href;
  }

  getShareText() {
    return `I just scored ${this.score} points representing ${this.city} in Rep Ur City Domination! Can you beat my score? 🎮🌟`;
  }

  async shareToTwitter() {
    const text = this.getShareText();
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
      text
    )}&url=${encodeURIComponent(this.gameUrl)}`;
    this.openShareWindow(url);
  }

  async shareToFacebook() {
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
      this.gameUrl
    )}&quote=${encodeURIComponent(this.getShareText())}`;
    this.openShareWindow(url);
  }

  openShareWindow(url) {
    const width = 600;
    const height = 400;
    const left = window.innerWidth / 2 - width / 2;
    const top = window.innerHeight / 2 - height / 2;

    window.open(
      url,
      "share",
      `width=${width},height=${height},left=${left},top=${top},location=0,menubar=0,toolbar=0,status=0,scrollbars=1,resizable=1`
    );
  }
}

// Initialize share buttons
export function initializeSocialSharing(username, city, score) {
  const sharing = new SocialSharing(username, city, score);

  document.getElementById("shareTwitter").addEventListener("click", () => {
    sharing.shareToTwitter();
  });

  document.getElementById("shareFacebook").addEventListener("click", () => {
    sharing.shareToFacebook();
  });
}
