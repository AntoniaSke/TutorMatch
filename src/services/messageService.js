import { db } from "../firebase";
import { COLLECTIONS } from "../constants/firestoreCollections";
import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from "firebase/firestore";

export const subscribeToAcceptedRequestContacts = (
  userId,
  role,
  onSuccess,
  onError
) => {
  const requestsRef = collection(db, COLLECTIONS.REQUESTS);
  const fieldName = role === "tutor" ? "tutorId" : "studentId";

  const q = query(
    requestsRef,
    where(fieldName, "==", userId),
    where("status", "==", "accepted")
  );

  return onSnapshot(
    q,
    async (snapshot) => {
      const contacts = await Promise.all(
        snapshot.docs.map(async (docSnap) => {
          const request = {
            id: docSnap.id,
            ...docSnap.data(),
          };

          const contactUserId =
            role === "tutor" ? request.studentId : request.tutorId;

          const userRef = doc(db, COLLECTIONS.USERS, contactUserId);
          const userSnap = await getDoc(userRef);
          const userData = userSnap.exists() ? userSnap.data() : {};

          return {
            requestId: request.id,
            userId: contactUserId,
            name:
              userData.name ||
              (role === "tutor" ? request.studentName : request.tutorName) ||
              "User",
            subject: request.subject || "",
            role: role === "tutor" ? "student" : "tutor",
            imageUrl:
              userData.imageUrl ||
              userData.profileImage ||
              userData.photoURL ||
              "",
          };
        })
      );

      onSuccess(contacts);
    },
    onError
  );
};

export const getOrCreateConversation = async ({
  currentUserId,
  contactUserId,
  currentUserName,
  contactName,
}) => {
  const conversationsRef = collection(db, COLLECTIONS.CONVERSATIONS);

  const q = query(
    conversationsRef,
    where("participants", "array-contains", currentUserId),
    limit(20)
  );

  const snapshot = await getDocs(q);

  const existingConversation = snapshot.docs.find((docSnap) => {
    const data = docSnap.data();
    return data.participants?.includes(contactUserId);
  });

  if (existingConversation) {
    return {
      id: existingConversation.id,
      ...existingConversation.data(),
    };
  }

  const conversationDoc = await addDoc(conversationsRef, {
    participants: [currentUserId, contactUserId],
    participantNames: {
      [currentUserId]: currentUserName || "Me",
      [contactUserId]: contactName || "User",
    },
    lastMessage: "",
    lastMessageSenderId: "",
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  return {
    id: conversationDoc.id,
    participants: [currentUserId, contactUserId],
    participantNames: {
      [currentUserId]: currentUserName || "Me",
      [contactUserId]: contactName || "User",
    },
    lastMessage: "",
    lastMessageSenderId: "",
  };
};

export const subscribeToConversationMessages = (
  conversationId,
  onSuccess,
  onError
) => {
  const messagesRef = collection(
    db,
    COLLECTIONS.CONVERSATIONS,
    conversationId,
    "messages"
  );

  const q = query(messagesRef, orderBy("createdAt", "asc"));

  return onSnapshot(
    q,
    (snapshot) => {
      const messages = snapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data(),
      }));

      onSuccess(messages);
    },
    onError
  );
};

export const sendMessage = async ({
  conversationId,
  senderId,
  receiverId,
  text,
}) => {
  const cleanText = text.trim();

  if (!cleanText) return;

  const messagesRef = collection(
    db,
    COLLECTIONS.CONVERSATIONS,
    conversationId,
    "messages"
  );

  await addDoc(messagesRef, {
    text: cleanText,
    senderId,
    createdAt: serverTimestamp(),
  });

  const conversationRef = doc(db, COLLECTIONS.CONVERSATIONS, conversationId);

 await updateDoc(conversationRef, {
  lastMessage: cleanText,
  lastMessageSenderId: senderId,
  updatedAt: serverTimestamp(),
  [`unreadBy.${receiverId}`]: true,
  [`unreadBy.${senderId}`]: false,
});
};

export const subscribeToUnreadMessagesCount = (userId, onSuccess, onError) => {
  const conversationsRef = collection(db, COLLECTIONS.CONVERSATIONS);

  const q = query(
    conversationsRef,
    where("participants", "array-contains", userId)
  );

  return onSnapshot(
    q,
    (snapshot) => {
      const unreadCount = snapshot.docs.filter((docSnap) => {
        const data = docSnap.data();
        return data.unreadBy?.[userId] === true;
      }).length;

      onSuccess(unreadCount);
    },
    onError
  );
};

export const markConversationAsRead = async (conversationId, userId) => {
  const conversationRef = doc(db, COLLECTIONS.CONVERSATIONS, conversationId);

  await updateDoc(conversationRef, {
    [`unreadBy.${userId}`]: false,
  });
};