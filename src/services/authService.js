import {
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  createUserWithEmailAndPassword,
} from "firebase/auth";
import { auth } from "../firebase";

export const loginWithEmail = async ({ email, password }) => {
  return await signInWithEmailAndPassword(auth, email.trim(), password);
};

export const sendResetPasswordEmail = async (email) => {
  return await sendPasswordResetEmail(auth, email.trim());
};

export const registerWithEmail = async ({ email, password }) => {
  return await createUserWithEmailAndPassword(auth, email.trim(), password);
};