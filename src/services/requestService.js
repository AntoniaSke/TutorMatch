import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../firebase";
import { COLLECTIONS } from "../constants/firestoreCollections";

export const getExistingPendingRequest = async ({
  studentId,
  tutorId,
  subject,
}) => {
  const q = query(
    collection(db, COLLECTIONS.REQUESTS),
    where("studentId", "==", studentId),
    where("tutorId", "==", tutorId),
    where("subject", "==", subject),
    where("status", "==", "pending")
  );

  return await getDocs(q);
};

export const createRequest = async ({
  studentId,
  studentName,
  studentPhotoURL,
  studentEducationLevel,
  studentAvailability,
  studentLearningGoals,
  tutorId,
  tutorName,
  tutorPhotoURL,
  tutorTeachingLevel,
  tutorAvailability,
  tutorHourlyRate,
  tutorSubjects,
  subject,
  message,
}) => {
  return await addDoc(collection(db, COLLECTIONS.REQUESTS), {
    studentId,
    studentName,
    studentPhotoURL,
    studentEducationLevel,
    studentAvailability,
    studentLearningGoals,
    tutorId,
    tutorName,
    tutorPhotoURL,
    tutorTeachingLevel,
    tutorAvailability,
    tutorHourlyRate,
    tutorSubjects,
    subject,
    message,
    status: "pending",
    createdAt: serverTimestamp(),
  });
};