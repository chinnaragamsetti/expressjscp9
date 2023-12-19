const express = require("express");
const path = require("path");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const bcrypt = require("bcrypt");
const app = express();
app.use(express.json());

const dbpath = path.join(__dirname, "userData.db");
let db = null;

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbpath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Running at hhttp://localhost:3000/");
    });
  } catch (error) {
    console.log(error.message);
  }
};

initializeDBAndServer();

app.post("/register", async (request, response) => {
  const todoDetails = request.body;
  const { username, name, password, gender, location } = todoDetails;

  const hashedPassword = await bcrypt.hash(password, 10);
  console.log(hashedPassword);

  const passwordLength = password.length;
  console.log(passwordLength);

  let database = null;

  const userExistsornot = `
    SELECT * FROM user WHERE username='${username}';`;

  const responseuserExists = await db.get(userExistsornot);

  switch (true) {
    case responseuserExists !== undefined:
      response.status(400);
      response.send("User already exists");

    case passwordLength < 5:
      response.status(400);
      response.send("Password is too short");
    case responseuserExists === undefined:
      const createUser = `
            INSERT INTO
            user(username,name,password,gender,location)
            VALUES(
                '${username}',
                '${name}',
                '${hashedPassword}',
                '${gender}',
                '${location}'
            );`;
      await db.run(createUser);
      response.status(200);
      response.send("User created successfully");
  }
});

app.post("/login", async (request, response) => {
  const { username, password } = request.body;

  const userRegisteredornot = `SELECT * FROM user WHERE username='${username}';`;

  const responseuserRegisteredornot = await db.get(userRegisteredornot);

  const comparepassword = await bcrypt.compare(
    password,
    responseuserRegisteredornot.password
  );

  switch (true) {
    case responseuserRegisteredornot === undefined:
      response.status(400);
      response.send("Invalid User");
    case comparepassword !== true:
      response.status(400);
      response.send("Invalid password");
    case (responseuserRegisteredornot !== undefined) &
      (comparepassword === true):
      response.status(200);
      response.send("Login success!");
  }
});

app.put("/change-password", async (request, response) => {
  const { username, oldPassword, newPassword } = request.body;

  const getuser = `SELECT * FROM user WHERE username='${username}';`;
  const responsegetuser = await db.get(getuser);
  const comparepass = await bcrypt.compare(
    oldPassword,
    responsegetuser.password
  );
  const hashedNewPassword = await bcrypt.hash(newPassword, 10);
  const passlength = newPassword.length;

  switch (true) {
    case comparepass !== true:
      response.status(400);
      response.send("Invalid current password");
    case passlength < 5:
      response.status(400);
      response.send("Password too short");

    case responsegetuser !== undefined:
      const addingnewpassword = `INSERT INTO 
            user(password)
            VALUES('${hashedNewPassword};'`;

      await db.run(addingnewpassword);
      response.status(200);
      response.send("Password Updated");
  }
});

/*app.get("/todo/", async (request, response) => {
  const todoQuery = `
SELECT * FROM user;`;

  const dbtodoQuery = await db.all(todoQuery);
  response.send(dbtodoQuery);
});*/

module.exports = app;
