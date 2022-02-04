import { Response } from "express";

export function internal_sendAuthData(
  res: Response,
  httpStatus: number,
  code: number,
  data: any,
  err: boolean = false
) {
  res.status(httpStatus).json({ auth: { code: code, err: err }, data: data });
}

export function internal_sendError(
  res: Response,
  httpStatus: number,
  code: number,
) {
  internal_sendAuthData(res, httpStatus, code, null, true)
}

export function internal_sendServerError(
  res: Response,
) {
  internal_sendError(res, 500, 5)
}

export function sendData(
  res: Response,
  httpStatus: number,
  data: any,
) {
  internal_sendAuthData(res, httpStatus, 0, data, false)
}
