# TutorMatch

https://tutor-match-sage.vercel.app/

# TutorMatch – Full Stack Web Application

## 📌 Overview

TutorMatch is a full-stack web application that connects students with tutors based on subjects, availability, and learning goals.
The platform allows users to create accounts, search for tutors, send requests, schedule sessions, and leave reviews.


---

## 🚀 Tech Stack

### Frontend

* React (Vite)
* CSS (custom styling)
* React Router
* React Hot Toast

### Backend (BaaS)

* Firebase Authentication
* Firestore Database
* Firebase Admin SDK (for admin scripts)

### External Services

* Cloudinary (image uploads)

---

## 🧠 Architecture

The application follows a **frontend-heavy architecture** using Firebase as a Backend-as-a-Service.

### Key Concepts:

* **Authentication** handled via Firebase Auth
* **Database** using Firestore (NoSQL)
* **Real-time updates** using `onSnapshot`
* **Service layer abstraction** (e.g. `requestService`, `sessionService`, `reviewService`)

---

## 📂 Firestore Data Model

### `users`

Stores user profiles.

```js
{
  name,
  email,
  role: "student" | "tutor",
  bio,
  subjects: [],
  teachingLevel,
  availability,
  hourlyRate,
  photoURL
}
```

---

### `requests`

Represents a student's request to a tutor.

```js
{
  studentId,
  tutorId,
  subject,
  message,
  status: "pending" | "accepted" | "rejected",
  createdAt
}
```

---

### `sessions`

Created after a request is accepted.

```js
{
  studentId,
  tutorId,
  subject,
  date,
  time,
  notes,
  status: "pending" | "confirmed" | "completed" | "cancelled"
}
```

---

### `reviews`

Stores feedback from students.

```js
{
  studentId,
  tutorId,
  rating,
  comment,
  createdAt
}
```

---

## 🔑 Core Features

### 1. Authentication

* Register/Login for students and tutors
* Role-based routing (student dashboard / tutor dashboard)

---

### 2. Find Tutors

* Filter by subject and level
* View tutor profiles in modal
* Send requests

👉 Important detail:

* Tutors are publicly readable via Firestore rules
* The current tutor is filtered out from results in the frontend

---

### 3. Requests System

* Students send requests
* Tutors accept/reject
* Prevent duplicate pending requests

---

### 4. Sessions Management

* Tutors schedule sessions
* Students confirm sessions
* Both can cancel or complete

---

### 5. Reviews System

* Students leave reviews after sessions
* Ratings are calculated dynamically (not stored in user)

```js
average = sum(ratings) / total_reviews
```

---

### 6. Dashboards

#### Tutor Dashboard

* Requests
* Students
* Sessions
* Reviews
* Overview

#### Student Dashboard

* Requests
* My Tutors
* Sessions
* Overview

---

## ⚙️ Firestore Rules (Security)

Key decisions:

* Public read access only for tutors
* Users can only modify their own data
* Requests & sessions are restricted by ownership

Example:

```js
allow read: if resource.data.role == "tutor"
  || request.auth.uid == userId;
```

---

## ⚠️ Challenges Faced

### 1. Data Consistency (NoSQL)

* No joins → had to duplicate data (e.g. tutor info in requests/sessions)

---

### 2. Real-time vs Manual Fetch

* Decided where to use:

  * `getDocs` (static)
  * `onSnapshot` (live updates)

---

### 3. Ratings System

* Ratings are not stored in users
* Calculated dynamically from reviews collection
* Required extra queries

---

### 4. Firestore Security Rules

* Needed to allow public tutor browsing
* While protecting private user data

---

### 5. Image Handling

* Users upload images → stored in Cloudinary
* URL saved in Firestore

---

### 6. State Management Complexity

* Many components share data (requests, sessions, reviews)
* Solved using:

  * service layer
  * prop passing
  * modular components

---

## 🧩 Future Improvements

* Messaging system (real-time chat)
* Payment integration
* Better filtering & search
* Pagination for scalability
* Move public tutor data to separate collection
* Store precomputed ratings (performance optimization)

---

## 🎯 What I Learned

* Designing scalable NoSQL schemas
* Handling real-time data in React
* Structuring a full application (not just components)
* Writing secure backend rules
* Separating concerns (services vs UI)

---

## 💬 Interview Talking Points


### Why Firebase?

* Faster development
* Built-in auth + database
* Real-time capabilities

---

### Why separate collections?

* Firestore doesn’t support joins
* Needed independent scaling

---

### Why calculate ratings dynamically?

* Keeps data consistent
* Avoids sync issues
* Tradeoff: performance

---

### Hardest part?

* Data flow between requests → sessions → reviews
* Firestore rules
* Managing multiple states

---

### What would you improve?

* Backend with Node.js instead of Firebase
* Better caching
* More scalable architecture

---

## 🧪 How to Run

```bash
npm install
npm run dev
```

---

## 🔐 Important Notes

Sensitive files are excluded:

* `.env`
* Firebase service account keys

---

## 📎 Conclusion

TutorMatch simulates a real-world tutoring platform and demonstrates:

* Full-stack thinking
* State management
* Real-time systems
* Secure backend design

---

