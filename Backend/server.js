require('dotenv').config();
const app = require('./src/app');
const pool = require("./src/config/db");

const PORT = process.env.PORT || 3000;

const startServer = async () => {
    try {
        await pool.getConnection();
        console.log("Connected to MySQL Database");
        //connection.release();

        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });
    } catch (err) {
        console.error("Failed to connect to MySQL");
        console.error(err.message);
    }
}

startServer();