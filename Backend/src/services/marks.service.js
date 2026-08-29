const pool = require("../config/db");

const createExam = async (user, data) => {
    try {
        const {
            examName,
            semester,
            academicYear,
            maxMarks
        } = data;

        // 1. Validate required fields
        if (
            !examName ||
            !semester ||
            !academicYear ||
            maxMarks === undefined ||
            maxMarks === null
        ) {
            const error = new Error(
                "examName, semester, academicYear and maxMarks are required"
            );
            error.statusCode = 400;
            throw error;
        }

        // 2. Validate semester
        if (
            !Number.isInteger(Number(semester)) ||
            Number(semester) < 1 ||
            Number(semester) > 8
        ) {
            const error = new Error(
                "Semester must be between 1 and 8"
            );
            error.statusCode = 400;
            throw error;
        }

        // 3. Validate max marks
        if (Number(maxMarks) <= 0) {
            const error = new Error(
                "maxMarks must be greater than 0"
            );
            error.statusCode = 400;
            throw error;
        }

        // 4. Validate academic year format
        if (!/^\d{4}-\d{2}$/.test(academicYear)) {
            const error = new Error(
                "academicYear must be in YYYY-YY format"
            );
            error.statusCode = 400;
            throw error;
        }

        // 5. Get HOD's faculty ID
        const [facultyRows] = await pool.execute(
            `SELECT faculty_id
             FROM faculty
             WHERE user_id = ?`,
            [user.userId]
        );

        if (facultyRows.length === 0) {
            const error = new Error(
                "Faculty profile not found for this user"
            );
            error.statusCode = 404;
            throw error;
        }

        const facultyId = facultyRows[0].faculty_id;

        // 6. Check whether same exam already exists
        const [existingExam] = await pool.execute(
            `SELECT exam_id
             FROM exams
             WHERE exam_name = ?
             AND semester = ?
             AND academic_year = ?`,
            [
                examName,
                semester,
                academicYear
            ]
        );

        if (existingExam.length > 0) {
            const error = new Error(
                "This exam already exists for the given semester and academic year"
            );
            error.statusCode = 409;
            throw error;
        }

        // 7. Create exam
        const [result] = await pool.execute(
            `INSERT INTO exams
            (
                exam_name,
                semester,
                academic_year,
                max_marks,
                created_by
            )
            VALUES (?, ?, ?, ?, ?)`,
            [
                examName,
                semester,
                academicYear,
                maxMarks,
                facultyId
            ]
        );

        return {
            statusCode: 201,
            message: "Exam created successfully",
            data: {
                examId: result.insertId,
                examName,
                semester: Number(semester),
                academicYear,
                maxMarks: Number(maxMarks),
                createdBy: facultyId
            }
        };

    } catch (error) {
        throw error;
    }
};
const getExams = async () => {
    try {
        const [rows] = await pool.execute(
            `SELECT
                exam_id,
                exam_name,
                semester,
                academic_year,
                max_marks,
                created_by,
                created_at
             FROM exams
             ORDER BY semester ASC, created_at DESC`
        );

        return {
            statusCode: 200,
            message: "Exams fetched successfully",
            data: rows
        };

    } catch (error) {
        throw error;
    }
};
const getExamById = async (examId) => {
    try {
        // 1. Validate examId
        if (!examId || isNaN(examId)) {
            const error = new Error("Valid examId is required");
            error.statusCode = 400;
            throw error;
        }

        // 2. Get exam
        const [rows] = await pool.execute(
            `SELECT
                exam_id,
                exam_name,
                semester,
                academic_year,
                max_marks,
                created_by,
                created_at
             FROM exams
             WHERE exam_id = ?`,
            [examId]
        );

        // 3. Exam not found
        if (rows.length === 0) {
            const error = new Error("Exam not found");
            error.statusCode = 404;
            throw error;
        }

        return {
            statusCode: 200,
            message: "Exam fetched successfully",
            data: rows[0]
        };

    } catch (error) {
        throw error;
    }
};
const updateExam = async (user, examId, data) => {
    try {
        // 1. Validate examId
        if (!examId || isNaN(examId)) {
            const error = new Error("Valid examId is required");
            error.statusCode = 400;
            throw error;
        }

        const {
            examName,
            semester,
            academicYear,
            maxMarks
        } = data;

        // 2. Check whether exam exists
        const [examRows] = await pool.execute(
            `SELECT
                exam_id,
                exam_name,
                semester,
                academic_year,
                max_marks
             FROM exams
             WHERE exam_id = ?`,
            [examId]
        );

        if (examRows.length === 0) {
            const error = new Error("Exam not found");
            error.statusCode = 404;
            throw error;
        }

        const existingExam = examRows[0];

        // 3. Use existing values when fields are not provided
        const updatedExamName =
            examName !== undefined
                ? examName
                : existingExam.exam_name;

        const updatedSemester =
            semester !== undefined
                ? semester
                : existingExam.semester;

        const updatedAcademicYear =
            academicYear !== undefined
                ? academicYear
                : existingExam.academic_year;

        const updatedMaxMarks =
            maxMarks !== undefined
                ? maxMarks
                : existingExam.max_marks;

        // 4. Validate exam name
        if (!updatedExamName || !updatedExamName.trim()) {
            const error = new Error("Exam name cannot be empty");
            error.statusCode = 400;
            throw error;
        }

        // 5. Validate semester
        if (
            !Number.isInteger(Number(updatedSemester)) ||
            Number(updatedSemester) < 1 ||
            Number(updatedSemester) > 8
        ) {
            const error = new Error(
                "Semester must be between 1 and 8"
            );
            error.statusCode = 400;
            throw error;
        }

        // 6. Validate academic year
        if (!/^\d{4}-\d{2}$/.test(updatedAcademicYear)) {
            const error = new Error(
                "academicYear must be in YYYY-YY format"
            );
            error.statusCode = 400;
            throw error;
        }

        // 7. Validate max marks
        if (Number(updatedMaxMarks) <= 0) {
            const error = new Error(
                "maxMarks must be greater than 0"
            );
            error.statusCode = 400;
            throw error;
        }

        // 8. Check duplicate exam
        const [duplicateRows] = await pool.execute(
            `SELECT exam_id
             FROM exams
             WHERE exam_name = ?
             AND semester = ?
             AND academic_year = ?
             AND exam_id != ?`,
            [
                updatedExamName.trim(),
                updatedSemester,
                updatedAcademicYear,
                examId
            ]
        );

        if (duplicateRows.length > 0) {
            const error = new Error(
                "Another exam with the same name, semester and academic year already exists"
            );
            error.statusCode = 409;
            throw error;
        }

        // 9. Update exam
        await pool.execute(
            `UPDATE exams
             SET exam_name = ?,
                 semester = ?,
                 academic_year = ?,
                 max_marks = ?
             WHERE exam_id = ?`,
            [
                updatedExamName.trim(),
                updatedSemester,
                updatedAcademicYear,
                updatedMaxMarks,
                examId
            ]
        );

        // 10. Get updated exam
        const [updatedRows] = await pool.execute(
            `SELECT
                exam_id,
                exam_name,
                semester,
                academic_year,
                max_marks,
                created_by,
                created_at
             FROM exams
             WHERE exam_id = ?`,
            [examId]
        );

        return {
            statusCode: 200,
            message: "Exam updated successfully",
            data: updatedRows[0]
        };

    } catch (error) {
        throw error;
    }
};
const deleteExam = async (examId) => {
    try {
        // 1. Validate examId
        if (!examId || isNaN(examId)) {
            const error = new Error("Valid examId is required");
            error.statusCode = 400;
            throw error;
        }

        // 2. Check whether exam exists
        const [examRows] = await pool.execute(
            `SELECT exam_id, exam_name
             FROM exams
             WHERE exam_id = ?`,
            [examId]
        );

        if (examRows.length === 0) {
            const error = new Error("Exam not found");
            error.statusCode = 404;
            throw error;
        }

        // 3. Check whether marks already exist
        const [markRows] = await pool.execute(
            `SELECT COUNT(*) AS markCount
             FROM exam_marks
             WHERE exam_id = ?`,
            [examId]
        );

        if (markRows[0].markCount > 0) {
            const error = new Error(
                "Cannot delete exam because marks have already been uploaded for this exam"
            );
            error.statusCode = 409;
            throw error;
        }

        // 4. Delete exam
        await pool.execute(
            `DELETE FROM exams
             WHERE exam_id = ?`,
            [examId]
        );

        return {
            statusCode: 200,
            message: "Exam deleted successfully",
            data: {
                examId: Number(examId)
            }
        };

    } catch (error) {
        throw error;
    }
};
const uploadMarks = async (user, data) => {
    const connection = await pool.getConnection();

    try {
        const {
            examId,
            subjectId,
            sectionId,
            batchId,
            marks
        } = data;

        // -----------------------------------------
        // 1. Validate request body
        // -----------------------------------------

        if (
            !examId ||
            !subjectId ||
            !sectionId ||
            !batchId ||
            !Array.isArray(marks) ||
            marks.length === 0
        ) {
            const error = new Error(
                "examId, subjectId, sectionId, batchId and marks are required"
            );
            error.statusCode = 400;
            throw error;
        }

        // -----------------------------------------
        // 2. Get faculty ID from authenticated user
        // -----------------------------------------

        const [facultyRows] = await connection.execute(
            `SELECT faculty_id
             FROM faculty
             WHERE user_id = ?`,
            [user.userId]
        );

        if (facultyRows.length === 0) {
            const error = new Error(
                "Faculty profile not found for this user"
            );
            error.statusCode = 404;
            throw error;
        }

        const facultyId = facultyRows[0].faculty_id;

        // -----------------------------------------
        // 3. Check exam
        // -----------------------------------------

        const [examRows] = await connection.execute(
            `SELECT
                exam_id,
                semester,
                max_marks
             FROM exams
             WHERE exam_id = ?`,
            [examId]
        );

        if (examRows.length === 0) {
            const error = new Error("Exam not found");
            error.statusCode = 404;
            throw error;
        }

        const exam = examRows[0];

        // -----------------------------------------
        // 4. Check subject
        // -----------------------------------------

        const [subjectRows] = await connection.execute(
            `SELECT
                subject_id,
                semester
             FROM subjects
             WHERE subject_id = ?`,
            [subjectId]
        );

        if (subjectRows.length === 0) {
            const error = new Error("Subject not found");
            error.statusCode = 404;
            throw error;
        }

        const subject = subjectRows[0];

        // -----------------------------------------
        // 5. Check exam and subject semester
        // -----------------------------------------

        if (exam.semester !== subject.semester) {
            const error = new Error(
                "Exam and subject belong to different semesters"
            );
            error.statusCode = 400;
            throw error;
        }

        // -----------------------------------------
        // 6. Check faculty allocation
        // -----------------------------------------

        if (user.role === "FACULTY") {

            const [allocationRows] = await connection.execute(
                `SELECT allocation_id
                 FROM faculty_subject_section
                 WHERE faculty_id = ?
                 AND subject_id = ?
                 AND section_id = ?
                 AND batch_id = ?`,
                [
                    facultyId,
                    subjectId,
                    sectionId,
                    batchId
                ]
            );

            if (allocationRows.length === 0) {
                const error = new Error(
                    "You are not assigned to this subject, section and batch"
                );
                error.statusCode = 403;
                throw error;
            }
        }

        // -----------------------------------------
        // 7. Validate marks
        // -----------------------------------------

        for (const mark of marks) {

            if (
                !mark.studentId ||
                mark.marksObtained === undefined ||
                mark.marksObtained === null
            ) {
                const error = new Error(
                    "Each mark must contain studentId and marksObtained"
                );
                error.statusCode = 400;
                throw error;
            }

            if (
                isNaN(mark.marksObtained) ||
                Number(mark.marksObtained) < 0 ||
                Number(mark.marksObtained) > Number(exam.max_marks)
            ) {
                const error = new Error(
                    `Marks must be between 0 and ${exam.max_marks}`
                );
                error.statusCode = 400;
                throw error;
            }
        }

        // -----------------------------------------
        // 8. Check duplicate student IDs in request
        // -----------------------------------------

        const studentIds = marks.map(
            mark => mark.studentId
        );

        const uniqueStudentIds = new Set(studentIds);

        if (uniqueStudentIds.size !== studentIds.length) {
            const error = new Error(
                "Duplicate student IDs are not allowed in the same request"
            );
            error.statusCode = 400;
            throw error;
        }

        // -----------------------------------------
        // 9. Start transaction
        // -----------------------------------------

        await connection.beginTransaction();

        // -----------------------------------------
        // 10. Verify students
        // -----------------------------------------

        for (const mark of marks) {

            const [studentRows] = await connection.execute(
                `SELECT student_id
                 FROM students
                 WHERE student_id = ?
                 AND section_id = ?
                 AND batch_id = ?`,
                [
                    mark.studentId,
                    sectionId,
                    batchId
                ]
            );

            if (studentRows.length === 0) {
                const error = new Error(
                    `Student ${mark.studentId} does not belong to the selected section and batch`
                );
                error.statusCode = 400;
                throw error;
            }
        }

        // -----------------------------------------
        // 11. Check whether marks already exist
        // -----------------------------------------

        for (const mark of marks) {

            const [existingRows] = await connection.execute(
                `SELECT mark_id
                 FROM exam_marks
                 WHERE exam_id = ?
                 AND student_id = ?
                 AND subject_id = ?`,
                [
                    examId,
                    mark.studentId,
                    subjectId
                ]
            );

            if (existingRows.length > 0) {
                const error = new Error(
                    `Marks already exist for student ${mark.studentId}`
                );
                error.statusCode = 409;
                throw error;
            }
        }

        // -----------------------------------------
        // 12. Insert marks
        // -----------------------------------------

        for (const mark of marks) {

            await connection.execute(
                `INSERT INTO exam_marks
                (
                    exam_id,
                    student_id,
                    subject_id,
                    marks_obtained,
                    uploaded_by
                )
                VALUES (?, ?, ?, ?, ?)`,
                [
                    examId,
                    mark.studentId,
                    subjectId,
                    mark.marksObtained,
                    facultyId
                ]
            );
        }

        // -----------------------------------------
        // 13. Commit transaction
        // -----------------------------------------

        await connection.commit();

        return {
            statusCode: 201,
            message: "Marks uploaded successfully",
            data: {
                examId: Number(examId),
                subjectId: Number(subjectId),
                sectionId: Number(sectionId),
                batchId: Number(batchId),
                uploadedCount: marks.length
            }
        };

    } catch (error) {

        await connection.rollback();

        throw error;

    } finally {

        connection.release();
    }
};
const getMarks = async (user, query) => {
    try {
        const {
            examId,
            subjectId,
            studentId,
            sectionId,
            batchId
        } = query;

        let sql = `
            SELECT
                em.mark_id,
                em.exam_id,
                e.exam_name,
                e.semester,
                e.academic_year,
                e.max_marks,
                em.student_id,
                s.enrollment_number,
                s.name AS student_name,
                em.subject_id,
                sub.subject_code,
                sub.subject_name,
                s.section_id,
                s.batch_id,
                em.marks_obtained,
                em.uploaded_by,
                em.uploaded_at
            FROM exam_marks em
            INNER JOIN exams e
                ON em.exam_id = e.exam_id
            INNER JOIN students s
                ON em.student_id = s.student_id
            INNER JOIN subjects sub
                ON em.subject_id = sub.subject_id
            WHERE 1 = 1
        `;

        const params = [];

        // ------------------------------------------------
        // 1. Student
        // ------------------------------------------------

        if (user.role === "STUDENT") {

            const [studentRows] = await pool.execute(
                `SELECT student_id
                 FROM students
                 WHERE user_id = ?`,
                [user.userId]
            );

            if (studentRows.length === 0) {
                const error = new Error(
                    "Student profile not found for this user"
                );
                error.statusCode = 404;
                throw error;
            }

            const loggedInStudentId = studentRows[0].student_id;

            // Ignore studentId from query
            sql += ` AND em.student_id = ?`;
            params.push(loggedInStudentId);
        }

        // ------------------------------------------------
        // 2. Faculty
        // ------------------------------------------------

        else if (user.role === "FACULTY") {

            const [facultyRows] = await pool.execute(
                `SELECT faculty_id
                 FROM faculty
                 WHERE user_id = ?`,
                [user.userId]
            );

            if (facultyRows.length === 0) {
                const error = new Error(
                    "Faculty profile not found for this user"
                );
                error.statusCode = 404;
                throw error;
            }

            const facultyId = facultyRows[0].faculty_id;

            /*
             * Only marks belonging to the faculty's
             * allocated subject + section + batch.
             */
            sql += `
                AND EXISTS (
                    SELECT 1
                    FROM faculty_subject_section fss
                    WHERE fss.faculty_id = ?
                    AND fss.subject_id = em.subject_id
                    AND fss.section_id = s.section_id
                    AND fss.batch_id = s.batch_id
                )
            `;

            params.push(facultyId);
        }

        // ------------------------------------------------
        // 3. HOD
        // ------------------------------------------------

        // HOD has no additional restriction.

        // ------------------------------------------------
        // 4. Optional filters
        // ------------------------------------------------

        if (examId !== undefined) {
            if (!Number.isInteger(Number(examId))) {
                const error = new Error("Invalid examId");
                error.statusCode = 400;
                throw error;
            }

            sql += ` AND em.exam_id = ?`;
            params.push(Number(examId));
        }

        if (subjectId !== undefined) {
            if (!Number.isInteger(Number(subjectId))) {
                const error = new Error("Invalid subjectId");
                error.statusCode = 400;
                throw error;
            }

            sql += ` AND em.subject_id = ?`;
            params.push(Number(subjectId));
        }

        // ------------------------------------------------
        // 5. Student filter
        // ------------------------------------------------

        /*
         * Only Faculty/HOD can use studentId.
         * Student's ID is always taken from req.user.
         */

        if (
            studentId !== undefined &&
            user.role !== "STUDENT"
        ) {
            if (!Number.isInteger(Number(studentId))) {
                const error = new Error("Invalid studentId");
                error.statusCode = 400;
                throw error;
            }

            sql += ` AND em.student_id = ?`;
            params.push(Number(studentId));
        }

        // ------------------------------------------------
        // 6. Section filter
        // ------------------------------------------------

        if (sectionId !== undefined) {
            if (!Number.isInteger(Number(sectionId))) {
                const error = new Error("Invalid sectionId");
                error.statusCode = 400;
                throw error;
            }

            sql += ` AND s.section_id = ?`;
            params.push(Number(sectionId));
        }

        // ------------------------------------------------
        // 7. Batch filter
        // ------------------------------------------------

        if (batchId !== undefined) {
            if (!Number.isInteger(Number(batchId))) {
                const error = new Error("Invalid batchId");
                error.statusCode = 400;
                throw error;
            }

            sql += ` AND s.batch_id = ?`;
            params.push(Number(batchId));
        }

        // ------------------------------------------------
        // 8. Ordering
        // ------------------------------------------------

        sql += `
            ORDER BY
                e.semester ASC,
                e.created_at DESC,
                sub.subject_code ASC,
                s.enrollment_number ASC
        `;

        // ------------------------------------------------
        // 9. Execute query
        // ------------------------------------------------

        const [rows] = await pool.execute(
            sql,
            params
        );

        return {
            statusCode: 200,
            message: "Marks fetched successfully",
            data: rows
        };

    } catch (error) {
        throw error;
    }
};
const updateMarks = async (user, markId, data) => {
    try {
        // -----------------------------------------
        // 1. Validate markId
        // -----------------------------------------

        if (!markId || !Number.isInteger(Number(markId))) {
            const error = new Error("Valid markId is required");
            error.statusCode = 400;
            throw error;
        }

        // -----------------------------------------
        // 2. Validate marksObtained
        // -----------------------------------------

        const { marksObtained } = data;

        if (
            marksObtained === undefined ||
            marksObtained === null
        ) {
            const error = new Error(
                "marksObtained is required"
            );
            error.statusCode = 400;
            throw error;
        }

        if (
            isNaN(marksObtained) ||
            Number(marksObtained) < 0
        ) {
            const error = new Error(
                "marksObtained must be a valid non-negative number"
            );
            error.statusCode = 400;
            throw error;
        }

        // -----------------------------------------
        // 3. Get existing mark
        // -----------------------------------------

        const [markRows] = await pool.execute(
            `SELECT
                em.mark_id,
                em.exam_id,
                em.student_id,
                em.subject_id,
                em.marks_obtained,
                e.max_marks,
                e.semester,
                s.section_id,
                s.batch_id
             FROM exam_marks em
             INNER JOIN exams e
                 ON em.exam_id = e.exam_id
             INNER JOIN students s
                 ON em.student_id = s.student_id
             WHERE em.mark_id = ?`,
            [markId]
        );

        if (markRows.length === 0) {
            const error = new Error("Marks record not found");
            error.statusCode = 404;
            throw error;
        }

        const existingMark = markRows[0];

        // -----------------------------------------
        // 4. Check marks don't exceed max marks
        // -----------------------------------------

        if (
            Number(marksObtained) >
            Number(existingMark.max_marks)
        ) {
            const error = new Error(
                `Marks cannot exceed maximum marks of ${existingMark.max_marks}`
            );
            error.statusCode = 400;
            throw error;
        }

        // -----------------------------------------
        // 5. Get faculty ID
        // -----------------------------------------

        const [facultyRows] = await pool.execute(
            `SELECT faculty_id
             FROM faculty
             WHERE user_id = ?`,
            [user.userId]
        );

        if (facultyRows.length === 0) {
            const error = new Error(
                "Faculty profile not found for this user"
            );
            error.statusCode = 404;
            throw error;
        }

        const facultyId = facultyRows[0].faculty_id;

        // -----------------------------------------
        // 6. Check faculty allocation
        // -----------------------------------------

        if (user.role === "FACULTY") {

            const [allocationRows] = await pool.execute(
                `SELECT allocation_id
                 FROM faculty_subject_section
                 WHERE faculty_id = ?
                 AND subject_id = ?
                 AND section_id = ?
                 AND batch_id = ?`,
                [
                    facultyId,
                    existingMark.subject_id,
                    existingMark.section_id,
                    existingMark.batch_id
                ]
            );

            if (allocationRows.length === 0) {
                const error = new Error(
                    "You are not assigned to this subject, section and batch"
                );
                error.statusCode = 403;
                throw error;
            }
        }

        // -----------------------------------------
        // 7. Update marks
        // -----------------------------------------

        await pool.execute(
            `UPDATE exam_marks
             SET marks_obtained = ?,
                 uploaded_by = ?
             WHERE mark_id = ?`,
            [
                marksObtained,
                facultyId,
                markId
            ]
        );

        // -----------------------------------------
        // 8. Get updated record
        // -----------------------------------------

        const [updatedRows] = await pool.execute(
            `SELECT
                em.mark_id,
                em.exam_id,
                e.exam_name,
                em.student_id,
                s.enrollment_number,
                s.name AS student_name,
                em.subject_id,
                sub.subject_code,
                sub.subject_name,
                em.marks_obtained,
                e.max_marks,
                em.uploaded_by,
                em.uploaded_at
             FROM exam_marks em
             INNER JOIN exams e
                 ON em.exam_id = e.exam_id
             INNER JOIN students s
                 ON em.student_id = s.student_id
             INNER JOIN subjects sub
                 ON em.subject_id = sub.subject_id
             WHERE em.mark_id = ?`,
            [markId]
        );

        return {
            statusCode: 200,
            message: "Marks updated successfully",
            data: updatedRows[0]
        };

    } catch (error) {
        throw error;
    }
};
const deleteMarks = async (markId) => {
    try {
        // -----------------------------------------
        // 1. Validate markId
        // -----------------------------------------

        if (!markId || !Number.isInteger(Number(markId))) {
            const error = new Error("Valid markId is required");
            error.statusCode = 400;
            throw error;
        }

        // -----------------------------------------
        // 2. Check whether marks exist
        // -----------------------------------------

        const [markRows] = await pool.execute(
            `SELECT
                mark_id,
                exam_id,
                student_id,
                subject_id,
                marks_obtained
             FROM exam_marks
             WHERE mark_id = ?`,
            [markId]
        );

        if (markRows.length === 0) {
            const error = new Error("Marks record not found");
            error.statusCode = 404;
            throw error;
        }

        const mark = markRows[0];

        // -----------------------------------------
        // 3. Delete marks
        // -----------------------------------------

        await pool.execute(
            `DELETE FROM exam_marks
             WHERE mark_id = ?`,
            [markId]
        );

        // -----------------------------------------
        // 4. Return response
        // -----------------------------------------

        return {
            statusCode: 200,
            message: "Marks deleted successfully",
            data: {
                markId: Number(markId),
                examId: mark.exam_id,
                studentId: mark.student_id,
                subjectId: mark.subject_id
            }
        };

    } catch (error) {
        throw error;
    }
};

module.exports = {
    createExam,
    getExams,
    getExamById,
    updateExam,
    deleteExam,
    uploadMarks,
    getMarks,
    updateMarks,
    deleteMarks
};