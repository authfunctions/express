import { JwtPayload, sign, verify } from "jsonwebtoken";

export function generateToken(
  payload: string | object | Buffer,
  secret: string,
  expiresIn?: number,
) {
  return sign(payload, secret, { expiresIn: expiresIn });
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
