const pool = require("../config/db");

const createError = (message, statusCode) => {
    const error = new Error(message);
    error.statusCode = statusCode;
    return error;
};

const getDepartmentSettings = async () => {
    const [settings] = await pool.query(
        `SELECT
            b.batch_id AS batchId,
            b.admission_year AS admissionYear,
            ds.current_semester AS currentSemester
         FROM batches b
         INNER JOIN department_settings ds
            ON b.batch_id = ds.batch_id
         ORDER BY b.admission_year DESC`
    );

    return settings;
};

const promoteBatch = async (batchId) => {
    if (!/^\d+$/.test(String(batchId)) || !Number.isSafeInteger(Number(batchId)) || Number(batchId) <= 0) {
        throw createError("Valid batch ID is required.", 400);
    }

    const connection = await pool.getConnection();
    let transactionStarted = false;

    try {
        await connection.beginTransaction();
        transactionStarted = true;

        const [batches] = await connection.query(
            `SELECT
                batch_id AS batchId,
                admission_year AS admissionYear
             FROM batches
             WHERE batch_id = ?`,
            [batchId]
        );

        if (batches.length === 0) {
            throw createError("Batch not found.", 404);
        }

        const [settings] = await connection.query(
            `SELECT
                current_semester AS currentSemester
             FROM department_settings
             WHERE batch_id = ?
             FOR UPDATE`,
            [batchId]
        );

        if (settings.length === 0) {
            throw createError("Department settings not found for this batch.", 404);
        }

        const previousSemester = Number(settings[0].currentSemester);

        if (previousSemester === 8) {
            throw createError("Batch is already in semester 8.", 400);
        }

        if (previousSemester < 1 || previousSemester > 7) {
            throw createError("Batch current semester must be between 1 and 7 to promote.", 400);
        }

        const currentSemester = previousSemester + 1;

        await connection.query(
            `UPDATE department_settings
             SET current_semester = ?
             WHERE batch_id = ?`,
            [currentSemester, batchId]
        );

        await connection.commit();
        transactionStarted = false;

        return {
            batchId: batches[0].batchId,
            admissionYear: batches[0].admissionYear,
            previousSemester,
            currentSemester
        };
    } catch (error) {
        if (transactionStarted) {
            await connection.rollback();
        }

        throw error;
    } finally {
        connection.release();
    }
};

module.exports = {
    getDepartmentSettings,
    promoteBatch
};
