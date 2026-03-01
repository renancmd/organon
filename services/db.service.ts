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

export const getProfile = async () => {
  const user = auth.currentUser;

  const docSnap = await getDoc(doc(db, "users", user.uid));

  const profile = {
    email: docSnap.data().email,
    name: docSnap.data().name,
  };

  return profile;
};

export const updateEmail = async (email: string) => {
  const user = auth.currentUser;

  await updateDoc(doc(db, "users", user.uid), { email: email });
};

// Calendar
export const createEvent = async (event) => {
  const user = auth.currentUser;
  const eventRef = collection(db, "users", user.uid, "events");

  await addDoc(eventRef, event);
};

export const updateEvent = async (
  eventId: string,
  eventData: Record<string, any>,
) => {
  const user = auth.currentUser;
  const eventDocRef = doc(db, "users", user.uid, "events", eventId);
  await updateDoc(eventDocRef, eventData);
};

export const deleteEvent = async (eventId: string) => {
  const user = auth.currentUser;
  const eventDocRef = doc(db, "users", user.uid, "events", eventId);
  await deleteDoc(eventDocRef);
};

export const getEvents = async () => {
  const user = auth.currentUser;
  const subCollectionRef = collection(db, "users", user.uid, "events");

  const snapshot = await getDocs(subCollectionRef);

  const events = snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));

  return events;
};

// Tasks
export const createTask = async (task: Record<string, any>) => {
  const user = auth.currentUser;

  if (!user) {
    throw new Error("User must be logged in to create a task.");
  }

  await addDoc(collection(db, "users", user.uid, "tasks"), task);
};

export const completeTask = async (isCompleted: boolean, taskId: string) => {
  const user = auth.currentUser;

  const taskDocRef = doc(db, "users", user.uid, "tasks", taskId);

  await updateDoc(taskDocRef, {
    completed: isCompleted,
  });
};

export const updateTask = async (taskId, task) => {
  const user = auth.currentUser;

  const taskDocRef = doc(db, "users", user.uid, "tasks", taskId);

  await updateDoc(taskDocRef, task);
};

export const getTasks = async () => {
  const user = auth.currentUser;
  const subCollectionRef = collection(db, "users", user.uid, "tasks");

  const snapshot = await getDocs(subCollectionRef);

  const tasks = snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));

  return tasks;
};

export const deleteTask = async (taskId: string) => {
  const user = auth.currentUser;
  const taskDocRef = doc(db, "users", user.uid, "tasks", taskId);

  await deleteDoc(taskDocRef);
};

// Areas
export const getAreas = async () => {
  const user = auth.currentUser;
  const subCollectionRef = collection(db, "users", user.uid, "areas");

  const snapshot = await getDocs(subCollectionRef);

  const areas = snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));

  return areas;
};
