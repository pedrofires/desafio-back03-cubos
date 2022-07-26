const { Pool } = require('pg');

const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'dindin',
    password: 'winkey',
    port: 5432
});

const query = (query, parametros) => {
    return pool.query(query, parametros);
}

module.exports = {
    query
}