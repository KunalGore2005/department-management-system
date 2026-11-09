const pool = require("../config/db");

const getAllSections = async () => {

    const [sections] = await pool.query(
        `SELECT
        s.section_id,
        s.batch_id,
        b.admission_year,
        s.section_name,
        s.intake_strength
     FROM sections s
     INNER JOIN batches b
        ON s.batch_id = b.batch_id
     ORDER BY b.admission_year DESC, s.section_name ASC`
    );

    return sections;
};

module.exports = {
    getAllSections
};