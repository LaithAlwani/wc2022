import Flag from "react-flagkit";
import { collection, doc, onSnapshot, query, orderBy, setDoc, where } from "firebase/firestore";
import { db } from "../lib/firebaseConfig";
import { matches } from "../lib/wcData";
import { useEffect, useState } from "react";
import dateFormat, { masks } from "dateformat";

export default function Games() {
  const today = "2022-11-20 00:00:00";
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

  useEffect(() => {
    const q = query(collection(db, "matches"), orderBy("dateUtc"));
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
  }, []);
  return (
    <div>
      <button onClick={importMatches}>import</button>
      <h1>Matches: {new Date(today).toDateString()}</h1>
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
                  <span>{dateFormat(dateUtc,"dd/mmm/yyyy hh:MM tt")}</span>
                  <span>{matchNumber < 10 ? `0${matchNumber}` : matchNumber}</span>
                </div>
                <div className="match-teams">
                  <Flag country={homeTeam.code} size={48} />
                  {homeTeam.country} {homeTeamScore ? homeTeamScore : 0} -
                  {awayTeamScore ? awayTeamScore : 0} {awayTeam.country}
                  <Flag country={awayTeam.code} size={48} />
                </div>
                <span>{location}</span>
              </div>
            )
          )
        ) : (
          <p>no games today</p>
        )}
      </div>
    </div>
  );
}
