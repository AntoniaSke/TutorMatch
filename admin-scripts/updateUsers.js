const admin = require("firebase-admin");
const serviceAccount = require("./serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

// 🔥 ΕΔΩ ΒΑΖΕΙΣ ΤΟΥΣ ΧΡΗΣΤΕΣ ΠΟΥ ΘΕΣ ΝΑ ΔΙΟΡΘΩΣΕΙΣ
const usersToUpdate = [
  {
    uid: "Q5FNTrZq9ghpClPKzCY5fktOfTJ3",
    newEmail: "elena.pap@gmail.com",
  },
   
 
];

async function updateUsers() {
  for (const user of usersToUpdate) {
    try {
      // 1. Update Authentication
      await admin.auth().updateUser(user.uid, {
        email: user.newEmail,
        emailVerified: true,
      });

      console.log(`✅ Auth updated: ${user.uid}`);

      // 2. Update Firestore
      await db.collection("users").doc(user.uid).update({
        email: user.newEmail,
      });

      console.log(`✅ Firestore updated: ${user.uid}`);
    } catch (error) {
      console.error(`❌ Error for ${user.uid}:`, error.message);
    }
  }

  console.log("🎉 DONE");
}

updateUsers();