import { createContext, useContext, useEffect, useState } from "react";
import {
  onAuthStateChanged,
  signOut,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  getIdToken,
} from "firebase/auth";
import { auth, googleProvider } from "./firebaseClient";
import { apiFetch } from "./utils/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [idToken, setIdToken] = useState(null);
  const [me, setMe] = useState(null);
  const [loadingAuth, setLoadingAuth] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      setUser(u || null);

      if (!u) {
        setIdToken(null);
        setMe(null);
        localStorage.removeItem("idToken");
        setLoadingAuth(false);
        return;
      }

      const token = await getIdToken(u); // no forced refresh on page reload, only when user changes or login/signup
      setIdToken(token);
      localStorage.setItem("idToken", token);
      setLoadingAuth(false);
    });

    return () => unsub();
  }, []);

  useEffect(() => {
    if (!idToken) return;

    // don't block UI
    setMe(null);

    (async () => {
      try {
        const data = await apiFetch("/api/auth/me", { token: idToken });
        setMe(data);
      } catch {
        setMe(null);
      }
    })();
  }, [idToken]);

  const login = async (email, password) => {
    const cred = await signInWithEmailAndPassword(auth, email, password);







    const token = await getIdToken(cred.user, true);
    setIdToken(token);
    localStorage.setItem("idToken", token);
    return cred;
  };

  const signup = async (email, password) => {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    const token = await getIdToken(cred.user, true);
    setIdToken(token);
    localStorage.setItem("idToken", token);
    return cred;
  };

  const loginWithGoogle = async () => {
    const cred = await signInWithPopup(auth, googleProvider);
    const token = await getIdToken(cred.user, true);
    setIdToken(token);
    localStorage.setItem("idToken", token);
    return cred;
  };

  const logout = async () => {
    try {
      if (idToken) await apiFetch("/api/auth/logout", { method: "POST", token: idToken });
    } catch {}
    await signOut(auth);
    setUser(null);
    setIdToken(null);
    setMe(null);
    localStorage.removeItem("idToken");
  };

  return (
    <AuthContext.Provider
      value={{ user, idToken, me, loadingAuth, login, signup, loginWithGoogle, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
