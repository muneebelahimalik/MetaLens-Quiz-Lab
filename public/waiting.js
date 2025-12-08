// waiting.js
// Simple waiting room logic. Poll the session status until the instructor starts the quiz.

document.addEventListener('DOMContentLoaded', () => {
  const sessionId = localStorage.getItem('sessionId');
  // If there's no session, redirect back to join page.
  if (!sessionId) {
    window.location.href = 'join.html';
    return;
  }
  // Update message periodically.
  const statusEl = document.getElementById('statusMessage');
  const countEl = document.getElementById('participantCount');

  async function pollStatus() {
    try {
      // Get the current session state
      const res = await fetch(`/api/sessions/${sessionId}/state`);
      if (!res.ok) {
        throw new Error('Failed to fetch session state');
      }
      const data = await res.json();
      if (data.status === 'in_progress') {
        // Session started! redirect to the question page.
        window.location.href = 'question.html';
        return;
      }
      // Optionally display number of participants (not provided directly by state).
      // You could implement an endpoint to fetch participants if desired.
      // For now, we leave this blank.
    } catch (err) {
      console.error(err);
      statusEl.textContent = 'Error connecting to server. Retrying…';
    }
    // Poll again after 2 seconds
    setTimeout(pollStatus, 2000);
  }

  // Kick off polling
  pollStatus();
});