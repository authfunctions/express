import { Router } from "express";
import { createRouter } from "./router";
import { PasswordValidationRules } from "./validationUtils";

export interface IConfig {
  accessTokenSecret: string;
  refreshTokenSecret: string;
  expiresIn?: number;
  passwordValidation?: PasswordValidationRules;
  emailValidation?: boolean;
}

export interface IUserData {
  id: string;
  email: string;
  username: string;
  hashedPassword: string;
}

export interface PassedInfos {
  run_use: RunUse;
  run_logger: any;
  config: {
    accessTokenSecret: string;
    refreshTokenSecret: string;
    expiresIn: number;
    passwordValidation: PasswordValidationRules;
    emailValidation: boolean;
  };
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

type LogLevels = "error" | "warn" | "info" | "debug";

export type LoggerFunction = (level: LogLevels, data: any) => void;

let loggerFunction: LoggerFunction = (level, data) => console[level](data);
let useEvents: IUseEvents = {}

export class AuthInstance {
  //type definitions
  public Router: Router;

  //constructor (config values defaulter)
  constructor(config: IConfig) {
    //default the logger function

    //default all useEvents to undefined
    useEvents = {};

    //the express router configuration with defaults
    this.Router = createRouter({
      config: {
        accessTokenSecret: config.accessTokenSecret,
        refreshTokenSecret: config.refreshTokenSecret,
        expiresIn: config.expiresIn || 900,
        passwordValidation: config.passwordValidation || "Y-Y-Y-N-8",
        emailValidation: config.emailValidation || true,
      },
      run_logger: this.run_logger,
      run_use: this.run_use,
    });
  }

  //run a use callback
  private async run_use<T extends UseEventDataTypes>(
    event: T,
    data: UseEventData<T>,
  ): Promise<UseEventReturnValueSync<T> | null> {
    //return null if the run event is unused
    if (!useEvents[event]) return null;

    //run the callback and return its return value
    return await (useEvents[event] as any)(data);
  }

  //the use event function
  public use<T extends UseEventDataTypes>(
    event: T,
    callback: (data: UseEventData<T>) => UseEventReturnValue<T>,
  ) {
    //set the useEvents[event] to the provided callback
    (useEvents[event] as any) = callback;
  }

  //the logger function
  public logger(cb: LoggerFunction) {
    loggerFunction = cb;
  }

  //the run logger function
  run_logger(level: LogLevels, data: any) {
    // console[level](data)
    loggerFunction(level, data);
  }
}
