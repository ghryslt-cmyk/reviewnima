import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, collection, addDoc, getDocs, doc, getDoc, updateDoc, deleteDoc, query, where, orderBy, serverTimestamp } from 'firebase/firestore';

// Firebase configuration - REPLACE WITH YOUR OWN CONFIG
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const googleProvider = new GoogleAuthProvider();

// Admin email - only this email can access admin panel
const ADMIN_EMAIL = import.meta.env.VITE_ADMIN_EMAIL || 'your-admin-email@gmail.com';

// Authentication functions
export const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error) {
    console.error('Error signing in with Google:', error);
    throw error;
  }
};

export const logoutUser = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error('Error signing out:', error);
    throw error;
  }
};

export const onAuthChange = (callback) => {
  return onAuthStateChanged(auth, callback);
};

export const isAdmin = (user) => {
  return user && user.email === ADMIN_EMAIL;
};

// Firestore functions
export const addReview = async (reviewData) => {
  try {
    const docRef = await addDoc(collection(db, 'reviews'), {
      ...reviewData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    return docRef.id;
  } catch (error) {
    console.error('Error adding review:', error);
    throw error;
  }
};

export const getReviews = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, 'reviews'));
    const reviews = [];
    querySnapshot.forEach((doc) => {
      reviews.push({ id: doc.id, ...doc.data() });
    });
    return reviews;
  } catch (error) {
    console.error('Error getting reviews:', error);
    throw error;
  }
};

export const getReviewById = async (reviewId) => {
  try {
    const docRef = doc(db, 'reviews', reviewId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() };
    }
    return null;
  } catch (error) {
    console.error('Error getting review:', error);
    throw error;
  }
};

export const addComment = async (reviewId, commentData) => {
  try {
    const commentsRef = collection(db, 'reviews', reviewId, 'comments');
    const docRef = await addDoc(commentsRef, {
      ...commentData,
      createdAt: serverTimestamp()
    });
    return docRef.id;
  } catch (error) {
    console.error('Error adding comment:', error);
    throw error;
  }
};

export const getComments = async (reviewId) => {
  try {
    const commentsRef = collection(db, 'reviews', reviewId, 'comments');
    const querySnapshot = await getDocs(query(commentsRef, orderBy('createdAt', 'desc')));
    const comments = [];
    querySnapshot.forEach((doc) => {
      comments.push({ id: doc.id, ...doc.data() });
    });
    return comments;
  } catch (error) {
    console.error('Error getting comments:', error);
    throw error;
  }
};

export const getUserProfile = async (userId) => {
  try {
    const docRef = doc(db, 'users', userId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return docSnap.data();
    }
    return null;
  } catch (error) {
    console.error('Error getting user profile:', error);
    throw error;
  }
};

export const updateUserProfile = async (userId, profileData) => {
  try {
    const docRef = doc(db, 'users', userId);
    await updateDoc(docRef, profileData);
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw error;
  }
};

export const deleteReview = async (reviewId) => {
  try {
    const docRef = doc(db, 'reviews', reviewId);
    await deleteDoc(docRef);
  } catch (error) {
    console.error('Error deleting review:', error);
    throw error;
  }
};

export const toggleFavorite = async (reviewId, isFavorite) => {
  try {
    const docRef = doc(db, 'reviews', reviewId);
    await updateDoc(docRef, { isFavorite, updatedAt: serverTimestamp() });
  } catch (error) {
    console.error('Error toggling favorite:', error);
    throw error;
  }
};

export const getFavoriteReviews = async () => {
  try {
    const q = query(collection(db, 'reviews'), where('isFavorite', '==', true));
    const querySnapshot = await getDocs(q);
    const reviews = [];
    querySnapshot.forEach((doc) => {
      reviews.push({ id: doc.id, ...doc.data() });
    });
    return reviews;
  } catch (error) {
    console.error('Error getting favorite reviews:', error);
    throw error;
  }
};

export { auth, db };
