const pool = require("../config/db");


// =====================================================
// Get Dashboard Data
// =====================================================

const getDashboard = async (user) => {

    try {

        // =============================================
        // 1. Get Basic User Information
        // =============================================

        const [userRows] = await pool.query(
            `
            SELECT
                user_id,
                email,
                role,
                is_active,
                last_login
            FROM users
            WHERE user_id = ?
            `,
            [user.userId]
        );

        if (userRows.length === 0) {

            const error = new Error("User not found.");
            error.statusCode = 404;

            throw error;
        }

        const userData = userRows[0];


        // =============================================
        // 2. STUDENT DASHBOARD
        // =============================================

        if (userData.role === "STUDENT") {

            // -----------------------------------------
            // Student Profile
            // -----------------------------------------

            const [studentRows] = await pool.query(
                `
                SELECT
                    s.student_id,
                    s.name,
                    s.enrollment_number,
                    s.section_id,
                    sec.section_name,
                    s.batch_id,
                    b.admission_year

                FROM students s

                INNER JOIN sections sec
                    ON s.section_id = sec.section_id

                INNER JOIN batches b
                    ON s.batch_id = b.batch_id

                WHERE s.user_id = ?
                `,
                [user.userId]
            );


            if (studentRows.length === 0) {

                const error = new Error(
                    "Student profile not found."
                );

                error.statusCode = 404;

                throw error;
            }


            const student = studentRows[0];


            // -----------------------------------------
            // Attendance Summary
            // -----------------------------------------

            const [attendanceRows] = await pool.query(
                `
                SELECT
                    COUNT(DISTINCT a.session_id) AS total_lectures,

                    COUNT(
                        DISTINCT CASE
                            WHEN ats.student_id = ?
                            THEN ats.session_id
                        END
                    ) AS attended_lectures

                FROM attendance_sessions a

                INNER JOIN attendance_session_sections ass
                    ON a.session_id = ass.session_id

                LEFT JOIN attendance_submissions ats
                    ON a.session_id = ats.session_id
                    AND ats.student_id = ?

                WHERE ass.section_id = ?
                AND ass.batch_id = ?
                AND a.attendance_category = 'REGULAR'
                `,
                [
                    student.student_id,
                    student.student_id,
                    student.section_id,
                    student.batch_id
                ]
            );


            const totalLectures =
                Number(attendanceRows[0].total_lectures || 0);

            const attendedLectures =
                Number(attendanceRows[0].attended_lectures || 0);

            const absentLectures =
                totalLectures - attendedLectures;

            const attendancePercentage =
                totalLectures === 0
                    ? 0
                    : Number(
                        (
                            (attendedLectures / totalLectures) *
                            100
                        ).toFixed(2)
                    );


            // -----------------------------------------
            // Marks Summary
            // -----------------------------------------

            const [marksRows] = await pool.query(
                `
                SELECT
                    COUNT(*) AS total_marks,
                    COALESCE(
                        AVG(
                            (em.marks_obtained / e.max_marks) * 100
                        ),
                        0
                    ) AS average_percentage

                FROM exam_marks em

                INNER JOIN exams e
                    ON em.exam_id = e.exam_id

                WHERE em.student_id = ?
                `,
                [student.student_id]
            );


            const totalMarks =
                Number(marksRows[0].total_marks || 0);

            const averagePercentage =
                Number(
                    Number(
                        marksRows[0].average_percentage || 0
                    ).toFixed(2)
                );


            // -----------------------------------------
            // Recent Notices
            // -----------------------------------------

            const [notices] = await pool.query(
                `
                SELECT
                    n.notice_id,
                    n.title,
                    n.description,
                    n.priority,
                    n.created_at,
                    n.updated_at,

                    f.name AS posted_by_name

                FROM notices n

                INNER JOIN faculty f
                    ON n.posted_by = f.faculty_id

                ORDER BY n.created_at DESC

                LIMIT 5
                `
            );


            // -----------------------------------------
            // Return Student Dashboard
            // -----------------------------------------

            return {
                statusCode: 200,

                message: "Dashboard data fetched successfully.",

                data: {

                    role: userData.role,

                    profile: {
                        name: student.name,
                        enrollmentNumber:
                            student.enrollment_number,

                        section: {
                            sectionId:
                                student.section_id,

                            sectionName:
                                student.section_name
                        },

                        batch: {
                            batchId:
                                student.batch_id,

                            admissionYear:
                                student.admission_year
                        }
                    },

                    attendance: {
                        totalLectures,
                        attendedLectures,
                        absentLectures,
                        attendancePercentage
                    },

                    marks: {
                        totalMarks,
                        averagePercentage
                    },

                    recentNotices: notices
                }
            };
        }


        // =============================================
        // 3. FACULTY DASHBOARD
        // =============================================

        if (userData.role === "FACULTY") {

            // -----------------------------------------
            // Faculty Profile
            // -----------------------------------------

            const [facultyRows] = await pool.query(
                `
                SELECT
                    faculty_id,
                    name,
                    designation

                FROM faculty

                WHERE user_id = ?
                `,
                [user.userId]
            );


            if (facultyRows.length === 0) {

                const error = new Error(
                    "Faculty profile not found."
                );

                error.statusCode = 404;

                throw error;
            }


            const faculty = facultyRows[0];


            // -----------------------------------------
            // Assigned Subject/Section Count
            // -----------------------------------------

            const [allocationRows] = await pool.query(
                `
                SELECT
                    COUNT(*) AS total_allocations,
                    COUNT(DISTINCT subject_id) AS total_subjects

                FROM faculty_subject_section

                WHERE faculty_id = ?
                `,
                [faculty.faculty_id]
            );


            // -----------------------------------------
            // Attendance Session Count
            // -----------------------------------------

            const [attendanceRows] = await pool.query(
                `
                SELECT
                    COUNT(*) AS total_sessions

                FROM attendance_sessions

                WHERE faculty_id = ?
                `,
                [faculty.faculty_id]
            );


            // -----------------------------------------
            // Notice Count
            // -----------------------------------------

            const [noticeRows] = await pool.query(
                `
                SELECT
                    COUNT(*) AS total_notices

                FROM notices

                WHERE posted_by = ?
                `,
                [faculty.faculty_id]
            );


            // -----------------------------------------
            // Recent Notices
            // -----------------------------------------

            const [recentNotices] = await pool.query(
                `
                SELECT
                    notice_id,
                    title,
                    description,
                    priority,
                    created_at,
                    updated_at

                FROM notices

                WHERE posted_by = ?

                ORDER BY created_at DESC

                LIMIT 5
                `,
                [faculty.faculty_id]
            );


            // -----------------------------------------
            // Return Faculty Dashboard
            // -----------------------------------------

            return {
                statusCode: 200,

                message: "Dashboard data fetched successfully.",

                data: {

                    role: userData.role,

                    profile: {
                        name: faculty.name,
                        designation: faculty.designation
                    },

                    statistics: {
                        totalSubjects:
                            Number(
                                allocationRows[0].total_subjects || 0
                            ),

                        totalAllocations:
                            Number(
                                allocationRows[0].total_allocations || 0
                            ),

                        totalAttendanceSessions:
                            Number(
                                attendanceRows[0].total_sessions || 0
                            ),

                        totalNotices:
                            Number(
                                noticeRows[0].total_notices || 0
                            )
                    },

                    recentNotices
                }
            };
        }


        // =============================================
        // 4. HOD DASHBOARD
        // =============================================

        if (userData.role === "HOD") {

            // -----------------------------------------
            // HOD Profile
            // -----------------------------------------

            const [hodRows] = await pool.query(
                `
                SELECT
                    faculty_id,
                    name,
                    designation

                FROM faculty

                WHERE user_id = ?
                `,
                [user.userId]
            );


            if (hodRows.length === 0) {

                const error = new Error(
                    "HOD faculty profile not found."
                );

                error.statusCode = 404;

                throw error;
            }


            const hod = hodRows[0];


            // -----------------------------------------
            // Student Count
            // -----------------------------------------

            const [studentRows] = await pool.query(
                `
                SELECT
                    COUNT(*) AS total_students

                FROM students
                `
            );


            // -----------------------------------------
            // Faculty Count
            // -----------------------------------------

            const [facultyRows] = await pool.query(
                `
                SELECT
                    COUNT(*) AS total_faculty

                FROM users

                WHERE role = 'FACULTY'
                AND is_active = TRUE
                `
            );


            // -----------------------------------------
            // Subject Count
            // -----------------------------------------

            const [subjectRows] = await pool.query(
                `
                SELECT
                    COUNT(*) AS total_subjects

                FROM subjects
                `
            );


            // -----------------------------------------
            // Active Attendance Sessions
            // -----------------------------------------

            const [attendanceRows] = await pool.query(
                `
                SELECT
                    COUNT(*) AS active_sessions

                FROM attendance_sessions

                WHERE status = 'ACTIVE'
                AND end_time > NOW()
                `
            );


            // -----------------------------------------
            // Total Notices
            // -----------------------------------------

            const [noticeRows] = await pool.query(
                `
                SELECT
                    COUNT(*) AS total_notices

                FROM notices
                `
            );


            // -----------------------------------------
            // Recent Notices
            // -----------------------------------------

            const [recentNotices] = await pool.query(
                `
                SELECT
                    n.notice_id,
                    n.title,
                    n.description,
                    n.priority,
                    n.created_at,
                    n.updated_at,

                    f.name AS posted_by_name

                FROM notices n

                INNER JOIN faculty f
                    ON n.posted_by = f.faculty_id

                ORDER BY n.created_at DESC

                LIMIT 5
                `
            );


            // -----------------------------------------
            // Return HOD Dashboard
            // -----------------------------------------

            return {
                statusCode: 200,

                message: "Dashboard data fetched successfully.",

                data: {

                    role: userData.role,

                    profile: {
                        name: hod.name,
                        designation: hod.designation
                    },

                    statistics: {

                        totalStudents:
                            Number(
                                studentRows[0].total_students || 0
                            ),

                        totalFaculty:
                            Number(
                                facultyRows[0].total_faculty || 0
                            ),

                        totalSubjects:
                            Number(
                                subjectRows[0].total_subjects || 0
                            ),

                        activeAttendanceSessions:
                            Number(
                                attendanceRows[0].active_sessions || 0
                            ),

                        totalNotices:
                            Number(
                                noticeRows[0].total_notices || 0
                            )
                    },

                    recentNotices
                }
            };
        }


        // =============================================
        // 5. Invalid Role
        // =============================================

        const error = new Error(
            "Invalid user role."
        );

        error.statusCode = 400;

        throw error;

    } catch (error) {

        throw error;

    }

};


module.exports = {
    getDashboard
};