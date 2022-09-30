import { collection, doc, onSnapshot, orderBy, query, setDoc, where } from "firebase/firestore";
import { db } from "../lib/firebaseConfig";
import { matches } from "../lib/wcData";
import { useEffect, useState } from "react";
import { DateTime } from "luxon";
import MatchCard from "../components/MatchCard";
import toast from "react-hot-toast";

export default function Matches() {
  const [today, setToday] = useState(DateTime.fromISO("2022-11-20"));
  const [todaysMatches, setTodaysMatches] = useState([]);
  const [touchPosition, setTouchPosition] = useState(null);

  const handleTouchStart = (e) => {
    const touchDown = e.touches[0].clientX;
    setTouchPosition(touchDown);
  };

  const handleTouchMove = (e) => {
    const touchDown = touchPosition;

    if (touchDown === null) {
      return;
    }

    const currentTouch = e.touches[0].clientX;
    const diff = touchDown - currentTouch;

    if (diff > 5) {
      changeDay("next");
    }

    if (diff < -5) {
      changeDay("prev");
    }

    setTouchPosition(null);
  };

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
            toast.success("Matches Imported");
          })
          .catch((err) => toast.error(err.message));
      }
    );
  };

  const changeDay = (value) => {
    value === "next" ? setToday(today.plus({ days: 1 })) : setToday(today.minus({ days: 1 }));
  };

  useEffect(() => {
    const searchDate = today.toISODate();
    const q = query(collection(db, "matches"), orderBy("dateUtc"), where("date", "==", searchDate));
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

  return (
    <section className="matches">
      <h2>Matches: {today.toLocaleString(DateTime.DATE_MED)}</h2>
      {/* <input
        className="date-picker"
        type="date"
        onChange={(e) => setToday(DateTime.fromISO(e.target.value))}
      /> */}
      <div className="date-btns">
        <button onClick={() => changeDay("prev")}>Prev</button>
        <button onClick={() => changeDay("next")}>Next</button>
      </div>
      <p className="swipe-info">Swipe right or left</p>
      <div
        className="matches-container"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}>
        {todaysMatches.length > 0 ? (
          todaysMatches.map((match) => <MatchCard key={match.matchNumber} match={match} />)
        ) : (
          <p>no games today</p>
        )}
      </div>

      <button onClick={importMatches}>import</button>
    </section>
  );
}
