const pool = require("../config/db");

const createNotice = async (user, data) => {
    try {

        const {
            title,
            description,
            priority
        } = data;

        // -----------------------------------------
        // 1. Validate required fields
        // -----------------------------------------

        if (!title || !description) {
            const error = new Error(
                "title and description are required"
            );
            error.statusCode = 400;
            throw error;
        }

        // -----------------------------------------
        // 2. Validate title
        // -----------------------------------------

        if (!title.trim()) {
            const error = new Error(
                "Title cannot be empty"
            );
            error.statusCode = 400;
            throw error;
        }

        // -----------------------------------------
        // 3. Validate description
        // -----------------------------------------

        if (!description.trim()) {
            const error = new Error(
                "Description cannot be empty"
            );
            error.statusCode = 400;
            throw error;
        }

        // -----------------------------------------
        // 4. Validate priority
        // -----------------------------------------

        const validPriorities = [
            "LOW",
            "MEDIUM",
            "HIGH"
        ];

        const noticePriority = priority || "MEDIUM";

        if (!validPriorities.includes(noticePriority)) {
            const error = new Error(
                "Priority must be LOW, MEDIUM or HIGH"
            );
            error.statusCode = 400;
            throw error;
        }

        // -----------------------------------------
        // 5. Get faculty ID from authenticated user
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
        // 6. Create notice
        // -----------------------------------------

        const [result] = await pool.execute(
            `INSERT INTO notices
            (
                title,
                description,
                priority,
                posted_by
            )
            VALUES (?, ?, ?, ?)`,
            [
                title.trim(),
                description.trim(),
                noticePriority,
                facultyId
            ]
        );

        // -----------------------------------------
        // 7. Return created notice
        // -----------------------------------------

        const [noticeRows] = await pool.execute(
            `SELECT
                notice_id,
                title,
                description,
                priority,
                posted_by,
                created_at,
                updated_at
             FROM notices
             WHERE notice_id = ?`,
            [result.insertId]
        );

        return {
            statusCode: 201,
            message: "Notice created successfully",
            data: noticeRows[0]
        };

    } catch (error) {
        throw error;
    }
};
const getAllNotices = async () => {
    try {

        // -----------------------------------------
        // 1. Fetch all notices
        // -----------------------------------------

        const [rows] = await pool.execute(
            `SELECT
                n.notice_id,
                n.title,
                n.description,
                n.priority,
                n.posted_by,
                f.name AS posted_by_name,
                n.created_at,
                n.updated_at
             FROM notices n
             INNER JOIN faculty f
                ON n.posted_by = f.faculty_id
             ORDER BY
                n.created_at DESC`
        );

        // -----------------------------------------
        // 2. Return notices
        // -----------------------------------------

        return {
            statusCode: 200,
            message: "Notices fetched successfully",
            data: rows
        };

    } catch (error) {
        throw error;
    }
};
const getNoticeById = async (noticeId) => {
    try {
        // -----------------------------------------
        // 1. Validate noticeId
        // -----------------------------------------

        if (!noticeId || !Number.isInteger(Number(noticeId))) {
            const error = new Error("Valid noticeId is required");
            error.statusCode = 400;
            throw error;
        }

        // -----------------------------------------
        // 2. Get notice
        // -----------------------------------------

        const [rows] = await pool.execute(
            `SELECT
                n.notice_id,
                n.title,
                n.description,
                n.priority,
                n.posted_by,
                f.name AS posted_by_name,
                n.created_at,
                n.updated_at
             FROM notices n
             INNER JOIN faculty f
                ON n.posted_by = f.faculty_id
             WHERE n.notice_id = ?`,
            [noticeId]
        );

        // -----------------------------------------
        // 3. Notice not found
        // -----------------------------------------

        if (rows.length === 0) {
            const error = new Error("Notice not found");
            error.statusCode = 404;
            throw error;
        }

        return {
            statusCode: 200,
            message: "Notice fetched successfully",
            data: rows[0]
        };

    } catch (error) {
        throw error;
    }
};
const updateNotice = async (user, noticeId, data) => {
    try {
        // -----------------------------------------
        // 1. Validate noticeId
        // -----------------------------------------

        if (!noticeId || !Number.isInteger(Number(noticeId))) {
            const error = new Error("Valid noticeId is required");
            error.statusCode = 400;
            throw error;
        }

        // -----------------------------------------
        // 2. Get existing notice
        // -----------------------------------------

        const [noticeRows] = await pool.execute(
            `SELECT
                notice_id,
                title,
                description,
                priority,
                posted_by
             FROM notices
             WHERE notice_id = ?`,
            [noticeId]
        );

        if (noticeRows.length === 0) {
            const error = new Error("Notice not found");
            error.statusCode = 404;
            throw error;
        }

        const existingNotice = noticeRows[0];

        // -----------------------------------------
        // 3. Get logged-in faculty ID
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
        // 4. Check ownership
        // -----------------------------------------

        if (
            user.role === "FACULTY" &&
            existingNotice.posted_by !== facultyId
        ) {
            const error = new Error(
                "You can only update your own notices"
            );
            error.statusCode = 403;
            throw error;
        }

        // -----------------------------------------
        // 5. Use existing values if not provided
        // -----------------------------------------

        const updatedTitle =
            data.title !== undefined
                ? data.title
                : existingNotice.title;

        const updatedDescription =
            data.description !== undefined
                ? data.description
                : existingNotice.description;

        const updatedPriority =
            data.priority !== undefined
                ? data.priority
                : existingNotice.priority;

        // -----------------------------------------
        // 6. Validate title
        // -----------------------------------------

        if (
            typeof updatedTitle !== "string" ||
            !updatedTitle.trim()
        ) {
            const error = new Error(
                "Title cannot be empty"
            );
            error.statusCode = 400;
            throw error;
        }

        // -----------------------------------------
        // 7. Validate description
        // -----------------------------------------

        if (
            typeof updatedDescription !== "string" ||
            !updatedDescription.trim()
        ) {
            const error = new Error(
                "Description cannot be empty"
            );
            error.statusCode = 400;
            throw error;
        }

        // -----------------------------------------
        // 8. Validate priority
        // -----------------------------------------

        const validPriorities = [
            "LOW",
            "MEDIUM",
            "HIGH"
        ];

        if (!validPriorities.includes(updatedPriority)) {
            const error = new Error(
                "Priority must be LOW, MEDIUM or HIGH"
            );
            error.statusCode = 400;
            throw error;
        }

        // -----------------------------------------
        // 9. Update notice
        // -----------------------------------------

        await pool.execute(
            `UPDATE notices
             SET title = ?,
                 description = ?,
                 priority = ?,
                 updated_at = CURRENT_TIMESTAMP
             WHERE notice_id = ?`,
            [
                updatedTitle.trim(),
                updatedDescription.trim(),
                updatedPriority,
                noticeId
            ]
        );

        // -----------------------------------------
        // 10. Get updated notice
        // -----------------------------------------

        const [updatedRows] = await pool.execute(
            `SELECT
                n.notice_id,
                n.title,
                n.description,
                n.priority,
                n.posted_by,
                f.name AS posted_by_name,
                n.created_at,
                n.updated_at
             FROM notices n
             INNER JOIN faculty f
                 ON n.posted_by = f.faculty_id
             WHERE n.notice_id = ?`,
            [noticeId]
        );

        return {
            statusCode: 200,
            message: "Notice updated successfully",
            data: updatedRows[0]
        };

    } catch (error) {
        throw error;
    }
};
const deleteNotice = async (user, noticeId) => {
    try {
        // -----------------------------------------
        // 1. Validate noticeId
        // -----------------------------------------

        if (!noticeId || !Number.isInteger(Number(noticeId))) {
            const error = new Error("Valid noticeId is required");
            error.statusCode = 400;
            throw error;
        }

        // -----------------------------------------
        // 2. Get existing notice
        // -----------------------------------------

        const [noticeRows] = await pool.execute(
            `SELECT
                notice_id,
                title,
                posted_by
             FROM notices
             WHERE notice_id = ?`,
            [noticeId]
        );

        if (noticeRows.length === 0) {
            const error = new Error("Notice not found");
            error.statusCode = 404;
            throw error;
        }

        const notice = noticeRows[0];

        // -----------------------------------------
        // 3. Get logged-in faculty ID
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
        // 4. Check ownership
        // -----------------------------------------

        if (
            user.role === "FACULTY" &&
            notice.posted_by !== facultyId
        ) {
            const error = new Error(
                "You can only delete your own notices"
            );
            error.statusCode = 403;
            throw error;
        }

        // -----------------------------------------
        // 5. Delete notice
        // -----------------------------------------

        await pool.execute(
            `DELETE FROM notices
             WHERE notice_id = ?`,
            [noticeId]
        );

        // -----------------------------------------
        // 6. Return response
        // -----------------------------------------

        return {
            statusCode: 200,
            message: "Notice deleted successfully",
            data: {
                noticeId: Number(noticeId)
            }
        };

    } catch (error) {
        throw error;
    }
};

module.exports = {
    createNotice,
    getAllNotices,
    getNoticeById,
    updateNotice,
    deleteNotice
};