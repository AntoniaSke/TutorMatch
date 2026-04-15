import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";
import { COLLECTIONS } from "../constants/firestoreCollections";

export const getUserProfile = async (uid) => {
  const userRef = doc(db, COLLECTIONS.USERS, uid);
  const userSnap = await getDoc(userRef);
  return userSnap;
};

export const createUserProfile = async ({ uid, name, email, role, extraData = {} }) => {
  const userRef = doc(db, COLLECTIONS.USERS, uid);

  await setDoc(userRef, {
    name,
    email,
    role,
    createdAt: serverTimestamp(),
    ...extraData,
  });
};

export const updateUserProfile = async (uid, data) => {
  const userRef = doc(db, COLLECTIONS.USERS, uid);
  await updateDoc(userRef, data);
};