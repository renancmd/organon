import { auth, db } from "../config/firebase";
import {
  doc,
  collection,
  addDoc,
  getDoc,
  getDocs,
  updateDoc,
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

// Tasks
export const createTask = async (task: Record<string, any>) => {
  const user = auth.currentUser;

  if (!user) {
    throw new Error("User must be logged in to create a task.");
  }

  await addDoc(collection(db, "users", user.uid, "tasks"), task);
  
};

export const updateTask = async () => {};

export const deleteTask = async () => {};

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
