import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, collection, addDoc, getDocs, doc, getDoc, updateDoc, deleteDoc, query, where, orderBy, serverTimestamp, setDoc } from 'firebase/firestore';

// Firebase configuration - REPLACE WITH YOUR OWN CONFIG
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

// Validate Firebase config
if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
  console.error('Firebase configuration is incomplete. Please check your environment variables.');
}

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
    throw new Error('Authentication failed. Please try again.');
  }
};

export const logoutUser = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error('Error signing out:', error);
    throw new Error('Logout failed. Please try again.');
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
    throw new Error('Failed to add review. Please try again.');
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
    throw new Error('Failed to fetch reviews. Please try again.');
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
    throw new Error('Failed to fetch review. Please try again.');
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
    throw new Error('Failed to add comment. Please try again.');
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
    throw new Error('Failed to fetch comments. Please try again.');
  }
};

export const deleteComment = async (reviewId, commentId) => {
  try {
    const commentRef = doc(db, 'reviews', reviewId, 'comments', commentId);
    await deleteDoc(commentRef);
  } catch (error) {
    console.error('Error deleting comment:', error);
    throw new Error('Failed to delete comment. Please try again.');
  }
};

export const addCommentReply = async (reviewId, commentId, replyData) => {
  try {
    const repliesRef = collection(db, 'reviews', reviewId, 'comments', commentId, 'replies');
    const docRef = await addDoc(repliesRef, {
      ...replyData,
      createdAt: serverTimestamp()
    });
    return docRef.id;
  } catch (error) {
    console.error('Error adding comment reply:', error);
    throw new Error('Failed to add reply. Please try again.');
  }
};

export const getCommentReplies = async (reviewId, commentId) => {
  try {
    const repliesRef = collection(db, 'reviews', reviewId, 'comments', commentId, 'replies');
    const querySnapshot = await getDocs(query(repliesRef, orderBy('createdAt', 'asc')));
    const replies = [];
    querySnapshot.forEach((doc) => {
      replies.push({ id: doc.id, ...doc.data() });
    });
    return replies;
  } catch (error) {
    console.error('Error getting comment replies:', error);
    throw new Error('Failed to fetch replies. Please try again.');
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
    throw new Error('Failed to fetch user profile. Please try again.');
  }
};

export const updateUserProfile = async (userId, profileData) => {
  try {
    const docRef = doc(db, 'users', userId);
    await updateDoc(docRef, profileData);
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw new Error('Failed to update user profile. Please try again.');
  }
};

export const deleteReview = async (reviewId) => {
  try {
    const docRef = doc(db, 'reviews', reviewId);
    await deleteDoc(docRef);
  } catch (error) {
    console.error('Error deleting review:', error);
    throw new Error('Failed to delete review. Please try again.');
  }
};

export const toggleFavorite = async (reviewId, isFavorite) => {
  try {
    const docRef = doc(db, 'reviews', reviewId);
    await updateDoc(docRef, { isFavorite, updatedAt: serverTimestamp() });
  } catch (error) {
    console.error('Error toggling favorite:', error);
    throw new Error('Failed to update favorite status. Please try again.');
  }
};

export const updateReview = async (reviewId, reviewData) => {
  try {
    const docRef = doc(db, 'reviews', reviewId);
    await updateDoc(docRef, {
      ...reviewData,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error updating review:', error);
    throw new Error('Failed to update review. Please try again.');
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
    throw new Error('Failed to fetch favorite reviews. Please try again.');
  }
};

// Visitor tracking functions
export const getVisitorCount = async () => {
  try {
    const docRef = doc(db, 'stats', 'visitors');
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return docSnap.data().count || 0;
    }
    return 0;
  } catch (error) {
    console.error('Error getting visitor count:', error);
    return 0;
  }
};

export const incrementVisitorCount = async () => {
  try {
    const docRef = doc(db, 'stats', 'visitors');
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      await updateDoc(docRef, {
        count: (docSnap.data().count || 0) + 1,
        lastUpdated: serverTimestamp()
      });
    } else {
      await addDoc(collection(db, 'stats'), {
        count: 1,
        lastUpdated: serverTimestamp()
      });
    }
  } catch (error) {
    console.error('Error incrementing visitor count:', error);
    // Silently fail for visitor count to not affect user experience
  }
};

// Anime management functions
export const addAnime = async (animeData) => {
  try {
    const docRef = await addDoc(collection(db, 'anime'), {
      ...animeData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    return docRef.id;
  } catch (error) {
    console.error('Error adding anime:', error);
    throw new Error('Failed to add anime. Please try again.');
  }
};

export const getAllAnime = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, 'anime'));
    const animeList = [];
    querySnapshot.forEach((doc) => {
      animeList.push({ id: doc.id, ...doc.data() });
    });
    return animeList;
  } catch (error) {
    console.error('Error getting anime:', error);
    throw new Error('Failed to fetch anime. Please try again.');
  }
};

export const getAnimeById = async (animeId) => {
  try {
    const docRef = doc(db, 'anime', animeId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() };
    }
    return null;
  } catch (error) {
    console.error('Error getting anime:', error);
    throw new Error('Failed to fetch anime. Please try again.');
  }
};

export const updateAnime = async (animeId, animeData) => {
  try {
    const docRef = doc(db, 'anime', animeId);
    await updateDoc(docRef, {
      ...animeData,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error updating anime:', error);
    throw new Error('Failed to update anime. Please try again.');
  }
};

export const deleteAnime = async (animeId) => {
  try {
    const docRef = doc(db, 'anime', animeId);
    await deleteDoc(docRef);
  } catch (error) {
    console.error('Error deleting anime:', error);
    throw new Error('Failed to delete anime. Please try again.');
  }
};

// Episode management functions
export const addAnimeEpisode = async (animeId, episodeData) => {
  try {
    const episodesRef = collection(db, 'anime', animeId, 'episodes');
    const docRef = await addDoc(episodesRef, {
      ...episodeData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    return docRef.id;
  } catch (error) {
    console.error('Error adding episode:', error);
    throw new Error('Failed to add episode. Please try again.');
  }
};

export const getAnimeEpisodes = async (animeId) => {
  try {
    const episodesRef = collection(db, 'anime', animeId, 'episodes');
    const querySnapshot = await getDocs(query(episodesRef, orderBy('episodeNumber', 'asc')));
    const episodes = [];
    querySnapshot.forEach((doc) => {
      episodes.push({ id: doc.id, ...doc.data() });
    });
    return episodes;
  } catch (error) {
    console.error('Error getting episodes:', error);
    throw new Error('Failed to fetch episodes. Please try again.');
  }
};

export const updateAnimeEpisode = async (animeId, episodeId, episodeData) => {
  try {
    const episodeRef = doc(db, 'anime', animeId, 'episodes', episodeId);
    await updateDoc(episodeRef, {
      ...episodeData,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error updating episode:', error);
    throw new Error('Failed to update episode. Please try again.');
  }
};

export const deleteAnimeEpisode = async (animeId, episodeId) => {
  try {
    const episodeRef = doc(db, 'anime', animeId, 'episodes', episodeId);
    await deleteDoc(episodeRef);
  } catch (error) {
    console.error('Error deleting episode:', error);
    throw new Error('Failed to delete episode. Please try again.');
  }
};

// Anime comment functions
export const addAnimeComment = async (animeId, commentData) => {
  try {
    const commentsRef = collection(db, 'anime', animeId, 'comments');
    const docRef = await addDoc(commentsRef, {
      ...commentData,
      createdAt: serverTimestamp()
    });
    return docRef.id;
  } catch (error) {
    console.error('Error adding anime comment:', error);
    throw new Error('Failed to add comment. Please try again.');
  }
};

export const getAnimeComments = async (animeId) => {
  try {
    const commentsRef = collection(db, 'anime', animeId, 'comments');
    const querySnapshot = await getDocs(query(commentsRef, orderBy('createdAt', 'desc')));
    const comments = [];
    querySnapshot.forEach((doc) => {
      comments.push({ id: doc.id, ...doc.data() });
    });
    return comments;
  } catch (error) {
    console.error('Error getting anime comments:', error);
    throw new Error('Failed to fetch comments. Please try again.');
  }
};

export const deleteAnimeComment = async (animeId, commentId) => {
  try {
    const commentRef = doc(db, 'anime', animeId, 'comments', commentId);
    await deleteDoc(commentRef);
  } catch (error) {
    console.error('Error deleting anime comment:', error);
    throw new Error('Failed to delete comment. Please try again.');
  }
};

export const addAnimeCommentReply = async (animeId, commentId, replyData) => {
  try {
    const repliesRef = collection(db, 'anime', animeId, 'comments', commentId, 'replies');
    const docRef = await addDoc(repliesRef, {
      ...replyData,
      createdAt: serverTimestamp()
    });
    return docRef.id;
  } catch (error) {
    console.error('Error adding anime comment reply:', error);
    throw new Error('Failed to add reply. Please try again.');
  }
};

export const getAnimeCommentReplies = async (animeId, commentId) => {
  try {
    const repliesRef = collection(db, 'anime', animeId, 'comments', commentId, 'replies');
    const querySnapshot = await getDocs(query(repliesRef, orderBy('createdAt', 'asc')));
    const replies = [];
    querySnapshot.forEach((doc) => {
      replies.push({ id: doc.id, ...doc.data() });
    });
    return replies;
  } catch (error) {
    console.error('Error getting anime comment replies:', error);
    throw new Error('Failed to fetch replies. Please try again.');
  }
};

// Save anime to user profile
export const saveAnimeToProfile = async (userId, animeData, userEmail) => {
  try {
    const userDocRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userDocRef);
    
    if (userDoc.exists()) {
      const userData = userDoc.data();
      const savedAnime = userData.savedAnime || [];
      
      // Check if anime is already saved
      if (!savedAnime.some(anime => anime.id === animeData.id)) {
        savedAnime.push({
          id: animeData.id,
          title: animeData.title,
          coverImage: animeData.coverImage,
          savedAt: new Date().toISOString()
        });
        await updateDoc(userDocRef, { savedAnime });
      }
    } else {
      // Create user document if it doesn't exist (using userId as document ID)
      await setDoc(userDocRef, {
        email: userEmail,
        savedAnime: [{
          id: animeData.id,
          title: animeData.title,
          coverImage: animeData.coverImage,
          savedAt: new Date().toISOString()
        }]
      });
    }
  } catch (error) {
    console.error('Error saving anime to profile:', error);
    throw new Error('Failed to save anime. Please try again.');
  }
};

export const removeAnimeFromProfile = async (userId, animeId) => {
  try {
    const userDocRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userDocRef);
    
    if (userDoc.exists()) {
      const userData = userDoc.data();
      const savedAnime = userData.savedAnime || [];
      const updatedSavedAnime = savedAnime.filter(anime => anime.id !== animeId);
      await updateDoc(userDocRef, { savedAnime: updatedSavedAnime });
    }
  } catch (error) {
    console.error('Error removing anime from profile:', error);
    throw new Error('Failed to remove anime. Please try again.');
  }
};

export const getSavedAnime = async (userId) => {
  try {
    const userDocRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userDocRef);
    
    if (userDoc.exists()) {
      const userData = userDoc.data();
      return userData.savedAnime || [];
    }
    return [];
  } catch (error) {
    console.error('Error getting saved anime:', error);
    throw new Error('Failed to fetch saved anime. Please try again.');
  }
};

// Report anime function (stores in Firestore, email integration requires backend service)
export const reportAnime = async (reportData) => {
  try {
    const docRef = await addDoc(collection(db, 'reports'), {
      ...reportData,
      createdAt: serverTimestamp(),
      status: 'pending'
    });
    return docRef.id;
  } catch (error) {
    console.error('Error reporting anime:', error);
    throw new Error('Failed to submit report. Please try again.');
  }
};

// Update user display name and photo URL
export const updateUserDisplayName = async (userId, displayName) => {
  try {
    // Update Firebase Auth profile
    const currentUser = auth.currentUser;
    if (currentUser && currentUser.updateProfile) {
      await currentUser.updateProfile({ displayName });
    }
    
    // Update Firestore document
    const userDocRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userDocRef);
    
    if (userDoc.exists()) {
      await updateDoc(userDocRef, { displayName });
    } else {
      await setDoc(userDocRef, { displayName });
    }
  } catch (error) {
    console.error('Error updating display name:', error);
    throw new Error('Failed to update display name. Please try again.');
  }
};

export const updateUserPhotoURL = async (userId, photoURL) => {
  try {
    // Update Firebase Auth profile
    const currentUser = auth.currentUser;
    if (currentUser && currentUser.updateProfile) {
      await currentUser.updateProfile({ photoURL });
    }
    
    // Update Firestore document
    const userDocRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userDocRef);
    
    if (userDoc.exists()) {
      await updateDoc(userDocRef, { photoURL });
    } else {
      await setDoc(userDocRef, { photoURL });
    }
  } catch (error) {
    console.error('Error updating photo URL:', error);
    throw new Error('Failed to update photo. Please try again.');
  }
};

// Rank management functions
export const updateUserRank = async (userId, rank) => {
  try {
    const userDocRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userDocRef);
    
    if (userDoc.exists()) {
      await updateDoc(userDocRef, { rank });
    } else {
      await setDoc(userDocRef, { rank });
    }
  } catch (error) {
    console.error('Error updating user rank:', error);
    throw new Error('Failed to update rank. Please try again.');
  }
};

export const getUserRank = async (userId) => {
  try {
    const userDocRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userDocRef);
    
    if (userDoc.exists()) {
      const userData = userDoc.data();
      console.log('getUserRank - User data:', userData, 'for userId:', userId);
      console.log('getUserRank - Rank field:', userData.rank, 'type:', typeof userData.rank);
      return userData.rank || null;
    }
    console.log('getUserRank - User document does not exist for userId:', userId);
    return null;
  } catch (error) {
    console.error('getUserRank - Error getting user rank:', error);
    return null;
  }
};

// Check if user can assign ranks (only admin)
export const canAssignRank = (userEmail) => {
  return userEmail === 'ghryslt@gmail.com';
};

// Get user by email (for admin rank assignment)
export const getUserByEmail = async (email) => {
  try {
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('email', '==', email));
    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
      const userDoc = querySnapshot.docs[0];
      return { id: userDoc.id, ...userDoc.data() };
    }
    return null;
  } catch (error) {
    console.error('Error getting user by email:', error);
    return null;
  }
};

// Get user rank by email (for comment display)
export const getUserRankByEmail = async (email) => {
  try {
    const user = await getUserByEmail(email);
    if (user && user.rank) {
      return user.rank;
    }
    return null;
  } catch (error) {
    console.error('Error getting user rank by email:', error);
    return null;
  }
};

export { auth, db, doc, getDoc, setDoc };
