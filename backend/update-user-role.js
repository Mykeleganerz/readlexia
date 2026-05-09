const mysql = require('mysql2/promise');

async function updateUserRole() {
    const connection = await mysql.createConnection({
        host: 'localhost',
        user: 'root',
        database: 'readlexia'
    });

    try {
        await connection.execute(
            'UPDATE users SET role = ? WHERE email = ?',
            ['admin', 'admin@readlexia.com']
        );
        console.log('User role updated to admin');
    } catch (error) {
        console.error('Error:', error);
    } finally {
        await connection.end();
    }
}

updateUserRole();
