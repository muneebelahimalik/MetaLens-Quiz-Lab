// Load available quizzes on page load
document.addEventListener('DOMContentLoaded', loadQuizzes);

async function loadQuizzes() {
  const listEl = document.getElementById('quizzesList');
  try {
    const response = await fetch('/api/quizzes');
    const quizzes = await response.json();
    if (quizzes.length === 0) {
      listEl.innerHTML = '<p>No quizzes available. Ask your instructor to create one.</p>';
      return;
    }
    const html = quizzes
      .map(
        (q) => `
        <div class="card" style="margin-bottom: 15px; text-align: left;">
          <h3>${q.title}</h3>
          <p>${q.description || ''}</p>
          <button class="btn btn-accent" onclick="startSolo(${q.id})">Start Practice</button>
        </div>
      `
      )
      .join('');
    listEl.innerHTML = html;
  } catch (error) {
    listEl.innerHTML = '<p>Error loading quizzes.</p>';
    console.error(error);
  }
}

async function startSolo(quizId) {
  const errorEl = document.getElementById('soloError');
  errorEl.textContent = '';
  const name = document.getElementById('soloName').value.trim();
  if (!name) {
    errorEl.textContent = 'Please enter your name.';
    return;
  }
  try {
    // Create a solo session
    const sessionRes = await fetch('/api/sessions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ quiz_id: quizId, mode: 'solo' }),
    });
    const sessionData = await sessionRes.json();
    if (!sessionRes.ok) {
      errorEl.textContent = sessionData.error || 'Failed to create session.';
      return;
    }
    // Join the solo session
    const joinRes = await fetch(`/api/sessions/${sessionData.room_code}/join`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_name: name, team_name: null }),
    });
    const joinData = await joinRes.json();
    if (!joinRes.ok) {
      errorEl.textContent = joinData.error || 'Failed to join session.';
      return;
    }
    // Start the session immediately for solo mode so questions load properly
    try {
      await fetch(`/api/sessions/${sessionData.id}/start`, { method: 'POST' });
    } catch (e) {
      console.warn('Failed to automatically start solo session', e);
    }
    // Store session and participant info so question page can identify the user and session
    localStorage.setItem('sessionId', String(sessionData.id));
    localStorage.setItem('participantId', String(joinData.participant_id));
    localStorage.setItem('user_name', name);
    localStorage.setItem('roomCode', sessionData.room_code);
    localStorage.setItem('isSoloMode', 'true');
    // Redirect to the quiz page
    window.location.href = 'question.html';
  } catch (err) {
    errorEl.textContent = 'Network error.';
  }
}