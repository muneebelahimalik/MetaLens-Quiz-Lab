# Complete File Contents Reference

This document maps each artifact to its corresponding file in your project.

---

## Root Directory Files

### 📄 `package.json`
**Artifact:** "MetaLens Quiz Lab - Package Configuration (package.json)"
**Location:** `metalens-quiz-lab/package.json`

### 📄 `server.js`
**Artifact:** "MetaLens Quiz Lab - Complete Backend (server.js)"
**Location:** `metalens-quiz-lab/server.js`
**Note:** This is your Node.js backend server

---

## Public Directory Files (metalens-quiz-lab/public/)

### HTML Files

#### 📄 `index.html`
**Artifact:** "MetaLens Quiz Lab - Home Page (public/index.html)"
**Location:** `metalens-quiz-lab/public/index.html`
**Purpose:** Main landing page with 3 options

#### 📄 `join.html`
**Artifact:** "MetaLens Quiz Lab - Join Session (public/join.html)"
**Location:** `metalens-quiz-lab/public/join.html`
**Purpose:** Students enter room code to join

#### 📄 `solo.html`
**Artifact:** "MetaLens Quiz Lab - Solo Practice (public/solo.html)"
**Location:** `metalens-quiz-lab/public/solo.html`
**Purpose:** Students select quiz for solo practice

#### 📄 `waiting.html`
**Artifact:** "MetaLens Quiz Lab - Waiting Room (public/waiting.html)"
**Location:** `metalens-quiz-lab/public/waiting.html`
**Purpose:** Students wait for instructor to start session

#### 📄 `question.html`
**Artifact:** "MetaLens Quiz Lab - Question Page (public/question.html)"
**Location:** `metalens-quiz-lab/public/question.html`
**Purpose:** Main quiz interface where students answer questions

#### 📄 `instructor.html`
**Artifact:** "MetaLens Quiz Lab - Instructor Dashboard (public/instructor.html)"
**Location:** `metalens-quiz-lab/public/instructor.html`
**Purpose:** Instructor creates quizzes and manages sessions

---

### CSS Files

#### 📄 `styles.css`
**Artifact:** "MetaLens Quiz Lab - Styles (public/styles.css)"
**Location:** `metalens-quiz-lab/public/styles.css`
**Purpose:** All styling for the entire application

---

### JavaScript Files

#### 📄 `join.js`
**Artifact:** "MetaLens Quiz Lab - Join Logic (public/join.js)"
**Location:** `metalens-quiz-lab/public/join.js`
**Purpose:** Handles joining sessions with room codes

#### 📄 `solo.js`
**Artifact:** "MetaLens Quiz Lab - Solo Practice Logic (public/solo.js)"
**Location:** `metalens-quiz-lab/public/solo.js`
**Purpose:** Loads quizzes and starts solo practice sessions

#### 📄 `waiting.js`
**Artifact:** "MetaLens Quiz Lab - Waiting Room Logic (public/waiting.js)"
**Location:** `metalens-quiz-lab/public/waiting.js`
**Purpose:** Polls for session start, shows participants

#### 📄 `question.js`
**Artifact:** "MetaLens Quiz Lab - Question Logic (public/question.js)"
**Location:** `metalens-quiz-lab/public/question.js`
**Purpose:** Main quiz game logic, handles questions, answers, feedback

#### 📄 `instructor.js`
**Artifact:** "MetaLens Quiz Lab - Instructor Logic (public/instructor.js)"
**Location:** `metalens-quiz-lab/public/instructor.js`
**Purpose:** Quiz creation, session management, analytics

---

## Quick Copy-Paste Guide

### Step 1: Create Folders
```bash
mkdir metalens-quiz-lab
cd metalens-quiz-lab
mkdir public
```

### Step 2: Copy Files in This Order

1. **Copy `package.json`** to root
2. **Copy `server.js`** to root
3. **Run `npm install`** to install dependencies
4. **Copy all HTML files** to `public/` folder:
   - index.html
   - join.html
   - solo.html
   - waiting.html
   - question.html
   - instructor.html
5. **Copy `styles.css`** to `public/` folder
6. **Copy all JavaScript files** to `public/` folder:
   - join.js
   - solo.js
   - waiting.js
   - question.js
   - instructor.js

### Step 3: Verify Structure
Your folder should look like this:
```
metalens-quiz-lab/
├── package.json              ← From artifact
├── server.js                 ← From artifact
├── node_modules/             ← Created by npm install
└── public/
    ├── index.html            ← From artifact
    ├── join.html             ← From artifact
    ├── solo.html             ← From artifact
    ├── waiting.html          ← From artifact
    ├── question.html         ← From artifact
    ├── instructor.html       ← From artifact
    ├── styles.css            ← From artifact
    ├── join.js               ← From artifact
    ├── solo.js               ← From artifact
    ├── waiting.js            ← From artifact
    ├── question.js           ← From artifact
    └── instructor.js         ← From artifact
```

### Step 4: Start Server
```bash
npm start
```

### Step 5: Open Browser
```
http://localhost:3000
```

---

## Artifact-to-File Mapping Table

| Artifact Name | File Path | File Type |
|--------------|-----------|-----------|
| MetaLens Quiz Lab - Complete Backend (server.js) | `server.js` | JavaScript |
| MetaLens Quiz Lab - Package Configuration (package.json) | `package.json` | JSON |
| MetaLens Quiz Lab - Home Page (public/index.html) | `public/index.html` | HTML |
| MetaLens Quiz Lab - Join Session (public/join.html) | `public/join.html` | HTML |
| MetaLens Quiz Lab - Solo Practice (public/solo.html) | `public/solo.html` | HTML |
| MetaLens Quiz Lab - Waiting Room (public/waiting.html) | `public/waiting.html` | HTML |
| MetaLens Quiz Lab - Question Page (public/question.html) | `public/question.html` | HTML |
| MetaLens Quiz Lab - Instructor Dashboard (public/instructor.html) | `public/instructor.html` | HTML |
| MetaLens Quiz Lab - Styles (public/styles.css) | `public/styles.css` | CSS |
| MetaLens Quiz Lab - Join Logic (public/join.js) | `public/join.js` | JavaScript |
| MetaLens Quiz Lab - Solo Practice Logic (public/solo.js) | `public/solo.js` | JavaScript |
| MetaLens Quiz Lab - Waiting Room Logic (public/waiting.js) | `public/waiting.js` | JavaScript |
| MetaLens Quiz Lab - Question Logic (public/question.js) | `public/question.js` | JavaScript |
| MetaLens Quiz Lab - Instructor Logic (public/instructor.js) | `public/instructor.js` | JavaScript |

---

## Files Created Automatically

These files are created automatically when you run the application:

- `metalens.db` - SQLite database (created on first server start)
- `node_modules/` - Dependencies folder (created by `npm install`)
- `package-lock.json` - Dependency lock file (created by `npm install`)

**Do not manually create these files!**

---

## What Each File Does

### Backend
- **server.js**: REST API, database operations, session management
- **package.json**: Lists dependencies and scripts

### Frontend Pages
- **index.html**: Home page with 3 main options
- **join.html**: Form to join live sessions
- **solo.html**: List of quizzes for solo practice
- **waiting.html**: Waiting room before quiz starts
- **question.html**: Main quiz interface
- **instructor.html**: Dashboard for instructors

### Frontend Logic
- **join.js**: Join session functionality
- **solo.js**: Solo practice functionality
- **waiting.js**: Waiting room polling
- **question.js**: Quiz game engine
- **instructor.js**: Quiz creation and analytics

### Styling
- **styles.css**: All visual styling

---

## Common Mistakes to Avoid

❌ **Don't put HTML files in root directory**  
✅ They must be in `public/` folder

❌ **Don't rename files**  
✅ Use exact names as listed

❌ **Don't skip `npm install`**  
✅ Must run before starting server

❌ **Don't edit `node_modules/`**  
✅ This is managed automatically

❌ **Don't create `metalens.db` manually**  
✅ It's created automatically

---

## Checklist Before Starting

- [ ] All HTML files in `public/` folder
- [ ] All JS files in `public/` folder
- [ ] All CSS files in `public/` folder
- [ ] `server.js` in root folder
- [ ] `package.json` in root folder
- [ ] Ran `npm install` successfully
- [ ] No errors in terminal
- [ ] Port 3000 is available

If all checked, run `npm start` and you're ready to go! 🚀