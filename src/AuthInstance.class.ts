import { Router } from "express";
import createRouter from "./router";
import { PasswordValidationRules } from "./validationUtils";

export interface IConfig {
  accessTokenSecret: string;
  refreshTokenSecret: string;
  expiresIn?: number;
  passwordValidation?: PasswordValidationRules
}

export interface IUserData {
  email: string;
  username: string;
  hashedPassword: string;
}

export interface IUseEvents {
  getUserByMail?: (
    data: UseEventData<"getUserByMail">,
  ) => UseEventReturnValue<"getUserByMail">;
  getUserByName?: (
    data: UseEventData<"getUserByName">,
  ) => UseEventReturnValue<"getUserByName">;
  storeUser?: (
    data: UseEventData<"storeUser">,
  ) => UseEventReturnValue<"storeUser">;
  checkToken?: (
    data: UseEventData<"checkToken">,
  ) => UseEventReturnValue<"checkToken">;
  storeToken?: (
    data: UseEventData<"storeToken">,
  ) => UseEventReturnValue<"storeToken">;
  deleteToken?: (
    data: UseEventData<"deleteToken">,
  ) => UseEventReturnValue<"deleteToken">;
}

interface UseEventDataMap {
  getUserByMail: {
    email: string;
  };
  getUserByName: {
    username: string;
  };
  storeUser: IUserData;
  checkToken: {
    token: string;
  };
  storeToken: {
    token: string;
  };
  deleteToken: {
    token: string;
  };
}

interface UseEventReturnMap {
  getUserByMail: [boolean, IUserData | null];
  getUserByName: [boolean, IUserData | null];
  storeUser: [boolean];
  checkToken: [boolean, boolean | null];
  storeToken: [boolean];
  deleteToken: [boolean];
}

type UseEventDataTypes = keyof UseEventDataMap;
type UseEventData<T extends UseEventDataTypes> = UseEventDataMap[T];
type UseEventReturnValueSync<T extends UseEventDataTypes> =
  UseEventReturnMap[T];
type UseEventReturnValue<T extends UseEventDataTypes> =
  | UseEventReturnValueSync<T>
  | Promise<UseEventReturnValueSync<T>>;

export type RunUse = <T extends UseEventDataTypes>(
  event: T,
  data: UseEventData<T>,
) => Promise<UseEventReturnValueSync<T> | null>;

export class AuthInstance {
  //type definitions
  private accessTokenSecret: string;
  private refreshTokenSecret: string;
  private expiresIn: number;
  private passwordRule: PasswordValidationRules
  private useEvents: IUseEvents;
  public authRouter: Router;

  //constructor (config values defaulter)
  constructor(config: IConfig) {
    //set all config vars
    this.accessTokenSecret = config.accessTokenSecret;
    this.refreshTokenSecret = config.refreshTokenSecret;
    this.expiresIn = config.expiresIn || 900;
    this.passwordRule = config.passwordValidation || "Y-Y-Y-N-8"

    //default all useEvents to undefined
    this.useEvents = {};

    //the express router config
    this.authRouter = createRouter(this.run_use);
  }

  //run a use callback
  private async run_use<T extends UseEventDataTypes>(
    event: T,
    data: UseEventData<T>,
  ): Promise<UseEventReturnValueSync<T> | null> {
    //return null if the run event is unused
    if (!this.useEvents[event]) return null;

    //run the callback and return its return value
    return await (this.useEvents[event] as any)(data);
  }

  //the use event function
  public use<T extends UseEventDataTypes>(
    event: T,
    callback: (data: UseEventData<T>) => UseEventReturnValue<T>,
  ) {
    //set the useEvents[event] to the provided callback
    (this.useEvents[event] as any) = callback;
  }

  //the express middleware for vaildating a token
  public async authMiddleWare() {}
}
