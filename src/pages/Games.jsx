import Flag from "react-flagkit";
import { collection, doc, onSnapshot, query,orderBy, setDoc, where } from "firebase/firestore";
import { db } from "../lib/firebaseConfig";
import { matches } from "../lib/wcData";
import { useEffect, useState } from "react";
import * as dayjs from "dayjs";
dayjs().format();

export default function Games() {
  const today = "2022-11-24";
  const [allMatches, setAllMatches] = useState(null);

  const importMatches = () => {
    matches.forEach((match) => {
      setDoc(doc(db, "matches", match.matchNumber.toString()), {date:match.dateUtc.split(" ")[0] }, {merge:true})
        .then(() => {
          console.log("done");
        })
        .catch((err) => console.log);
    });
  };

  useEffect(() => {
    const q = query(collection(db, "matches"), orderBy("dateUtc"), where("date", "==", today));
    const unsub = onSnapshot(q, (querySnapshot) => {
      const tempMatches = [];
      querySnapshot.forEach((doc) => {
        tempMatches.push({ matchNumber: doc.id, ...doc.data() });
      });
      console.log(tempMatches)
      setAllMatches(tempMatches);
    });
    return () => unsub;
  }, []);
  return (
    <div>
      <button onClick={importMatches}>import</button>
      <h1>Matches: { dayjs(today).format("DD/MMM/YYYY")}</h1>
      <div className="matches-container">
        {allMatches &&
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
                  <span>{dayjs(dateUtc).format("DD/MMM/YYYY hh:mm a")}</span>
                  <span>{matchNumber < 10 ? `0${matchNumber}` : matchNumber}</span>
                </div>
                <div className="match-teams">
                  <Flag country={homeTeam.code} size={48} />
                  {homeTeam.country} {homeTeamScore ? homeTeamScore : 0} -{" "}
                  {awayTeamScore ? awayTeamScore : 0} {awayTeam.country}
                  <Flag country={awayTeam.code} size={48} />
                </div>
                <span>{location}</span>
              </div>
            )
          )}
      </div>
    </div>
  );
}
