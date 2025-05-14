// Environment configuration with fallbacks to ensure the app works
const env = {
  // Firebase configuration
  firebase: {
    apiKey: process.env.REACT_APP_FIREBASE_API_KEY || "AIzaSyBATSgEl3k8O5n2Fn7R9-PbQKG_EuMnP_o",
    authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN || "xeno-crm-ae680.firebaseapp.com",
    projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID || "xeno-crm-ae680",
    storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET || "xeno-crm-ae680.firebasestorage.app",
    messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID || "1028254529357",
    appId: process.env.REACT_APP_FIREBASE_APP_ID || "1:1028254529357:web:84625a8ddd6d4cdd46a904"
  },
  
  // API URLs
  api: {
    baseUrl: process.env.REACT_APP_API_URL || "http://localhost:5000/api"
  }
};

// Log environment configuration (exclude sensitive values in production)
if (process.env.NODE_ENV !== 'production') {
  console.log('Environment Configuration:', {
    ...env,
    firebase: {
      ...env.firebase,
      apiKey: env.firebase.apiKey ? '***' : 'Not set'
    }
  });
}

export default env; 