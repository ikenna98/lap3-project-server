const { Pool } = require('pg');

let pool;
if (process.env.NODE_ENV === 'production') {
      pool = new Pool({
  	    connectionString: process.env.DATABASE_URL,
  	    ssl: {
  		    rejectUnauthorized: false,
  	    },
  });
} else {
    pool = new Pool(
	// 	// Content inside new pool is for locl postgres db:
	// 	{
	// 	user: 'lap3',
	// 	host: 'localhost',
	// 	database: 'lap3project',
	// 	password: 'password',
	// 	port: 5432,
	// }
	);
}

module.exports = pool;
