import { auth, db } from "../config/firebase";
import {
  doc,
  collection,
  addDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";

const requireUser = () => {
  const user = auth.currentUser;
  if (!user) {
    throw new Error("User must be logged in to perform this action.");
  }
  return user;
};

// Profile
export const getProfile = async () => {
  const user = requireUser();

  const docSnap = await getDoc(doc(db, "users", user.uid));

  if (!docSnap.exists()) return null;

  const profile = {
    email: docSnap.data().email,
    name: docSnap.data().name,
  };

  return profile;
};

export const updateEmail = async (email: string) => {
  const user = requireUser();

  await updateDoc(doc(db, "users", user.uid), { email: email });
};

// Calendar
export const createEvent = async (event: any) => {
  const user = requireUser();
  const eventRef = collection(db, "users", user.uid, "events");

  await addDoc(eventRef, event);
};

export const updateEvent = async (
  eventId: string,
  eventData: Record<string, string>, 
) => {
  const user = requireUser();
  const eventDocRef = doc(db, "users", user.uid, "events", eventId);
  await updateDoc(eventDocRef, eventData);
};

export const deleteEvent = async (eventId: string) => {
  const user = requireUser();
  const eventDocRef = doc(db, "users", user.uid, "events", eventId);
  await deleteDoc(eventDocRef);
};

export const getEvents = async () => {
  const user = requireUser();
  const subCollectionRef = collection(db, "users", user.uid, "events");

  const snapshot = await getDocs(subCollectionRef);

  const events = snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));

  return events;
};

// Tasks
export const createTask = async (task: any) => {
  const user = requireUser();

  await addDoc(collection(db, "users", user.uid, "tasks"), task);
};

export const completeTask = async (isCompleted: boolean, taskId: string) => {
  const user = requireUser();

  const taskDocRef = doc(db, "users", user.uid, "tasks", taskId);

  await updateDoc(taskDocRef, {
    completed: isCompleted,
  });
};

export const updateTask = async (taskId: string, task: any) => {
  const user = requireUser();

  const taskDocRef = doc(db, "users", user.uid, "tasks", taskId);

  await updateDoc(taskDocRef, task);
};

export const getTasks = async () => {
  const user = requireUser();
  const subCollectionRef = collection(db, "users", user.uid, "tasks");

  const snapshot = await getDocs(subCollectionRef);

  const tasks = snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));

  return tasks;
};

export const deleteTask = async (taskId: string) => {
  const user = requireUser();
  const taskDocRef = doc(db, "users", user.uid, "tasks", taskId);

  await deleteDoc(taskDocRef);
};

// Areas
export const getAreas = async () => {
  const user = requireUser();
  const subCollectionRef = collection(db, "users", user.uid, "areas");

  const snapshot = await getDocs(subCollectionRef);

  const areas = snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));

  return areas;
};
