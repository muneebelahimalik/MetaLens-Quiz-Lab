# Sample Quiz for Testing

Use this sample quiz data to quickly test the system after installation.

---

## Sample Quiz: Basic Physics

**Title:** Introduction to Physics  
**Description:** Test your understanding of fundamental physics concepts

---

### Question 1: Newton's First Law

**Question:** What does Newton's First Law state?

**Options:**
- A: An object at rest stays at rest unless acted upon by a force
- B: Force equals mass times acceleration
- C: For every action there is an equal and opposite reaction
- D: Energy cannot be created or destroyed

**Correct Answer:** A

**Explanation:** Newton's First Law (Law of Inertia) states that an object at rest will remain at rest, and an object in motion will remain in motion at constant velocity, unless acted upon by an external force.

**Topic Tag:** Newton's Laws

---

### Question 2: Speed of Light

**Question:** What is the approximate speed of light in vacuum?

**Options:**
- A: 300 meters per second
- B: 3,000 kilometers per second
- C: 300,000 kilometers per second
- D: 3,000,000 kilometers per second

**Correct Answer:** C

**Explanation:** The speed of light in vacuum is approximately 299,792 kilometers per second, commonly rounded to 300,000 km/s or 3×10⁸ m/s.

**Topic Tag:** Constants

---

### Question 3: Kinetic Energy

**Question:** The kinetic energy of an object depends on which factors?

**Options:**
- A: Only its mass
- B: Only its velocity
- C: Both mass and velocity
- D: Neither mass nor velocity

**Correct Answer:** C

**Explanation:** Kinetic energy is given by KE = ½mv², which shows it depends on both the mass (m) and the square of velocity (v) of the object.

**Topic Tag:** Energy

---

### Question 4: Electrical Resistance

**Question:** According to Ohm's Law, if voltage increases and resistance stays constant, what happens to current?

**Options:**
- A: Current increases
- B: Current decreases
- C: Current stays the same
- D: Current becomes zero

**Correct Answer:** A

**Explanation:** Ohm's Law states V = IR. If voltage (V) increases and resistance (R) remains constant, current (I) must increase proportionally.

**Topic Tag:** Electricity

---

### Question 5: Gravity

**Question:** Two objects of different masses are dropped from the same height in a vacuum. Which hits the ground first?

**Options:**
- A: The heavier object
- B: The lighter object
- C: They hit at the same time
- D: It depends on their shape

**Correct Answer:** C

**Explanation:** In a vacuum (no air resistance), all objects fall at the same rate regardless of mass, as demonstrated by Galileo. The acceleration due to gravity is the same for all objects.

**Topic Tag:** Gravity

---

## How to Enter This Quiz

### Method 1: Via Instructor Dashboard (Recommended)

1. Go to http://localhost:3000
2. Click "Instructor"
3. Click "New Quiz"
4. Enter:
   - Title: Introduction to Physics
   - Description: Test your understanding of fundamental physics concepts
5. Click "Create Quiz"
6. For each question above:
   - Copy the question text
   - Copy options A, B, C, D
   - Select correct option
   - Copy explanation
   - Enter topic tag
   - Click "Add Question"
7. Click "Finish Quiz" when done

### Method 2: Direct API Calls (For Programmers)

You can also use curl or Postman to quickly insert data:

```bash
# Create quiz
curl -X POST http://localhost:3000/api/quizzes \
  -H "Content-Type: application/json" \
  -d '{"title":"Introduction to Physics","description":"Test your understanding of fundamental physics concepts"}'

# This returns {"id": 1}
# Use that ID for adding questions:

# Add Question 1
curl -X POST http://localhost:3000/api/quizzes/1/questions \
  -H "Content-Type: application/json" \
  -d '{
    "text": "What does Newton'\''s First Law state?",
    "option_a": "An object at rest stays at rest unless acted upon by a force",
    "option_b": "Force equals mass times acceleration",
    "option_c": "For every action there is an equal and opposite reaction",
    "option_d": "Energy cannot be created or destroyed",
    "correct_option": "A",
    "explanation": "Newton'\''s First Law (Law of Inertia) states that an object at rest will remain at rest, and an object in motion will remain in motion at constant velocity, unless acted upon by an external force.",
    "topic_tag": "Newton'\''s Laws"
  }'

# Repeat for other questions...
```

---

## Sample Quiz: Math Fundamentals

**Title:** Basic Algebra  
**Description:** Review fundamental algebra concepts

### Question 1: Solving Equations

**Question:** Solve for x: 2x + 5 = 13

**Options:**
- A: x = 3
- B: x = 4
- C: x = 8
- D: x = 9

**Correct Answer:** B

**Explanation:** Subtract 5 from both sides: 2x = 8. Then divide both sides by 2: x = 4.

**Topic Tag:** Algebra

---

### Question 2: Order of Operations

**Question:** What is the result of: 3 + 4 × 2?

**Options:**
- A: 10
- B: 11
- C: 14
- D: 24

**Correct Answer:** B

**Explanation:** Following order of operations (PEMDAS), multiplication comes before addition: 4 × 2 = 8, then 3 + 8 = 11.

**Topic Tag:** Order of Operations

---

### Question 3: Fractions

**Question:** What is 1/2 + 1/4?

**Options:**
- A: 1/6
- B: 2/6
- C: 2/4
- D: 3/4

**Correct Answer:** D

**Explanation:** Convert 1/2 to 2/4, then add: 2/4 + 1/4 = 3/4.

**Topic Tag:** Fractions

---

## Testing Scenarios

### Scenario 1: Test Overconfidence Detection

1. Create quiz with these questions
2. Start live session
3. Join as student
4. On Question 5 (gravity), deliberately:
   - Select wrong answer (A or B)
   - Set confidence to 5 (Very Sure)
   - Submit
5. Check feedback - should warn about overconfidence

### Scenario 2: Test Solo vs Live Mode

**Solo Mode:**
1. Create quiz
2. Go to "Solo Practice"
3. Select quiz
4. Answer questions - should auto-advance

**Live Mode:**
1. Create quiz
2. Start live session
3. Join as student in another tab
4. Instructor must click "Next Question" to advance

### Scenario 3: Test Analytics

1. Create quiz
2. Have 3-4 people answer (or use multiple browsers)
3. Mix correct/incorrect answers
4. Vary confidence levels
5. Go to analytics to see:
   - Leaderboard
   - Overconfidence patterns
   - Question difficulty
6. Download CSV

---

## Expected Behaviors

### When Student is Correct + High Confidence
✅ "Great job! You were confident and got it right. +50 points"

### When Student is Correct + Low Confidence
✅ "You got it right but weren't very confident. Review this topic to build confidence. +10 points"

### When Student is Incorrect + High Confidence
❌ "You were very confident but got it wrong. This may indicate a misconception."

### When Student is Incorrect + Low Confidence
❌ "You weren't sure and got it wrong. The correct answer was [X]."

---

## Quick Test Checklist

After entering sample quiz:

- [ ] Quiz appears in instructor dashboard
- [ ] Can start live session
- [ ] Room code is generated
- [ ] Can join with room code
- [ ] Question displays correctly
- [ ] Options are clickable
- [ ] Confidence slider works
- [ ] Strategy buttons work
- [ ] Submit button activates when all selected
- [ ] Timer counts up
- [ ] Feedback shows correct/incorrect
- [ ] Explanation displays
- [ ] Can advance to next question
- [ ] Final summary shows
- [ ] Analytics display data
- [ ] CSV export works

---

## Troubleshooting Sample Data

**Quiz not showing:**
- Check that quiz was created successfully
- Refresh the page
- Check browser console for errors

**Questions not appearing:**
- Verify questions were added to correct quiz ID
- Check that session was started
- Refresh student page

**Analytics empty:**
- Make sure students submitted answers
- Check that session ID is correct
- Verify responses were saved in database

---

## Next Steps

After testing with sample data:

1. Create your own quizzes for your actual course
2. Test with real students in a pilot session
3. Review analytics to understand patterns
4. Adjust scoring or feedback as needed
5. Export data for research analysis

Good luck with your educational research! 🎓