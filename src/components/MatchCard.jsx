import { useState, useContext } from "react";
import Flag from "react-flagkit";
import dateFormat, { masks } from "dateformat";
import { MdEdit } from "react-icons/md";
import { doc, getDoc, onSnapshot, writeBatch } from "firebase/firestore";
import { db } from "../lib/firebaseConfig";
import toast from "react-hot-toast";
import { useEffect } from "react";
import { UserContext } from "../lib/context";

export default function MatchCard({ match, user }) {
  const [isPredicting, setIsPredecting] = useState(false);
  const [userPrediction, setUserPrediction] = useState(null);

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

  const handlePrediction = (e, matchNumber, homeTeam, awayTeam, homeTeamScore, awayTeamScore) => {
    e.preventDefault();
    if (isPredicting) {
      if (!userPrediction.homeTeamPrediction || !userPrediction.awayTeamPrediction) {
        return toast.error("Cannot leave Predictions empty");
      }
      const batch = writeBatch(db);
      const matchRef = doc(db, "matches", matchNumber, "users", user.uid);
      const userRef = doc(db, "users", user.uid, "predictions", matchNumber);
      batch.set(matchRef, {...userPrediction});
      batch.set(userRef, { matchNumber, ...userPrediction }); //adding winning team
      batch
        .commit()
        .then(() => {
         toast.success("Prediction Saved, Thank you!")
        })
        .catch(err=>toast.error(err.message));
      setIsPredecting(!isPredicting);
    }
  };
  useEffect(() => {
    if (user) {
      onSnapshot(doc(db, "users", user.uid, "predictions", matchNumber), doc => {
        if (doc.exists()) {
          setUserPrediction(doc.data());
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

              {userPrediction && <span> ({userPrediction.homeTeamPrediction})</span>}
            </div>
          ) : (
            <input
              type="number"
              value={userPrediction.homeTeamPrediction}
              onChange={(e) =>
                setUserPrediction((prevState) => ({
                  ...prevState,
                  homeTeamPrediction: e.target.value,
                }))
              }
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
              {userPrediction && (
                <span className="team-score"> ({userPrediction.awayTeamPrediction})</span>
              )}
            </div>
          ) : (
            <input
              type="number"
              value={userPrediction.awayTeamPrediction}
              onChange={(e) =>
                setUserPrediction((prevState) => ({
                  ...prevState,
                  awayTeamPrediction: e.target.value,
                }))
              }
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
