import Flag from "react-flagkit";
import { collection, doc, onSnapshot, query, orderBy, setDoc, where } from "firebase/firestore";
import { db } from "../lib/firebaseConfig";
import { matches } from "../lib/wcData";
import { useEffect, useState } from "react";
import dateFormat, { masks } from "dateformat";
import { DateTime } from "luxon";
import {MdEdit} from "react-icons/md"

export default function Matches() {
  const [today, setToday] = useState(DateTime.fromISO("2022-11-20"));
  const [allMatches, setAllMatches] = useState([]);

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
      setAllMatches(tempMatches);
    });
    return () => unsub;
  }, [today]);
  return (
    <section className="matches">
      {/* <button onClick={importMatches}>import</button> */}
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
        {allMatches.length > 0 ? (
          allMatches.map(
            ({
              matchNumber,
              roundNumber,
              dateUtc,
              location,
              homeTeam,
              awayTeam,
              homeTeamScore,
              awayTeamScore,
            }) => (
              <div className="match-card" key={matchNumber}>
                <div className="time-date">
                  <span>{dateFormat(dateUtc, "dd/mmm/yyyy hh:MM tt")}</span>
                  <span>{matchNumber < 10 ? `0${matchNumber}` : matchNumber}</span>
                </div>
                <div className="match-teams">
                  <div>
                    <Flag country={homeTeam.code} size={32} className="shadow mr" />
                    <p>{homeTeam.country}</p>
                    <span className="team-score">{homeTeamScore ? homeTeamScore : 0}</span>
                  </div>
                  <div>
                    <Flag country={awayTeam.code} size={32} className="shadow mr" />
                    <p>{awayTeam.country}</p>
                    <span className="team-score">{awayTeamScore ? awayTeamScore : 0}</span>
                  </div>
                </div>
                <div className="match-card-footer">
                  <span>{location}</span>
                  <span><MdEdit size={24} /></span>
                  <button>Guess</button>
                </div>
              </div>
            )
          )
        ) : (
          <p>no games today</p>
        )}
      </div>
    </section>
  );
}
