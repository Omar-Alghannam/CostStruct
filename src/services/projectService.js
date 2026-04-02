/**
 * Projects Firestore Service
 * CRUD operations for projects collection.
 * Each project is scoped to the authenticated user via userId field.
 */
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
  orderBy,
  getDocs,
  onSnapshot,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '../config/firebase';

const COLLECTION = 'projects';

// Create a new project
export async function createProject(userId, projectData) {
  const docRef = await addDoc(collection(db, COLLECTION), {
    ...projectData,
    userId,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return docRef.id;
}

// Update an existing project
export async function updateProject(projectId, projectData) {
  const docRef = doc(db, COLLECTION, projectId);
  await updateDoc(docRef, {
    ...projectData,
    updatedAt: serverTimestamp(),
  });
}

// Delete a project
export async function deleteProject(projectId) {
  await deleteDoc(doc(db, COLLECTION, projectId));
}

// Get all projects for a user (one-time fetch)
export async function getProjects(userId) {
  const q = query(
    collection(db, COLLECTION),
    where('userId', '==', userId),
    orderBy('createdAt', 'desc')
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
}

// Subscribe to projects in real-time
export function subscribeToProjects(userId, callback, onError) {
  const q = query(
    collection(db, COLLECTION),
    where('userId', '==', userId),
    orderBy('createdAt', 'desc')
  );
  return onSnapshot(
    q,
    (snapshot) => {
      const projects = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
      callback(projects);
    },
    (error) => {
      console.error('Error subscribing to projects:', error);
      if (onError) onError(error);
    }
  );
}
