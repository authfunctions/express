import { Request, Response } from "express";
import { validateEmail, validatePassword } from "../validationUtils";
import { PassedInfos } from "../AuthInstance.class";
import getUserByLogin from "../getUserByLogin";
import { hash } from "bcrypt";
import { v4 } from "uuid";
import {
  internal_sendAuthData,
  internal_sendError,
  internal_sendServerError,
} from "../senders";

export default ({
  config,
  run_logger,
  run_use,
  run_intercept,
}: PassedInfos) => {
  return async (req: Request, res: Response) => {
    try {
      //get the email, username and password from the body
      const {
        email,
        username,
        password,
      }: { email: string; username: string; password: string } = req.body;

      //check that email, username and password are defined
      if (!email || !username || !password) {
        run_logger(
          "info",
          '"email", "username" or "password" is missing on req.body!',
        );
        return internal_sendError(res, 400, 11);
      }

      //validate the email
      if (config.emailValidation && !validateEmail(email)) {
        run_logger("info", "The E-Mail is malformated!");
        return internal_sendError(res, 406, 12);
      }

      //validate the password
      if (!validatePassword(password, config.passwordValidation)) {
        run_logger("info", "The password is to weak!");
        return internal_sendError(res, 406, 13);
      }

      //check if email is alredy used as email or username
      const [err1, user1] = await getUserByLogin(
        email,
        run_use,
        run_logger,
        res,
      );

      //check for errors
      if (err1) return;

      //check if the email is alredy used
      if (user1) {
        run_logger("info", "The E-Mail is alredy used!");
        return internal_sendError(res, 403, 14);
      }

      //check if username is alredy used as email or username
      const [err2, user2] = await getUserByLogin(
        username,
        run_use,
        run_logger,
        res,
      );

      //check for errors
      if (err2) return;

      //check if the username is alredy used
      if (user2) {
        run_logger("info", "The Username is alredy used!");
        return internal_sendError(res, 403, 15);
      }

      //hash the password
      const hashedPassword = await hash(password, 10);

      //generate an id with uuidV4
      const id = v4();

      //run the interceptor
      const intercept = await run_intercept("register", {
        email: email,
        hashedPassword: hashedPassword,
        id: id,
        username: username,
      });

      //check if reequest got intercepted
      if (intercept && intercept[0]) return internal_sendError(res, 403, 3);

      //store the user (run use event)
      const user = await run_use("storeUser", {
        id: id,
        email: email,
        hashedPassword: hashedPassword,
        username: username,
      });

      //check if storeUser is defined
      if (!user) {
        run_logger("warn", 'use Event "storeUser" is not defined!');
        return internal_sendServerError(res);
      }

      //check if an error occured
      if (user[0]) {
        run_logger("error", 'use Event "storeUser" returned an Error!');
        return internal_sendServerError(res);
      }

      //send data to client
      return internal_sendAuthData(res, 201, 10, null);
    } catch (err) {
      run_logger("error", err);
      internal_sendServerError(res);
    }
  };
};
