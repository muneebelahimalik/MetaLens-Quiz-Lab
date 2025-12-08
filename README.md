# MetaLens Quiz Lab

A browser-based quiz game for educational research that captures student confidence, strategy use, and metacognitive awareness.

## Features

- **Multiple choice quizzes** with explanations
- **Confidence ratings** (1-5 scale) for each answer
- **Strategy tracking** (how students got their answer)
- **Live classroom mode** with room codes
- **Solo practice mode** for self-paced learning
- **Instructor dashboard** with analytics
- **Overconfidence detection** to identify misconceptions
- **CSV export** for research analysis

## Quick Start

### Installation

1. **Install Node.js** (if not already installed)
   - Download from https://nodejs.org/ (LTS version recommended)

2. **Create project folder structure:**
```bash
mkdir metalens-quiz-lab
cd metalens-quiz-lab
```

3. **Create the following files** (copy the code from artifacts):
   - `server.js` (backend)
   - `package.json`
   - Create a `public` folder with:
     - `index.html`
     - `join.html`
     - `waiting.html`
     - `question.html`
     - `instructor.html`
     - `styles.css`
     - `join.js`
     - `waiting.js`
     - `question.js`
     - `instructor.js`

4. **Install dependencies:**
```bash
npm install
```

5. **Start the server:**
```bash
npm start
```

6. **Open your browser:**
   - Go to `http://localhost:3000`

## Project Structure

```
metalens-quiz-lab/
├── server.js           # Backend API
├── package.json        # Dependencies
├── metalens.db         # SQLite database (auto-created)
└── public/             # Frontend files
    ├── index.html      # Home page
    ├── join.html       # Join session page
    ├── waiting.html    # Waiting room
    ├── question.html   # Quiz interface
    ├── instructor.html # Instructor dashboard
    ├── styles.css      # Styling
    ├── join.js
    ├── waiting.js
    ├── question.js
    └── instructor.js
```

## Usage Guide

### For Instructors

1. **Create a Quiz:**
   - Go to Instructor Dashboard
   - Click "New Quiz"
   - Enter title and description
   - Add questions with options and explanations
   - Mark the correct answer
   - Optional: Add topic tags for analytics

2. **Start a Session:**
   - Click "Launch Session"
   - Select your quiz
   - Choose mode:
     - **Live**: You control when to show each question
     - **Solo**: Students work at their own pace
   - Share the room code with students

3. **Run Live Session:**
   - Display room code for students to join
   - Click "Start Quiz" when ready
   - Click "Next Question" to advance
   - Monitor participant count and responses

4. **View Analytics:**
   - Click "View Data"
   - Select a session
   - See:
     - Student scores and rankings
     - Overconfidence patterns
     - Question difficulty
     - Strategy usage
   - Download CSV for detailed analysis

### For Students

1. **Join a Session:**
   - Click "Join Session" on home page
   - Enter room code from instructor
   - Enter your name
   - Optional: Enter team name

2. **Answer Questions:**
   - Read the question carefully
   - Select your answer (A, B, C, or D)
   - Rate your confidence (1 = guessing, 5 = very sure)
   - Select how you got the answer (strategy)
   - Click "Submit Answer"

3. **Get Feedback:**
   - See if you were correct
   - Read the explanation
   - Learn about your metacognitive patterns
   - Wait for next question (live mode) or continue (solo)

4. **View Summary:**
   - See your total score
   - Identify overconfident mistakes
   - Find topics to review

## Research Data

The system tracks:
- **Correctness**: Right or wrong
- **Confidence**: 1-5 scale
- **Strategy**: How the answer was obtained
- **Response time**: Time taken to answer
- **Overconfidence**: Wrong answers with high confidence

### Strategy Options
- "Remembered formula"
- "Applied concept"
- "Guessed"
- "Saw similar example"
- "Used notes/homework"

### Export Data
Analytics page includes CSV download with all response data for analysis in R, Python, Excel, etc.

## API Endpoints

### Quizzes
- `POST /api/quizzes` - Create quiz
- `GET /api/quizzes` - List all quizzes
- `POST /api/quizzes/:quizId/questions` - Add question
- `GET /api/quizzes/:quizId/questions` - Get questions

### Sessions
- `POST /api/sessions` - Create session
- `POST /api/sessions/:sessionId/start` - Start session
- `POST /api/sessions/:sessionId/next` - Next question
- `GET /api/sessions/:sessionId/state` - Get current state
- `POST /api/sessions/:roomCode/join` - Join session

### Responses
- `POST /api/responses` - Submit answer

### Analytics
- `GET /api/sessions/:sessionId/summary` - Detailed stats
- `GET /api/sessions/:sessionId/leaderboard` - Rankings
- `GET /api/sessions/:sessionId/export` - Download CSV

## Database Schema

### Tables
- `users` - User accounts (optional)
- `quizzes` - Quiz metadata
- `questions` - Questions and options
- `sessions` - Active quiz sessions
- `participants` - Students who joined
- `responses` - All answer data

## Customization

### Modify Scoring
Edit `server.js` line with score calculation:
```javascript
score_delta: is_correct ? 10 * confidence : 0
```

### Add Strategy Options
Edit `question.html` strategy buttons section

### Change Styling
Modify `styles.css` colors and layouts

### Add Authentication
Implement login system in `server.js`

## Production Deployment

### For Production Use:

1. **Use PostgreSQL or MySQL** instead of SQLite:
```javascript
// Replace SQLite with PostgreSQL
const { Pool } = require('pg');
const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});
```

2. **Add authentication:**
   - Implement proper login system
   - Use sessions or JWT tokens
   - Hash passwords with bcrypt

3. **Enable HTTPS**

4. **Set environment variables:**
```bash
export PORT=3000
export DATABASE_URL=postgresql://...
```

5. **Deploy to cloud:**
   - Heroku
   - DigitalOcean
   - AWS
   - Render

## Troubleshooting

**Database errors:**
- Delete `metalens.db` and restart to recreate tables

**Port already in use:**
- Change PORT in `server.js` (default: 3000)

**Students can't join:**
- Check firewall settings
- Ensure server is accessible on network
- Verify room code is correct (case-sensitive)

**Questions not advancing:**
- Instructor must click "Next Question" in live mode
- Check browser console for errors

## Support

For issues or questions, check:
- Browser console (F12) for JavaScript errors
- Server logs in terminal
- Database contents using SQLite viewer

## License

MIT License - Free to use and modify

## Credits

Built for educational research on metacognition and confidence calibration.