const pool = require("../config/db");


// =====================================================
// Get Logged-in User Profile
// =====================================================

const getProfile = async (user) => {

    try {

        // =============================================
        // 1. Get common user information
        // =============================================

        const [userRows] = await pool.query(
            `
            SELECT
                user_id,
                email,
                role,
                is_active,
                is_first_login,
                last_login,
                created_at
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
        // 2. Student Profile
        // =============================================

        if (userData.role === "STUDENT") {

            const [studentRows] = await pool.query(
                `
                SELECT
                    s.student_id,
                    s.enrollment_number,
                    s.name,
                    s.phone,
                    s.section_id,
                    sec.section_name,
                    s.batch_id,
                    b.admission_year

                FROM students s

                JOIN sections sec
                    ON s.section_id = sec.section_id

                JOIN batches b
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


            return {
                statusCode: 200,
                message: "Profile fetched successfully.",
                data: {
                    userId: userData.user_id,
                    email: userData.email,
                    role: userData.role,

                    studentId: student.student_id,
                    enrollmentNumber: student.enrollment_number,

                    name: student.name,
                    phone: student.phone,

                    sectionId: student.section_id,
                    sectionName: student.section_name,

                    batchId: student.batch_id,
                    admissionYear: student.admission_year,

                    isActive: userData.is_active,
                    isFirstLogin: userData.is_first_login,
                    lastLogin: userData.last_login,
                    createdAt: userData.created_at
                }
            };

        }


        // =============================================
        // 3. Faculty / HOD Profile
        // =============================================

        if (
            userData.role === "FACULTY" ||
            userData.role === "HOD"
        ) {

            const [facultyRows] = await pool.query(
                `
                SELECT
                    f.faculty_id,
                    f.name,
                    f.designation,
                    f.phone,
                    f.joining_date

                FROM faculty f

                WHERE f.user_id = ?
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


            return {
                statusCode: 200,
                message: "Profile fetched successfully.",
                data: {
                    userId: userData.user_id,
                    email: userData.email,
                    role: userData.role,

                    facultyId: faculty.faculty_id,

                    name: faculty.name,
                    designation: faculty.designation,
                    phone: faculty.phone,
                    joiningDate: faculty.joining_date,

                    isActive: userData.is_active,
                    isFirstLogin: userData.is_first_login,
                    lastLogin: userData.last_login,
                    createdAt: userData.created_at
                }
            };

        }


        // =============================================
        // 4. Invalid Role
        // =============================================

        const error = new Error("Invalid user role.");
        error.statusCode = 400;

        throw error;

    } catch (error) {

        throw error;

    }

};


// =====================================================
// Update Logged-in User Profile
// =====================================================

const updateProfile = async (user, userData) => {

    const connection = await pool.getConnection();

    try {

        await connection.beginTransaction();


        // =============================================
        // 1. Check User Exists
        // =============================================

        const [users] = await connection.query(
            `
            SELECT
                user_id,
                email,
                role
            FROM users
            WHERE user_id = ?
            `,
            [user.userId]
        );

        if (users.length === 0) {

            const error = new Error("User not found.");
            error.statusCode = 404;

            throw error;

        }

        const currentUser = users[0];


        // =============================================
        // 2. Allowed Fields
        // =============================================

        const {
            email,
            name,
            phone
        } = userData;


        // =============================================
        // 3. Validate Email
        // =============================================

        if (email !== undefined) {

            if (
                typeof email !== "string" ||
                !email.trim()
            ) {

                const error = new Error(
                    "Email cannot be empty."
                );

                error.statusCode = 400;
                throw error;

            }

            const cleanEmail =
                email.trim().toLowerCase();

            const emailRegex =
                /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

            if (!emailRegex.test(cleanEmail)) {

                const error = new Error(
                    "Please provide a valid email."
                );

                error.statusCode = 400;
                throw error;

            }


            // =========================================
            // Check Duplicate Email
            // =========================================

            const [existingEmail] = await connection.query(
                `
                SELECT user_id
                FROM users
                WHERE email = ?
                AND user_id <> ?
                `,
                [
                    cleanEmail,
                    user.userId
                ]
            );

            if (existingEmail.length > 0) {

                const error = new Error(
                    "Email already exists."
                );

                error.statusCode = 409;
                throw error;

            }


            // =========================================
            // Update Email
            // =========================================

            await connection.query(
                `
                UPDATE users
                SET email = ?
                WHERE user_id = ?
                `,
                [
                    cleanEmail,
                    user.userId
                ]
            );

        }


        // =============================================
        // 4. Validate Name
        // =============================================

        if (name !== undefined) {

            if (
                typeof name !== "string" ||
                !name.trim()
            ) {

                const error = new Error(
                    "Name cannot be empty."
                );

                error.statusCode = 400;
                throw error;

            }

        }


        // =============================================
        // 5. Validate Phone
        // =============================================

        if (phone !== undefined && phone !== null) {

            if (
                typeof phone !== "string" ||
                !/^[0-9]{10,15}$/.test(phone.trim())
            ) {

                const error = new Error(
                    "Phone must contain 10 to 15 digits."
                );

                error.statusCode = 400;
                throw error;

            }

        }


        // =============================================
        // 6. Update Student Profile
        // =============================================

        if (currentUser.role === "STUDENT") {

            await connection.query(
                `
                UPDATE students
                SET
                    name = COALESCE(?, name),
                    phone = COALESCE(?, phone)
                WHERE user_id = ?
                `,
                [
                    name !== undefined
                        ? name.trim()
                        : null,

                    phone !== undefined
                        ? phone
                        : null,

                    user.userId
                ]
            );

        }


        // =============================================
        // 7. Update Faculty / HOD Profile
        // =============================================

        if (
            currentUser.role === "FACULTY" ||
            currentUser.role === "HOD"
        ) {

            await connection.query(
                `
                UPDATE faculty
                SET
                    name = COALESCE(?, name),
                    phone = COALESCE(?, phone)
                WHERE user_id = ?
                `,
                [
                    name !== undefined
                        ? name.trim()
                        : null,

                    phone !== undefined
                        ? phone
                        : null,

                    user.userId
                ]
            );

        }


        // =============================================
        // 8. Commit Transaction
        // =============================================

        await connection.commit();


        // =============================================
        // 9. Return Updated Profile
        // =============================================

        return await getProfile(user);

    } catch (error) {

        await connection.rollback();

        throw error;

    } finally {

        connection.release();

    }

};


module.exports = {
    getProfile,
    updateProfile
};