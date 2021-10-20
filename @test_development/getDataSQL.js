var mysql = require('mysql');

var con = mysql.createConnection({
  host: "localhost",
  user: "Travis",
  password: "test1234",
  database: "steam_new"
});

con.connect(function(err) {
  if (err) throw err;
  console.log("Connected!");

  var sql = "SELECT * FROM games";
  con.query(sql, function (err, result) {
    if (err) throw err;
    console.log('The data from users table are: \n', result[1]);
  });
});