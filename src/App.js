import { useState, useEffect } from "react";
import Quiz from "./components/Quiz";
import Result from "./components/Result";
import "./styles.css";

// Define db outside the component
let db;

// Function to open the database
function openDB() {
  const DBOpenRequest = window.indexedDB.open("quizAttempts", 1);

  DBOpenRequest.onupgradeneeded = (event) => {
    const db = event.target.result;
    console.log("Database created or upgraded");

    // Create your object stores here
    db.createObjectStore("quizAttempts", {
      keyPath: "id",
      autoIncrement: true,
    });
  };

  DBOpenRequest.onsuccess = (event) => {
    db = DBOpenRequest.result;
    console.log("Database opened successfully");
  };

  DBOpenRequest.onerror = (event) => {
    console.error("Error opening database:", event.target.error);
  };
}

// Call the function to open the database when the script loads
openDB();

function App() {
  const [quizResult, setQuizResult] = useState(null);
  const [attemptHistory, setAttemptHistory] = useState();

  useEffect(() => {
    // Fetch and display the attempt history
    const transaction = db.transaction("quizAttempts", "readonly");
    const objectStore = transaction.objectStore("quizAttempts");
    const getAllRequest = objectStore.getAll();

    getAllRequest.onsuccess = (e) => {
      setAttemptHistory(e.target.result);
    };
  },);

  const handleQuizEnd = (result) => {
    setQuizResult(result);

    const newAttempt = {
      timestamp: new Date(),
      score: result.score, // Make sure to include the score here
      userAnswers: result.userAnswers,
    };

    // Store the new attempt in IndexedDB
    const transaction = db.transaction("quizAttempts", "readwrite");
    const objectStore = transaction.objectStore("quizAttempts");
    const addRequest = objectStore.add(newAttempt);

    addRequest.onsuccess = () => {
      console.log("Attempt added to database");
      setAttemptHistory((prevHistory) => [...prevHistory, newAttempt]);
    };

    addRequest.onerror = (event) => {
      console.error("Error adding attempt to database:", event.target.error);
    };
  };

  const handleRestartQuiz = () => {
    setQuizResult(null);
  };

  const handleDeleteAttempt = (id) => {
    const transaction = db.transaction("quizAttempts", "readwrite");
    const objectStore = transaction.objectStore("quizAttempts");
    const deleteRequest = objectStore.delete(id);

    deleteRequest.onsuccess = () => {
      console.log("Attempt deleted from database");
      setAttemptHistory((prevHistory) =>
        prevHistory.filter((attempt) => attempt.id!== id)
      );
    };

    deleteRequest.onerror = (event) => {
      console.error("Error deleting attempt from database:", event.target.error);
    };
  };

  return (
    <div className="app-container">
      <h1>Interactive Quiz</h1>
      <div className="quiz-and-results"> {/* Added a container for Quiz and Result */}
        {quizResult? (
          <Result
            result={quizResult}
            onRestart={handleRestartQuiz}
            userAnswers={quizResult.userAnswers}
          />
        ): (
          <Quiz onQuizEnd={handleQuizEnd} />
        )}
      </div>

      <h2>Attempt History</h2>
      {attemptHistory?.length > 0 && (
        <ul>
          {attemptHistory.map((attempt, index) => (
            <li key={attempt.id}>
              Attempt {index + 1}: Score - {attempt.score}, Time -{" "}
              {attempt.timestamp.toString()}
              <button onClick={() => handleDeleteAttempt(attempt.id)}>
                Delete
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default App;