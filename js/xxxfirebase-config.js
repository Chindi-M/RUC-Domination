// firebase-config.js
import { initializeApp } from "firebase/app";
import {
  getFirestore,
  collection,
  addDoc,
  query,
  orderBy,
  limit,
  getDocs,
} from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  // Replace with your Firebase config
  apiKey: "YOUR_API_KEY",
  authDomain: "your-app.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-app.appspot.com",
  messagingSenderId: "your-messaging-sender-id",
  appId: "your-app-id",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// Major cities list
export const majorCities = [
  "New York",
  "London",
  "Tokyo",
  "Paris",
  "Dubai",
  "Singapore",
  "Hong Kong",
  "Los Angeles",
  "Shanghai",
  "Sydney",
  "Toronto",
  "Berlin",
  "Mumbai",
  "São Paulo",
  "Moscow",
  "Amsterdam",
  "Seoul",
  "Miami",
  "Barcelona",
  "Vancouver",
  "Istanbul",
  "Delhi",
  "Bangkok",
  "Rome",
  "Melbourne",
  "Chicago",
  "Mexico City",
  "Cairo",
  "Manila",
  "Lagos",
];

// Database operations
export const dbOperations = {
  // Add new score to leaderboard
  async addScore(username, city, score) {
    try {
      const docRef = await addDoc(collection(db, "leaderboard"), {
        username,
        city,
        score,
        timestamp: new Date().toISOString(),
      });
      return docRef.id;
    } catch (error) {
      console.error("Error adding score:", error);
      throw error;
    }
  },

  // Get top 10 scores
  async getTopScores() {
    try {
      const q = query(
        collection(db, "leaderboard"),
        orderBy("score", "desc"),
        limit(10)
      );

      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
    } catch (error) {
      console.error("Error getting top scores:", error);
      throw error;
    }
  },

  // Get top scores for a specific city
  async getCityTopScores(city) {
    try {
      const q = query(
        collection(db, "leaderboard"),
        where("city", "==", city),
        orderBy("score", "desc"),
        limit(10)
      );

      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
    } catch (error) {
      console.error("Error getting city scores:", error);
      throw error;
    }
  },
};

export const initializeFirebase = () => app;
