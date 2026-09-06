const MySql = require('mysql2');

const pool = MySql.createPool(
  {
    host:"localhost",
    user:"root",
    password:"swastik@2005",
    database:"bmws"
  }
);
module.exports = pool.promise();