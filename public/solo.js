// Load available quizzes
async function loadQuizzes() {
  try {
    const response = await fetch('/api/quizzes');
    const quizzes = await response.json();
    
    const quizzesList = document.getElementById('quizzesList');
    const noQuizzes = document.getElementById('noQuizzes');
    
    if (quizzes.length === 0) {
      noQuizzes.style.display = 'block';
      return;
    }
    
    quizzesList.innerHTML = quizzes.map(quiz => `
      <div class="card" style="margin-bottom: 15px; cursor: pointer; transition: all 0.3s;" 
           onclick="startSoloQuiz(${quiz.id}, '${quiz.title}')">
        <h3 style="margin-bottom: 10px;">${quiz.title}</h3>
        <p style="color: #666; margin-bottom: 15px;">${quiz.description || 'No description'}</p>
        <button class="btn btn-primary" style="pointer-events: none;">Start Practice</button>
      </div>
    `).join('');
    
  } catch (error) {
    console.error('Error loading quizzes:', error);
    document.getElementById('quizzesList').innerHTML = 
      '<p style="color: #f56565; text-align: center;">Error loading quizzes. Please try again.</p>';
  }
}

async function startSoloQuiz(quizId, quizTitle) {
  try {
    // Create a solo session
    const response = await fetch('/api/sessions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        quiz_id: quizId, 
        mode: 'solo' 
      })
    });
    
    const sessionData = await response.json();
    
    // Prompt for name
    const userName = prompt('Enter your name for this practice session:');
    if (!userName) return;
    
    // Join the session
    const joinResponse = await fetch(`/api/sessions/${sessionData.room_code}/join`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        user_name: userName, 
        team_name: null 
      })
    });
    
    const joinData = await joinResponse.json();
    
    // Store session info
    localStorage.setItem('participantId', joinData.participant_id);
    localStorage.setItem('sessionId', joinData.session_id);
    localStorage.setItem('userName', userName);
    localStorage.setItem('roomCode', sessionData.room_code);
    localStorage.setItem('isSoloMode', 'true');
    
    // Auto-start the session
    await fetch(`/api/sessions/${joinData.session_id}/start`, {
      method: 'POST'
    });
    
    // Redirect to question page
    window.location.href = 'question.html';
    
  } catch (error) {
    alert('Error starting solo practice: ' + error.message);
  }
}

// Load quizzes on page load
loadQuizzes();