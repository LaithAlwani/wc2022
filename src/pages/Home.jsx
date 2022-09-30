import CountDownTimer from "../components/CountDownTimer";
import { groupsData } from "../lib/wcData";
import { doc, setDoc } from "firebase/firestore";
import { db } from "../lib/firebaseConfig";
import { useGetStandings } from "../lib/hooks";
import Flag from "react-flagkit";
import toast from "react-hot-toast";

export default function Home() {
  const { loading, groups } = useGetStandings();

  const importTeams = () => {
    if (groups.length === 0)
      groupsData.forEach(({ id, teams }) => {
        setDoc(doc(db, "groups", id), { teams })
          .then(() => {
            toast.success("Teams Imported");
          })
          .catch((err) => toast.error(err.message));
      });
  };

  return (
    <section>
      <CountDownTimer />
      <section className="rules">
        <hgroup>
          <h2>The Rules</h2>
          <p>Submit your predictions to gain points</p>
        </hgroup>
        <ul>
          <li>Correct prediction 1 point.</li>
          <li> accurate score prediction 2 points.</li>
          <li>failing to predict -1 point.</li>
        </ul>
      </section>
      <section className="group-list">
        {!loading &&
          groups &&
          groups.map(({ id, teams }) => (
            <div key={id} className="group-card">
              <div>
                <h3>Group {id}</h3>
                <span>GP</span>
                <span>P</span>
              </div>
              {teams.map((team) => (
                <div key={team.code}>
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
      <button onClick={importTeams}>import</button>
    </section>
  );
}
