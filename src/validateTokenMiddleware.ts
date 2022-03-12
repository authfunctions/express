import { NextFunction, Request, Response } from "express";
import { IPayload, PassedInfos } from "./AuthInstance.class";
import { internal_sendError, internal_sendServerError } from "./senders";
import { createValidation } from "./tokenUtils";

export function createMiddleware(props: PassedInfos) {
  return (req: Request, res: Response, next: NextFunction) => {
    //get the token from the header
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    //create validator
    const validate = createValidation(props);

    //validate the token
    const [code, payload] = validate(token);

    //check if token is undefined
    if (code === 1) return internal_sendError(res, 400, code);

    //check if token is invalid
    if (code === 2) return internal_sendError(res, 403, code);

    //check if token validation fails
    if (code === 5) return internal_sendServerError(res);

    //apply token payload to res.locals
    res.locals.payload = payload;

    //call next middleware
    next();
  };
}
