import { Request, Response } from "express";
import {
  internal_sendAuthData,
  internal_sendError,
  internal_sendServerError,
} from "../senders";
import { decodeToken } from "../tokenUtils";
import { PassedInfos } from "../AuthInstance.class";

export default ({ config, run_logger, run_use }: PassedInfos) => {
  return async (req: Request, res: Response) => {
    try {
      //get the refreshToken from the body
      const { refreshToken } = req.body;

      //check that refreshToken is defined
      if (!refreshToken) {
        run_logger("info", '"refreshToken" is missing on req.body!');
        return internal_sendError(res, 400, 31);
      }

      //decode the refreshToken (verify it)
      const [err1] = decodeToken(refreshToken, config.refreshTokenSecret);

      //check if an error occured
      if (err1) {
        run_logger("info", "The refreshToken is invalid!");
        return internal_sendError(res, 403, 32);
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
        return internal_sendError(res, 404, 33);
      }

      //delete the token form the server
      const deleteToken = await run_use("deleteToken", { token: refreshToken });

      //check if deleteToken is defined
      if (!deleteToken) {
        run_logger("warn", 'use Event "deleteToken" is not defined!');
        return internal_sendServerError(res);
      }

      //check if an error occured
      if (checkToken[0]) {
        run_logger("error", 'use Event "deleteToken" returned an Error!');
        return internal_sendServerError(res);
      }

      //send data to client
      return internal_sendAuthData(res, 200, 30, null);
    } catch (err) {
      run_logger("error", err);
      internal_sendServerError(res);
    }
  };
};
