// firebase-config.js
export const dbOperations = {
  saveScore: async (username, score, city) => {
    console.log("Mock saving score:", { username, score, city });
    return true;
  },
  getHighScores: async () => {
    return [
      { username: "TestUser1", score: 1000, city: "New York" },
      { username: "TestUser2", score: 800, city: "London" },
      { username: "TestUser3", score: 600, city: "Tokyo" },
    ];
  },
};
