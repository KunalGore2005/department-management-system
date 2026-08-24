const db = require("../config/db");
const { generateSessionCode } = require("../utils/attendance.utils");

const startAttendanceSession = async (user, data) => {

    const { userId, role } = user;

    const {
        subjectId,
        sessionType,
        presentStrength,
        durationMinutes,
        sections
    } = data;

    if (!subjectId) {
        return {
            status: 400,
            success: false,
            message: "Subject is required."
        };
    }

    if (!sessionType) {
        return {
            status: 400,
            success: false,
            message: "Session type is required."
        };
    }

    if (!presentStrength) {
        return {
            status: 400,
            success: false,
            message: "Present strength is required."
        };
    }

    if (!durationMinutes) {
        return {
            status: 400,
            success: false,
            message: "Duration is required."
        };
    }

    if (!sections || sections.length === 0) {
        return {
            status: 400,
            success: false,
            message: "Please select at least one section."
        };
    }

    const connection = await db.getConnection();

    try {

        await connection.beginTransaction();

        // =====================================================
        // Get Faculty ID
        // =====================================================

        const [faculty] = await connection.query(
            `
            SELECT faculty_id
            FROM faculty
            WHERE user_id = ?
            `,
            [userId]
        );

        if (faculty.length === 0) {

            await connection.rollback();

            return {
                status: 404,
                success: false,
                message: "Faculty record not found."
            };
        }

        const facultyId = faculty[0].faculty_id;

        // =====================================================
        // Verify Allocation (Faculty Only)
        // =====================================================

        if (role === "FACULTY") {

            for (const item of sections) {

                const [allocation] = await connection.query(
                    `
                    SELECT allocation_id
                    FROM faculty_subject_section
                    WHERE faculty_id = ?
                    AND subject_id = ?
                    AND section_id = ?
                    AND batch_id = ?
                    `,
                    [
                        facultyId,
                        subjectId,
                        item.sectionId,
                        item.batchId
                    ]
                );

                if (allocation.length === 0) {

                    await connection.rollback();

                    return {
                        status: 403,
                        success: false,
                        message:
                            "You are not assigned to one or more selected sections."
                    };
                }

            }

        }

        // =====================================================
        // Check Active Session
        // =====================================================

        const [activeSession] = await connection.query(
            `
            SELECT session_id
            FROM attendance_sessions
            WHERE faculty_id = ?
            AND status = 'ACTIVE'
            AND end_time > NOW()
            LIMIT 1
            `,
            [facultyId]
        );

        if (activeSession.length > 0) {

            await connection.rollback();

            return {
                status: 409,
                success: false,
                message: "You already have an active attendance session."
            };
        }

        // =====================================================
        // Generate Session Code
        // =====================================================

        const sessionCode = await generateSessionCode();

        // =====================================================
        // Create Attendance Session
        // =====================================================

        const [session] = await connection.query(
            `
    INSERT INTO attendance_sessions
    (
        subject_id,
        faculty_id,
        session_code,
        present_strength,
        session_type,
        start_time,
        end_time
    )
    VALUES
    (
        ?, ?, ?, ?, ?,
        NOW(),
        DATE_ADD(NOW(), INTERVAL ? MINUTE)
    )
    `,
            [
                subjectId,
                facultyId,
                sessionCode,
                presentStrength,
                sessionType,
                durationMinutes
            ]
        );

        const sessionId = session.insertId;

        // =====================================================
        // Insert Allowed Sections
        // =====================================================

        for (const item of sections) {

            await connection.query(
                `
                INSERT INTO attendance_session_sections
                (
                    session_id,
                    section_id,
                    batch_id
                )
                VALUES (?, ?, ?)
                `,
                [
                    sessionId,
                    item.sectionId,
                    item.batchId
                ]
            );

        }

        await connection.commit();

        return {
            status: 201,
            success: true,
            message: "Attendance session started successfully.",
            data: {
                sessionId,
                sessionCode,
                sessionType,
                presentStrength,
                durationMinutes,
                startTime: new Date(),
                endTime: new Date(Date.now() + durationMinutes * 60000)
            }
        };

    } catch (error) {

        await connection.rollback();
        throw error;

    } finally {

        connection.release();

    }

};
const getActiveSession = async (userId) => {

    // =====================================================
    // Get Faculty ID
    // =====================================================

    const [faculty] = await db.query(
        `
        SELECT faculty_id
        FROM faculty
        WHERE user_id = ?
        `,
        [userId]
    );

    if (faculty.length === 0) {
        return {
            status: 404,
            success: false,
            message: "Faculty record not found."
        };
    }

    const facultyId = faculty[0].faculty_id;


    // =====================================================
    // Get Active Attendance Session
    // =====================================================

    const [sessions] = await db.query(
        `
        SELECT
            a.session_id,
            a.session_code,
            a.subject_id,
            s.subject_code,
            s.subject_name,
            a.attendance_category,
            a.present_strength,
            a.session_type,
            a.attendance_method,
            a.start_time,
            a.end_time,
            a.status,
            a.created_at
        FROM attendance_sessions a
        INNER JOIN subjects s
            ON a.subject_id = s.subject_id
        WHERE a.faculty_id = ?
        AND a.status = 'ACTIVE'
        AND a.end_time > NOW()
        ORDER BY a.start_time DESC
        LIMIT 1
        `,
        [facultyId]
    );


    // =====================================================
    // No Active Session
    // =====================================================

    if (sessions.length === 0) {
        return {
            status: 200,
            success: true,
            message: "No active attendance session.",
            data: null
        };
    }

    const session = sessions[0];


    // =====================================================
    // Get Sections Associated With Session
    // =====================================================

    const [sections] = await db.query(
        `
        SELECT
            ass.section_id,
            sec.section_name,
            ass.batch_id,
            b.admission_year
        FROM attendance_session_sections ass
        INNER JOIN sections sec
            ON ass.section_id = sec.section_id
        INNER JOIN batches b
            ON ass.batch_id = b.batch_id
        WHERE ass.session_id = ?
        ORDER BY sec.section_name
        `,
        [session.session_id]
    );


    // =====================================================
    // Return Active Session
    // =====================================================

    return {
        status: 200,
        success: true,
        message: "Active attendance session retrieved successfully.",
        data: {
            sessionId: session.session_id,
            sessionCode: session.session_code,

            subject: {
                subjectId: session.subject_id,
                subjectCode: session.subject_code,
                subjectName: session.subject_name
            },

            attendanceCategory: session.attendance_category,
            presentStrength: session.present_strength,
            sessionType: session.session_type,
            attendanceMethod: session.attendance_method,

            startTime: session.start_time,
            endTime: session.end_time,

            status: session.status,

            sections: sections.map((item) => ({
                sectionId: item.section_id,
                sectionName: item.section_name,
                batchId: item.batch_id,
                admissionYear: item.admission_year
            }))
        }
    };
};
const getSessionById = async (user, sessionId) => {

    const { userId, role } = user;

    // =====================================================
    // Validate Session ID
    // =====================================================

    if (!sessionId || isNaN(sessionId)) {
        return {
            status: 400,
            success: false,
            message: "Invalid session ID."
        };
    }

    // =====================================================
    // Get Faculty ID
    // =====================================================

    const [faculty] = await db.query(
        `
        SELECT faculty_id
        FROM faculty
        WHERE user_id = ?
        `,
        [userId]
    );

    if (faculty.length === 0) {
        return {
            status: 404,
            success: false,
            message: "Faculty record not found."
        };
    }

    const facultyId = faculty[0].faculty_id;

    // =====================================================
    // Get Session
    // =====================================================

    let query = `
        SELECT
            a.session_id,
            a.session_code,
            a.subject_id,
            s.subject_code,
            s.subject_name,
            a.faculty_id,
            f.name AS faculty_name,
            a.attendance_category,
            a.present_strength,
            a.session_type,
            a.attendance_method,
            a.start_time,
            a.end_time,
            a.status,
            a.created_at
        FROM attendance_sessions a

        INNER JOIN subjects s
            ON a.subject_id = s.subject_id

        INNER JOIN faculty f
            ON a.faculty_id = f.faculty_id

        WHERE a.session_id = ?
    `;

    const params = [sessionId];

    // Faculty can only access their own sessions.
    // HOD can access any session.
    if (role === "FACULTY") {
        query += ` AND a.faculty_id = ?`;
        params.push(facultyId);
    }

    const [sessions] = await db.query(query, params);

    // =====================================================
    // Session Not Found
    // =====================================================

    if (sessions.length === 0) {
        return {
            status: 404,
            success: false,
            message: "Attendance session not found."
        };
    }

    const session = sessions[0];

    // =====================================================
    // Get Session Sections
    // =====================================================

    const [sections] = await db.query(
        `
        SELECT
            ass.section_id,
            sec.section_name,
            ass.batch_id,
            b.admission_year
        FROM attendance_session_sections ass

        INNER JOIN sections sec
            ON ass.section_id = sec.section_id

        INNER JOIN batches b
            ON ass.batch_id = b.batch_id

        WHERE ass.session_id = ?

        ORDER BY sec.section_name
        `,
        [sessionId]
    );

    // =====================================================
    // Return Session
    // =====================================================

    return {
        status: 200,
        success: true,
        message: "Attendance session retrieved successfully.",
        data: {
            sessionId: session.session_id,
            sessionCode: session.session_code,

            faculty: {
                facultyId: session.faculty_id,
                facultyName: session.faculty_name
            },

            subject: {
                subjectId: session.subject_id,
                subjectCode: session.subject_code,
                subjectName: session.subject_name
            },

            attendanceCategory: session.attendance_category,
            presentStrength: session.present_strength,
            sessionType: session.session_type,
            attendanceMethod: session.attendance_method,

            startTime: session.start_time,
            endTime: session.end_time,
            status: session.status,
            createdAt: session.created_at,

            sections: sections.map((item) => ({
                sectionId: item.section_id,
                sectionName: item.section_name,
                batchId: item.batch_id,
                admissionYear: item.admission_year
            }))
        }
    };
};
const getLiveAttendance = async (user, sessionId) => {

    const { userId, role } = user;

    // =====================================================
    // Validate Session ID
    // =====================================================

    if (!sessionId || isNaN(sessionId)) {
        return {
            status: 400,
            success: false,
            message: "Invalid session ID."
        };
    }

    // =====================================================
    // Get Faculty ID
    // =====================================================

    const [faculty] = await db.query(
        `
        SELECT faculty_id
        FROM faculty
        WHERE user_id = ?
        `,
        [userId]
    );

    if (faculty.length === 0) {
        return {
            status: 404,
            success: false,
            message: "Faculty record not found."
        };
    }

    const facultyId = faculty[0].faculty_id;

    // =====================================================
    // Verify Session Access
    // =====================================================

    let sessionQuery = `
        SELECT
            a.session_id,
            a.session_code,
            a.subject_id,
            s.subject_code,
            s.subject_name,
            a.faculty_id,
            a.present_strength,
            a.session_type,
            a.attendance_category,
            a.attendance_method,
            a.start_time,
            a.end_time,
            a.status
        FROM attendance_sessions a
        INNER JOIN subjects s
            ON a.subject_id = s.subject_id
        WHERE a.session_id = ?
    `;

    const params = [sessionId];

    // Faculty can only monitor their own sessions.
    // HOD can monitor any session.
    if (role === "FACULTY") {
        sessionQuery += ` AND a.faculty_id = ?`;
        params.push(facultyId);
    }

    const [sessions] = await db.query(sessionQuery, params);

    if (sessions.length === 0) {
        return {
            status: 404,
            success: false,
            message: "Attendance session not found."
        };
    }

    const session = sessions[0];

    // =====================================================
    // Get Attendance Submissions
    // =====================================================

    const [submissions] = await db.query(
        `
        SELECT
            ats.submission_id,
            ats.student_id,
            st.enrollment_number,
            st.name AS student_name,
            st.section_id,
            sec.section_name,
            st.batch_id,
            b.admission_year,
            ats.unique_id,
            ats.submitted_at
        FROM attendance_submissions ats

        INNER JOIN students st
            ON ats.student_id = st.student_id

        INNER JOIN sections sec
            ON st.section_id = sec.section_id

        INNER JOIN batches b
            ON st.batch_id = b.batch_id

        WHERE ats.session_id = ?

        ORDER BY ats.submitted_at ASC
        `,
        [sessionId]
    );

    // =====================================================
    // Return Live Attendance
    // =====================================================

    return {
        status: 200,
        success: true,
        message: "Live attendance retrieved successfully.",
        data: {
            sessionId: session.session_id,
            sessionCode: session.session_code,

            subject: {
                subjectId: session.subject_id,
                subjectCode: session.subject_code,
                subjectName: session.subject_name
            },

            attendanceCategory: session.attendance_category,
            sessionType: session.session_type,
            attendanceMethod: session.attendance_method,

            presentStrength: session.present_strength,
            markedCount: submissions.length,
            remainingCount: Math.max(
                session.present_strength - submissions.length,
                0
            ),

            startTime: session.start_time,
            endTime: session.end_time,
            status: session.status,

            students: submissions.map((item) => ({
                submissionId: item.submission_id,
                studentId: item.student_id,
                enrollmentNumber: item.enrollment_number,
                name: item.student_name,

                section: {
                    sectionId: item.section_id,
                    sectionName: item.section_name
                },

                batch: {
                    batchId: item.batch_id,
                    admissionYear: item.admission_year
                },

                uniqueId: item.unique_id,
                submittedAt: item.submitted_at
            }))
        }
    };
};
const endAttendanceSession = async (user, sessionId) => {

    const { userId, role } = user;

    // =====================================================
    // Validate Session ID
    // =====================================================

    if (!sessionId || isNaN(sessionId)) {
        return {
            status: 400,
            success: false,
            message: "Invalid session ID."
        };
    }

    // =====================================================
    // Get Faculty ID
    // =====================================================

    const [faculty] = await db.query(
        `
        SELECT faculty_id
        FROM faculty
        WHERE user_id = ?
        `,
        [userId]
    );

    if (faculty.length === 0) {
        return {
            status: 404,
            success: false,
            message: "Faculty record not found."
        };
    }

    const facultyId = faculty[0].faculty_id;

    // =====================================================
    // Find Session
    // =====================================================

    let query = `
        SELECT
            session_id,
            session_code,
            present_strength,
            start_time,
            end_time,
            status
        FROM attendance_sessions
        WHERE session_id = ?
    `;

    const params = [sessionId];

    // Faculty can only end their own session.
    // HOD can end any session.
    if (role === "FACULTY") {
        query += ` AND faculty_id = ?`;
        params.push(facultyId);
    }

    const [sessions] = await db.query(query, params);

    if (sessions.length === 0) {
        return {
            status: 404,
            success: false,
            message: "Attendance session not found."
        };
    }

    const session = sessions[0];

    // =====================================================
    // Check Session Status
    // =====================================================

    if (session.status === "CLOSED") {
        return {
            status: 400,
            success: false,
            message: "Attendance session is already closed."
        };
    }

    // =====================================================
    // Close Session
    // =====================================================

    await db.query(
        `
        UPDATE attendance_sessions
        SET status = 'CLOSED'
        WHERE session_id = ?
        `,
        [sessionId]
    );

    // =====================================================
    // Get Final Attendance Count
    // =====================================================

    const [result] = await db.query(
        `
        SELECT COUNT(*) AS markedCount
        FROM attendance_submissions
        WHERE session_id = ?
        `,
        [sessionId]
    );

    const markedCount = result[0].markedCount;

    // =====================================================
    // Return Response
    // =====================================================

    return {
        status: 200,
        success: true,
        message: "Attendance session closed successfully.",
        data: {
            sessionId: session.session_id,
            sessionCode: session.session_code,
            presentStrength: session.present_strength,
            markedCount: markedCount,
            absentCount: Math.max(
                session.present_strength - markedCount,
                0
            ),
            status: "CLOSED"
        }
    };
};
const getAttendanceHistory = async (user) => {

    const { userId, role } = user;

    // =====================================================
    // Get Faculty ID
    // =====================================================

    const [faculty] = await db.query(
        `
        SELECT faculty_id
        FROM faculty
        WHERE user_id = ?
        `,
        [userId]
    );

    if (faculty.length === 0) {
        return {
            status: 404,
            success: false,
            message: "Faculty record not found."
        };
    }

    const facultyId = faculty[0].faculty_id;

    // =====================================================
    // Get Attendance Sessions
    // =====================================================

    let query = `
        SELECT
            a.session_id,
            a.session_code,
            a.subject_id,
            s.subject_code,
            s.subject_name,
            a.faculty_id,
            f.name AS faculty_name,
            a.attendance_category,
            a.present_strength,
            a.session_type,
            a.attendance_method,
            a.start_time,
            a.end_time,
            a.status,
            a.created_at,

            COUNT(DISTINCT ats.submission_id) AS marked_count

        FROM attendance_sessions a

        INNER JOIN subjects s
            ON a.subject_id = s.subject_id

        INNER JOIN faculty f
            ON a.faculty_id = f.faculty_id

        LEFT JOIN attendance_submissions ats
            ON a.session_id = ats.session_id
    `;

    const params = [];

    // Faculty can see only their own sessions.
    // HOD can see all sessions.
    if (role === "FACULTY") {
        query += `
            WHERE a.faculty_id = ?
        `;

        params.push(facultyId);
    }

    query += `
        GROUP BY
            a.session_id,
            a.session_code,
            a.subject_id,
            s.subject_code,
            s.subject_name,
            a.faculty_id,
            f.name,
            a.attendance_category,
            a.present_strength,
            a.session_type,
            a.attendance_method,
            a.start_time,
            a.end_time,
            a.status,
            a.created_at

        ORDER BY a.start_time DESC
    `;

    const [sessions] = await db.query(query, params);

    // =====================================================
    // No History
    // =====================================================

    if (sessions.length === 0) {
        return {
            status: 200,
            success: true,
            message: "No attendance history found.",
            data: []
        };
    }

    // =====================================================
    // Get Sections For Each Session
    // =====================================================

    for (const session of sessions) {

        const [sections] = await db.query(
            `
            SELECT
                ass.section_id,
                sec.section_name,
                ass.batch_id,
                b.admission_year

            FROM attendance_session_sections ass

            INNER JOIN sections sec
                ON ass.section_id = sec.section_id

            INNER JOIN batches b
                ON ass.batch_id = b.batch_id

            WHERE ass.session_id = ?

            ORDER BY sec.section_name
            `,
            [session.session_id]
        );

        session.sections = sections.map((item) => ({
            sectionId: item.section_id,
            sectionName: item.section_name,
            batchId: item.batch_id,
            admissionYear: item.admission_year
        }));

        session.markedCount = Number(session.marked_count);

        session.remainingCount = Math.max(
            session.present_strength - session.markedCount,
            0
        );

        delete session.marked_count;
    }

    // =====================================================
    // Return History
    // =====================================================

    return {
        status: 200,
        success: true,
        message: "Attendance history retrieved successfully.",
        data: sessions.map((session) => ({
            sessionId: session.session_id,
            sessionCode: session.session_code,

            subject: {
                subjectId: session.subject_id,
                subjectCode: session.subject_code,
                subjectName: session.subject_name
            },

            faculty: {
                facultyId: session.faculty_id,
                facultyName: session.faculty_name
            },

            attendanceCategory: session.attendance_category,
            presentStrength: session.present_strength,
            markedCount: session.markedCount,
            remainingCount: session.remainingCount,

            sessionType: session.session_type,
            attendanceMethod: session.attendance_method,

            startTime: session.start_time,
            endTime: session.end_time,
            status: session.status,
            createdAt: session.created_at,

            sections: session.sections
        }))
    };
};
const markAttendance = async (userId, data) => {

    const {
        sessionCode,
        uniqueId
    } = data;

    // =====================================================
    // Validate Input
    // =====================================================

    if (!sessionCode) {
        return {
            status: 400,
            success: false,
            message: "Session code is required."
        };
    }

    if (
        uniqueId === undefined ||
        uniqueId === null ||
        uniqueId === ""
    ) {
        return {
            status: 400,
            success: false,
            message: "Unique ID is required."
        };
    }

    if (!Number.isInteger(Number(uniqueId))) {
        return {
            status: 400,
            success: false,
            message: "Unique ID must be a valid integer."
        };
    }

    const parsedUniqueId = Number(uniqueId);

    // =====================================================
    // Get Student
    // =====================================================

    const [students] = await db.query(
        `
        SELECT
            student_id,
            name,
            enrollment_number,
            section_id,
            batch_id
        FROM students
        WHERE user_id = ?
        `,
        [userId]
    );

    if (students.length === 0) {
        return {
            status: 404,
            success: false,
            message: "Student record not found."
        };
    }

    const student = students[0];

    // =====================================================
    // Get Attendance Session
    // =====================================================

    const [sessions] = await db.query(
        `
        SELECT
            session_id,
            session_code,
            present_strength,
            session_type,
            attendance_category,
            attendance_method,
            start_time,
            end_time,
            status
        FROM attendance_sessions
        WHERE session_code = ?
        LIMIT 1
        `,
        [sessionCode.trim().toUpperCase()]
    );

    if (sessions.length === 0) {
        return {
            status: 404,
            success: false,
            message: "Attendance session not found."
        };
    }

    const session = sessions[0];

    // =====================================================
    // Check Session Status
    // =====================================================

    if (session.status !== "ACTIVE") {
        return {
            status: 400,
            success: false,
            message: "Attendance session is closed."
        };
    }

    // =====================================================
    // Check Session Expiry
    // =====================================================

    const currentTime = new Date();
    const endTime = new Date(session.end_time);

    if (currentTime >= endTime) {
        return {
            status: 400,
            success: false,
            message: "Attendance session has expired."
        };
    }

    // =====================================================
    // Check Attendance Method
    // =====================================================

    if (session.attendance_method !== "UNIQUE_ID") {
        return {
            status: 400,
            success: false,
            message: "This attendance session does not use unique ID."
        };
    }

    // =====================================================
    // Check Unique ID Range
    // =====================================================

    if (
        parsedUniqueId < 1 ||
        parsedUniqueId > session.present_strength
    ) {
        return {
            status: 400,
            success: false,
            message:
                `Unique ID must be between 1 and ${session.present_strength}.`
        };
    }

    // =====================================================
    // Check Student Eligibility
    // =====================================================

    const [eligibility] = await db.query(
        `
        SELECT id
        FROM attendance_session_sections
        WHERE session_id = ?
        AND section_id = ?
        AND batch_id = ?
        LIMIT 1
        `,
        [
            session.session_id,
            student.section_id,
            student.batch_id
        ]
    );

    if (eligibility.length === 0) {
        return {
            status: 403,
            success: false,
            message:
                "You are not eligible to mark attendance for this session."
        };
    }

    // =====================================================
    // Check Whether Student Already Marked Attendance
    // =====================================================

    const [existingSubmission] = await db.query(
        `
        SELECT submission_id
        FROM attendance_submissions
        WHERE session_id = ?
        AND student_id = ?
        LIMIT 1
        `,
        [
            session.session_id,
            student.student_id
        ]
    );

    if (existingSubmission.length > 0) {
        return {
            status: 409,
            success: false,
            message: "You have already marked attendance for this session."
        };
    }

    // =====================================================
    // Insert Attendance
    // =====================================================

    const [submission] = await db.query(
        `
        INSERT INTO attendance_submissions
        (
            session_id,
            student_id,
            unique_id
        )
        VALUES (?, ?, ?)
        `,
        [
            session.session_id,
            student.student_id,
            parsedUniqueId
        ]
    );

    // =====================================================
    // Check Whether This Unique ID Is Duplicate
    // =====================================================

    const [duplicateCheck] = await db.query(
        `
        SELECT COUNT(*) AS count
        FROM attendance_submissions
        WHERE session_id = ?
        AND unique_id = ?
        `,
        [
            session.session_id,
            parsedUniqueId
        ]
    );

    const isDuplicate = Number(duplicateCheck[0].count) > 1;

    // =====================================================
    // Return Response
    // =====================================================

    return {
        status: 201,
        success: true,
        message: isDuplicate
            ? "Attendance marked successfully. This unique ID has been used by another student."
            : "Attendance marked successfully.",
        data: {
            submissionId: submission.insertId,
            sessionId: session.session_id,
            sessionCode: session.session_code,
            studentId: student.student_id,
            uniqueId: parsedUniqueId,
            submittedAt: new Date(),
            duplicateUniqueId: isDuplicate
        }
    };
};
const getStudentAttendance = async (userId) => {

    // =====================================================
    // Get Student
    // =====================================================

    const [students] = await db.query(
        `
        SELECT
            student_id,
            name,
            enrollment_number,
            section_id,
            batch_id
        FROM students
        WHERE user_id = ?
        `,
        [userId]
    );

    if (students.length === 0) {
        return {
            status: 404,
            success: false,
            message: "Student record not found."
        };
    }

    const student = students[0];

    // =====================================================
    // Get Subject-wise Attendance
    // =====================================================

    const [attendance] = await db.query(
        `
        SELECT
            s.subject_id,
            s.subject_code,
            s.subject_name,

            COUNT(DISTINCT ats.session_id) AS total_lectures,

            COUNT(DISTINCT CASE
                WHEN ats.student_id = ?
                THEN ats.session_id
            END) AS attended_lectures

        FROM attendance_sessions a

        INNER JOIN subjects s
            ON a.subject_id = s.subject_id

        INNER JOIN attendance_session_sections ass
            ON a.session_id = ass.session_id

        LEFT JOIN attendance_submissions ats
            ON a.session_id = ats.session_id
            AND ats.student_id = ?

        WHERE ass.section_id = ?
        AND ass.batch_id = ?
        AND a.attendance_category = 'REGULAR'

        GROUP BY
            s.subject_id,
            s.subject_code,
            s.subject_name

        ORDER BY s.subject_name
        `,
        [
            student.student_id,
            student.student_id,
            student.section_id,
            student.batch_id
        ]
    );

    // =====================================================
    // Calculate Percentage
    // =====================================================

    const subjectWiseAttendance = attendance.map((item) => {

        const totalLectures = Number(item.total_lectures);
        const attendedLectures = Number(item.attended_lectures);

        const percentage = totalLectures === 0
            ? 0
            : Number(
                ((attendedLectures / totalLectures) * 100).toFixed(2)
            );

        return {
            subjectId: item.subject_id,
            subjectCode: item.subject_code,
            subjectName: item.subject_name,
            totalLectures,
            attendedLectures,
            absentLectures: totalLectures - attendedLectures,
            attendancePercentage: percentage
        };
    });

    // =====================================================
    // Overall Attendance
    // =====================================================

    let totalLectures = 0;
    let attendedLectures = 0;

    for (const subject of subjectWiseAttendance) {
        totalLectures += subject.totalLectures;
        attendedLectures += subject.attendedLectures;
    }

    const overallPercentage = totalLectures === 0
        ? 0
        : Number(
            ((attendedLectures / totalLectures) * 100).toFixed(2)
        );

    // =====================================================
    // Return Attendance
    // =====================================================

    return {
        status: 200,
        success: true,
        message: "Student attendance retrieved successfully.",
        data: {
            student: {
                studentId: student.student_id,
                name: student.name,
                enrollmentNumber: student.enrollment_number,
                sectionId: student.section_id,
                batchId: student.batch_id
            },

            overall: {
                totalLectures,
                attendedLectures,
                absentLectures: totalLectures - attendedLectures,
                attendancePercentage: overallPercentage
            },

            subjects: subjectWiseAttendance
        }
    };
};
const getAttendanceReport = async (user) => {

    const { userId, role } = user;

    const [faculty] = await db.query(
        `
        SELECT faculty_id
        FROM faculty
        WHERE user_id = ?
        `,
        [userId]
    );

    if (faculty.length === 0) {
        return {
            status: 404,
            success: false,
            message: "Faculty record not found."
        };
    }

    const facultyId = faculty[0].faculty_id;

    let query = `
        SELECT
            a.subject_id,
            s.subject_code,
            s.subject_name,

            ass.section_id,
            sec.section_name,

            ass.batch_id,
            b.admission_year,

            a.attendance_category,
            a.session_type,

            COUNT(DISTINCT a.session_id) AS total_sessions,

            COUNT(ats.submission_id) AS total_submissions,

            COUNT(DISTINCT a.session_id) *
            MAX(a.present_strength) AS expected_attendance

        FROM attendance_sessions a

        INNER JOIN subjects s
            ON a.subject_id = s.subject_id

        INNER JOIN attendance_session_sections ass
            ON a.session_id = ass.session_id

        INNER JOIN sections sec
            ON ass.section_id = sec.section_id

        INNER JOIN batches b
            ON ass.batch_id = b.batch_id

        LEFT JOIN attendance_submissions ats
            ON a.session_id = ats.session_id
            AND ats.student_id IN (
                SELECT student_id
                FROM students
                WHERE section_id = ass.section_id
                AND batch_id = ass.batch_id
            )
    `;

    const params = [];

    if (role === "FACULTY") {
        query += `
            WHERE a.faculty_id = ?
        `;

        params.push(facultyId);
    }

    query += `
        GROUP BY
            a.subject_id,
            s.subject_code,
            s.subject_name,
            ass.section_id,
            sec.section_name,
            ass.batch_id,
            b.admission_year,
            a.attendance_category,
            a.session_type

        ORDER BY
            s.subject_name,
            sec.section_name,
            b.admission_year
    `;

    const [reports] = await db.query(query, params);

    if (reports.length === 0) {
        return {
            status: 200,
            success: true,
            message: "No attendance report data found.",
            data: []
        };
    }

    const formattedReports = reports.map((item) => {

        const totalSessions = Number(item.total_sessions);
        const totalSubmissions = Number(item.total_submissions);
        const expectedAttendance = Number(item.expected_attendance);

        const attendancePercentage =
            expectedAttendance === 0
                ? 0
                : Number(
                    (
                        (totalSubmissions / expectedAttendance) * 100
                    ).toFixed(2)
                );

        return {
            subject: {
                subjectId: item.subject_id,
                subjectCode: item.subject_code,
                subjectName: item.subject_name
            },

            section: {
                sectionId: item.section_id,
                sectionName: item.section_name
            },

            batch: {
                batchId: item.batch_id,
                admissionYear: item.admission_year
            },

            attendanceCategory: item.attendance_category,
            sessionType: item.session_type,

            totalSessions,
            totalSubmissions,
            expectedAttendance,
            attendancePercentage
        };
    });

    return {
        status: 200,
        success: true,
        message: "Attendance report generated successfully.",
        data: formattedReports
    };
};

module.exports = {
    startAttendanceSession,
    getActiveSession,
    getSessionById,
    getLiveAttendance,
    endAttendanceSession,
    getAttendanceHistory,
    markAttendance,
    getStudentAttendance,
    getAttendanceReport
};