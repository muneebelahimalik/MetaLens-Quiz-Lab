let currentQuizId = null;
let currentSessionId = null;
let liveSessionInterval = null;

// Show create quiz modal
function showCreateQuiz() {
  document.getElementById('createQuizModal').style.display = 'block';
  document.getElementById('questionsSection').style.display = 'none';
}

function hideCreateQuiz() {
  document.getElementById('createQuizModal').style.display = 'none';
  document.getElementById('quizForm').reset();
  currentQuizId = null;
}

// Create quiz
document.getElementById('quizForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const title = document.getElementById('quizTitle').value;
  const description = document.getElementById('quizDescription').value;
  try {
    const response = await fetch('/api/quizzes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, description }),
    });
    const data = await response.json();
    currentQuizId = data.id;
    document.getElementById('quizForm').style.display = 'none';
    document.getElementById('questionsSection').style.display = 'block';
  } catch (error) {
    alert('Error creating quiz: ' + error.message);
  }
});

// Add question to quiz
document.getElementById('questionForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const questionData = {
    text: document.getElementById('questionText').value,
    option_a: document.getElementById('optionA').value,
    option_b: document.getElementById('optionB').value,
    option_c: document.getElementById('optionC').value,
    option_d: document.getElementById('optionD').value || null,
    correct_option: document.getElementById('correctOption').value,
    explanation: document.getElementById('explanation').value || null,
    topic_tag: document.getElementById('topicTag').value || null,
  };
  try {
    await fetch(`/api/quizzes/${currentQuizId}/questions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(questionData),
    });
    document.getElementById('questionForm').reset();
    const questionsList = document.getElementById('questionsList');
    const div = document.createElement('div');
    div.style.cssText = 'padding: 10px; background: #f7fafc; margin: 10px 0; border-radius: 8px;';
    div.textContent = `✓ Added: ${questionData.text.substring(0, 60)}...`;
    questionsList.appendChild(div);
  } catch (error) {
    alert('Error adding question: ' + error.message);
  }
});

function finishQuiz() {
  alert('Quiz created successfully!');
  hideCreateQuiz();
}

// Show start session modal
function showStartSession() {
  document.getElementById('startSessionModal').style.display = 'block';
  loadQuizzesForSession();
}

function hideStartSession() {
  document.getElementById('startSessionModal').style.display = 'none';
}

// Load quizzes for session creation
async function loadQuizzesForSession() {
  try {
    const response = await fetch('/api/quizzes');
    const quizzes = await response.json();
    const select = document.getElementById('sessionQuiz');
    select.innerHTML = '<option value="">Select a quiz...</option>' + quizzes.map((q) => `<option value="${q.id}">${q.title}</option>`).join('');
  } catch (error) {
    console.error('Error loading quizzes:', error);
  }
}

// Create session
document.getElementById('sessionForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const quizId = document.getElementById('sessionQuiz').value;
  const mode = document.getElementById('sessionMode').value;
  try {
    const response = await fetch('/api/sessions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ quiz_id: quizId, mode }),
    });
    const data = await response.json();
    currentSessionId = data.id;
    hideStartSession();
    if (mode === 'live') {
      showLiveControl(data.room_code);
    } else {
      alert(`Solo practice session created! Room code: ${data.room_code}`);
    }
  } catch (error) {
    alert('Error creating session: ' + error.message);
  }
});

// Show live control panel
function showLiveControl(roomCode) {
  document.getElementById('liveControl').style.display = 'block';
  document.getElementById('liveRoomCode').textContent = roomCode;
  liveSessionInterval = setInterval(updateLiveStats, 2000);
  updateLiveStats();
}

// Update participant count for live session
async function updateLiveStats() {
  try {
    const response = await fetch(`/api/sessions/${currentSessionId}/participants`);
    const participants = await response.json();
    document.getElementById('participantCount').textContent = participants.length;
  } catch (error) {
    console.error('Error updating stats:', error);
  }
}

// Start quiz in live mode
document.getElementById('startQuizBtn').addEventListener('click', async () => {
  try {
    await fetch(`/api/sessions/${currentSessionId}/start`, { method: 'POST' });
    document.getElementById('startQuizBtn').style.display = 'none';
    document.getElementById('nextQuestionBtn').style.display = 'inline-block';
    alert('Quiz started!');
  } catch (error) {
    alert('Error starting quiz: ' + error.message);
  }
});

// Advance to next question in live mode
document.getElementById('nextQuestionBtn').addEventListener('click', async () => {
  try {
    await fetch(`/api/sessions/${currentSessionId}/next`, { method: 'POST' });
    alert('Advanced to next question');
  } catch (error) {
    alert('Error: ' + error.message);
  }
});

// End live session
function endSession() {
  if (confirm('Are you sure you want to end this session?')) {
    clearInterval(liveSessionInterval);
    document.getElementById('liveControl').style.display = 'none';
    alert('Session ended. View analytics to see results.');
  }
}

// Show analytics modal
function showAnalytics() {
  document.getElementById('analyticsModal').style.display = 'block';
  loadSessionsForAnalytics();
}

function hideAnalytics() {
  document.getElementById('analyticsModal').style.display = 'none';
}

// Load sessions for analytics – this example shows quiz list; extend to real sessions if needed
async function loadSessionsForAnalytics() {
  try {
    const response = await fetch('/api/sessions');
    const sessions = await response.json();
    const select = document.getElementById('analyticsSession');
    // Build option elements describing each session
    const options = sessions
      .map((s) => {
        const title = s.quiz_title || `Session ${s.id}`;
        const mode = s.mode;
        const status = s.status;
        const participants = s.participant_count || 0;
        return `<option value="${s.id}">${title} | ${mode} | ${status} | ${participants} players</option>`;
      })
      .join('');
    select.innerHTML = '<option value="">Select session...</option>' + options;
  } catch (error) {
    console.error('Error loading sessions:', error);
  }
}

// Load analytics data and display
async function loadAnalytics() {
  const sessionId = document.getElementById('analyticsSession').value;
  if (!sessionId) return;
  try {
    const [summaryRes, leaderboardRes] = await Promise.all([
      fetch(`/api/sessions/${sessionId}/summary`),
      fetch(`/api/sessions/${sessionId}/leaderboard`),
    ]);
    const summary = await summaryRes.json();
    const leaderboard = await leaderboardRes.json();
    let html = '<h3>Leaderboard</h3>';
    html += '<table style="width: 100%; margin-bottom: 30px;"><thead><tr><th>Student</th><th>Score</th><th>Correct</th><th>Total</th></tr></thead><tbody>';
    leaderboard.forEach((p) => {
      html += `<tr>
        <td>${p.user_name}${p.team_name ? ` (${p.team_name})` : ''}</td>
        <td>${p.score || 0}</td>
        <td>${p.total_correct || 0}</td>
        <td>${p.total_questions || 0}</td>
      </tr>`;
    });
    html += '</tbody></table>';
    html += '<h3>Participant Stats</h3>';
    html += '<table style="width: 100%;"><thead><tr><th>Student</th><th>Answered</th><th>Correct</th><th>Avg Confidence</th><th>Overconfident</th></tr></thead><tbody>';
    summary.participants.forEach((p) => {
      html += `<tr>
        <td>${p.user_name}</td>
        <td>${p.total_answered || 0}</td>
        <td>${p.total_correct || 0}</td>
        <td>${p.avg_confidence ? p.avg_confidence.toFixed(1) : 'N/A'}</td>
        <td style="color: ${p.overconfident_count > 0 ? '#f56565' : '#48bb78'}">${p.overconfident_count || 0}</td>
      </tr>`;
    });
    html += '</tbody></table>';
    html += `<div style="margin-top: 20px; text-align: center;">
      <a href="/api/sessions/${sessionId}/export" class="btn btn-accent">Download CSV</a>
    </div>`;
    document.getElementById('analyticsContent').innerHTML = html;
  } catch (error) {
    alert('Error loading analytics: ' + error.message);
  }
}