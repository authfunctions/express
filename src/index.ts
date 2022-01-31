import { AuthInstance } from "./AuthInstance.class";
import express from "express";

const auth = new AuthInstance({
  accessTokenSecret: "",
  refreshTokenSecret: "",
});

auth.use("checkToken", ({ token }) => {
  try {
    return [false, true];
  } catch (error) {
    return [true, null];
  }
});