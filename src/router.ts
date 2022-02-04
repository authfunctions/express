import { Router } from "express"
import { PassedInfos } from "./AuthInstance.class"
import check from "./Routes/check"
import login from "./Routes/login"
import logout from "./Routes/logout"
import refresh from "./Routes/refresh"
import register from "./Routes/register"

export function createRouter (props: PassedInfos) {
  const authRouter = Router()

  //the route for register
  authRouter.post("/register", register(props))

  //the route for login
  authRouter.post("/login", login(props))

  //the route for logout
  authRouter.post("/logout", logout(props))

  //the route for check
  authRouter.post("/check", check(props))

  //the route for refresh
  authRouter.post("/refresh", refresh(props))

  return authRouter
}

