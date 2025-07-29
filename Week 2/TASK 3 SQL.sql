SELECT DATABASE();
DESCRIBE STUDENTS;


-- ✅ Insert data into Students table
INSERT INTO Students (student_id, name, age, gender, class_id) VALUES
(1, 'Ahmed', 17, 'Male', 1),
(2, 'Sara', 18, 'Female', 2),
(3, 'Ali', 19, 'Male', 1),
(4, 'Ayesha', 17, 'Female', 3),
(5, 'Usman', 21, 'Male', 2),
(6, 'Zara', 22, 'Female', 3),
(7, 'Hassan', 20, 'Male', 1);

-- ✅ Insert data into Classes table
INSERT INTO Classes (class_id, class_name, teacher_id) VALUES
(1, 'Class 10', 101),
(2, 'Class 9', 102),
(3, 'Class 8', 103);

-- ✅ Insert data into Teachers table
INSERT INTO Teachers (teacher_id, name, subject) VALUES
(101, 'Mr. Khan', 'Math'),
(102, 'Ms. Fatima', 'Science'),
(103, 'Mr. Bilal', 'English');

-- ✅ Insert data into Marks table
INSERT INTO Marks (mark_id, student_id, subject, marks) VALUES
(1, 1, 'Math', 88),
(2, 2, 'Science', 75),
(3, 3, 'Math', 90),
(4, 4, 'English', 65),
(5, 5, 'Science', 95),
(6, 6, 'English', 85),
(7, 7, 'Math', 72),
(8, 1, 'Science', 70),
(9, 2, 'Math', 67),
(10, 4, 'Math', 78);

-- ✅Get the names of all students
SELECT name FROM Students;

--  Get the names of all male students
SELECT name
FROM Students
WHERE gender = 'Male';

-- Get details of students older than 18
SELECT * FROM Students WHERE age > 18;

-- Get details of students who are in class_id = 2
SELECT * FROM Students WHERE class_id = 2;

--  List all students ordered by age (youngest first)
SELECT * FROM Students ORDER BY age ASC;

-- Show top 5 students with the highest marks in "Math"
SELECT s.name, m.marks
FROM Students s
JOIN Marks m ON s.student_id = m.student_id
WHERE m.subject = 'Math'
ORDER BY m.marks DESC
LIMIT 5;

--  List student names along with their class names
SELECT s.name AS student_name, c.class_name
FROM Students s
JOIN Classes c ON s.class_id = c.class_id;

-- Show student names with their teacher’s name for each class
SELECT s.name AS student_name, t.name AS teacher_name
FROM Students s
JOIN Classes c ON s.class_id = c.class_id
JOIN Teachers t ON c.teacher_id = t.teacher_id;

-- Find the average marks for each subject
SELECT subject, AVG(marks) AS average_marks
FROM Marks
GROUP BY subject;

--  Count how many students are in each class
SELECT class_id, COUNT(*) AS total_students
FROM Students
GROUP BY class_id;

-- Find the highest marks scored in "Science"
SELECT MAX(marks) AS highest_science_marks
FROM Marks
WHERE subject = 'Science';

-- ✅ List names of students who scored more than the average marks
SELECT s.name, m.subject, m.marks
FROM Students s
JOIN Marks m ON s.student_id = m.student_id
WHERE m.marks > (
    SELECT AVG(marks) FROM Marks
);

-- Find the class name where the oldest student studies
SELECT c.class_name
FROM Students s
JOIN Classes c ON s.class_id = c.class_id
ORDER BY s.age DESC
LIMIT 1;

--  Insert a new student named "Ali", age 17, male, in class 3
INSERT INTO Students (student_id, name, age, gender, class_id)
VALUES (8, 'Ali', 17, 'Male', 3);

--  Update the subject of teacher with teacher_id = 101 to "Computer Science"
UPDATE Teachers
SET subject = 'Computer Science'
WHERE teacher_id = 101;
SELECT * FROM Teachers WHERE teacher_id = 1;
-- Delete all students who have age > 25
DELETE FROM Students
WHERE age > 25;

--  Get names of students who have not received marks in "English"
SELECT name
FROM Students
WHERE student_id NOT IN (
    SELECT student_id FROM Marks WHERE subject = 'English'
);

--  Display each class name with the total number of male and female students
SELECT 
    c.class_name,
    SUM(CASE WHEN s.gender = 'Male' THEN 1 ELSE 0 END) AS male_students,
    SUM(CASE WHEN s.gender = 'Female' THEN 1 ELSE 0 END) AS female_students
FROM Classes c
JOIN Students s ON c.class_id = s.class_id
GROUP BY c.class_name;

-- Get a list of students with total marks across all subjects, ordered from highest to lowest
SELECT s.name, SUM(m.marks) AS total_marks
FROM Students s
JOIN Marks m ON s.student_id = m.student_id
GROUP BY s.name
ORDER BY total_marks DESC;

-- Create a temporary table to store student names with their class names (Query #8)
CREATE TEMPORARY TABLE StudentClassInfo AS
SELECT s.name AS student_name, c.class_name
FROM Students s
JOIN Classes c ON s.class_id = c.class_id;

--  View contents of the temporary table
SELECT * FROM StudentClassInfo;
