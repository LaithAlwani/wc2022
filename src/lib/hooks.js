import { useState, useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { db, auth } from "./firebaseConfig";
import { collection, doc, onSnapshot, query } from "firebase/firestore";

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

export const useGetStandings = () => {
  const [loading, setLoading] = useState(false);
  const [groups, setGroups] = useState([]);
  const [message, setMessage] = useState("")

  useEffect(() => {
    let unsub;
    setLoading(true);
    const q = query(collection(db, "groups"));
    unsub = onSnapshot(q, (querySnapshot) => {
      const groupsTemp = [];
      querySnapshot.forEach((doc) => {
        groupsTemp.push({
          id: doc.id,
          teams: [...doc.data().teams].sort(
            (a, b) =>
              b.points - a.points ||
              b.goalsFor - b.goalsAgainst - (a.goalsFor - a.goalsAgainst) ||
              b.goalsFor - a.goalsFor
          ),
        });
      });
      setGroups(groupsTemp);
      setLoading(false)
      return () => unsub;
    });
  }, []);
  return { groups, loading, message };
};
