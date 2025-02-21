import React, { useState, useEffect, useRef } from "react";
import quizData from "../quiz_data.json";
import "../styles.css"; // Import your styles

function Quiz({ onQuizEnd }) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState({});
  const [score, setScore] = useState(0);
  const [timer, setTimer] = useState(30);
  const [isQuizFinished, setIsQuizFinished] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [integerAnswer, setIntegerAnswer] = useState("");

  // Create a ref to access the input element
  const inputRef = useRef(null);

  // Move currentQuestion declaration here
  const currentQuestion = quizData[currentQuestionIndex];

  useEffect(() => {
    let interval;
    if (!isQuizFinished && timer > 0) {
      interval = setInterval(() => {
        setTimer((prevTimer) => prevTimer - 1);
      }, 1000);
    } else if (timer === 0) {
      handleAnswerSubmit();
    }
    return () => clearInterval(interval);
  }, [timer, currentQuestionIndex, isQuizFinished]);

  // Focus on the input field when the question changes
  useEffect(() => {
    if (currentQuestion &&!currentQuestion.options && inputRef.current) {
      inputRef.current.focus();
    }
  }, [currentQuestion]);

  const handleAnswerSelect = (answer) => {
    setUserAnswers((prevAnswers) => ({
    ...prevAnswers,
      [currentQuestionIndex]: answer,
    }));
  };

  const handleIntegerAnswerChange = (event) => {
    setIntegerAnswer(event.target.value);
  };

  // Handle Enter key press
  const handleKeyDown = (event) => {
    if (event.key === "Enter") {
      handleAnswerSubmit();
    }
  };

  const handleAnswerSubmit = () => {
    const correctAnswer = currentQuestion.answer;

    // Update userAnswers immediately
    setUserAnswers((prevAnswers) => ({
    ...prevAnswers,
      [currentQuestionIndex]: currentQuestion.options
      ? userAnswers[currentQuestionIndex]
      : integerAnswer,
    }));

    const selectedAnswer = currentQuestion.options
    ? userAnswers[currentQuestionIndex]
    : integerAnswer;

    if (selectedAnswer == correctAnswer) {
      setScore((prevScore) => prevScore + 1);
    }

    setShowFeedback(true);

    setTimeout(() => {
      setShowFeedback(false);
      setIntegerAnswer("");

      if (currentQuestionIndex === quizData.length - 1) {
        setIsQuizFinished(true);
        onQuizEnd(calculateResult());
      } else {
        setCurrentQuestionIndex((prevIndex) => prevIndex + 1);
        setTimer(30);
      }
    }, 1500);
  };

  const calculateResult = () => {
    let correctAnswers = 0;
    let incorrectAnswers = 0;

    for (let i = 0; i < quizData.length; i++) {
      const correctAnswer = quizData[i].answer;
      const userAnswer = userAnswers[i];

      if (userAnswer == correctAnswer) {
        correctAnswers++;
      } else {
        incorrectAnswers++;
      }
    }

    return {
      correctAnswers,
      incorrectAnswers,
      totalQuestions: quizData.length,
      userAnswers,
    };
  };

  return (
    <div className="quiz-container">
      {!isQuizFinished? (
        <div>
          <h2 className="question-title">{currentQuestion.question}</h2>

          {currentQuestion.options? (
            <div className="options-container">
              {currentQuestion.options.map((option, index) => (
                <button
                  key={index}
                  className={`option-button ${
                    userAnswers[currentQuestionIndex] === option
                    ? "selected"
                    : ""
                  }`}
                  onClick={() => handleAnswerSelect(option)}
                  disabled={showFeedback}
                >
                  {option}
                </button>
              ))}
            </div>
          ): (
            <div>
              <input
                type="text"
                value={integerAnswer}
                onChange={handleIntegerAnswerChange}
                onKeyDown={handleKeyDown} // Add onKeyDown handler
                ref={inputRef} // Add the ref to the input element
                disabled={showFeedback}
              />
              {/* Remove the Check Answer button */}
            </div>
          )}

          <div className="timer">Time: {timer}</div>
          {showFeedback && (
            <div className="feedback">
              {/* Corrected conditional rendering for feedback */}
              {(currentQuestion.options
              ? userAnswers[currentQuestionIndex] == currentQuestion.answer
              : integerAnswer == currentQuestion.answer)? (
                <span className="correct">Correct!</span>
              ): (
                <span className="incorrect">Incorrect!</span>
              )}
            </div>
          )}
          {timer === 0? (
            <button
              className="next-button"
              onClick={handleAnswerSubmit}
              disabled={!userAnswers[currentQuestionIndex]}
            >
              Next
            </button>
          ): (
            <button
              className="submit-button"
              onClick={handleAnswerSubmit}
              disabled={
                currentQuestion.options &&
                userAnswers[currentQuestionIndex] === undefined
              }
            >
              Submit
            </button>
          )}
        </div>
      ): null}
    </div>
  );
}

export default Quiz;