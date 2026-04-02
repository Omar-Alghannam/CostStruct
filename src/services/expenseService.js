/**
 * Expenses Firestore Service
 * CRUD operations for expenses collection.
 * Each expense is scoped to the authenticated user and linked to a project.
 * Supports filtering by category, project, and date range.
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

const COLLECTION = 'expenses';

// Create a new expense
export async function createExpense(userId, expenseData) {
  const docRef = await addDoc(collection(db, COLLECTION), {
    ...expenseData,
    userId,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return docRef.id;
}

// Update an existing expense
export async function updateExpense(expenseId, expenseData) {
  const docRef = doc(db, COLLECTION, expenseId);
  await updateDoc(docRef, {
    ...expenseData,
    updatedAt: serverTimestamp(),
  });
}

// Delete an expense
export async function deleteExpense(expenseId) {
  await deleteDoc(doc(db, COLLECTION, expenseId));
}

// Get all expenses for a user (one-time fetch)
export async function getExpenses(userId) {
  const q = query(
    collection(db, COLLECTION),
    where('userId', '==', userId),
    orderBy('date', 'desc')
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
}

// Get expenses by category
export async function getExpensesByCategory(userId, category) {
  const q = query(
    collection(db, COLLECTION),
    where('userId', '==', userId),
    where('category_en', '==', category),
    orderBy('date', 'desc')
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
}

// Get expenses by project
export async function getExpensesByProject(userId, projectId) {
  const q = query(
    collection(db, COLLECTION),
    where('userId', '==', userId),
    where('projectId', '==', projectId),
    orderBy('date', 'desc')
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
}

// Subscribe to expenses in real-time
export function subscribeToExpenses(userId, callback, onError) {
  const q = query(
    collection(db, COLLECTION),
    where('userId', '==', userId),
    orderBy('date', 'desc')
  );
  return onSnapshot(
    q,
    (snapshot) => {
      const expenses = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
      callback(expenses);
    },
    (error) => {
      console.error('Error subscribing to expenses:', error);
      if (onError) onError(error);
    }
  );
}

// Subscribe to expenses by category
export function subscribeToExpensesByCategory(userId, category, callback, onError) {
  const q = query(
    collection(db, COLLECTION),
    where('userId', '==', userId),
    where('category_en', '==', category),
    orderBy('date', 'desc')
  );
  return onSnapshot(
    q,
    (snapshot) => {
      const expenses = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
      callback(expenses);
    },
    (error) => {
      console.error(`Error subscribing to expenses (category: ${category}):`, error);
      if (onError) onError(error);
    }
  );
}

// Expense categories definition (bilingual)
export const EXPENSE_CATEGORIES = {
  labor: { en: 'Labor', ar: 'مصنعية' },
  materials: { en: 'Materials', ar: 'مواد بناء' },
  equipment: { en: 'Equipment', ar: 'معدات' },
  administrative: { en: 'Administrative', ar: 'إدارية' },
  subcontractor: { en: 'Subcontractor', ar: 'مقاول باطن' },
  permits: { en: 'Permits', ar: 'تصاريح' },
  insurance: { en: 'Insurance', ar: 'تأمين' },
  transportation: { en: 'Transportation', ar: 'نقل' },
  utilities: { en: 'Utilities', ar: 'مرافق' },
  other: { en: 'Other', ar: 'أخرى' },
};
