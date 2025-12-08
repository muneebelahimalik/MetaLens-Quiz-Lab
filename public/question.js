const sessionId = localStorage.getItem('sessionId');
const participantId = localStorage.getItem('participantId');

if (!sessionId || !participantId) {
  window.location.href = 'join.html';
}

let currentQuestion = null;
let selectedOption = null;
let selectedStrategy = null;
let startTime = Date.now();
let timerInterval;
let totalQuestions = 0;
let currentIndex = 0;
let allResponses = [];

// Timer
function startTimer() {
  startTime = Date.now();
  timerInterval = setInterval(() => {
    const elapsed = Math.floor((Date.now() - startTime) / 1000);
    const minutes = Math.floor(elapsed / 60);
    const seconds = elapsed % 60;
    document.getElementById('timer').textContent = 
      `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }, 1000);
}

function stopTimer() {
  clearInterval(timerInterval);
  return Date.now() - startTime;
}

// Confidence slider
document.getElementById('confidenceSlider').addEventListener('input', (e) => {
  document.getElementById('confidenceValue').textContent = e.target.value;
  checkSubmitEnabled();
});

// Options selection
function renderOptions(question) {
  const optionsDiv = document.getElementById('options');
  optionsDiv.innerHTML = '';
  
  const options = ['A', 'B', 'C', 'D'].filter(opt => question[`option_${opt.toLowerCase()}`]);
  
  options.forEach(opt => {
    const optDiv = document.createElement('div');
    optDiv.className = 'option';
    optDiv.textContent = `${opt}. ${question[`option_${opt.toLowerCase()}`]}`;
    optDiv.onclick = () => selectOption(opt, optDiv);
    optionsDiv.appendChild(optDiv);
  });
}

function selectOption(option, element) {
  document.querySelectorAll('.option').forEach(el => el.classList.remove('selected'));
  element.classList.add('selected');
  selectedOption = option;
  checkSubmitEnabled();
}

// Strategy selection
document.querySelectorAll('.strategy-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.strategy-btn').forEach(b => b.classList.remove('selected'));
    btn.classList.add('selected');
    selectedStrategy = btn.dataset.strategy;
    checkSubmitEnabled();
  });
});

function checkSubmitEnabled() {
  const submitBtn = document.getElementById('submitBtn');
  submitBtn.disabled = !(selectedOption && selectedStrategy);
}

// Load question
async function loadQuestion() {
  try {
    const response = await fetch(`/api/sessions/${sessionId}/current-question`);
    const data = await response.json();
    
    if (data.status === 'finished' || !data.question) {
      showSummary();
      return;
    }
    
    currentQuestion = data.question;
    currentIndex = data.index;
    totalQuestions = data.total;
    
    // Update progress
    const progress = ((currentIndex + 1) / totalQuestions) * 100;
    document.getElementById('progressBar').style.width = `${progress}%`;
    
    // Render question
    document.getElementById('questionText').textContent = 
      `Question ${currentIndex + 1} of ${totalQuestions}: ${currentQuestion.text}`;
    renderOptions(currentQuestion);
    
    // Reset selections
    selectedOption = null;
    selectedStrategy = null;
    document.getElementById('confidenceSlider').value = 3;
    document.getElementById('confidenceValue').textContent = '3';
    document.querySelectorAll('.strategy-btn').forEach(b => b.classList.remove('selected'));
    checkSubmitEnabled();
    
    // Start timer
    startTimer();
    
  } catch (error) {
    console.error('Error loading question:', error);
  }
}

// Submit answer
document.getElementById('submitBtn').addEventListener('click', async () => {
  const responseTime = stopTimer();
  const confidence = parseInt(document.getElementById('confidenceSlider').value);
  
  try {
    const response = await fetch('/api/responses', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        session_id: parseInt(sessionId),
        participant_id: parseInt(participantId),
        question_id: currentQuestion.id,
        selected_option: selectedOption,
        confidence: confidence,
        strategy_tag: selectedStrategy,
        response_time_ms: responseTime
      })
    });
    
    const result = await response.json();
    allResponses.push({
      question: currentQuestion.text,
      selected: selectedOption,
      correct: result.correct_option,
      is_correct: result.is_correct,
      confidence: confidence,
      strategy: selectedStrategy
    });
    
    showFeedback(result, confidence);
    
  } catch (error) {
    console.error('Error submitting response:', error);
  }
});

// Show feedback
function showFeedback(result, confidence) {
  document.getElementById('questionView').style.display = 'none';
  const feedbackView = document.getElementById('feedbackView');
  feedbackView.style.display = 'block';
  
  if (result.is_correct) {
    feedbackView.className = 'question-card feedback correct';
    document.getElementById('feedbackIcon').textContent = '✅';
    document.getElementById('feedbackTitle').textContent = 'Correct!';
    
    if (confidence >= 4) {
      document.getElementById('feedbackMessage').textContent = 
        `Great job! You were confident and got it right. +${result.score_delta} points`;
    } else {
      document.getElementById('feedbackMessage').textContent = 
        `You got it right but weren't very confident. Review this topic to build confidence. +${result.score_delta} points`;
    }
  } else {
    feedbackView.className = 'question-card feedback incorrect';
    document.getElementById('feedbackIcon').textContent = '❌';
    document.getElementById('feedbackTitle').textContent = 'Incorrect';
    
    if (confidence >= 4) {
      document.getElementById('feedbackMessage').textContent = 
        `You were very confident but got it wrong. This may indicate a misconception. The correct answer was ${result.correct_option}.`;
    } else {
      document.getElementById('feedbackMessage').textContent = 
        `You weren't sure and got it wrong. The correct answer was ${result.correct_option}.`;
    }
  }
  
  if (result.explanation) {
    document.getElementById('explanation').style.display = 'block';
    document.getElementById('explanation').innerHTML = 
      `<strong>Explanation:</strong><br>${result.explanation}`;
  }
}

// Next question
document.getElementById('nextBtn').addEventListener('click', () => {
  document.getElementById('feedbackView').style.display = 'none';
  document.getElementById('questionView').style.display = 'block';
  pollForNextQuestion();
});

async function pollForNextQuestion() {
  const pollInterval = setInterval(async () => {
    const response = await fetch(`/api/sessions/${sessionId}/current-question`);
    const data = await response.json();
    
    if (data.status === 'finished') {
      clearInterval(pollInterval);
      showSummary();
    } else if (data.index > currentIndex) {
      clearInterval(pollInterval);
      loadQuestion();
    }
  }, 2000);
  
  // Also load immediately in case already advanced
  setTimeout(loadQuestion, 100);
}

// Show summary
function showSummary() {
  document.getElementById('questionView').style.display = 'none';
  document.getElementById('feedbackView').style.display = 'none';
  document.getElementById('summaryView').style.display = 'block';
  
  const correct = allResponses.filter(r => r.is_correct).length;
  const total = allResponses.length;
  const percentage = Math.round((correct / total) * 100);
  
  const overconfident = allResponses.filter(r => !r.is_correct && r.confidence >= 4);
  const underconfident = allResponses.filter(r => r.is_correct && r.confidence <= 2);
  
  let html = `
    <div style="text-align: center; font-size: 1.5em; margin-bottom: 30px;">
      <div style="font-size: 3em; color: #667eea; margin-bottom: 10px;">${percentage}%</div>
      <div>Score: ${correct} / ${total} correct</div>
    </div>
  `;
  
  if (overconfident.length > 0) {
    html += `
      <div style="background: #fff5f5; padding: 20px; border-radius: 8px; margin-bottom: 20px; border-left: 4px solid #f56565;">
        <h3 style="color: #c53030; margin-bottom: 10px;">⚠️ Overconfidence Detected</h3>
        <p style="margin-bottom: 10px;">You were very confident but incorrect on these questions:</p>
        <ul style="margin-left: 20px;">
          ${overconfident.map(r => `<li>${r.question.substring(0, 60)}...</li>`).join('')}
        </ul>
        <p style="margin-top: 10px; font-style: italic;">This might indicate misconceptions worth reviewing.</p>
      </div>
    `;
  }
  
  if (underconfident.length > 0) {
    html += `
      <div style="background: #f0fff4; padding: 20px; border-radius: 8px; margin-bottom: 20px; border-left: 4px solid #48bb78;">
        <h3 style="color: #2f855a; margin-bottom: 10px;">💪 Build Your Confidence</h3>
        <p style="margin-bottom: 10px;">You got these right but weren't confident:</p>
        <ul style="margin-left: 20px;">
          ${underconfident.map(r => `<li>${r.question.substring(0, 60)}...</li>`).join('')}
        </ul>
        <p style="margin-top: 10px; font-style: italic;">You know more than you think! Review to build confidence.</p>
      </div>
    `;
  }
  
  document.getElementById('summaryContent').innerHTML = html;
}

// Start
loadQuestion();