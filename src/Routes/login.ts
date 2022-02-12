import { Request, Response } from "express";
import {
  internal_sendAuthData,
  internal_sendError,
  internal_sendServerError,
} from "../senders";
import { PassedInfos } from "../AuthInstance.class";
import { compare } from "bcrypt";
import { generateToken } from "../tokenUtils";
import getUserByLogin from "../getUserByLogin";

export default ({ config, run_logger, run_use, run_intercept }: PassedInfos) => {
  return async (req: Request, res: Response) => {
    try {
      //get the login and password from the body
      const { login, password } = req.body;

      //check that login and password are defined
      if (!login || !password) {
        run_logger("info", '"login" or "password" is missing on req.body!');
        return internal_sendError(res, 400, 21);
      }

      //get the user by login (email or username)
      const [err1, user] = await getUserByLogin(
        login,
        run_use,
        run_logger,
        res,
      );

      //check for errors
      if (err1) return;

      //check if user is null
      if (!user) {
        run_logger("info", "The requested User does not exist!");
        return internal_sendError(res, 404, 22);
      }

      //check if the password is correct
      if (!(await compare(password, user.hashedPassword))) {
        run_logger("info", "Password of the requested User is wrong!");
        return internal_sendError(res, 403, 23);
      }

      //run the interceptor
      const intercept = await run_intercept("login", user);

      //check if reequest got intercepted
      if (intercept && intercept[0]) return internal_sendError(res, 403, 3);

      //generate the refreshToken of the user
      const refreshToken = generateToken(
        {
          id: user.id,
          email: user.email,
          username: user.username,
        },
        config.refreshTokenSecret,
      );

      //generate the accessToken of the user
      const accessToken = generateToken(
        {
          id: user.id,
          email: user.email,
          username: user.username,
        },
        config.accessTokenSecret,
        config.expiresIn,
      );

      //store the refreshToken (run use event)
      const token = await run_use("storeToken", { token: refreshToken });

      //check if storeToken is defined
      if (!token) {
        run_logger("warn", 'use Event "storeToken" is not defined!');
        return internal_sendServerError(res);
      }

      //check if an error occured
      if (token[0]) {
        run_logger("error", 'use Event "storeToken" returned an Error!');
        return internal_sendServerError(res);
      }

      //send data to client
      return internal_sendAuthData(res, 200, 20, {
        accessToken: accessToken,
        refreshToken: refreshToken,
      });
    } catch (err) {
      run_logger("error", err);
      internal_sendServerError(res);
    }
  };
};
