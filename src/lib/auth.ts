import { initializeApp } from 'firebase/app';
import { getAuth, signInWithPopup, GoogleAuthProvider, onAuthStateChanged, User, signOut } from 'firebase/auth';
import { dummyFirebaseConfig } from './dummyConfig';

// Carrega a configuração real do Firebase se o arquivo existir na raiz do projeto.
// (O antigo `require` não existe em módulos ESM do Vite e sempre caía no catch.)
const realConfigs = import.meta.glob('../../firebase-applet-config.json', {
  eager: true,
  import: 'default',
}) as Record<string, { apiKey?: string } | undefined>;
const realConfig = Object.values(realConfigs)[0];

export const isFirebaseConfigured = !!realConfig?.apiKey;
const config = isFirebaseConfigured ? (realConfig as typeof dummyFirebaseConfig) : dummyFirebaseConfig;

const app = initializeApp(config);
export const auth = getAuth(app);

const provider = new GoogleAuthProvider();
provider.addScope('https://www.googleapis.com/auth/sheets'); 

let isSigningIn = false;
let cachedAccessToken: string | null = null;

export const initAuth = (
  onAuthSuccess?: (user: User, token: string) => void,
  onAuthFailure?: () => void
) => {
  if (!isFirebaseConfigured) {
    onAuthFailure?.();
    return () => {};
  }
  return onAuthStateChanged(auth, async (user: User | null) => {
    if (user) {
      if (cachedAccessToken) {
        if (onAuthSuccess) onAuthSuccess(user, cachedAccessToken);
      } else if (!isSigningIn) {
        // If we don't have token but user is signed in previously, we might need re-auth to get tokens, 
        // but for now we just handle it. 
        cachedAccessToken = null;
        if (onAuthFailure) onAuthFailure();
      }
    } else {
      cachedAccessToken = null;
      if (onAuthFailure) onAuthFailure();
    }
  });
};

export const googleSignIn = async (): Promise<{ user: User; accessToken: string } | null> => {
  if (!isFirebaseConfigured) {
    throw new Error('Firebase não configurado: adicione firebase-applet-config.json na raiz do projeto.');
  }
  try {
    isSigningIn = true;
    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (!credential?.accessToken) {
      throw new Error('Failed to get access token from Firebase Auth');
    }

    cachedAccessToken = credential.accessToken;
    return { user: result.user, accessToken: cachedAccessToken };
  } catch (error: any) {
    console.error('Sign in error:', error);
    throw error;
  } finally {
    isSigningIn = false;
  }
};

export const getAccessToken = async (): Promise<string | null> => {
  return cachedAccessToken;
};

export const logout = async () => {
  await signOut(auth);
  cachedAccessToken = null;
};
