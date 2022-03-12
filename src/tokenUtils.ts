import { JwtPayload, sign, verify } from "jsonwebtoken";
import { IPayload, PassedInfos } from "./AuthInstance.class";

export function generateToken(
  payload: IPayload,
  secret: string,
  expiresIn?: number,
) {
  return sign(
    payload,
    secret,
    expiresIn ? { expiresIn: expiresIn } : undefined,
  );
}

export function decodeToken<Payload>(
  token: string,
  secret: string,
): [boolean, (JwtPayload & Payload) | null] {
  try {
    const data: any = verify(token, secret);
    return [false, <JwtPayload & Payload>data];
  } catch (err) {
    return [true, null];
  }
}

export function createValidation(props: PassedInfos) {
  return function (
    token?: string,
  ): [0 | 1 | 2 | 5, (JwtPayload & IPayload) | null] {
    try {
      //validate token exists on request
      if (!token) {
        props.run_logger(
          "info",
          "AccessToken is missing or value was not provided!",
        );
        return [1, null];
      }

      //decode and validate accessToken
      const [err, payload] = decodeToken<IPayload>(
        token,
        props.config.accessTokenSecret,
      );

      //check if an error occured
      if (err) {
        props.run_logger("info", "The accessToken is invalid!");
        return [2, null];
      }

      //return token data
      return [0, payload];
    } catch (err) {
      //catch errors
      props.run_logger("error", String(err));
      return [5, null];
    }
  };
}
