import { collection, limit, onSnapshot, orderBy, query } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import { db } from "../lib/firebaseConfig";
import {RiCheckFill} from "react-icons/ri"
import {RiCheckDoubleLine} from "react-icons/ri"
import {RiStarFill} from "react-icons/ri"

export default function Ranking() {
  const [users, setUser] = useState(null);

  useEffect(() => {
    const q = query(collection(db, "users"), orderBy("points", "desc"), limit(10));
    const unsub = onSnapshot(q, (querySnapshot) => {
      const tempUsers = [];
      querySnapshot.forEach((doc) => {
        tempUsers.push({ ...doc.data() });
      });
      setUser(tempUsers);
    });
    return () => unsub;
  }, []);

  return (
    <div>
      <h1>Overall Rankings</h1>
      <div className="cards-container">
        {users &&
          users.map((user, i) => (
            <div className="player-card">
              <span className="rank">#{ i+1}</span>
              <img src={user.avatar} alt="" className="player-img" />
              <h4>{user.username}</h4>
              <div className="player-stats">
                <span className="mr"><RiCheckFill size={24} color="green" /> {user.guesses}</span>
                <span className="mr"><RiCheckDoubleLine size={24} color="green" /> {user.accurateGuess}</span>
                <span className="mr"><RiStarFill size={24} color="yellow"/> {user.points}</span>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}
