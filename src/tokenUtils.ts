import { JwtPayload, sign, verify } from "jsonwebtoken";
import { IPayload } from "./AuthInstance.class";

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
