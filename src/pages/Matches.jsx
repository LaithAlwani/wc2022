import { collection, doc, onSnapshot, query, setDoc, where } from "firebase/firestore";
import { db } from "../lib/firebaseConfig";
import { matches } from "../lib/wcData";
import { useEffect, useState, useContext } from "react";
import { DateTime } from "luxon";

import { UserContext } from "../lib/context";
import MatchCard from "../components/MatchCard";

export default function Matches() {
  const [today, setToday] = useState(DateTime.fromISO("2022-11-20"));
  const [todaysMatches, setTodaysMatches] = useState([]);
  const [userPredictions, setUserPredictions] = useState([]);
  const { user } = useContext(UserContext);

  const importMatches = () => {
    matches.forEach(
      ({
        matchNumber,
        roundNumber,
        dateUtc,
        location,
        homeTeam,
        homeTeamScore,
        awayTeam,
        awayTeamScore,
        group,
      }) => {
        setDoc(
          doc(db, "matches", matchNumber.toString()),
          {
            dateUtc,
            location,
            homeTeam,
            homeTeamScore,
            awayTeam,
            awayTeamScore,
            group,
            roundNumber,
            date: dateUtc.split(" ")[0],
          },
          { merge: true }
        )
          .then(() => {
            console.log("done");
          })
          .catch((err) => console.log);
      }
    );
  };

  const changeDay = (value) => {
    setUserPredictions([]);
    value === "next" ? setToday(today.plus({ days: 1 })) : setToday(today.minus({ days: 1 }));
  };

  useEffect(() => {
    const searchDate = today.toISODate();
    const q = query(collection(db, "matches"), where("date", "==", searchDate));
    const unsub = onSnapshot(q, (querySnapshot) => {
      const tempMatches = [];
      if (!querySnapshot.empty) {
        querySnapshot.forEach((doc) => {
          tempMatches.push({ matchNumber: doc.id, ...doc.data() });
        });
      } else console.log("it's empty");
      setTodaysMatches(tempMatches);
    });
    return () => unsub;
  }, [today]);

  useEffect(() => {
    let unsub;
    if (user) {
      unsub = todaysMatches.forEach(({ matchNumber }) => {
        onSnapshot(doc(db, "users", user.uid, "predictions", matchNumber), (doc) => {
          if (doc.exists()) {
            setUserPredictions((prevState) => [...prevState, doc.data()]);
          }
        });
      });
    }
    return () => unsub;
  }, [todaysMatches]);

  return (
    <section className="matches">
      <button onClick={importMatches}>import</button>
      <h2>Matches: {today.toLocaleString(DateTime.DATE_MED)}</h2>
      <input
        className="date-picker"
        type="date"
        onChange={(e) => setToday(DateTime.fromISO(e.target.value))}
      />
      <div className="date-btns">
        <button onClick={() => changeDay("prev")}>Prev</button>
        <button onClick={() => changeDay("next")}>Next</button>
      </div>
      <div className="matches-container">
        {todaysMatches.length > 0 ? (
          todaysMatches.map((match) => (
            <MatchCard
              key={match.matchNumber}
              match={match}
              userPredictions={userPredictions}
              setUserPredictions={setUserPredictions}
              user={user}
            />
          ))
        ) : (
          <p>no games today</p>
        )}
      </div>
    </section>
  );
}
