import { Request, Response } from "express";
import {
  internal_sendAuthData,
  internal_sendError,
  internal_sendServerError,
} from "../senders";
import { PassedInfos } from "../AuthInstance.class";
import { decodeToken } from "../tokenUtils";

export default ({ config, run_logger, run_use }: PassedInfos) => {
  return async (req: Request, res: Response) => {
    try {
      //get the accessToken and refreshToken from the body
      const { accessToken, refreshToken } = req.body;

      //check that accessToken, refreshToken is defined
      if (!accessToken || !refreshToken) {
        run_logger(
          "info",
          '"accessToken" or "refreshToken" is missing on req.body!',
        );
        return internal_sendError(res, 400, 51);
      }

      //decode the refreshToken (verify it)
      const [err1] = decodeToken(refreshToken, config.refreshTokenSecret);

      //check if an error occured
      if (err1) {
        run_logger("info", "The refreshToken is invalid!");
        return internal_sendError(res, 403, 52);
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
        return internal_sendError(res, 404, 53);
      }

      //decode the accessToken (verify it)
      const [err2] = decodeToken(accessToken, config.accessTokenSecret);

      //check if an error occured
      if (err2) {
        run_logger("info", "The accessToken is invalid!");
        return internal_sendError(res, 403, 54);
      }

      //send data to client
      return internal_sendAuthData(res, 200, 50, null);
    } catch (err) {
      run_logger("error", String(err));
      internal_sendServerError(res);}
  };
};
