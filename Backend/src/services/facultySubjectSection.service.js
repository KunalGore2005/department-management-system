
const pool = require("../config/db");

// =====================================================
// Get Faculty-Subject-Section Allocations
// =====================================================

const getAllAllocations = async (user) => {
    let sql = `
        SELECT
            fss.allocation_id,
            fss.faculty_id,
            f.name AS faculty_name,
            f.designation,

            fss.subject_id,
            sub.subject_code,
            sub.subject_name,

            fss.section_id,
            sec.section_name,

            fss.batch_id,
            b.admission_year

        FROM faculty_subject_section fss

        INNER JOIN faculty f
            ON fss.faculty_id = f.faculty_id

        INNER JOIN subjects sub
            ON fss.subject_id = sub.subject_id

        INNER JOIN sections sec
            ON fss.section_id = sec.section_id
            AND fss.batch_id = sec.batch_id

        INNER JOIN batches b
            ON fss.batch_id = b.batch_id
    `;

    const params = [];

    // Faculty can only view their own allocations
    if (user.role === "FACULTY") {
        const [facultyRows] = await pool.query(
            `SELECT faculty_id
             FROM faculty
             WHERE user_id = ?`,
            [user.userId]
        );

        if (facultyRows.length === 0) {
            const error = new Error("Faculty profile not found.");
            error.statusCode = 404;
            throw error;
        }

        sql += ` WHERE fss.faculty_id = ?`;
        params.push(facultyRows[0].faculty_id);
    }

    sql += `
        ORDER BY
            b.admission_year DESC,
            sec.section_name ASC,
            sub.subject_name ASC
    `;

    const [allocations] = await pool.query(sql, params);

    return allocations;
};


// =====================================================
// Get Allocations By Faculty
// =====================================================

const getAllocationsByFaculty = async (facultyId) => {

    if (!facultyId || !Number.isInteger(Number(facultyId))) {
        const error = new Error("Valid faculty ID is required.");
        error.statusCode = 400;
        throw error;
    }

    const [facultyRows] = await pool.query(
        `SELECT faculty_id, name, designation
         FROM faculty
         WHERE faculty_id = ?`,
        [facultyId]
    );

    if (facultyRows.length === 0) {
        const error = new Error("Faculty not found.");
        error.statusCode = 404;
        throw error;
    }

    const [allocations] = await pool.query(
        `
        SELECT
            fss.allocation_id,
            fss.subject_id,
            sub.subject_code,
            sub.subject_name,

            fss.section_id,
            sec.section_name,

            fss.batch_id,
            b.admission_year

        FROM faculty_subject_section fss

        INNER JOIN subjects sub
            ON fss.subject_id = sub.subject_id

        INNER JOIN sections sec
            ON fss.section_id = sec.section_id
            AND fss.batch_id = sec.batch_id

        INNER JOIN batches b
            ON fss.batch_id = b.batch_id

        WHERE fss.faculty_id = ?

        ORDER BY
            b.admission_year DESC,
            sec.section_name ASC,
            sub.subject_name ASC
        `,
        [facultyId]
    );

    return {
        faculty: facultyRows[0],
        allocations
    };
};


// =====================================================
// Create Allocation
// =====================================================

const createAllocation = async (data) => {

    const {
        facultyId,
        subjectId,
        sectionId,
        batchId
    } = data;

    if (!facultyId || !subjectId || !sectionId || !batchId) {
        const error = new Error(
            "Faculty ID, Subject ID, Section ID and Batch ID are required."
        );
        error.statusCode = 400;
        throw error;
    }

    const ids = [facultyId, subjectId, sectionId, batchId];

    if (!ids.every(id => Number.isInteger(Number(id)) && Number(id) > 0)) {
        const error = new Error("All IDs must be valid positive integers.");
        error.statusCode = 400;
        throw error;
    }

    const connection = await pool.getConnection();

    try {
        await connection.beginTransaction();

        // Check Faculty
        const [faculty] = await connection.query(
            `
            SELECT f.faculty_id
            FROM faculty f
            INNER JOIN users u
                ON f.user_id = u.user_id
            WHERE f.faculty_id = ?
            AND u.role = 'FACULTY'
            AND u.is_active = TRUE
            `,
            [facultyId]
        );

        if (faculty.length === 0) {
            const error = new Error("Active faculty member not found.");
            error.statusCode = 404;
            throw error;
        }

        // Check Subject
        const [subject] = await connection.query(
            `SELECT subject_id
             FROM subjects
             WHERE subject_id = ?`,
            [subjectId]
        );

        if (subject.length === 0) {
            const error = new Error("Subject not found.");
            error.statusCode = 404;
            throw error;
        }

        // Check Section and Batch Relationship
        const [section] = await connection.query(
            `
            SELECT section_id
            FROM sections
            WHERE section_id = ?
            AND batch_id = ?
            `,
            [sectionId, batchId]
        );

        if (section.length === 0) {
            const error = new Error(
                "Section does not belong to the selected batch."
            );
            error.statusCode = 400;
            throw error;
        }

        // Prevent duplicate allocation for the same subject and section
        const [existingAllocation] = await connection.query(
            `
            SELECT allocation_id
            FROM faculty_subject_section
            WHERE subject_id = ?
            AND section_id = ?
            AND batch_id = ?
            `,
            [subjectId, sectionId, batchId]
        );

        if (existingAllocation.length > 0) {
            const error = new Error(
                "This subject is already assigned to a faculty member for this section."
            );
            error.statusCode = 409;
            throw error;
        }

        // Create Allocation
        const [result] = await connection.query(
            `
            INSERT INTO faculty_subject_section
            (
                faculty_id,
                subject_id,
                section_id,
                batch_id
            )
            VALUES (?, ?, ?, ?)
            `,
            [facultyId, subjectId, sectionId, batchId]
        );

        await connection.commit();

        return {
            allocationId: result.insertId
        };

    } catch (error) {
        await connection.rollback();
        throw error;

    } finally {
        connection.release();
    }
};


// =====================================================
// Update Allocation
// =====================================================

const updateAllocation = async (allocationId, data) => {

    const {
        facultyId,
        subjectId,
        sectionId,
        batchId
    } = data;

    if (!allocationId || !Number.isInteger(Number(allocationId))) {
        const error = new Error("Valid allocation ID is required.");
        error.statusCode = 400;
        throw error;
    }

    if (!facultyId || !subjectId || !sectionId || !batchId) {
        const error = new Error(
            "Faculty ID, Subject ID, Section ID and Batch ID are required."
        );
        error.statusCode = 400;
        throw error;
    }

    const ids = [facultyId, subjectId, sectionId, batchId];

    if (!ids.every(id => Number.isInteger(Number(id)) && Number(id) > 0)) {
        const error = new Error("All IDs must be valid positive integers.");
        error.statusCode = 400;
        throw error;
    }

    const connection = await pool.getConnection();

    try {
        await connection.beginTransaction();

        // Check Existing Allocation
        const [allocation] = await connection.query(
            `
            SELECT allocation_id
            FROM faculty_subject_section
            WHERE allocation_id = ?
            `,
            [allocationId]
        );

        if (allocation.length === 0) {
            const error = new Error("Allocation not found.");
            error.statusCode = 404;
            throw error;
        }

        // Check Active Faculty
        const [faculty] = await connection.query(
            `
            SELECT f.faculty_id
            FROM faculty f
            INNER JOIN users u
                ON f.user_id = u.user_id
            WHERE f.faculty_id = ?
            AND u.role = 'FACULTY'
            AND u.is_active = TRUE
            `,
            [facultyId]
        );

        if (faculty.length === 0) {
            const error = new Error("Active faculty member not found.");
            error.statusCode = 404;
            throw error;
        }

        // Check Subject
        const [subject] = await connection.query(
            `SELECT subject_id
             FROM subjects
             WHERE subject_id = ?`,
            [subjectId]
        );

        if (subject.length === 0) {
            const error = new Error("Subject not found.");
            error.statusCode = 404;
            throw error;
        }

        // Check Section and Batch
        const [section] = await connection.query(
            `
            SELECT section_id
            FROM sections
            WHERE section_id = ?
            AND batch_id = ?
            `,
            [sectionId, batchId]
        );

        if (section.length === 0) {
            const error = new Error(
                "Section does not belong to the selected batch."
            );
            error.statusCode = 400;
            throw error;
        }

        // Prevent Duplicate Allocation
        const [duplicate] = await connection.query(
            `
            SELECT allocation_id
            FROM faculty_subject_section
            WHERE subject_id = ?
            AND section_id = ?
            AND batch_id = ?
            AND allocation_id <> ?
            `,
            [subjectId, sectionId, batchId, allocationId]
        );

        if (duplicate.length > 0) {
            const error = new Error(
                "This subject is already assigned to another allocation for this section."
            );
            error.statusCode = 409;
            throw error;
        }

        // Update Allocation
        await connection.query(
            `
            UPDATE faculty_subject_section
            SET
                faculty_id = ?,
                subject_id = ?,
                section_id = ?,
                batch_id = ?
            WHERE allocation_id = ?
            `,
            [facultyId, subjectId, sectionId, batchId, allocationId]
        );

        await connection.commit();

        return {
            allocationId: Number(allocationId)
        };

    } catch (error) {
        await connection.rollback();
        throw error;

    } finally {
        connection.release();
    }
};


// =====================================================
// Delete Allocation
// =====================================================

const deleteAllocation = async (allocationId) => {

    if (!allocationId || !Number.isInteger(Number(allocationId))) {
        const error = new Error("Valid allocation ID is required.");
        error.statusCode = 400;
        throw error;
    }

    const [result] = await pool.query(
        `
        DELETE FROM faculty_subject_section
        WHERE allocation_id = ?
        `,
        [allocationId]
    );

    if (result.affectedRows === 0) {
        const error = new Error("Allocation not found.");
        error.statusCode = 404;
        throw error;
    }

    return {
        allocationId: Number(allocationId)
    };
};


module.exports = {
    getAllAllocations,
    getAllocationsByFaculty,
    createAllocation,
    updateAllocation,
    deleteAllocation
};
