// solo.js

// Load available quizzes on page load
document.addEventListener('DOMContentLoaded', loadQuizzes);

async function loadQuizzes() {
  const listEl = document.getElementById('quizzesList');
  const noQuizzesEl = document.getElementById('noQuizzes');

  if (!listEl) {
    console.error('quizzesList element not found in solo.html');
    return;
  }

  try {
    const response = await fetch('/api/quizzes');
    if (!response.ok) {
      throw new Error('Failed to load quizzes');
    }

    const quizzes = await response.json();

    if (!Array.isArray(quizzes) || quizzes.length === 0) {
      // No quizzes available
      listEl.innerHTML = '';
      if (noQuizzesEl) {
        noQuizzesEl.style.display = 'block';
      } else {
        listEl.innerHTML =
          '<p style="text-align:center;color:#666;">No quizzes available yet. Ask your instructor to create one.</p>';
      }
      return;
    }

    if (noQuizzesEl) {
      noQuizzesEl.style.display = 'none';
    }

    listEl.innerHTML = quizzes
      .map(
        (q) => `
        <div class="card" style="margin-bottom:15px; cursor:pointer;">
          <h3 style="margin-bottom:8px;">${q.title}</h3>
          <p style="margin-bottom:12px;color:#666;">${q.description || 'No description'}</p>
          <button class="btn btn-primary" type="button" onclick="startSolo(${q.id})">
            Start Practice
          </button>
        </div>
      `
      )
      .join('');
  } catch (error) {
    console.error('Error loading quizzes:', error);
    listEl.innerHTML =
      '<p style="color:#e53e3e;text-align:center;">Error loading quizzes. Please try again.</p>';
  }
}

async function startSolo(quizId) {
  const errorEl = document.getElementById('soloError');
  if (errorEl) errorEl.textContent = '';

  // Try to get name from input; if not present (old solo.html), fall back to prompt
  let nameInput = document.getElementById('soloName');
  let userName = nameInput ? nameInput.value.trim() : '';

  if (!userName) {
    userName = window.prompt('Enter your name for this practice session:') || '';
    userName = userName.trim();
  }

  if (!userName) {
    if (errorEl) {
      errorEl.textContent = 'Please enter your name.';
    }
    return;
  }

  try {
    // 1) Create a solo session
    const sessionRes = await fetch('/api/sessions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ quiz_id: quizId, mode: 'solo' })
    });
    const sessionData = await sessionRes.json();

    if (!sessionRes.ok) {
      const msg = sessionData && sessionData.error ? sessionData.error : 'Failed to create session.';
      if (errorEl) errorEl.textContent = msg;
      else alert(msg);
      return;
    }

    // 2) Join the session using room_code
    const joinRes = await fetch(`/api/sessions/${sessionData.room_code}/join`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user_name: userName,
        team_name: null
      })
    });
    const joinData = await joinRes.json();

    if (!joinRes.ok) {
      const msg = joinData && joinData.error ? joinData.error : 'Failed to join session.';
      if (errorEl) errorEl.textContent = msg;
      else alert(msg);
      return;
    }

    // 3) Start the session so questions load correctly
    try {
      await fetch(`/api/sessions/${joinData.session_id}/start`, {
        method: 'POST'
      });
    } catch (e) {
      console.warn('Could not auto-start solo session', e);
    }

    // 4) Store info for question.html
    localStorage.setItem('sessionId', String(joinData.session_id));
    localStorage.setItem('participantId', String(joinData.participant_id));
    localStorage.setItem('roomCode', sessionData.room_code);
    localStorage.setItem('user_name', userName);
    localStorage.setItem('isSoloMode', 'true');

    // 5) Go to questions
    window.location.href = 'question.html';
  } catch (err) {
    console.error('Error starting solo practice:', err);
    const msg = 'Network error starting solo practice.';
    if (errorEl) errorEl.textContent = msg;
    else alert(msg);
  }
}
