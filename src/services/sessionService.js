import {
  addDoc,
  collection,
  onSnapshot,
  query,
  serverTimestamp,
  where,
  doc,
  updateDoc,
  getDoc,
} from "firebase/firestore";
import { db } from "../firebase";
import { COLLECTIONS } from "../constants/firestoreCollections";

export const createSession = async ({
  requestId,
  studentId,
  studentName,
  studentPhotoURL,
  tutorId,
  tutorName,
  tutorPhotoURL,
  subject,
  date,
  time,
  notes,
}) => {
  let finalStudentPhotoURL = studentPhotoURL || "";
  let finalTutorPhotoURL = tutorPhotoURL || "";

  if (!finalStudentPhotoURL && studentId) {
    const studentSnap = await getDoc(doc(db, COLLECTIONS.USERS, studentId));
    if (studentSnap.exists()) {
      finalStudentPhotoURL = studentSnap.data().photoURL || "";
    }
  }

  if (!finalTutorPhotoURL && tutorId) {
    const tutorSnap = await getDoc(doc(db, COLLECTIONS.USERS, tutorId));
    if (tutorSnap.exists()) {
      finalTutorPhotoURL = tutorSnap.data().photoURL || "";
    }
  }

  return await addDoc(collection(db, COLLECTIONS.SESSIONS), {
    requestId,
    studentId,
    studentName,
    studentPhotoURL: finalStudentPhotoURL,
    tutorId,
    tutorName,
    tutorPhotoURL: finalTutorPhotoURL,
    subject,
    date,
    time,
    notes: notes || "",
    status: "pending",
    createdAt: serverTimestamp(),
  });
};

export const updateSessionStatus = async (sessionId, newStatus) => {
  const sessionRef = doc(db, COLLECTIONS.SESSIONS, sessionId);
  await updateDoc(sessionRef, {
    status: newStatus,
  });
};

export const subscribeToTutorSessions = (tutorId, callback, errorCallback) => {
  const q = query(
    collection(db, COLLECTIONS.SESSIONS),
    where("tutorId", "==", tutorId)
  );

  return onSnapshot(
    q,
    (snapshot) => {
      const sessions = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      sessions.sort((a, b) => {
        const aDateTime = `${a.date || ""} ${a.time || ""}`;
        const bDateTime = `${b.date || ""} ${b.time || ""}`;
        return aDateTime.localeCompare(bDateTime);
      });

      callback(sessions);
    },
    errorCallback
  );
};

export const subscribeToStudentSessions = (
  studentId,
  callback,
  errorCallback
) => {
  const q = query(
    collection(db, COLLECTIONS.SESSIONS),
    where("studentId", "==", studentId)
  );

  return onSnapshot(
    q,
    (snapshot) => {
      const sessions = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      sessions.sort((a, b) => {
        const aDateTime = `${a.date || ""} ${a.time || ""}`;
        const bDateTime = `${b.date || ""} ${b.time || ""}`;
        return aDateTime.localeCompare(bDateTime);
      });

      callback(sessions);
    },
    errorCallback
  );
};

export const cancelSession = async (sessionId) => {
  const sessionRef = doc(db, COLLECTIONS.SESSIONS, sessionId);
  await updateDoc(sessionRef, {
    status: "cancelled",
  });
};