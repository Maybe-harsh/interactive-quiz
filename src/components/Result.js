import React from 'react';
import quizData from '../quiz_data.json'; // Import quizData

function Result({ result, onRestart }) { // Add onRestart prop
  return (
    <div className="result-container">
      <h2>Quiz Results</h2>
      {/* Display correct and incorrect answers */}
      <p>Correct Answers: {result.correctAnswers} / {result.totalQuestions}</p>
      <p>Incorrect Answers: {result.incorrectAnswers} / {result.totalQuestions}</p>
      <ul className="answers-list">
        {Object.keys(result.userAnswers).map((questionIndex) => (
          <li key={questionIndex}>
            {/* Display the question */}
            <p><strong>Question:</strong> {quizData[questionIndex].question}</p>
            {/* Display the user's answer */}
            <p><strong>Your Answer:</strong> {result.userAnswers[questionIndex] || "Not Answered"}</p>
            {/* Conditionally render correct answer if user answer is wrong */}
            {result.userAnswers[questionIndex]!= quizData[questionIndex].answer && (
              <p><strong>Correct Answer:</strong> {quizData[questionIndex].answer}</p>
            )}
          </li>
        ))}
      </ul>
      {/* Add Restart Quiz button */}
      <button onClick={onRestart}>Restart Quiz</button>
    </div>
  );
}

export default Result;