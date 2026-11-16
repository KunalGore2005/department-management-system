const pool = require("../config/db");

const getSubjectsByBatch = async (batchId) => {
    if (!batchId || !Number.isInteger(Number(batchId)) || Number(batchId) <= 0) {
        const error = new Error("Valid batch ID is required.");
        error.statusCode = 400;
        throw error;
    }

    // Get the semester configured for this batch
    const [settings] = await pool.query(
        `
        SELECT
            ds.batch_id,
            ds.current_semester,
            b.admission_year
        FROM department_settings ds
        INNER JOIN batches b
            ON ds.batch_id = b.batch_id
        WHERE ds.batch_id = ?
        `,
        [batchId]
    );

    if (settings.length === 0) {
        const error = new Error(
            "Semester settings not found for this batch."
        );
        error.statusCode = 404;
        throw error;
    }

    const semester = settings[0].current_semester;

    // Get subjects belonging to that semester
    const [subjects] = await pool.query(
        `
        SELECT
            subject_id,
            subject_code,
            subject_name,
            semester
        FROM subjects
        WHERE semester = ?
        ORDER BY subject_code ASC
        `,
        [semester]
    );

    return {
        batch_id: settings[0].batch_id,
        admission_year: settings[0].admission_year,
        semester,
        subjects
    };
};

module.exports = {
    getSubjectsByBatch
};