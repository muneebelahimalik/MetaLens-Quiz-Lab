# Complete Deployment Guide for MetaLens Quiz Lab

## Step-by-Step Setup Instructions

### Prerequisites
- Computer with Windows, Mac, or Linux
- Internet connection
- Text editor (VS Code, Sublime Text, or Notepad++)

---

## Part 1: Install Node.js

### Windows:
1. Go to https://nodejs.org/
2. Download the "LTS" version (left button)
3. Run the installer
4. Click "Next" through all prompts (keep defaults)
5. Click "Finish"

### Mac:
1. Go to https://nodejs.org/
2. Download the "LTS" version
3. Open the downloaded .pkg file
4. Follow installation prompts

### Linux (Ubuntu/Debian):
```bash
curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -
sudo apt-get install -y nodejs
```

### Verify Installation:
Open terminal/command prompt and type:
```bash
node --version
npm --version
```
You should see version numbers.

---

## Part 2: Create Project Structure

### 1. Create Main Folder
```bash
mkdir metalens-quiz-lab
cd metalens-quiz-lab
```

### 2. Create Public Folder
```bash
mkdir public
```

### 3. Your folder structure should look like:
```
metalens-quiz-lab/
├── server.js
├── package.json
└── public/
    ├── index.html
    ├── join.html
    ├── solo.html
    ├── waiting.html
    ├── question.html
    ├── instructor.html
    ├── styles.css
    ├── join.js
    ├── solo.js
    ├── waiting.js
    ├── question.js
    └── instructor.js
```

---

## Part 3: Copy All Files

### Root Directory Files (in metalens-quiz-lab/)

#### 1. Create `package.json`
```json
{
  "name": "metalens-quiz-lab",
  "version": "1.0.0",
  "description": "Metacognitive quiz game for education research",
  "main": "server.js",
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js"
  },
  "keywords": ["quiz", "education", "metacognition"],
  "author": "",
  "license": "MIT",
  "dependencies": {
    "express": "^4.18.2",
    "sqlite3": "^5.1.6",
    "body-parser": "^1.20.2"
  },
  "devDependencies": {
    "nodemon": "^3.0.1"
  }
}
```

#### 2. Copy `server.js` from artifacts (the backend code)

### Public Directory Files (in metalens-quiz-lab/public/)

Copy these files from the artifacts I created:

#### HTML Files:
1. `index.html` - Home page
2. `join.html` - Join session page
3. `solo.html` - Solo practice page
4. `waiting.html` - Waiting room
5. `question.html` - Quiz interface
6. `instructor.html` - Instructor dashboard

#### CSS Files:
1. `styles.css` - All styling

#### JavaScript Files:
1. `join.js` - Join logic
2. `solo.js` - Solo practice logic
3. `waiting.js` - Waiting room logic
4. `question.js` - Quiz game logic
5. `instructor.js` - Instructor dashboard logic

---

## Part 4: Install Dependencies

Open terminal in the `metalens-quiz-lab` folder and run:

```bash
npm install
```

This will download all required packages. You'll see a `node_modules` folder appear (this is normal).

---

## Part 5: Start the Server

```bash
npm start
```

You should see:
```
Connected to SQLite database
MetaLens Quiz Lab running on http://localhost:3000
```

---

## Part 6: Access the Application

Open your web browser and go to:
```
http://localhost:3000
```

You should see the MetaLens Quiz Lab home page!

---

## Complete File Checklist

### Root Directory (metalens-quiz-lab/)
- [ ] package.json
- [ ] server.js
- [ ] node_modules/ (created automatically)
- [ ] metalens.db (created automatically on first run)

### Public Directory (metalens-quiz-lab/public/)
- [ ] index.html
- [ ] join.html
- [ ] solo.html
- [ ] waiting.html
- [ ] question.html
- [ ] instructor.html
- [ ] styles.css
- [ ] join.js
- [ ] solo.js
- [ ] waiting.js
- [ ] question.js
- [ ] instructor.js

---

## Testing the Installation

### Test 1: Create a Quiz (Instructor)
1. Go to http://localhost:3000
2. Click "Instructor"
3. Click "New Quiz"
4. Create a quiz with at least 2 questions
5. Click "Finish Quiz"

### Test 2: Start Live Session
1. Click "Launch Session"
2. Select your quiz
3. Choose "Live" mode
4. Click "Start Session"
5. You'll see a room code (e.g., "AB23F")

### Test 3: Join as Student
1. Open a new browser tab or incognito window
2. Go to http://localhost:3000
3. Click "Join Session"
4. Enter the room code
5. Enter a name
6. Click "Join Session"

### Test 4: Run the Quiz
1. Back in instructor tab, click "Start Quiz"
2. In student tab, you should see the first question
3. Answer with confidence and strategy
4. Click "Submit Answer"
5. See feedback
6. Instructor: click "Next Question"
7. Student should see next question

### Test 5: Solo Practice
1. Go to http://localhost:3000
2. Click "Solo Practice"
3. Select a quiz
4. Enter your name
5. Take the quiz at your own pace

---

## Troubleshooting

### Problem: "npm: command not found"
**Solution:** Node.js not installed properly. Reinstall Node.js.

### Problem: "Cannot find module 'express'"
**Solution:** Run `npm install` in the project folder.

### Problem: "Port 3000 already in use"
**Solution:** 
- Close other applications using port 3000
- Or change port in `server.js`:
```javascript
const PORT = 3001; // Change to different number
```

### Problem: "Cannot GET /"
**Solution:** Make sure all files are in the `public` folder, not root.

### Problem: Students can't join session
**Solutions:**
- Check that room code is typed correctly (case-sensitive)
- Make sure instructor clicked "Start Session"
- Verify server is still running

### Problem: Questions not showing
**Solutions:**
- Make sure quiz has questions added
- Check browser console for errors (F12)
- Verify instructor clicked "Start Quiz"

### Problem: Database errors
**Solution:** Delete `metalens.db` file and restart server.

---

## Running on Network (Multiple Computers)

To allow students on other computers to access:

### 1. Find Your IP Address

**Windows:**
```bash
ipconfig
```
Look for "IPv4 Address" (e.g., 192.168.1.100)

**Mac/Linux:**
```bash
ifconfig
```
or
```bash
ip addr show
```

### 2. Update server.js
Change:
```javascript
app.listen(PORT, () => {
```
To:
```javascript
app.listen(PORT, '0.0.0.0', () => {
```

### 3. Students Access Via:
```
http://YOUR_IP_ADDRESS:3000
```
Example: `http://192.168.1.100:3000`

### 4. Firewall Rules
You may need to allow port 3000 through your firewall.

---

## Stopping the Server

Press `Ctrl+C` in the terminal where server is running.

---

## Backing Up Data

Your quiz data is stored in `metalens.db`. To backup:

1. Stop the server (Ctrl+C)
2. Copy `metalens.db` to safe location
3. To restore: Copy it back and restart server

---

## Production Deployment (Optional)

For deploying to the internet, see main README.md file.

Quick options:
- **Heroku** (free tier available)
- **Render** (free tier available)
- **DigitalOcean** ($5/month)
- **Railway** (free tier available)

---

## Getting Help

If you encounter issues:

1. Check the terminal for error messages
2. Check browser console (F12 → Console tab)
3. Verify all files are in correct locations
4. Make sure Node.js version is 14 or higher
5. Try deleting `node_modules` and running `npm install` again

---

## Next Steps

Once installed:
1. Create your first quiz
2. Test with live session
3. Try solo practice mode
4. Explore analytics dashboard
5. Export data as CSV

Enjoy using MetaLens Quiz Lab! 🎯