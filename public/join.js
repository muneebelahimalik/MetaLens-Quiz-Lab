document.getElementById('joinBtn').addEventListener('click', async () => {
  const errorEl = document.getElementById('error');
  errorEl.textContent = '';
  const roomCode = document.getElementById('roomCode').value.trim().toUpperCase();
  const userName = document.getElementById('userName').value.trim();
  const teamName = document.getElementById('teamName').value.trim();
  if (!roomCode || !userName) {
    errorEl.textContent = 'Room code and name are required.';
    return;
  }
  try {
    const res = await fetch(`/api/sessions/${roomCode}/join`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_name: userName, team_name: teamName || null }),
    });
    const data = await res.json();
    if (!res.ok) {
      errorEl.textContent = data.error || 'Failed to join session.';
      return;
    }
    // Save to localStorage for subsequent pages
    localStorage.setItem('sessionId', data.session_id);
    localStorage.setItem('participantId', data.participant_id);
    localStorage.setItem('isSoloMode', 'false');
    localStorage.setItem('roomCode', roomCode);
    // After joining, check session status. If waiting, show waiting room.
    try {
      const stateRes = await fetch(`/api/sessions/${data.session_id}/state`);
      const stateData = await stateRes.json();
      if (stateData.status && stateData.status === 'waiting') {
        window.location.href = 'waiting.html';
      } else {
        window.location.href = 'question.html';
      }
    } catch (e) {
      // If error, just go to question page
      window.location.href = 'question.html';
    }
  } catch (err) {
    errorEl.textContent = 'Network error.';
  }
});