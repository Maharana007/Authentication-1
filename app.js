const express = require("express");
const bcrypt = require("bcrypt");
const sqlite3 = require("sqlite3");
const { open } = require("sqlite");

const path = require("path");

const dbPath = path.join(__dirname, "userData.db");
const app = express();
app.use(express.json());
let db = null;
const initializer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3030, () => {
      console.log(`Server working on http://localhost:3030/`);
    });
  } catch (e) {
    console.log(`Server Error ${e.message} `);
    process.exit(1);
  }
};

initializer();

/// API 1
app.post("/register", async (request, response) => {
  let { username, name, password, gender, location } = request.body;

  let hashPassword = await bcrypt.hash(password, 10);

  let checkTheUsername = `SELECT * FROM user  WHERE username = '${username}';`;
  let userData = await db.get(checkTheUsername);
  if (userData === undefined) {
    let postNewUserQuery = `
            INSERT INTO
            user (username,name,password,gender,location)
            VALUES (
                '${username}',
                '${name}',
                '${hashPassword}',
                '${gender}',
                '${location}'
            );`;
    if (password.length < 5) {
      response.status(400);
      response.send("Password is too short");
    } else {
      let newUserDetails = await db.run(postNewUserQuery);
      response.status(200);
      response.send("User created successfully");
    }
  } else {
    response.status(400);
    response.send("User already exists");
  }
});
