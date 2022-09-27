import Flag from "react-flagkit";
import {
  collection,
  doc,
  onSnapshot,
  query,
  orderBy,
  setDoc,
  where,
  writeBatch,
  arrayUnion,
  getDoc,
} from "firebase/firestore";
import { auth, db } from "../lib/firebaseConfig";
import { matches } from "../lib/wcData";
import { useEffect, useState } from "react";
import dateFormat, { masks } from "dateformat";
import { DateTime } from "luxon";
import { MdEdit } from "react-icons/md";
import { useContext } from "react";
import { UserContext } from "../lib/context";

export default function Matches() {
  const [today, setToday] = useState(DateTime.fromISO("2022-11-20"));
  const [todaysMatches, setTodaysMatches] = useState([]);
  const [isPredicting, setIsPredecting] = useState(false);
  const [userPredictions, setUserPredictions] = useState([]);
  const [homeTeamPrediction, setHomeTeamPrediction] = useState("");
  const [awayTeamPrediction, setAwayTeamPrediction] = useState("");
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

  const handlePrediction = (e, matchNumber, homeTeam, awayTeam, homeTeamScore, awayTeamScore) => {
    e.preventDefault();
    if (isPredicting) {
      const batch = writeBatch(db);
      const matchRef = doc(db, "matches", matchNumber, "users", user.uid);
      const userRef = doc(db, "users", user.uid, "predictions", matchNumber);
      batch.set(matchRef, { homeTeamPrediction, awayTeamPrediction });
      batch.set(userRef, { matchNumber, homeTeamPrediction, awayTeamPrediction }); //adding winning team
      batch
        .commit()
        .then(() => {
          console.log("done");
          const tempArr = userPredictions.filter(p => p.matchNumber !== matchNumber)
          console.log(tempArr)
          setUserPredictions([...tempArr, { matchNumber, homeTeamPrediction, awayTeamPrediction }])
        })
        .catch(console.log);
      setIsPredecting(!isPredicting);
    } else {
      setIsPredecting(!isPredicting);
    }
  };

  const changeDay = (value) => {
    setIsPredecting(false);
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
          todaysMatches.map(
            (
              {
                matchNumber,
                roundNumber,
                dateUtc,
                location,
                homeTeam,
                awayTeam,
                homeTeamScore,
                awayTeamScore,
              },
              i
            ) => (
              <div className="match-card" key={matchNumber}>
                <div className="time-date">
                  <span>{dateFormat(dateUtc, "dd/mmm/yyyy hh:MM tt")}</span>
                  <span>{matchNumber < 10 ? `0${matchNumber}` : matchNumber}</span>
                </div>
                <div className="match-teams">
                  <div>
                    <Flag country={homeTeam.code} size={32} className="shadow mr" />
                    <p>{homeTeam.country}</p>
                    {!isPredicting ? (
                      <div className="team-score">
                        <span >{homeTeamScore ? homeTeamScore : 0}</span>

                        {userPredictions &&
                          userPredictions.map(
                            (p) =>
                              p.matchNumber === matchNumber && (
                                <span> ({p.homeTeamPrediction})</span>
                              )
                          )}
                      </div>
                    ) : (
                      <input
                        type="number"
                        value={homeTeamPrediction}
                        onChange={(e) => setHomeTeamPrediction(e.target.value)}
                        className="predict-input"
                      />
                    )}
                  </div>
                  <div>
                    <Flag country={awayTeam.code} size={32} className="shadow mr" />
                    <p>{awayTeam.country}</p>
                    {!isPredicting ? (
                      <div className="team-score">
                        <span>{awayTeamScore ? awayTeamScore : 0}</span>
                        {userPredictions.length > 0 &&
                          userPredictions.map(
                            (p) =>
                              p.matchNumber === matchNumber && (
                                <span className="team-score"> ({p.awayTeamPrediction})</span>
                              )
                          )}
                      </div>
                    ) : (
                      <input
                        type="number"
                        value={awayTeamPrediction}
                        onChange={(e) => setAwayTeamPrediction(e.target.value)}
                        className="predict-input"
                      />
                    )}
                  </div>
                </div>
                <div className="match-card-footer">
                  <span>{location}</span>
                  <span>
                    <MdEdit size={24} />
                  </span>
                  <button
                    onClick={(e) =>
                      handlePrediction(
                        e,
                        matchNumber,
                        homeTeam,
                        awayTeam,
                        homeTeamScore,
                        awayTeamScore
                      )
                    }>
                    {isPredicting ? "Done" : "Predict"}
                  </button>
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
