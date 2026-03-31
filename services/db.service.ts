import { auth, db } from "../config/firebase";
import {
  doc,
  collection,
  addDoc,
  setDoc,
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

// --- Projects Refactored CRUD ---

/**
 * Creates a project with the new structure
 * Includes: name, description, createdAt, deadline (opt), objectives[]
 */
export const createProject = async (projectData: {
  name: string;
  description: string;
  deadline?: string;
}) => {
  const user = requireUser();

  const newProject = {
    ...projectData,
    createdAt: new Date().toISOString(),
    archived: false,
    objectives: [], // Starts empty
  };

  return await addDoc(
    collection(db, "users", user.uid, "projects"),
    newProject,
  );
};

/**
 * Updates project header or the entire object
 */
export const updateProject = async (projectId: string, projectData: any) => {
  const user = requireUser();
  const projectDocRef = doc(db, "users", user.uid, "projects", projectId);

  return await updateDoc(projectDocRef, projectData);
};

/**
 * Specialized function to toggle a goal checkbox
 * This preserves the rest of the project data
 */
export const toggleGoalStatus = async (
  projectId: string,
  objIndex: number,
  goalIndex: number,
  currentStatus: boolean,
) => {
  const user = requireUser();
  const projectDocRef = doc(db, "users", user.uid, "projects", projectId);

  // 1. Get the current document
  const docSnap = await getDoc(projectDocRef);
  if (!docSnap.exists()) throw new Error("Project not found");

  const data = docSnap.data();
  const objectives = [...data.objectives];

  // 2. Flip the status at the specific nested index
  if (objectives[objIndex]?.goals[goalIndex]) {
    objectives[objIndex].goals[goalIndex].done = !currentStatus;
  }

  // 3. Update only the objectives array
  return await updateDoc(projectDocRef, { objectives });
};

/**
 * Fetch all projects for the list view
 */
export const getProjects = async () => {
  const user = requireUser();
  const subCollectionRef = collection(db, "users", user.uid, "projects");
  const snapshot = await getDocs(subCollectionRef);

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));
};

/**
 * Fetch a single project by ID
 */
export const getProjectById = async (projectId: string) => {
  const user = requireUser();
  const projectDocRef = doc(db, "users", user.uid, "projects", projectId);
  const docSnap = await getDoc(projectDocRef);

  if (!docSnap.exists()) return null;
  return { id: docSnap.id, ...docSnap.data() };
};

/**
 * Deletes the project
 */
export const deleteProject = async (projectId: string) => {
  const user = requireUser();
  const projectDocRef = doc(db, "users", user.uid, "projects", projectId);
  return await deleteDoc(projectDocRef);
};

// --- Habits ---
export const createHabit = async (habitData: any) => {
  const user = requireUser();
  // Add to Firestore and return the generated ID
  const docRef = await addDoc(
    collection(db, "users", user.uid, "habits"),
    habitData,
  );
  return docRef.id;
};

export const getHabits = async () => {
  const user = requireUser();
  const subCollectionRef = collection(db, "users", user.uid, "habits");
  const snapshot = await getDocs(subCollectionRef);

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));
};

export const updateHabit = async (habitId: string, habitData: any) => {
  const user = requireUser();
  const habitDocRef = doc(db, "users", user.uid, "habits", habitId);
  await updateDoc(habitDocRef, habitData);
};

export const deleteHabit = async (habitId: string) => {
  const user = requireUser();
  const habitDocRef = doc(db, "users", user.uid, "habits", habitId);
  await deleteDoc(habitDocRef);
};

// --- Journal ---
export const getJournalEntries = async () => {
  const user = requireUser();
  const journalCollectionRef = collection(
    db,
    "users",
    user.uid,
    "journal_entries",
  );
  const snapshot = await getDocs(journalCollectionRef);

  // Map the database data to our MappedJournalEntry type
  // Database uses 'gratitude' and 'memory'
  // Local type uses 'grateful' and 'memory'
  const mappedEntries = snapshot.docs
    .map((doc) => {
      const data = doc.data();
      return {
        id: doc.id, // The document ID (e.g., '2025-06-27')
        date: data.date,
        grateful: data.gratitude || "", // Map gratitude from DB to grateful locally
        memory: data.memory || "",
        // Add attachment property. For old data without it, it will be undefined.
        attachment: data.attachment,
      };
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return mappedEntries;
};

export const createJournalEntry = async (entry: Omit<JournalEntry, "id">) => {
  const user = requireUser();
  // Use the date string as the doc ID (e.g., '2026-03-28') for instant searching
  const journalDocRef = doc(
    db,
    "users",
    user.uid,
    "journal_entries",
    entry.date,
  );

  // Map local entry data (grateful) to database data structure (gratitude, memory)
  const dbData = {
    date: entry.date,
    gratitude: entry.grateful, // Map grateful from UI to gratitude in DB
    memory: entry.memory,
    attachment: entry.attachment || null, // Explicitly handle null for attachment
  };

  // Use setDoc because we are specifying the ID (the date string)
  await setDoc(journalDocRef, dbData);
};

export const deleteJournalEntry = async (dateId: string) => {
  const user = requireUser();
  // Since we use the date as the document ID, we pass the date string to delete it
  const journalDocRef = doc(db, "users", user.uid, "journal_entries", dateId);
  await deleteDoc(journalDocRef);
};
