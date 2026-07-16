const pool = require("../config/db");
const bcrypt = require("bcrypt");
const defaultPasswords = require("../utils/defaultPasswords");

const createUser = async (loggedInUser, userData) => {

    const connection = await pool.getConnection();

    try {

        await connection.beginTransaction();

        const {
            role,
            email,
            name,
            phone,

            enrollment_number,
            section_id,
            admission_year,

            designation,
            joining_date
        } = userData;

        // =============================
        // Required fields
        // =============================

        if (!role || !email || !name) {

            throw new Error("Role, email and name are required.");

        }

        // =============================
        // Valid role
        // =============================

        if (!["STUDENT", "FACULTY"].includes(role)) {

            throw new Error("Invalid role.");

        }

        // =============================
        // Permission Check
        // =============================

        if (
            loggedInUser.role === "FACULTY" &&
            role === "FACULTY"
        ) {

            throw new Error(
                "Faculty cannot create another faculty."
            );

        }

        // =============================
        // Student validation
        // =============================

        if (role === "STUDENT") {

            if (
                !enrollment_number ||
                !section_id ||
                !admission_year
            ) {

                throw new Error(
                    "Enrollment number, section and admission year are required."
                );

            }

        }

        // =============================
        // Faculty validation
        // =============================

        if (role === "FACULTY") {

            if (!designation || !joining_date) {

                throw new Error(
                    "Designation and joining date are required."
                );

            }

        }

        // =============================
        // Duplicate Email
        // =============================

        const [existingUser] = await connection.query(
            `
            SELECT user_id
            FROM users
            WHERE email = ?
            `,
            [email]
        );

        if (existingUser.length > 0) {

            throw new Error(
                "Email already exists."
            );

        }

        // =============================
        // Duplicate Enrollment
        // =============================

        if (role === "STUDENT") {

            const [student] = await connection.query(
                `
                SELECT student_id
                FROM students
                WHERE enrollment_number = ?
                `,
                [enrollment_number]
            );

            if (student.length > 0) {

                throw new Error(
                    "Enrollment number already exists."
                );

            }

        }

        // =============================
        // Check Section
        // =============================

        if (role === "STUDENT") {

            const [section] = await connection.query(
                `
                SELECT section_id
                FROM sections
                WHERE section_id = ?
                `,
                [section_id]
            );

            if (section.length === 0) {

                throw new Error(
                    "Invalid section."
                );

            }

        }

        // =============================
        // Default Password
        // =============================

        let password = "";

        if (role === "STUDENT") {

            password = defaultPasswords.STUDENT;

        } else {

            password = defaultPasswords.FACULTY;

        }

        const passwordHash = await bcrypt.hash(
            password,
            10
        );

        // =============================
        // Insert User
        // =============================

        const [userResult] = await connection.query(
            `
            INSERT INTO users
            (
                email,
                password_hash,
                role
            )
            VALUES
            (?, ?, ?)
            `,
            [
                email,
                passwordHash,
                role
            ]
        );

        const userId = userResult.insertId;
        // =============================
        // Insert Student
        // =============================

        if (role === "STUDENT") {

            await connection.query(
                `
                INSERT INTO students
                (
                    user_id,
                    enrollment_number,
                    name,
                    phone,
                    section_id,
                    admission_year
                )
                VALUES
                (?, ?, ?, ?, ?, ?)
                `,
                [
                    userId,
                    enrollment_number,
                    name,
                    phone || null,
                    section_id,
                    admission_year
                ]
            );

        }

        // =============================
        // Insert Faculty
        // =============================

        if (role === "FACULTY") {

            await connection.query(
                `
                INSERT INTO faculty
                (
                    user_id,
                    name,
                    designation,
                    phone,
                    joining_date
                )
                VALUES
                (?, ?, ?, ?, ?)
                `,
                [
                    userId,
                    name,
                    designation,
                    phone || null,
                    joining_date
                ]
            );

        }

        await connection.commit();

        return {
            success: true,
            message: `${role} created successfully.`,
            userId: userId
        };

    } catch (error) {

        await connection.rollback();

        throw error;

    } finally {

        connection.release();

    }

};

const getAllUsers = async (query) => {

    try {

        const { role, is_active } = query;

        let sql = `
            SELECT
                u.user_id,
                u.email,
                u.role,
                u.is_active,
                u.created_at,
                s.name,
                s.phone,
                s.enrollment_number,
                s.section_id,
                NULL AS designation
            FROM users u
            JOIN students s
                ON u.user_id = s.user_id

            UNION ALL

            SELECT
                u.user_id,
                u.email,
                u.role,
                u.is_active,
                u.created_at,
                f.name,
                f.phone,
                NULL,
                NULL,
                f.designation
            FROM users u
            JOIN faculty f
                ON u.user_id = f.user_id
        `;

        const conditions = [];
        const values = [];

        if (role) {
            conditions.push("role = ?");
            values.push(role);
        }

        if (is_active !== undefined) {
            conditions.push("is_active = ?");
            values.push(is_active === "true");
        }

        if (conditions.length > 0) {

            sql = `
                SELECT *
                FROM (
                    ${sql}
                ) AS users
                WHERE ${conditions.join(" AND ")}
                ORDER BY role, name
            `;

        } else {

            sql = `
                SELECT *
                FROM (
                    ${sql}
                ) AS users
                ORDER BY role, user_id
            `;

        }

        const [users] = await pool.query(sql, values);

        return users;

    } catch (error) {

        throw error;

    }

};

const getUserById = async (id) => {

    try {

        const [student] = await pool.query(
            `
            SELECT
                u.user_id,
                u.email,
                u.role,
                u.is_active,
                u.is_first_login,
                u.last_login,
                u.created_at,

                s.student_id,
                s.name,
                s.phone,
                s.enrollment_number,
                s.section_id,
                s.admission_year

            FROM users u

            JOIN students s
                ON u.user_id = s.user_id

            WHERE u.user_id = ?
            `,
            [id]
        );

        if (student.length > 0) {

            return student[0];

        }

        const [faculty] = await pool.query(
            `
            SELECT
                u.user_id,
                u.email,
                u.role,
                u.is_active,
                u.is_first_login,
                u.last_login,
                u.created_at,

                f.faculty_id,
                f.name,
                f.phone,
                f.designation,
                f.joining_date

            FROM users u

            JOIN faculty f
                ON u.user_id = f.user_id

            WHERE u.user_id = ?
            `,
            [id]
        );

        if (faculty.length > 0) {

            return faculty[0];

        }

        const [hod] = await pool.query(
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
            AND role = 'HOD'
            `,
            [id]
        );

        if (hod.length > 0) {

            return hod[0];

        }

        throw new Error("User not found.");

    } catch (error) {

        throw error;

    }

};

const updateUser = async (userId, userData) => {

    const connection = await pool.getConnection();

    try {

        await connection.beginTransaction();

        const {
            email,
            name,
            phone,
            section_id,
            admission_year,
            designation,
            joining_date
        } = userData;

        // =============================
        // Check User Exists
        // =============================

        const [users] = await connection.query(
            `
            SELECT *
            FROM users
            WHERE user_id = ?
            `,
            [userId]
        );

        if (users.length === 0) {

            throw new Error("User not found.");

        }

        const user = users[0];

        // =============================
        // Check Duplicate Email
        // =============================

        if (email) {

            const [existingEmail] = await connection.query(
                `
                SELECT user_id
                FROM users
                WHERE email = ?
                AND user_id <> ?
                `,
                [email, userId]
            );

            if (existingEmail.length > 0) {

                throw new Error("Email already exists.");

            }

        }

        // =============================
        // Student Validation
        // =============================

        if (user.role === "STUDENT") {

            if (section_id) {

                const [section] = await connection.query(
                    `
                    SELECT section_id
                    FROM sections
                    WHERE section_id = ?
                    `,
                    [section_id]
                );

                if (section.length === 0) {

                    throw new Error("Invalid section.");

                }

            }

        }
                // =============================
        // Update users table
        // =============================

        if (email) {

            await connection.query(
                `
                UPDATE users
                SET email = ?
                WHERE user_id = ?
                `,
                [email, userId]
            );

        }

        // =============================
        // Update Student
        // =============================

        if (user.role === "STUDENT") {

            await connection.query(
                `
                UPDATE students
                SET
                    name = COALESCE(?, name),
                    phone = COALESCE(?, phone),
                    section_id = COALESCE(?, section_id),
                    admission_year = COALESCE(?, admission_year)
                WHERE user_id = ?
                `,
                [
                    name,
                    phone,
                    section_id,
                    admission_year,
                    userId
                ]
            );

        }

        // =============================
        // Update Faculty
        // =============================

        if (user.role === "FACULTY") {

            await connection.query(
                `
                UPDATE faculty
                SET
                    name = COALESCE(?, name),
                    phone = COALESCE(?, phone),
                    designation = COALESCE(?, designation),
                    joining_date = COALESCE(?, joining_date)
                WHERE user_id = ?
                `,
                [
                    name,
                    phone,
                    designation,
                    joining_date,
                    userId
                ]
            );

        }

        await connection.commit();

        return {
            success: true,
            message: "User updated successfully."
        };

    } catch (error) {

        await connection.rollback();
        throw error;

    } finally {

        connection.release();

    }

};

const updateUserStatus = async (userId, loggedInUserId, isActive) => {

    try {

        if (typeof isActive !== "boolean") {
            throw new Error("is_active must be true or false.");
        }

        const [users] = await pool.query(
            `
            SELECT user_id
            FROM users
            WHERE user_id = ?
            `,
            [userId]
        );

        if (users.length === 0) {
            throw new Error("User not found.");
        }

        // Prevent self deactivation
        if (Number(userId) === Number(loggedInUserId)) {
            throw new Error("You cannot deactivate your own account.");
        }

        await pool.query(
            `
            UPDATE users
            SET is_active = ?
            WHERE user_id = ?
            `,
            [
                isActive,
                userId
            ]
        );

        return {
            success: true,
            message: `User has been ${isActive ? "activated" : "deactivated"} successfully.`
        };

    } catch (error) {

        throw error;

    }

};

module.exports = {
    createUser,
    getAllUsers,
    getUserById,
    updateUser,
    updateUserStatus
};