import { useState, useContext } from "react";
import Flag from "react-flagkit";
import dateFormat, { masks } from "dateformat";
import { MdEdit } from "react-icons/md";
import { doc, getDoc, writeBatch } from "firebase/firestore";
import { db } from "../lib/firebaseConfig";
import toast from "react-hot-toast";
import { useEffect } from "react";
import { UserContext } from "../lib/context";

export default function MatchCard({ match }) {
  const [isPredicting, setIsPredicting] = useState(false);
  const [homeTeamPrediction, setHomeTeamPrediction] = useState(undefined);
  const [awayTeamPrediction, setAwayTeamPrediction] = useState(undefined);

  const { user } = useContext(UserContext);

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

  const handleIsPredicting = () => {
    setIsPredicting(!isPredicting);
  };

  const handlePrediction = (e, matchNumber, homeTeam, awayTeam) => {
    e.preventDefault();
    if (isPredicting) {
      if (!homeTeamPrediction || !awayTeamPrediction) {
        return toast.error("Cannot leave Predictions empty");
      }
      const batch = writeBatch(db);
      const matchRef = doc(db, "matches", matchNumber, "users", user.uid);
      const userRef = doc(db, "users", user.uid, "predictions", matchNumber);
      batch.set(matchRef, { homeTeamPrediction, awayTeamPrediction });
      batch.set(userRef, { matchNumber, homeTeamPrediction, awayTeamPrediction });
      batch
        .commit()
        .then(() => {
          if (homeTeamPrediction > awayTeamPrediction) {
            toast.success(
              `Predicted ${homeTeam.country} Wins ${homeTeamPrediction}-${awayTeamPrediction}`
            );
          } else if (homeTeamPrediction === awayTeamPrediction) {
            toast.success(`Predicted a tie`);
          } else {
            toast.success(
              `Predicted ${awayTeam.country} Wins ${awayTeamPrediction}-${homeTeamPrediction}`
            );
          }
        })
        .catch((err) => toast.error(err.message));
      setIsPredicting(!isPredicting);
    }
  };
  useEffect(() => {
    if (user) {
      getDoc(doc(db, "users", user.uid, "predictions", matchNumber)).then((doc) => {
        if (doc.exists()) {
          console.log(doc.data());
          setHomeTeamPrediction(doc.data().homeTeamPrediction);
          setAwayTeamPrediction(doc.data().awayTeamPrediction);
        }
      });
    }
  }, [user]);

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

              {homeTeamPrediction && <span> ({homeTeamPrediction})</span>}
            </div>
          ) : (
            <input
              type="number"
              value={homeTeamPrediction}
              min={0}
              max={20}
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
              {awayTeamPrediction && <span className="team-score"> ({awayTeamPrediction})</span>}
            </div>
          ) : (
            <input
              type="number"
              value={awayTeamPrediction}
              min={0}
              max={20}
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
            {isPredicting ? (
              <button
                onClick={(e) =>
                  handlePrediction(e, matchNumber, homeTeam, awayTeam, homeTeamScore, awayTeamScore)
                }>
                Done
              </button>
            ) : (
              <button onClick={handleIsPredicting}>predict</button>
            )}
          </>
        )}
      </div>
    </div>
  );
}
