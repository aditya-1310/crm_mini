// Import Firebase modules
import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';

// Import environment configuration
import env from './env';

// Initialize Firebase with config from environment
if (!firebase.apps.length) {
  console.log('Initializing Firebase');
  try {
    firebase.initializeApp(env.firebase);
    console.log('Firebase initialized successfully');
  } catch (error) {
    console.error('Error initializing Firebase:', error);
  }
}

const auth = firebase.auth();
const googleProvider = new firebase.auth.GoogleAuthProvider();

// Configure Google provider
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

export { auth, googleProvider };
export default firebase; 