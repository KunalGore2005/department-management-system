const pool = require("../config/db");

const assignCoordinator = async (sectionId, batchId, facultyId) => {

    if (!sectionId || !batchId || !facultyId) {
        const error = new Error("Section ID, Batch ID and Faculty ID are required.");
        error.statusCode = 400;
        throw error;
    }

    const connection = await pool.getConnection();

    try {

        await connection.beginTransaction();

        // Check Section

        const [section] = await connection.query(
            `SELECT section_id
             FROM sections
             WHERE section_id = ?`,
            [sectionId]
        );

        if (section.length === 0) {
            const error = new Error("Section not found.");
            error.statusCode = 404;
            throw error;
        }

        // Check Batch

        const [batch] = await connection.query(
            `SELECT batch_id
             FROM batches
             WHERE batch_id = ?`,
            [batchId]
        );

        if (batch.length === 0) {
            const error = new Error("Batch not found.");
            error.statusCode = 404;
            throw error;
        }

        // Check Faculty

        const [faculty] = await connection.query(
            `SELECT faculty_id
             FROM faculty
             WHERE faculty_id = ?`,
            [facultyId]
        );

        if (faculty.length === 0) {
            const error = new Error("Faculty not found.");
            error.statusCode = 404;
            throw error;
        }

        // Existing Assignment

        const [assignment] = await connection.query(
            `SELECT assignment_id, faculty_id
             FROM coordinator_assignments
             WHERE section_id = ?
             AND batch_id = ?`,
            [sectionId, batchId]
        );

        // Insert

        if (assignment.length === 0) {

            await connection.query(
                `INSERT INTO coordinator_assignments
                (
                    faculty_id,
                    section_id,
                    batch_id,
                    assigned_date
                )
                VALUES (?, ?, ?, CURDATE())`,
                [facultyId, sectionId, batchId]
            );

            await connection.commit();

            return {
                statusCode: 201,
                message: "Coordinator assigned successfully."
            };
        }

        // Already Assigned

        if (assignment[0].faculty_id === Number(facultyId)) {

            await connection.commit();

            return {
                statusCode: 200,
                message: "Faculty is already assigned as coordinator."
            };
        }

        // Update

        await connection.query(
            `UPDATE coordinator_assignments
             SET
                faculty_id = ?,
                assigned_date = CURDATE()
             WHERE assignment_id = ?`,
            [facultyId, assignment[0].assignment_id]
        );

        await connection.commit();

        return {
            statusCode: 200,
            message: "Coordinator updated successfully."
        };

    } catch (error) {

        await connection.rollback();
        throw error;

    } finally {

        connection.release();

    }
};

const getCoordinatorBySection = async (sectionId, batchId) => {

    if (!sectionId || !batchId) {
        const error = new Error("Section ID and Batch ID are required.");
        error.statusCode = 400;
        throw error;
    }

    // Check Section

    const [section] = await pool.query(
        `SELECT section_id
         FROM sections
         WHERE section_id = ?`,
        [sectionId]
    );

    if (section.length === 0) {
        const error = new Error("Section not found.");
        error.statusCode = 404;
        throw error;
    }

    // Check Batch

    const [batch] = await pool.query(
        `SELECT batch_id
         FROM batches
         WHERE batch_id = ?`,
        [batchId]
    );

    if (batch.length === 0) {
        const error = new Error("Batch not found.");
        error.statusCode = 404;
        throw error;
    }

    // Fetch Coordinator

    const [coordinator] = await pool.query(
        `SELECT
            ca.assignment_id,
            ca.assigned_date,

            f.faculty_id,
            f.name,
            f.designation,
            f.phone,

            s.section_id,
            s.section_name,

            b.batch_id,
            b.admission_year

        FROM coordinator_assignments ca

        INNER JOIN faculty f
            ON ca.faculty_id = f.faculty_id

        INNER JOIN sections s
            ON ca.section_id = s.section_id

        INNER JOIN batches b
            ON ca.batch_id = b.batch_id

        WHERE ca.section_id = ?
        AND ca.batch_id = ?`,
        [sectionId, batchId]
    );

    if (coordinator.length === 0) {
        const error = new Error("Coordinator is not assigned for this section.");
        error.statusCode = 404;
        throw error;
    }

    return {
        statusCode: 200,
        message: "Coordinator fetched successfully.",
        data: coordinator[0]
    };
};

const getAllCoordinators = async () => {

    const [coordinators] = await pool.query(
        `SELECT
            ca.assignment_id,
            ca.assigned_date,

            f.faculty_id,
            f.name,
            f.designation,
            f.phone,

            s.section_id,
            s.section_name,

            b.batch_id,
            b.admission_year

        FROM coordinator_assignments ca

        INNER JOIN faculty f
            ON ca.faculty_id = f.faculty_id

        INNER JOIN sections s
            ON ca.section_id = s.section_id

        INNER JOIN batches b
            ON ca.batch_id = b.batch_id

        ORDER BY
            b.admission_year DESC,
            s.section_name ASC`
    );

    return {
        statusCode: 200,
        message: "Coordinator assignments fetched successfully.",
        data: coordinators
    };
};

const getCoordinatorByFaculty = async (facultyId) => {

    if (!facultyId) {
        const error = new Error("Faculty ID is required.");
        error.statusCode = 400;
        throw error;
    }

    // Check Faculty

    const [faculty] = await pool.query(
        `SELECT
            faculty_id,
            name
        FROM faculty
        WHERE faculty_id = ?`,
        [facultyId]
    );

    if (faculty.length === 0) {
        const error = new Error("Faculty not found.");
        error.statusCode = 404;
        throw error;
    }

    // Fetch Coordinator Assignments

    const [assignments] = await pool.query(
        `SELECT
            ca.assignment_id,
            ca.assigned_date,

            s.section_id,
            s.section_name,

            b.batch_id,
            b.admission_year

        FROM coordinator_assignments ca

        INNER JOIN sections s
            ON ca.section_id = s.section_id

        INNER JOIN batches b
            ON ca.batch_id = b.batch_id

        WHERE ca.faculty_id = ?

        ORDER BY
            b.admission_year DESC,
            s.section_name ASC`,
        [facultyId]
    );

    return {
        statusCode: 200,
        message: "Coordinator assignments fetched successfully.",
        data: {
            faculty: faculty[0],
            assignments
        }
    };
};

module.exports = {
    assignCoordinator,
    getCoordinatorBySection,
    getAllCoordinators,
    getCoordinatorByFaculty
};