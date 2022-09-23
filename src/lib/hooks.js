import { useState, useEffect } from "react";
import { onSnapshot, doc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { db, auth  } from "./firebaseConfig";

export const useUserData = () => {
  const [user, setUser] = useState(null);
  const [username, setUsername] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let unsubscribe;
    setLoading(true);
    onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user);
        const userRef = doc(db, "users", user.uid);
        unsubscribe = onSnapshot(userRef, (docRef) => {
          setUsername(docRef.data()?.username);
          setLoading(false);
        });
      } else {
        setUser(null);
        setUsername(null);
        setLoading(false);
      }
      return unsubscribe;
    });
  }, [user]);
  return { user, username, loading };
};