var mysql=require("mysql2")

const db=mysql.createPool({
    host:"localhost",
    database:"login_form",
    password:"Mowlee@12345",
    user:"myadmin"
})

db.getConnection((err, connection) => {
    if (err) {
        console.error("Database connection failed:", err.message);
    } else {
        console.log("Connected to the database!");
        connection.release(); // Release the connection back to the pool
    }
});

module.exports=db

