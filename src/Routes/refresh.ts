import { Request, Response } from "express";
import {
  internal_sendAuthData,
  internal_sendError,
  internal_sendServerError,
} from "../senders";
import { IPayload, IUserData, PassedInfos } from "../AuthInstance.class";
import { decodeToken, generateToken } from "../tokenUtils";

export default ({ config, run_logger, run_use }: PassedInfos) => {
  return async (req: Request, res: Response) => {
    try {
      //get the refreshToken from the body
      const { refreshToken } = req.body;

      //check that refreshToken is defined
      if (!refreshToken) {
        run_logger("info", '"refreshToken" is missing on req.body!');
        return internal_sendError(res, 400, 41);
      }

      //decode the refreshToken (verify it)
      const [err1, payload] = decodeToken<IPayload>(
        refreshToken,
        config.refreshTokenSecret,
      );

      //check if an error occured
      if (err1) {
        run_logger("info", "The refreshToken is invalid!");
        return internal_sendError(res, 403, 42);
      }

      //check the refreshToken
      const checkToken = await run_use("checkToken", { token: refreshToken });

      //check if storeToken is defined
      if (!checkToken) {
        run_logger("warn", 'use Event "checkToken" is not defined!');
        return internal_sendServerError(res);
      }

      //check if an error occured
      if (checkToken[0]) {
        run_logger("error", 'use Event "checkToken" returned an Error!');
        return internal_sendServerError(res);
      }

      //check if an error occured
      if (!checkToken[1]) {
        run_logger("info", "The refreshToken does not exist!");
        return internal_sendError(res, 404, 43);
      }

      //generate the accessToken of the user
      const accessToken = generateToken(
        {
          id: payload?.id || "",
          email: payload?.email || "",
          username: payload?.username || "",
        },
        config.accessTokenSecret,
        config.expiresIn,
      );

      //send data to client
      return internal_sendAuthData(res, 200, 20, {
        accessToken: accessToken,
      });
    } catch (err) {
      run_logger("error", String(err));
      internal_sendServerError(res);
    }
  };
};
