//replace "../dist" with "@authfunctions/express"
import Auth from "../dist";
import cors from "cors";
import express from "express";

//the user interface
interface IUser {
  id: string;
  email: string;
  username: string;
  hashedPassword: string;
}

//for example purpose we create an array as a database for the tokens '(tokens being the refreshTokens of all users)
//you would use something like redis
const TokenDatabase: string[] = [];

//for example purpose we create an array as a database for all users
//you would use something like MongoDB or PostgreSQL
const UserDatabase: IUser[] = [];

//create a new instance of authfunctions
const auth = new Auth({
  accessTokenSecret: "YOUR SECRET FOR THE ACCESS TOKENS",
  refreshTokenSecret: "YOUR SECRET FOR THE REFRESH TOKENS",

  //the amount of seconds an accessToken is valid
  expiresIn: 900,

  //enable password validation
  passwordValidation: "Y-Y-Y-Y-8",
  // Y = yes; N = no;
  // Y-Y-N-Y-8
  // │ │ │ │ └── minimum length of a password
  // │ │ │ └──── password must use special characters
  // │ │ └────── password must use numbers
  // │ └──────── password must use lowercase characters
  // └────────── password must use uppercase characters

  //enable email validation (alredy enabled by default, explicitly set just to show how it works)
  emailValidation: true,
});

//setup the express app to use the authfunctions router
//init a basic app with json support (body parsing) and cors
const app = express();
app.use(cors());
app.use(express.json());

//use the router exported by the AuthInstance with the prefix of /auth
app.use("/auth", auth.Router);

//cumstom logger support (defaulted to use the standard level)
//Levels:
// - "error": gets called when a critical error occured
// - "warn":  gets called when a fixable error occured to notify the user
// - "info":  gets called when an event or so runs successfully
// - "debug": ges called to provide debug informations
auth.logger((level, data) => console[level](`[${level.toUpperCase()}]:`, data));

//all possible events used with authfunctions
//Notes:
// - all event callbacks can be also used as async functions
// - all events return an Array of items where the first is an indicator if an error occured (boolean)
//   and the second is the data fetched in the callback (only used in some event)
// - all events are sync so the try-catch blocks are not needed and are just there to represent how you could handle errors (for example errors with your database)

//the event for getting a user by it's name (username)
auth.use("getUserByName", async ({ username }) => {
  try {
    //get the user by it's name from our "database"
    const user = UserDatabase.find((usr) => usr.username === username);

    //return that no error has occured and return our found user (the user needs to have following values: email, username & password) or if no user was found return null
    return [false, user ? user : null];
  } catch (err) {
    //return that an error has occured and return null to represent that no user could be found
    return [true, null];
  }
});

//the event for getting a user by it's mail (email)
auth.use("getUserByMail", async ({ email }) => {
  try {
    //get the user by it's email from our "database"
    const user = UserDatabase.find((usr) => usr.email === email);

    //return that no error has occured and return our found user (the user needs to have following values: email, username & password) or if no user was found return null
    return [false, user ? user : null];
  } catch (err) {
    //return that an error has occured and return null to represent that no user could be found
    return [true, null];
  }
});

//the event for storing a user in our "database"
auth.use("storeUser", async ({ email, hashedPassword, username }) => {
  try {
    //add the user to our "database"
    UserDatabase.push({
      //we use the currrent date timestamp stringified as an identifier for the user, for real usage use something lika a uuid
      id: String(Date.now()),
      email: email,
      username: username,
      hashedPassword: hashedPassword,
    });

    //return that no error has occured
    return [false];
  } catch (err) {
    //return that an error has occured
    return [true];
  }
});

//the event for checking if a token exists in our "database"
auth.use("checkToken", async ({ token }) => {
  try {
    //check if the token exists in our "database"
    const included = TokenDatabase.includes(token);

    //return that no error has occured and return a boolean representing if the token exists in our "database"
    return [false, included];
  } catch (err) {
    //return that an error has occured and return null to represent that no token could be found
    return [true, null];
  }
});

//the event for storing a token in our "database"
auth.use("storeToken", async ({ token }) => {
  try {
    //add the token to our "database"
    TokenDatabase.push(token);

    //return that no error has occured
    return [false];
  } catch (err) {
    //return that an error has occured
    return [true];
  }
});

//the event for deleting a token from our "database"
auth.use("deleteToken", async ({ token }) => {
  try {
    //remove the token form our "database"
    TokenDatabase.splice(TokenDatabase.indexOf(token), 1);

    //return that no error has occured
    return [false];
  } catch (err) {
    //return that an error has occured
    return [true];
  }
});

//make express listen on port 5000
app.listen(5000, () => {
  console.log("@authfunctions/express Demo Application running on Port 5000");
});
