import CountDownTimer from "../components/CountDownTimer";
import Signin from "../components/Signin";
import { groupsData } from "../lib/wcData";
import { doc, setDoc } from "firebase/firestore";
import { db } from "../lib/firebaseConfig";
import { useGetGroups } from "../lib/hooks";
import Flag from "react-flagkit";
import App from "../App";

export default function Home() {
  const { loading, groups } = useGetGroups();

  const importTeams = () => {
    groupsData.forEach(({ id, teams }) => {
      setDoc(doc(db, "groups", id), { teams })
        .then((result) => {
          console.log(result);
        })
        .catch((err) => console.log);
    });
  };

  return (
    <section>
      <h1 style={{fontSize:"1em"}}>
        <CountDownTimer />
      </h1>

      {/* <button onClick={importTeams}>Import</button> */}
      <section className="rules">
        <h2>The Rules</h2>
        <p>Guess the score of every match, submit your guess every day to gain points</p>
        <p>
          Each correct guess adds 1 point to your personal score, accurate guesses add 2 more points
        </p>
        {/* <p>create a group and invite your friends to play</p> */}
      </section>
      {!loading &&
        groups.map(({ id, teams }) => (
          <div key={id} className="group-card">
            <div>
              <h3>Group {id}</h3>
              <span>GP</span>
              <span>P</span>
            </div>
            {teams.map((team) => (
              <div className="">
                <h4>
                  {" "}
                  <Flag country={team.code} size={32} className="mr shadow" />
                  {team.country}
                </h4>

                <p>{team.gamesPlayed}</p>
                <p>{team.points}</p>
              </div>
            ))}
          </div>
        ))}
    </section>
  );
}
