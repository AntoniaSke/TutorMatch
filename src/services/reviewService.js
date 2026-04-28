import {
  addDoc,
  collection,
  getDocs,
  onSnapshot,
  query,
  serverTimestamp,
  where,
} from "firebase/firestore";
import { db } from "../firebase";
import { COLLECTIONS } from "../constants/firestoreCollections";

export const createReview = async ({
  tutorId,
  tutorName,
  studentId,
  studentName,
  sessionId,
  rating,
  comment,
}) => {
  return await addDoc(collection(db, COLLECTIONS.REVIEWS), {
    tutorId,
    tutorName,
    studentId,
    studentName,
    sessionId,
    rating,
    comment,
    createdAt: serverTimestamp(),
  });
};

export const getExistingReviewForSession = async ({ sessionId, studentId }) => {
  const q = query(
    collection(db, COLLECTIONS.REVIEWS),
    where("sessionId", "==", sessionId),
    where("studentId", "==", studentId)
  );

  return await getDocs(q);
};

export const subscribeToTutorReviews = (tutorId, callback, errorCallback) => {
  const q = query(
    collection(db, COLLECTIONS.REVIEWS),
    where("tutorId", "==", tutorId)
  );

  return onSnapshot(
    q,
    (snapshot) => {
      const reviews = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      reviews.sort((a, b) => {
        const aTime = a.createdAt?.seconds || 0;
        const bTime = b.createdAt?.seconds || 0;
        return bTime - aTime;
      });

      callback(reviews);
    },
    errorCallback
  );
};

export const calculateAverageRating = (reviews = []) => {
  if (!reviews.length) return null;

  const total = reviews.reduce(
    (sum, review) => sum + Number(review.rating || 0),
    0
  );

  return Number((total / reviews.length).toFixed(1));
};

export const getExistingReviewForTutor = async ({ tutorId, studentId }) => {
  const q = query(
    collection(db, COLLECTIONS.REVIEWS),
    where("tutorId", "==", tutorId),
    where("studentId", "==", studentId)
  );

  return await getDocs(q);
};