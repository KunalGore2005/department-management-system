const pool = require("../config/db");

const getAllBatches = async () => {

    const [batches] = await pool.query(
        `SELECT
            batch_id,
            admission_year
         FROM batches
         ORDER BY admission_year DESC`
    );

    return batches;
};

module.exports = {
    getAllBatches
};