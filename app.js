
// Hilfsfunktionen
const qs = selector => document.querySelector(selector);
const qsAll = selector => document.querySelectorAll(selector);

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, c => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  }[c]));
}

// View Management
function showView(viewId) {
  qsAll('.view').forEach(v => v.classList.add('hidden'));
  document.getElementById(viewId).classList.remove('hidden');
}

// Quiz-Daten
const quizzes = [
  {
    title: 'Allgemeinwissen',
    questions: [
      { q: 'Wie viele Kontinente gibt es?', options: ['5', '6', '7', '8'], answer: 2 },
      { q: 'Was ist die Hauptstadt von Frankreich?', options: ['London', 'Berlin', 'Paris', 'Madrid'], answer: 2 },
      { q: 'Welcher Planet ist der größte im Sonnensystem?', options: ['Mars', 'Jupiter', 'Saturn', 'Neptun'], answer: 1 },
      { q: 'In welchem Jahr fiel die Berliner Mauer?', options: ['1987', '1989', '1991', '1993'], answer: 1 },
      { q: 'Wie viele Bundesländer hat Deutschland?', options: ['12', '14', '16', '18'], answer: 2 }
    ]
  },
  {
    title: 'Mathematik',
    questions: [
      { q: 'Was ist 15 + 27?', options: ['40', '42', '44', '46'], answer: 1 },
      { q: 'Was ist 8 × 7?', options: ['54', '56', '58', '60'], answer: 1 },
      { q: 'Was ist 100 ÷ 4?', options: ['20', '25', '30', '35'], answer: 1 },
      { q: 'Was ist die Quadratwurzel von 144?', options: ['10', '11', '12', '13'], answer: 2 },
      { q: 'Was ist 15% von 200?', options: ['25', '30', '35', '40'], answer: 1 }
    ]
  },
  {
    title: 'Geographie',
    questions: [
      { q: 'Welches ist das größte Land der Welt?', options: ['Kanada', 'China', 'USA', 'Russland'], answer: 3 },
      { q: 'Wie heißt die Hauptstadt von Spanien?', options: ['Barcelona', 'Madrid', 'Sevilla', 'Valencia'], answer: 1 },
      { q: 'Welcher ist der längste Fluss der Welt?', options: ['Nil', 'Amazonas', 'Jangtse', 'Mississippi'], answer: 0 },
      { q: 'Auf welchem Kontinent liegt Ägypten?', options: ['Asien', 'Afrika', 'Europa', 'Naher Osten'], answer: 1 }
    ]
  },
  {
    title: 'Tiere',
    questions: [
      { q: 'Welches ist das schnellste Landtier?', options: ['Löwe', 'Gepard', 'Antilope', 'Windhund'], answer: 1 },
      { q: 'Wie viele Beine hat eine Spinne?', options: ['6', '8', '10', '12'], answer: 1 },
      { q: 'Welches Tier ist das größte Säugetier?', options: ['Elefant', 'Blauwal', 'Giraffe', 'Nilpferd'], answer: 1 },
      { q: 'Was fressen Pandas hauptsächlich?', options: ['Fleisch', 'Bambus', 'Fisch', 'Früchte'], answer: 1 }
    ]
  }
];

// Quiz-Liste rendern
function renderQuizList() {
  const list = qs('#quiz-list');
  list.innerHTML = '';
  
  quizzes.forEach((quiz, index) => {
    const card = document.createElement('div');
    card.className = 'quiz-card';
    card.style.cursor = 'pointer';
    card.innerHTML = `
      <div>
        <div class="quiz-title">${escapeHtml(quiz.title)}</div>
        <div class="muted">${quiz.questions.length} Fragen</div>
      </div>
      <button class="btn" style="margin:0">Start ▶</button>
    `;
    card.addEventListener('click', () => startQuiz(quiz));
    list.appendChild(card);
  });
}

// Quiz starten
function startQuiz(quiz) {
  showView('spielen');
  const area = qs('#play-area');
  let currentQuestion = 0;
  let score = 0;
  let selectedAnswer = null;

  function renderQuestion() {
    const question = quiz.questions[currentQuestion];
    selectedAnswer = null;
    
    area.innerHTML = `
      <div class="quiz-card">
        <div>
          <div class="quiz-title">${escapeHtml(quiz.title)} – Frage ${currentQuestion + 1}/${quiz.questions.length}</div>
          <div class="muted" style="margin-top:8px; font-size:1.1rem;">${escapeHtml(question.q)}</div>
        </div>
      </div>
      <div id="options"></div>
      <button id="next-btn" class="btn" style="display:none; margin-top:16px">Weiter →</button>
    `;
    
    const optionsEl = qs('#options');
    question.options.forEach((option, index) => {
      const button = document.createElement('button');
      button.className = 'option';
      button.textContent = option;
      button.addEventListener('click', () => selectAnswer(index, button));
      optionsEl.appendChild(button);
    });
  }

  function selectAnswer(answerIndex, buttonEl) {
    if (selectedAnswer !== null) return; // Bereits beantwortet
    
    selectedAnswer = answerIndex;
    const question = quiz.questions[currentQuestion];
    const isCorrect = answerIndex === question.answer;
    
    if (isCorrect) {
      score++;
      buttonEl.style.background = '#22c55e';
      buttonEl.style.color = '#fff';
    } else {
      buttonEl.style.background = '#ef4444';
      buttonEl.style.color = '#fff';
      // Zeige auch die richtige Antwort
      const allOptions = qsAll('#options .option');
      allOptions[question.answer].style.background = '#22c55e';
      allOptions[question.answer].style.color = '#fff';
    }
    
    // Alle Buttons deaktivieren
    qsAll('#options .option').forEach(btn => {
      btn.style.pointerEvents = 'none';
      btn.style.opacity = '0.7';
    });
    
    // Weiter-Button anzeigen
    const nextBtn = qs('#next-btn');
    nextBtn.style.display = 'inline-block';
    nextBtn.addEventListener('click', nextQuestion);
  }

  function nextQuestion() {
    currentQuestion++;
    if (currentQuestion < quiz.questions.length) {
      renderQuestion();
    } else {
      showResult();
    }
  }

  function showResult() {
    const percentage = Math.round((score / quiz.questions.length) * 100);
    let message = '';
    
    if (percentage === 100) {
      message = '🎉 Perfekt! Du hast alle Fragen richtig beantwortet!';
    } else if (percentage >= 80) {
      message = '👏 Sehr gut gemacht!';
    } else if (percentage >= 60) {
      message = '👍 Gut gemacht!';
    } else if (percentage >= 40) {
      message = '💪 Nicht schlecht, aber da geht noch mehr!';
    } else {
      message = '📚 Übung macht den Meister!';
    }
    
    area.innerHTML = `
      <div class="panel" style="text-align:center;">
        <div class="score" style="font-size:2rem; margin-bottom:10px;">
          ${score} / ${quiz.questions.length}
        </div>
        <div style="font-size:1.2rem; margin-bottom:8px;">${percentage}%</div>
        <p class="muted" style="margin:16px 0;">${message}</p>
        <div style="margin-top:20px; display:flex; gap:10px; justify-content:center;">
          <button id="retry" class="btn">🔄 Nochmal</button>
          <button id="to-quizzes" class="back">📝 Zu den Quizzes</button>
        </div>
      </div>
    `;
    
    qs('#retry').addEventListener('click', () => {
      currentQuestion = 0;
      score = 0;
      renderQuestion();
    });
    
    qs('#to-quizzes').addEventListener('click', () => {
      renderQuizList();
      showView('quizzes');
    });
  }

  renderQuestion();
}

// Event Listeners für Dashboard
qs('#btn-spielen').addEventListener('click', () => {
  showView('spielen');
});

qs('#btn-quizzes').addEventListener('click', () => {
  renderQuizList();
  showView('quizzes');
});

qs('#btn-random').addEventListener('click', () => {
  const randomQuiz = quizzes[Math.floor(Math.random() * quizzes.length)];
  startQuiz(randomQuiz);
});

// Zurück-Buttons
qsAll('.back').forEach(button => {
  button.addEventListener('click', () => {
    showView('dashboard');
  });
});

// Für Entwicklung
window.__QUIZZES = quizzes;
