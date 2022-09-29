import { useState } from "react";
import Flag from "react-flagkit";
import dateFormat, { masks } from "dateformat";
import { MdEdit } from "react-icons/md";
import { doc, writeBatch } from "firebase/firestore";
import { db } from "../lib/firebaseConfig";

export default function MatchCard({ match, userPredictions, setUserPredictions, user }) {
  const [homeTeamPrediction, setHomeTeamPrediction] = useState("");
  const [awayTeamPrediction, setAwayTeamPrediction] = useState("");
  const [isPredicting, setIsPredecting] = useState(false);

  const {
    matchNumber,
    roundNumber,
    dateUtc,
    location,
    homeTeam,
    homeTeamScore,
    awayTeam,
    awayTeamScore,
    group,
  } = match;

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
          const tempArr = userPredictions.filter((p) => p.matchNumber !== matchNumber);
          console.log(tempArr);
          setUserPredictions([...tempArr, { matchNumber, homeTeamPrediction, awayTeamPrediction }]);
        })
        .catch(console.log);
      setIsPredecting(!isPredicting);
    } else {
      setIsPredecting(!isPredicting);
    }
  };

  return (
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
              <span>{homeTeamScore ? homeTeamScore : 0}</span>

              {userPredictions &&
                userPredictions.map(
                  (p) => p.matchNumber === matchNumber && <span> ({p.homeTeamPrediction})</span>
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
        {user && (
          <>
            <span>
              <MdEdit size={24} />
            </span>
            <button
              onClick={(e) =>
                handlePrediction(e, matchNumber, homeTeam, awayTeam, homeTeamScore, awayTeamScore)
              }>
              {isPredicting ? "Done" : "Predict"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
