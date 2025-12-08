const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');
const path = require('path');
const crypto = require('crypto');

const app = express();
const PORT = 3000;

// Middleware
app.use(bodyParser.json());
app.use(express.static('public'));

// Serve HTML files explicitly (fallback routes)
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('*.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', req.path));
});

// Initialize SQLite database
const db = new sqlite3.Database('./metalens.db', (err) => {
  if (err) console.error('Database error:', err);
  else console.log('Connected to SQLite database');
});

// Create tables
db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    role TEXT DEFAULT 'student',
    email TEXT,
    password_hash TEXT
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS quizzes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT,
    created_by INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS questions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    quiz_id INTEGER NOT NULL,
    text TEXT NOT NULL,
    option_a TEXT NOT NULL,
    option_b TEXT NOT NULL,
    option_c TEXT NOT NULL,
    option_d TEXT,
    correct_option TEXT NOT NULL,
    explanation TEXT,
    topic_tag TEXT,
    FOREIGN KEY (quiz_id) REFERENCES quizzes(id)
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS sessions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    quiz_id INTEGER NOT NULL,
    room_code TEXT UNIQUE NOT NULL,
    mode TEXT DEFAULT 'live',
    status TEXT DEFAULT 'waiting',
    current_question_index INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (quiz_id) REFERENCES quizzes(id)
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS participants (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    session_id INTEGER NOT NULL,
    user_name TEXT NOT NULL,
    team_name TEXT,
    joined_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (session_id) REFERENCES sessions(id)
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS responses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    session_id INTEGER NOT NULL,
    participant_id INTEGER NOT NULL,
    question_id INTEGER NOT NULL,
    selected_option TEXT NOT NULL,
    is_correct INTEGER NOT NULL,
    confidence INTEGER NOT NULL,
    strategy_tag TEXT NOT NULL,
    response_time_ms INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (session_id) REFERENCES sessions(id),
    FOREIGN KEY (participant_id) REFERENCES participants(id),
    FOREIGN KEY (question_id) REFERENCES questions(id)
  )`);
});

// Helper: Generate room code
function generateRoomCode() {
  return crypto.randomBytes(3).toString('hex').toUpperCase().substring(0, 5);
}

// === API ROUTES ===

// Create quiz
app.post('/api/quizzes', (req, res) => {
  const { title, description } = req.body;
  db.run(
    'INSERT INTO quizzes (title, description) VALUES (?, ?)',
    [title, description],
    function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ id: this.lastID });
    }
  );
});

// Get all quizzes
app.get('/api/quizzes', (req, res) => {
  db.all('SELECT * FROM quizzes ORDER BY created_at DESC', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// Add question to quiz
app.post('/api/quizzes/:quizId/questions', (req, res) => {
  const { quizId } = req.params;
  const { text, option_a, option_b, option_c, option_d, correct_option, explanation, topic_tag } = req.body;
  
  db.run(
    `INSERT INTO questions (quiz_id, text, option_a, option_b, option_c, option_d, correct_option, explanation, topic_tag)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [quizId, text, option_a, option_b, option_c, option_d, correct_option, explanation, topic_tag],
    function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ id: this.lastID });
    }
  );
});

// Get questions for a quiz
app.get('/api/quizzes/:quizId/questions', (req, res) => {
  const { quizId } = req.params;
  db.all('SELECT * FROM questions WHERE quiz_id = ?', [quizId], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// Create session
app.post('/api/sessions', (req, res) => {
  const { quiz_id, mode } = req.body;
  const room_code = generateRoomCode();
  
  db.run(
    'INSERT INTO sessions (quiz_id, room_code, mode) VALUES (?, ?, ?)',
    [quiz_id, room_code, mode || 'live'],
    function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ id: this.lastID, room_code });
    }
  );
});

// Start session
app.post('/api/sessions/:sessionId/start', (req, res) => {
  const { sessionId } = req.params;
  db.run(
    "UPDATE sessions SET status = 'in_progress', current_question_index = 0 WHERE id = ?",
    [sessionId],
    (err) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ success: true });
    }
  );
});

// Next question
app.post('/api/sessions/:sessionId/next', (req, res) => {
  const { sessionId } = req.params;
  db.run(
    'UPDATE sessions SET current_question_index = current_question_index + 1 WHERE id = ?',
    [sessionId],
    (err) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ success: true });
    }
  );
});

// Get session state
app.get('/api/sessions/:sessionId/state', (req, res) => {
  const { sessionId } = req.params;
  db.get(
    `SELECT s.*, q.title as quiz_title, 
     (SELECT COUNT(*) FROM questions WHERE quiz_id = s.quiz_id) as total_questions
     FROM sessions s
     JOIN quizzes q ON s.quiz_id = q.quiz_id
     WHERE s.id = ?`,
    [sessionId],
    (err, row) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(row);
    }
  );
});

// Join session
app.post('/api/sessions/:roomCode/join', (req, res) => {
  const { roomCode } = req.params;
  const { user_name, team_name } = req.body;
  
  db.get('SELECT id FROM sessions WHERE room_code = ?', [roomCode], (err, session) => {
    if (err || !session) return res.status(404).json({ error: 'Session not found' });
    
    db.run(
      'INSERT INTO participants (session_id, user_name, team_name) VALUES (?, ?, ?)',
      [session.id, user_name, team_name],
      function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ participant_id: this.lastID, session_id: session.id });
      }
    );
  });
});

// Get participants
app.get('/api/sessions/:sessionId/participants', (req, res) => {
  const { sessionId } = req.params;
  db.all('SELECT * FROM participants WHERE session_id = ?', [sessionId], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// Get current question
app.get('/api/sessions/:sessionId/current-question', (req, res) => {
  const { sessionId } = req.params;
  
  db.get('SELECT quiz_id, current_question_index, status FROM sessions WHERE id = ?', [sessionId], (err, session) => {
    if (err || !session) return res.status(404).json({ error: 'Session not found' });
    
    if (session.status !== 'in_progress') {
      return res.json({ status: session.status, question: null });
    }
    
    db.all('SELECT * FROM questions WHERE quiz_id = ? ORDER BY id', [session.quiz_id], (err, questions) => {
      if (err) return res.status(500).json({ error: err.message });
      
      const question = questions[session.current_question_index];
      if (!question) {
        return res.json({ status: 'finished', question: null });
      }
      
      // Don't send correct answer to frontend
      const { correct_option, explanation, ...safeQuestion } = question;
      res.json({ 
        status: 'in_progress',
        question: safeQuestion,
        index: session.current_question_index,
        total: questions.length
      });
    });
  });
});

// Submit response
app.post('/api/responses', (req, res) => {
  const { session_id, participant_id, question_id, selected_option, confidence, strategy_tag, response_time_ms } = req.body;
  
  db.get('SELECT correct_option, explanation FROM questions WHERE id = ?', [question_id], (err, question) => {
    if (err || !question) return res.status(404).json({ error: 'Question not found' });
    
    const is_correct = selected_option === question.correct_option ? 1 : 0;
    
    db.run(
      `INSERT INTO responses (session_id, participant_id, question_id, selected_option, is_correct, confidence, strategy_tag, response_time_ms)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [session_id, participant_id, question_id, selected_option, is_correct, confidence, strategy_tag, response_time_ms],
      function(err) {
        if (err) return res.status(500).json({ error: err.message });
        
        res.json({
          is_correct: is_correct === 1,
          correct_option: question.correct_option,
          explanation: question.explanation,
          score_delta: is_correct ? 10 * confidence : 0
        });
      }
    );
  });
});

// Get session summary
app.get('/api/sessions/:sessionId/summary', (req, res) => {
  const { sessionId } = req.params;
  
  // Get per-participant stats
  db.all(
    `SELECT 
      p.id, p.user_name, p.team_name,
      COUNT(r.id) as total_answered,
      SUM(r.is_correct) as total_correct,
      AVG(r.confidence) as avg_confidence,
      SUM(CASE WHEN r.is_correct = 0 AND r.confidence >= 4 THEN 1 ELSE 0 END) as overconfident_count
     FROM participants p
     LEFT JOIN responses r ON p.id = r.participant_id
     WHERE p.session_id = ?
     GROUP BY p.id`,
    [sessionId],
    (err, participants) => {
      if (err) return res.status(500).json({ error: err.message });
      
      // Get per-question stats
      db.all(
        `SELECT 
          q.id, q.text, q.topic_tag,
          COUNT(r.id) as response_count,
          AVG(r.is_correct) as pct_correct,
          AVG(r.confidence) as avg_confidence,
          r.selected_option,
          COUNT(*) as option_count
         FROM questions q
         JOIN sessions s ON q.quiz_id = s.quiz_id
         LEFT JOIN responses r ON q.id = r.question_id AND r.session_id = s.id
         WHERE s.id = ?
         GROUP BY q.id, r.selected_option`,
        [sessionId],
        (err, questions) => {
          if (err) return res.status(500).json({ error: err.message });
          res.json({ participants, questions });
        }
      );
    }
  );
});

// Get leaderboard
app.get('/api/sessions/:sessionId/leaderboard', (req, res) => {
  const { sessionId } = req.params;
  
  db.all(
    `SELECT 
      p.user_name, p.team_name,
      COUNT(r.id) as total_questions,
      SUM(r.is_correct) as total_correct,
      SUM(r.is_correct * r.confidence * 10) as score
     FROM participants p
     LEFT JOIN responses r ON p.id = r.participant_id
     WHERE p.session_id = ?
     GROUP BY p.id
     ORDER BY score DESC`,
    [sessionId],
    (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(rows);
    }
  );
});

// Export CSV
app.get('/api/sessions/:sessionId/export', (req, res) => {
  const { sessionId } = req.params;
  
  db.all(
    `SELECT 
      p.user_name, p.team_name,
      q.text as question, q.topic_tag,
      r.selected_option, r.is_correct, r.confidence, r.strategy_tag, r.response_time_ms,
      r.created_at
     FROM responses r
     JOIN participants p ON r.participant_id = p.id
     JOIN questions q ON r.question_id = q.id
     WHERE r.session_id = ?
     ORDER BY r.created_at`,
    [sessionId],
    (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      
      // Convert to CSV
      const headers = Object.keys(rows[0] || {});
      const csv = [
        headers.join(','),
        ...rows.map(row => headers.map(h => JSON.stringify(row[h])).join(','))
      ].join('\n');
      
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename=session_${sessionId}_export.csv`);
      res.send(csv);
    }
  );
});

// Start server
app.listen(PORT, () => {
  console.log(`MetaLens Quiz Lab running on http://localhost:${PORT}`);
});