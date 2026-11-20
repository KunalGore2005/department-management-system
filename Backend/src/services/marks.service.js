const pool = require("../config/db");

const fail = (message, statusCode = 400) => Object.assign(new Error(message), { statusCode });
const validId = value => Number.isInteger(Number(value)) && Number(value) > 0;
const yearPattern = /^\d{4}-\d{2}$/;
const hasAttendanceStatus = async executor => {
    const [columns] = await executor.query("SHOW COLUMNS FROM exam_marks");
    return columns.some(column => column.Field === "attendance_status");
};

const normalizeSubjects = subjects => {
    if (!Array.isArray(subjects) || !subjects.length) throw fail("At least one subject is required");
    const seen = new Set();
    return subjects.map(item => {
        const subjectId = Number(item?.subjectId);
        const maxMarks = Number(item?.maxMarks);
        if (!validId(item?.subjectId) || !Number.isFinite(maxMarks) || maxMarks <= 0 || maxMarks > 999.99) throw fail("Each subject requires a valid subjectId and maxMarks between 0 and 999.99");
        if (seen.has(subjectId)) throw fail("Duplicate subject IDs are not allowed");
        seen.add(subjectId);
        return { subjectId, maxMarks };
    });
};

const facultyForUser = async (executor, userId) => {
    const [[row]] = await executor.query("SELECT faculty_id FROM faculty WHERE user_id = ?", [userId]);
    if (!row) throw fail("Faculty profile not found for this user", 404);
    return Number(row.faculty_id);
};

const validateSubjectsForBatch = async (executor, batchId, semester, subjects) => {
    const ids = subjects.map(item => item.subjectId);
    const [rows] = await executor.query(`SELECT DISTINCT s.subject_id, s.semester
        FROM subjects s INNER JOIN faculty_subject_section fss ON fss.subject_id = s.subject_id
        INNER JOIN sections sec ON sec.section_id = fss.section_id AND sec.batch_id = fss.batch_id
        WHERE fss.batch_id = ? AND s.semester = ? AND s.subject_id IN (?)`, [batchId, semester, ids]);
    if (rows.length !== ids.length) throw fail("Every subject must exist, match the selected semester and be allocated within the selected batch");
};

const shapeExams = async (executor, where = "", params = []) => {
    const [exams] = await executor.query(`SELECT e.exam_id, e.exam_name, e.batch_id, b.admission_year, e.semester, e.academic_year, e.created_by, e.created_at
        FROM exams e INNER JOIN batches b ON b.batch_id = e.batch_id ${where} ORDER BY e.semester ASC, e.created_at DESC`, params);
    if (!exams.length) return exams;
    const ids = exams.map(row => row.exam_id);
    const [subjects] = await executor.query(`SELECT es.exam_id, es.subject_id, s.subject_name, s.subject_code, es.max_marks
        FROM exam_subjects es INNER JOIN subjects s ON s.subject_id = es.subject_id WHERE es.exam_id IN (?) ORDER BY s.subject_code ASC`, [ids]);
    return exams.map(exam => ({ ...exam, subjects: subjects.filter(subject => Number(subject.exam_id) === Number(exam.exam_id)) }));
};

const createExam = async (user, data) => {
    const { examName, batchId, semester, academicYear } = data;
    const name = typeof examName === "string" ? examName.trim() : "";
    if (!name || name.length > 50 || !validId(batchId) || !Number.isInteger(Number(semester)) || Number(semester) < 1 || Number(semester) > 8 || !yearPattern.test(academicYear || "")) throw fail("Valid examName, batchId, semester (1-8) and academicYear (YYYY-YY) are required");
    const subjects = normalizeSubjects(data.subjects);
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();
        const [[batch]] = await connection.query("SELECT batch_id FROM batches WHERE batch_id = ?", [batchId]);
        if (!batch) throw fail("Batch not found", 404);
        await validateSubjectsForBatch(connection, Number(batchId), Number(semester), subjects);
        const facultyId = await facultyForUser(connection, user.userId);
        const [result] = await connection.query("INSERT INTO exams (exam_name, batch_id, semester, academic_year, created_by) VALUES (?, ?, ?, ?, ?)", [name, batchId, semester, academicYear, facultyId]);
        for (const subject of subjects) await connection.query("INSERT INTO exam_subjects (exam_id, subject_id, max_marks) VALUES (?, ?, ?)", [result.insertId, subject.subjectId, subject.maxMarks]);
        await connection.commit();
        return { statusCode: 201, message: "Exam created successfully", data: (await shapeExams(pool, "WHERE e.exam_id = ?", [result.insertId]))[0] };
    } catch (error) { await connection.rollback(); if (error.code === "ER_DUP_ENTRY") throw fail("An exam with this name, batch, semester and academic year already exists", 409); throw error; }
    finally { connection.release(); }
};

const getExams = async user => {
    let where = "";
    const params = [];
    if (user.role === "STUDENT") {
        const [[student]] = await pool.query("SELECT batch_id FROM students WHERE user_id = ?", [user.userId]);
        if (!student) throw fail("Student profile not found for this user", 404);
        where = "WHERE e.batch_id = ?"; params.push(student.batch_id);
    } else if (user.role === "FACULTY") {
        const facultyId = await facultyForUser(pool, user.userId);
        where = `WHERE EXISTS (SELECT 1 FROM exam_subjects es
            INNER JOIN faculty_subject_section fss ON fss.subject_id = es.subject_id AND fss.batch_id = e.batch_id
            WHERE es.exam_id = e.exam_id AND fss.faculty_id = ?)
            OR EXISTS (SELECT 1 FROM coordinator_assignments ca WHERE ca.faculty_id = ? AND ca.batch_id = e.batch_id)`;
        params.push(facultyId, facultyId);
    }
    return { statusCode: 200, message: "Exams fetched successfully", data: await shapeExams(pool, where, params) };
};
const getExamById = async (examId, user) => {
    if (!validId(examId)) throw fail("Valid examId is required");
    const data = await shapeExams(pool, "WHERE e.exam_id = ?", [examId]);
    if (!data.length) throw fail("Exam not found", 404);
    if (user.role === "STUDENT") {
        const [[student]] = await pool.query("SELECT batch_id FROM students WHERE user_id = ?", [user.userId]);
        if (!student) throw fail("Student profile not found for this user", 404);
        if (Number(student.batch_id) !== Number(data[0].batch_id)) throw fail("Exam not found", 404);
    } else if (user.role === "FACULTY") {
        const facultyId = await facultyForUser(pool, user.userId);
        const [[scope]] = await pool.query(`SELECT 1 FROM exam_subjects es INNER JOIN faculty_subject_section fss
            ON fss.subject_id = es.subject_id AND fss.batch_id = ? WHERE es.exam_id = ? AND fss.faculty_id = ?
            UNION SELECT 1 FROM coordinator_assignments WHERE faculty_id = ? AND batch_id = ? LIMIT 1`, [data[0].batch_id, examId, facultyId, facultyId, data[0].batch_id]);
        if (!scope) throw fail("Exam not found", 404);
    }
    return { statusCode: 200, message: "Exam fetched successfully", data: data[0] };
};

const updateExam = async (user, examId, data) => {
    if (!validId(examId)) throw fail("Valid examId is required");
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();
        const [[exam]] = await connection.query("SELECT * FROM exams WHERE exam_id = ? FOR UPDATE", [examId]);
        if (!exam) throw fail("Exam not found", 404);
        const name = data.examName === undefined ? exam.exam_name : String(data.examName).trim();
        const batchId = data.batchId === undefined ? Number(exam.batch_id) : Number(data.batchId);
        const semester = data.semester === undefined ? Number(exam.semester) : Number(data.semester);
        const academicYear = data.academicYear === undefined ? exam.academic_year : data.academicYear;
        if (!name || name.length > 50 || !validId(batchId) || !Number.isInteger(semester) || semester < 1 || semester > 8 || !yearPattern.test(academicYear || "")) throw fail("Invalid exam details");
        const [[batch]] = await connection.query("SELECT batch_id FROM batches WHERE batch_id = ?", [batchId]);
        if (!batch) throw fail("Batch not found", 404);
        const requestedSubjects = data.subjects === undefined ? null : normalizeSubjects(data.subjects);
        const [currentSubjects] = await connection.query("SELECT subject_id, max_marks FROM exam_subjects WHERE exam_id = ?", [examId]);
        const [[existingMarks]] = await connection.query("SELECT COUNT(*) AS total FROM exam_marks WHERE exam_id = ?", [examId]);
        if (Number(batchId) !== Number(exam.batch_id) && Number(existingMarks.total)) throw fail("The batch cannot be changed after marks have been uploaded", 409);
        const finalSubjects = requestedSubjects || currentSubjects.map(row => ({ subjectId: Number(row.subject_id), maxMarks: Number(row.max_marks) }));
        await validateSubjectsForBatch(connection, Number(batchId), semester, finalSubjects);
        if (requestedSubjects) {
            const [marks] = await connection.query("SELECT subject_id, MAX(marks_obtained) AS max_obtained FROM exam_marks WHERE exam_id = ? GROUP BY subject_id", [examId]);
            const requested = new Map(requestedSubjects.map(item => [item.subjectId, item.maxMarks]));
            for (const mark of marks) {
                const nextMaximum = requested.get(Number(mark.subject_id));
                if (nextMaximum === undefined) throw fail("A subject with uploaded marks cannot be removed", 409);
                if (mark.max_obtained !== null && nextMaximum < Number(mark.max_obtained)) throw fail("Maximum marks cannot be lower than marks already recorded", 409);
            }
            for (const current of currentSubjects) if (!requested.has(Number(current.subject_id))) await connection.query("DELETE FROM exam_subjects WHERE exam_id = ? AND subject_id = ?", [examId, current.subject_id]);
            for (const subject of requestedSubjects) {
                if (currentSubjects.some(current => Number(current.subject_id) === subject.subjectId)) await connection.query("UPDATE exam_subjects SET max_marks = ? WHERE exam_id = ? AND subject_id = ?", [subject.maxMarks, examId, subject.subjectId]);
                else await connection.query("INSERT INTO exam_subjects (exam_id, subject_id, max_marks) VALUES (?, ?, ?)", [examId, subject.subjectId, subject.maxMarks]);
            }
        }
        await connection.query("UPDATE exams SET exam_name = ?, batch_id = ?, semester = ?, academic_year = ? WHERE exam_id = ?", [name, batchId, semester, academicYear, examId]);
        await connection.commit();
        return { statusCode: 200, message: "Exam updated successfully", data: (await shapeExams(pool, "WHERE e.exam_id = ?", [examId]))[0] };
    } catch (error) { await connection.rollback(); if (error.code === "ER_DUP_ENTRY") throw fail("An exam with this name, batch, semester and academic year already exists", 409); throw error; }
    finally { connection.release(); }
};

const deleteExam = async examId => {
    if (!validId(examId)) throw fail("Valid examId is required");
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();
        const [[exam]] = await connection.query("SELECT exam_id FROM exams WHERE exam_id = ? FOR UPDATE", [examId]);
        if (!exam) throw fail("Exam not found", 404);
        const [[count]] = await connection.query("SELECT COUNT(*) AS total FROM exam_marks WHERE exam_id = ?", [examId]);
        if (Number(count.total)) throw fail("Cannot delete an exam with uploaded marks", 409);
        await connection.query("DELETE FROM exam_subjects WHERE exam_id = ?", [examId]);
        await connection.query("DELETE FROM exams WHERE exam_id = ?", [examId]);
        await connection.commit();
        return { statusCode: 200, message: "Exam deleted successfully", data: { examId: Number(examId) } };
    } catch (error) { await connection.rollback(); throw error; }
    finally { connection.release(); }
};

const getSubjects = async (batchId, semester) => {
    if (!validId(batchId) || !Number.isInteger(Number(semester)) || Number(semester) < 1 || Number(semester) > 8) throw fail("Valid batchId and semester (1-8) are required");
    const [data] = await pool.query(`SELECT DISTINCT s.subject_id, s.subject_code, s.subject_name, s.semester
        FROM subjects s INNER JOIN faculty_subject_section fss ON fss.subject_id = s.subject_id
        INNER JOIN sections sec ON sec.section_id = fss.section_id AND sec.batch_id = fss.batch_id
        WHERE fss.batch_id = ? AND s.semester = ? ORDER BY s.subject_code`, [batchId, semester]);
    return { statusCode: 200, message: "Batch subjects fetched successfully", data };
};

const getAssignments = async user => {
    const facultyId = await facultyForUser(pool, user.userId);
    const [allocations] = await pool.query(`SELECT fss.subject_id, sub.subject_code, sub.subject_name, sub.semester,
        fss.batch_id, b.admission_year, fss.section_id, sec.section_name, 'FACULTY' AS assignment_type
        FROM faculty_subject_section fss INNER JOIN subjects sub ON sub.subject_id = fss.subject_id
        INNER JOIN batches b ON b.batch_id = fss.batch_id INNER JOIN sections sec ON sec.section_id = fss.section_id AND sec.batch_id = fss.batch_id
        WHERE fss.faculty_id = ? ORDER BY b.admission_year DESC, sub.semester, sec.section_name`, [facultyId]);
    const [coordinatorSections] = await pool.query(`SELECT ca.batch_id, b.admission_year, ca.section_id, sec.section_name,
        'COORDINATOR' AS assignment_type FROM coordinator_assignments ca INNER JOIN batches b ON b.batch_id = ca.batch_id
        INNER JOIN sections sec ON sec.section_id = ca.section_id AND sec.batch_id = ca.batch_id
        WHERE ca.faculty_id = ? ORDER BY b.admission_year DESC, sec.section_name`, [facultyId]);
    return { statusCode: 200, message: "Marks assignments fetched successfully", data: { allocations, coordinatorSections } };
};

const canManage = async (executor, user, facultyId, subjectId, sectionId, batchId) => {
    if (user.role === "HOD") return true;
    if (user.role !== "FACULTY") return false;
    const [[allocation]] = await executor.query("SELECT allocation_id FROM faculty_subject_section WHERE faculty_id = ? AND subject_id = ? AND section_id = ? AND batch_id = ?", [facultyId, subjectId, sectionId, batchId]);
    if (allocation) return true;
    const [[coordinator]] = await executor.query("SELECT assignment_id FROM coordinator_assignments WHERE faculty_id = ? AND section_id = ? AND batch_id = ?", [facultyId, sectionId, batchId]);
    return Boolean(coordinator);
};

const getExamStudents = async (user, examId, subjectId, sectionId) => {
    if (![examId, subjectId, sectionId].every(validId)) throw fail("Valid examId, subjectId and sectionId are required");
    const [[exam]] = await pool.query("SELECT batch_id FROM exams WHERE exam_id = ?", [examId]);
    if (!exam) throw fail("Exam not found", 404);
    const [[section]] = await pool.query("SELECT section_id FROM sections WHERE section_id = ? AND batch_id = ?", [sectionId, exam.batch_id]);
    if (!section) throw fail("Section does not belong to the exam batch");
    const [[configured]] = await pool.query("SELECT subject_id FROM exam_subjects WHERE exam_id = ? AND subject_id = ?", [examId, subjectId]);
    if (!configured) throw fail("Subject is not included in this exam");
    const facultyId = user.role === "STUDENT" ? null : await facultyForUser(pool, user.userId);
    if (!(await canManage(pool, user, facultyId, subjectId, sectionId, exam.batch_id))) throw fail("You are not authorized to manage this subject and section", 403);
    const statusColumnExists = await hasAttendanceStatus(pool);
    const attendanceStatus = statusColumnExists ? "em.attendance_status" : "CASE WHEN em.mark_id IS NULL THEN 'PENDING' ELSE 'PRESENT' END";
    const rosterSql = status => `SELECT s.student_id, s.enrollment_number, s.name,
        em.mark_id, em.marks_obtained, ${status} AS attendance_status,
        CASE WHEN em.mark_id IS NULL THEN 'PENDING' ELSE ${status} END AS result_status
        FROM students s LEFT JOIN exam_marks em ON em.student_id = s.student_id AND em.exam_id = ? AND em.subject_id = ?
        WHERE s.batch_id = ? AND s.section_id = ? ORDER BY s.enrollment_number`;
    let rows;
    try {
        [rows] = await pool.query(rosterSql(attendanceStatus), [examId, subjectId, exam.batch_id, sectionId]);
    } catch (error) {
        if (!statusColumnExists || error.code !== "ER_BAD_FIELD_ERROR" || !String(error.message).includes("attendance_status")) throw error;
        const legacyStatus = "CASE WHEN em.mark_id IS NULL THEN 'PENDING' ELSE 'PRESENT' END";
        [rows] = await pool.query(rosterSql(legacyStatus), [examId, subjectId, exam.batch_id, sectionId]);
    }
    return { statusCode: 200, message: "Students fetched successfully", data: rows };
};

const getMarks = async (user, query) => {
    const statusColumnExists = await hasAttendanceStatus(pool);
    const attendanceStatus = statusColumnExists ? "em.attendance_status" : "CASE WHEN em.mark_id IS NULL THEN 'PENDING' ELSE 'PRESENT' END";
    let sql = `SELECT em.mark_id, e.exam_id, e.exam_name, e.batch_id, b.admission_year, e.semester, e.academic_year,
        s.student_id, s.enrollment_number, s.name AS student_name, sub.subject_id, sub.subject_code, sub.subject_name,
        s.section_id, sec.section_name, em.marks_obtained, es.max_marks, ${attendanceStatus} AS attendance_status,
        CASE WHEN em.mark_id IS NULL THEN 'PENDING' ELSE ${attendanceStatus} END AS result_status, em.uploaded_by, f.name AS uploader_name, em.uploaded_at
        FROM exams e INNER JOIN exam_subjects es ON es.exam_id = e.exam_id INNER JOIN subjects sub ON sub.subject_id = es.subject_id
        INNER JOIN batches b ON b.batch_id = e.batch_id INNER JOIN students s ON s.batch_id = e.batch_id
        INNER JOIN sections sec ON sec.section_id = s.section_id AND sec.batch_id = s.batch_id
        LEFT JOIN exam_marks em ON em.exam_id = e.exam_id AND em.subject_id = es.subject_id AND em.student_id = s.student_id
        LEFT JOIN faculty f ON f.faculty_id = em.uploaded_by WHERE 1=1`;
    const params = [];
    let facultyId = null;
    if (user.role === "STUDENT") {
        const [[student]] = await pool.query("SELECT student_id FROM students WHERE user_id = ?", [user.userId]);
        if (!student) throw fail("Student profile not found for this user", 404);
        sql += " AND s.student_id = ?"; params.push(student.student_id);
    } else if (user.role === "FACULTY") {
        facultyId = await facultyForUser(pool, user.userId);
        sql += ` AND (EXISTS (SELECT 1 FROM faculty_subject_section fss WHERE fss.faculty_id = ? AND fss.subject_id = es.subject_id AND fss.section_id = s.section_id AND fss.batch_id = s.batch_id)
            OR EXISTS (SELECT 1 FROM coordinator_assignments ca WHERE ca.faculty_id = ? AND ca.section_id = s.section_id AND ca.batch_id = s.batch_id))`;
        params.push(facultyId, facultyId);
    }
    for (const key of ["examId", "subjectId", "studentId", "sectionId", "batchId"]) if (query[key] !== undefined) {
        if (!validId(query[key])) throw fail(`Invalid ${key}`);
        if (key === "studentId" && user.role === "STUDENT") continue;
        const columns = { examId: "e.exam_id", subjectId: "es.subject_id", studentId: "s.student_id", sectionId: "s.section_id", batchId: "s.batch_id" };
        sql += ` AND ${columns[key]} = ?`; params.push(Number(query[key]));
    }
    if (query.semester !== undefined) {
        if (!Number.isInteger(Number(query.semester)) || Number(query.semester) < 1 || Number(query.semester) > 8) throw fail("Invalid semester");
        sql += " AND e.semester = ?"; params.push(Number(query.semester));
    }
    sql += " ORDER BY e.semester, e.created_at DESC, sub.subject_code, s.enrollment_number";
    let data;
    try {
        [data] = await pool.query(sql, params);
    } catch (error) {
        if (!statusColumnExists || error.code !== "ER_BAD_FIELD_ERROR" || !String(error.message).includes("attendance_status")) throw error;
        const legacyStatus = "CASE WHEN em.mark_id IS NULL THEN 'PENDING' ELSE 'PRESENT' END";
        [data] = await pool.query(sql.replaceAll("em.attendance_status", legacyStatus), params);
    }
    return { statusCode: 200, message: "Marks fetched successfully", data };
};

const saveMarks = async (user, data) => {
    const { examId, subjectId, sectionId, batchId, marks } = data;
    if (![examId, subjectId, sectionId, batchId].every(validId) || !Array.isArray(marks) || !marks.length) throw fail("examId, subjectId, sectionId, batchId and marks are required");
    const seen = new Set();
    const normalized = marks.map(item => {
        const studentId = Number(item?.studentId);
        const attendanceStatus = item?.attendanceStatus || "PRESENT";
        if (!validId(studentId) || seen.has(studentId)) throw fail("Each mark requires a unique valid studentId");
        seen.add(studentId);
        if (!["PRESENT", "ABSENT"].includes(attendanceStatus)) throw fail("attendanceStatus must be PRESENT or ABSENT");
        if (attendanceStatus === "ABSENT") return { studentId, attendanceStatus, marksObtained: null };
        const marksObtained = Number(item?.marksObtained);
        if (item?.marksObtained === undefined || item?.marksObtained === null || !Number.isFinite(marksObtained) || marksObtained < 0) throw fail("PRESENT students require a non-negative marksObtained value");
        return { studentId, attendanceStatus, marksObtained };
    });
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();
        const statusColumnExists = await hasAttendanceStatus(connection);
        if (!statusColumnExists && normalized.some(item => item.attendanceStatus === "ABSENT")) throw fail("Absence entry requires the approved exam_marks attendance_status database migration", 409);
        const [[exam]] = await connection.query("SELECT exam_id, batch_id, semester FROM exams WHERE exam_id = ?", [examId]);
        if (!exam) throw fail("Exam not found", 404);
        if (Number(exam.batch_id) !== Number(batchId)) throw fail("Selected batch does not match the exam");
        const [[section]] = await connection.query("SELECT section_id FROM sections WHERE section_id = ? AND batch_id = ?", [sectionId, batchId]);
        if (!section) throw fail("Section does not belong to the selected batch");
        const [[configuration]] = await connection.query("SELECT es.max_marks, s.semester FROM exam_subjects es INNER JOIN subjects s ON s.subject_id = es.subject_id WHERE es.exam_id = ? AND es.subject_id = ?", [examId, subjectId]);
        if (!configuration) throw fail("Subject is not included in this exam");
        if (Number(configuration.semester) !== Number(exam.semester)) throw fail("Exam and subject belong to different semesters");
        if (normalized.some(item => item.attendanceStatus === "PRESENT" && item.marksObtained > Number(configuration.max_marks))) throw fail(`Marks cannot exceed maximum marks of ${configuration.max_marks}`);
        const facultyId = await facultyForUser(connection, user.userId);
        if (!(await canManage(connection, user, facultyId, subjectId, sectionId, batchId))) throw fail("You are not authorized to manage this subject and section", 403);
        const ids = normalized.map(item => item.studentId);
        const [students] = await connection.query("SELECT student_id FROM students WHERE student_id IN (?) AND section_id = ? AND batch_id = ?", [ids, sectionId, batchId]);
        if (students.length !== ids.length) throw fail("Every student must belong to the selected section and batch");
        for (const item of normalized) {
            if (statusColumnExists) {
                await connection.query(`INSERT INTO exam_marks (exam_id, student_id, subject_id, marks_obtained, attendance_status, uploaded_by)
                    VALUES (?, ?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE marks_obtained = VALUES(marks_obtained), attendance_status = VALUES(attendance_status), uploaded_by = VALUES(uploaded_by)`, [examId, item.studentId, subjectId, item.marksObtained, item.attendanceStatus, facultyId]);
            } else {
                await connection.query(`INSERT INTO exam_marks (exam_id, student_id, subject_id, marks_obtained, uploaded_by)
                    VALUES (?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE marks_obtained = VALUES(marks_obtained), uploaded_by = VALUES(uploaded_by)`, [examId, item.studentId, subjectId, item.marksObtained, facultyId]);
            }
        }
        await connection.commit();
        return { statusCode: 200, message: "Marks saved successfully", data: { examId: Number(examId), subjectId: Number(subjectId), sectionId: Number(sectionId), batchId: Number(batchId), savedCount: normalized.length } };
    } catch (error) { await connection.rollback(); throw error; }
    finally { connection.release(); }
};

const updateMarks = async (user, markId, data) => {
    if (!validId(markId)) throw fail("Valid markId is required");
    const attendanceStatus = data.attendanceStatus || "PRESENT";
    if (!["PRESENT", "ABSENT"].includes(attendanceStatus)) throw fail("attendanceStatus must be PRESENT or ABSENT");
    const statusColumnExists = await hasAttendanceStatus(pool);
    if (!statusColumnExists && attendanceStatus === "ABSENT") throw fail("Absence entry requires the approved exam_marks attendance_status database migration", 409);
    let marksObtained = null;
    if (attendanceStatus === "PRESENT") {
        marksObtained = Number(data.marksObtained);
        if (data.marksObtained === undefined || data.marksObtained === null || !Number.isFinite(marksObtained) || marksObtained < 0) throw fail("PRESENT students require a non-negative marksObtained value");
    }
    const facultyId = await facultyForUser(pool, user.userId);
    const [[row]] = await pool.query(`SELECT em.mark_id, em.subject_id, s.section_id, s.batch_id, es.max_marks
        FROM exam_marks em INNER JOIN students s ON s.student_id = em.student_id
        INNER JOIN exam_subjects es ON es.exam_id = em.exam_id AND es.subject_id = em.subject_id WHERE em.mark_id = ?`, [markId]);
    if (!row) throw fail("Marks record not found", 404);
    if (attendanceStatus === "PRESENT" && marksObtained > Number(row.max_marks)) throw fail(`Marks cannot exceed maximum marks of ${row.max_marks}`);
    if (!(await canManage(pool, user, facultyId, row.subject_id, row.section_id, row.batch_id))) throw fail("You are not authorized to manage this subject and section", 403);
    if (statusColumnExists) await pool.query("UPDATE exam_marks SET marks_obtained = ?, attendance_status = ?, uploaded_by = ? WHERE mark_id = ?", [marksObtained, attendanceStatus, facultyId, markId]);
    else await pool.query("UPDATE exam_marks SET marks_obtained = ?, uploaded_by = ? WHERE mark_id = ?", [marksObtained, facultyId, markId]);
    return { statusCode: 200, message: "Marks updated successfully", data: { markId: Number(markId), marksObtained, attendanceStatus } };
};
const deleteMarks = async markId => {
    if (!validId(markId)) throw fail("Valid markId is required");
    const [result] = await pool.query("DELETE FROM exam_marks WHERE mark_id = ?", [markId]);
    if (!result.affectedRows) throw fail("Marks record not found", 404);
    return { statusCode: 200, message: "Marks deleted successfully", data: { markId: Number(markId) } };
};

module.exports = { createExam, getExams, getExamById, updateExam, deleteExam, getSubjects, getAssignments, getExamStudents, uploadMarks: saveMarks, getMarks, updateMarks, deleteMarks };
