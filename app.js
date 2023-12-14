

const express = require("express");
const path = require("path");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const bcrypt = require("bcrypt");
const app = express();
app.use(express.json());

const dbpath = path.oin(__dirname, "userData.db");
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
  const { username, name, password, gender, location } = request.body;

  const hashedPassword = await bcrypt.hash(password, 10);

  const passwordLength = password.length;

  let database = null;

  const userExistsornot = `
    SELECT * FROM user WHERE username='${username}';`;

  const responseuserExists = await db.get(userExistsornot);

  switch (true) {
    case responseuserExists !== undefined:
      response.send("User already exists");

    case passwordLength < 5:
      response.send("Password is too short");
    case responseuserExists === undefined:
      const createUser = `
            INSERT INTO
            user(usernamse,name,password,gender,location)
            VALUES(
                '${username}',
                '${name}',
                '${password}',
                '${gender}',
                '${location}'
            );`;
      await db.run(createUser);
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
      response.send("Invalid User");
    case comparepassword !== true:
      response.send("Invalid password");
    case (responseuserRegisteredornot !== undefined) &
      (comparepassword === true):
      response.send("Login success!");
  }
});

app.put('/change-password',(request,response)=>{

    const {username,oldPassword,newPassword}=request.body;

    const getuser=`SELECT * FROM user WHERE username='${username};`;
    const responsegetuser=await db.get(getuser);
    const comparepass=await bcrypt.compare(oldPassword,responsegetuser.password);
    const passlength=newPassword.length;

    switch (true) {
        case (comparepass!==true):
            response.send('Invalid curent password')
        case(passlength<5):
            response.send('Password too short');

        case(responsegetuser!==undefined):
            const addingnewpassword=`INSERT INTO 
            user(password)
            VALUES('${newPassword};`;

            await db.run(addingnewpassword);
            response.send('Password Updated');
    }



});


module.exports=app;