const express = require('express');
const mysql = require('mysql2');

const app = express();
const port = 3000;

const dbConfig = {
  host: '127.0.0.1',
  user: 'root',
  password: 'Avinash@6387',
  database: 'leaderboard',
};

const connection = mysql.createConnection(dbConfig);

app.get('/current-week-leaderboard', (req, res) => {
  const query = `
    SELECT UID, Name, Score, Country, TimeStamp,
      DENSE_RANK() OVER (ORDER BY Score DESC) AS \`Rank\`
    FROM leaderboard
    WHERE WEEK(TimeStamp) = WEEK(NOW())
    ORDER BY Score DESC
    LIMIT 200`;

  executeQueryAndSendResponse(query, res);
});

function executeQueryAndSendResponse(query, res) {
  connection.query(query, (err, results) => {
    if (err) {
      console.error('Error executing query:', err.stack);
      res.status(500).json({ error: 'Internal Server Error' });
      return;
    }

    // Map the result to include Rank in each row
    const leaderboardWithRank = results.map((row) => ({
      ...row,
      Rank: row.Rank,
    }));

    // Send the modified result to the client
    res.json(leaderboardWithRank);
  });
}



app.get('/last-week-leaderboard/:country', (req, res) => {
  const country = req.params.country;
  const query = `SELECT * FROM leaderboard WHERE country = ? ORDER BY score DESC LIMIT 200`;
  executeQueryAndSendResponse(query, res, [country]);
});

app.get('/user-rank/:userId', (req, res) => {
  const userId = req.params.userId;
  const query = `
    SELECT RANK() OVER (ORDER BY Score DESC) AS UserRank
    FROM leaderboard
    WHERE UID = ?`;
  
  executeQueryAndSendResponse(query, res, [userId]);
});


function executeQueryAndSendResponse(query, res, params = []) {
  connection.query(query, params, (err, results) => {
    if (err) {
      console.error('Error executing query:', err.stack);
      res.status(500).send('Internal Server Error');
      return;
    }

    res.json(results);
  });
}

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
