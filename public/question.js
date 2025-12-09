// question.js
// Handles rendering questions, submitting answers, showing feedback and summary

// Retrieve session and participant info from localStorage
const sessionId = localStorage.getItem('sessionId');
const participantId = localStorage.getItem('participantId');
const isSoloMode = localStorage.getItem('isSoloMode') === 'true';

// DOM elements
const questionView = document.getElementById('questionView');
const feedbackView = document.getElementById('feedbackView');
const summaryView = document.getElementById('summaryView');
const progressBar = document.getElementById('progressBar');
const timerEl = document.getElementById('timer');

const questionTextEl = document.getElementById('questionText');
const optionsContainer = document.getElementById('options');
const confidenceSlider = document.getElementById('confidenceSlider');
const confidenceValueEl = document.getElementById('confidenceValue');
const strategyButtons = document.querySelectorAll('#strategyButtons .strategy-btn');
const submitBtn = document.getElementById('submitBtn');

const feedbackIcon = document.getElementById('feedbackIcon');
const feedbackTitle = document.getElementById('feedbackTitle');
const feedbackMessage = document.getElementById('feedbackMessage');
const explanationEl = document.getElementById('explanation');
const nextBtn = document.getElementById('nextBtn');
const summaryContent = document.getElementById('summaryContent');

// State variables
let sessionInfo = null;
let totalQuestions = 0;
let currentQuestion = null;
let currentIndex = 0;
let selectedOption = null;
let selectedStrategy = null;
let timerInterval = null;
let elapsedMs = 0;

// Initialization
if (!sessionId || !participantId) {
  // Redirect to join page if session or participant is missing
  window.location.href = 'join.html';
} else {
  // Initialize UI and fetch session info
  init();
}

async function init() {
  // Reset state
  resetState();
  // Load session info and total questions
  await loadSessionInfo();
  // Load first question
  await loadQuestion();
  // Attach event listeners
  confidenceSlider.addEventListener('input', () => {
    confidenceValueEl.textContent = confidenceSlider.value;
    updateSubmitDisabled();
  });
  strategyButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      strategyButtons.forEach((b) => b.classList.remove('selected'));
      btn.classList.add('selected');
      selectedStrategy = btn.getAttribute('data-strategy');
      updateSubmitDisabled();
    });
  });
  submitBtn.addEventListener('click', submitAnswer);
  nextBtn.addEventListener('click', onNextClick);
}

function resetState() {
  selectedOption = null;
  selectedStrategy = null;
  elapsedMs = 0;
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }
}

async function loadSessionInfo() {
  // Fetch session state to determine quiz_id and current index
  const res = await fetch(`/api/sessions/${sessionId}/state`);
  if (!res.ok) {
    console.error('Failed to fetch session info');
    return;
  }
  sessionInfo = await res.json();
  // Fetch questions for the quiz to know total count
  const qres = await fetch(`/api/quizzes/${sessionInfo.quiz_id}/questions`);
  if (!qres.ok) {
    console.error('Failed to fetch quiz questions');
    return;
  }
  const questions = await qres.json();
  totalQuestions = questions.length;
}

async function loadQuestion() {
  // Hide feedback view and summary view, show question view
  feedbackView.style.display = 'none';
  summaryView.style.display = 'none';
  questionView.style.display = 'block';
  // Reset state for new question
  resetState();
  updateSubmitDisabled();
  // Fetch current question from server
  const res = await fetch(`/api/sessions/${sessionId}/current-question`);
  if (!res.ok) {
    console.error('Failed to fetch current question');
    return;
  }
  const data = await res.json();
  // If session is finished or no question returned, show summary
  if (data.status === 'finished' || !data.question) {
    showSummary();
    return;
  }
  currentQuestion = data.question;
  currentIndex = data.index || 0;
  // Display question text
  questionTextEl.textContent = currentQuestion.text;
  // Render options
  optionsContainer.innerHTML = '';
  const options = [];
  if (currentQuestion.option_a) options.push({ key: 'A', text: currentQuestion.option_a });
  if (currentQuestion.option_b) options.push({ key: 'B', text: currentQuestion.option_b });
  if (currentQuestion.option_c) options.push({ key: 'C', text: currentQuestion.option_c });
  if (currentQuestion.option_d) options.push({ key: 'D', text: currentQuestion.option_d });
  options.forEach((opt) => {
    const div = document.createElement('div');
    div.className = 'option';
    div.textContent = `${opt.key}. ${opt.text}`;
    div.setAttribute('data-key', opt.key);
    div.addEventListener('click', () => {
      document.querySelectorAll('.option').forEach((el) => el.classList.remove('selected'));
      div.classList.add('selected');
      selectedOption = opt.key;
      updateSubmitDisabled();
    });
    optionsContainer.appendChild(div);
  });
  // Reset slider and strategy selection
  confidenceSlider.value = 3;
  confidenceValueEl.textContent = '3';
  selectedStrategy = null;
  strategyButtons.forEach((b) => b.classList.remove('selected'));
  // Update progress bar
  if (totalQuestions > 0) {
    const progress = (currentIndex / totalQuestions) * 100;
    progressBar.style.width = `${progress}%`;
  }
  // Start timer
  startTimer();
}

function startTimer() {
  if (timerInterval) clearInterval(timerInterval);
  elapsedMs = 0;
  timerEl.textContent = 'Time: 0s';
  timerInterval = setInterval(() => {
    elapsedMs += 1000;
    timerEl.textContent = `Time: ${Math.floor(elapsedMs / 1000)}s`;
  }, 1000);
}

function updateSubmitDisabled() {
  // Only enable submit when option, confidence, and strategy selected
  submitBtn.disabled = !(selectedOption && selectedStrategy && confidenceSlider.value);
}

async function submitAnswer() {
  // Stop timer
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }
  // Prepare payload
  const payload = {
    session_id: Number(sessionId),
    participant_id: Number(participantId),
    question_id: currentQuestion.id,
    selected_option: selectedOption,
    confidence: Number(confidenceSlider.value),
    strategy_tag: selectedStrategy,
    response_time_ms: elapsedMs,
  };
  try {
    const res = await fetch('/api/responses', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    // Show feedback
    showFeedback(data);
  } catch (error) {
    console.error('Failed to submit response', error);
  }
}

function showFeedback(data) {
  // Hide question view, show feedback view
  questionView.style.display = 'none';
  feedbackView.style.display = 'block';
  feedbackIcon.textContent = data.is_correct ? '✅' : '❌';
  feedbackTitle.textContent = data.is_correct ? 'Correct!' : 'Incorrect';
  feedbackMessage.textContent = `Correct answer: ${data.correct_option}`;
  // Explanation if available
  if (data.explanation) {
    explanationEl.style.display = 'block';
    explanationEl.textContent = data.explanation;
  } else {
    explanationEl.style.display = 'none';
  }
  // Additional message for overconfidence or other cases
  const conf = Number(confidenceSlider.value);
  let confMsg = '';
  if (!data.is_correct && conf >= 4) {
    confMsg = 'You were very confident but incorrect. This may indicate a hidden misconception.';
  } else if (!data.is_correct && conf <= 2) {
    confMsg = 'You were unsure and incorrect. This suggests this concept needs more practice.';
  } else if (data.is_correct && conf <= 2) {
    confMsg = 'You were unsure but correct. You might understand more than you think.';
  }
  feedbackMessage.textContent += confMsg ? `\n${confMsg}` : '';
}

async function onNextClick() {
  // For solo mode, advance the session question index
  if (isSoloMode) {
    try {
      await fetch(`/api/sessions/${sessionId}/next`, { method: 'POST' });
    } catch (err) {
      console.error('Failed to advance session', err);
    }
  } else {
    // In live mode, the instructor will advance the question.
    // We'll poll for new question after clicking next.
  }
  // After next, load the new question or summary
  await loadQuestion();
}

async function showSummary() {
  // Hide other views, show summary view
  questionView.style.display = 'none';
  feedbackView.style.display = 'none';
  summaryView.style.display = 'block';
  summaryContent.innerHTML = '<h3>Quiz Complete</h3><p>Fetching your results…</p>';
  try {
    const res = await fetch(`/api/sessions/${sessionId}/summary`);
    if (!res.ok) throw new Error('Failed to fetch summary');
    const data = await res.json();
    // Find participant summary
    const participantData = data.participants.find(
      (p) => p.user_name === localStorage.getItem('user_name') || p.id === Number(participantId)
    );
    let html = '<h3>Your Summary</h3>';
    if (participantData) {
      const total = participantData.total_answered || participantData.total || 0;
      const correct = participantData.total_correct || participantData.correct || 0;
      const avgConf = participantData.avg_confidence != null ? participantData.avg_confidence : 0;
      const overconf = participantData.overconfident_count || participantData.overconfident_errors || 0;
      html += `<p>Total Questions Answered: ${total}</p>`;
      html += `<p>Correct Answers: ${correct}</p>`;
      html += `<p>Average Confidence: ${avgConf.toFixed(2)}</p>`;
      html += `<p>Overconfident Errors: ${overconf}</p>`;
    }
    // Optionally, list challenging questions (wrong answers with high confidence)
    const challenging = [];
    data.questions.forEach((q) => {
      if (q.wrong_high_conf && q.wrong_high_conf > 0) {
        challenging.push(
          `<li>${q.text} (${q.topic_tag || 'topic'}) – Wrong high confidence: ${q.wrong_high_conf}</li>`
        );
      }
    });
    if (challenging.length > 0) {
      html += '<h4>Questions to Review:</h4><ul>' + challenging.join('') + '</ul>';
    }
    summaryContent.innerHTML = html;
  } catch (err) {
    console.error(err);
    summaryContent.innerHTML = '<p>Error fetching summary.</p>';
  }
}