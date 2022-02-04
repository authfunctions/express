import { Response } from "express";
import { IUserData, LoggerFunction, RunUse } from "./AuthInstance.class";
import { internal_sendServerError } from "./senders";

export default async (
  login: string,
  run_use: RunUse,
  run_logger: LoggerFunction,
  res: Response
): Promise<[boolean, IUserData | null]> => {
  //get the user with login as username
  const user1 = await run_use("getUserByName", { username: login });

  //check if getUserByName is defined
  if (!user1) {
    run_logger("warn", 'use Event "getUserByName" is not defined!');
    internal_sendServerError(res);
    return [true, null];
  }

  //check if an error occured
  if (user1[0]) {
    run_logger("error", 'use Event "getUserByName" returned an Error!');
    internal_sendServerError(res);
    return [true, null];
  }

  //get the user with login as email
  const user2 = await run_use("getUserByMail", { email: login });

  //check if getUserByMail is defined
  if (!user2) {
    run_logger("warn", 'use Event "getUserByMail" is not defined!');
    internal_sendServerError(res);
    return [true, null];
  }

  //check if an error occured
  if (user2[0]) {
    run_logger("error", 'use Event "getUserByMail" returned an Error!');
    internal_sendServerError(res);
    return [true, null];
  }

  return [false, user1[1] || user2[1]]
};
