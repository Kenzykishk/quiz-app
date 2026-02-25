"use strict";

//  Select DOM elements first
let categoryMenu = document.getElementById("categoryMenu");
let difficultyOptions = document.getElementById("difficultyOptions");
let questionsNumber = document.getElementById("questionsNumber");
let startQuiz = document.getElementById("startQuiz");
let typeOptions = document.getElementById("typeOptions");

let questionContainer = document.getElementById("questionContainer");
let loaderContainer = document.querySelector(".loaderContainer");

//  QuizApi class
class QuizApi {
  baseUrl = "https://opentdb.com/api.php?";

  constructor(amount, category, difficulty, type) {
    this.amount = amount;
    this.category = category;
    this.difficulty = difficulty;
    this.type = type;
  }

  async getQuestions() {
    const params = new URLSearchParams({
      amount: this.amount,
      category: this.category,
      difficulty: this.difficulty,
      type: this.type,
    });

    const res = await fetch(this.baseUrl + params);
    const data = await res.json();

    return data.results;
  }
}

//  Quiz class (game manager)
class Quiz extends QuizApi {
  constructor(amount, category, difficulty, type) {
    super(amount, category, difficulty, type);
    this.score = 0;
    this.index = 0;
  }

  async start() {
    this.showLoader();

    this.questions = await this.getQuestions();

    this.hideLoader();
    this.showQuestion();
  }

  showLoader() {
    loaderContainer?.classList.remove("d-none");
    loaderContainer?.classList.add("d-flex");
  }

  hideLoader() {
    loaderContainer?.classList.add("d-none");
    loaderContainer?.classList.remove("d-flex");
  }

  showQuestion() {
    new Questions(this.questions, this.index, this.score, this);
  }

  next(newScore) {
    this.score = newScore;
    this.index++;

    if (this.index < this.questions.length) {
      this.showQuestion();
    } else {
      this.showResult();
    }
  }

  showResult() {
    questionContainer.innerHTML = `
      <div class="card p-4 text-center">
        <h3>🎉 Congratulations!</h3>
        <p>Your score is:</p>
        <span class="badge bg-warning fs-4">
          ${this.score} / ${this.questions.length}
        </span>
      </div>
    `;
  }
}

//  Questions class (single question)
class Questions {
  constructor(questions, index, score, quiz) {
    this.questions = questions;
    this.index = index;
    this.score = score;
    this.quiz = quiz;

    this.current = questions[index];
    this.answers = [
      this.current.correct_answer,
      ...this.current.incorrect_answers,
    ].sort();

    this.render();
  }

  render() {
    questionContainer.innerHTML = `
      <div class="card p-4">
        <div class="card-title">
          <p>${this.current.question}</p>
        </div>
        <div>
          <span class="badge bg-primary">Question</span>
          <span class="badge bg-primary">
            ${this.index + 1} of ${this.questions.length}
          </span>
        </div>
        <div class="card-body">
          <ul class="list-unstyled row g-2">
            ${this.answers.map(ans => `
              <li class="col-6 mb-2">
                <button class="btn btn-dark w-100 answer">${ans}</button>
              </li>
            `).join("")}
          </ul>
        </div>
        <div class="card-footer">
          score: <span class="badge bg-warning">${this.score}</span>
        </div>
      </div>
    `;

    this.addEvents();
  }

  addEvents() {
    let answered = false;

    document.querySelectorAll(".answer").forEach(btn => {
      btn.addEventListener("click", e => {
        if (answered) return;
        answered = true;

        let newScore = this.score;

        if (e.target.innerText === this.current.correct_answer) {
          e.target.classList.replace("btn-dark", "btn-success");
          e.target.classList.add("animate__animated", "animate__shakeY");
          newScore++;
        } else {
          e.target.classList.replace("btn-dark", "btn-danger");
          e.target.classList.add("animate__animated", "animate__shakeX");

          // highlight correct answer
          document.querySelectorAll(".answer").forEach(btn => {
            if (btn.innerText === this.current.correct_answer) {
              btn.classList.replace("btn-dark", "btn-success");
            }
          });
        }

        setTimeout(() => {
          this.quiz.next(newScore);
        }, 1000);
      });
    });
  }
}

//  Start button listener
startQuiz.addEventListener("click", () => {
  const quiz = new Quiz(
    questionsNumber.value,
    categoryMenu.value,
    difficultyOptions.value,
    typeOptions.value
  );

  quiz.start();
});
