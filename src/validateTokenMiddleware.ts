import { NextFunction, Request, Response } from "express";
import { IPayload, PassedInfos } from "./AuthInstance.class";
import { internal_sendError, internal_sendServerError } from "./senders";
import { decodeToken } from "./tokenUtils";

export function createMiddleware(props: PassedInfos) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      //get the token from the header
      const authHeader = req.headers["authorization"];
      const token = authHeader && authHeader.split(" ")[1];

      //validate token exists on request
      if (!token) {
        props.run_logger(
          "info",
          "Authorization header was missing or value was not provided!",
        );
        return internal_sendError(res, 400, 1);
      }

      //decode and validate accessToken
      const [err, payload] = decodeToken<IPayload>(
        token,
        props.config.accessTokenSecret,
      );

      //check if an error occured
      if (err) {
        props.run_logger("info", "The accessToken is invalid!");
        return internal_sendError(res, 403, 2);
      }

      //apply token payload to res.locals
      res.locals.payload = payload;

      //call next middleware
      next();
    } catch (err) {
      props.run_logger("error", String(err));
      internal_sendServerError(res);
    }
  };
}
