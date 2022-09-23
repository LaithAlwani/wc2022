import CountDownTimer from "../components/CountDownTimer";
import Signin from "../components/Signin";
import Flag from "react-flagkit";
import { groupsData } from "../lib/wcData";
import { collection, doc, onSnapshot, orderBy, query, setDoc } from "firebase/firestore";
import { db } from "../lib/firebaseConfig";
import { useEffect, useState } from "react";

export default function Home() {
  const [groups, setGroups] = useState(null);
  const importTeams = () => {
    groupsData.forEach(({ id, teams }) => {
      setDoc(doc(db, "groups", id), { teams })
        .then((result) => {
          console.log(result);
        })
        .catch((err) => console.log);
    });
  };
  useEffect(() => {
    const q = query(collection(db, "groups"));
    const unsub = onSnapshot(q, (querySnapshot) => {
      const groupsTemp = [];
      querySnapshot.forEach((doc) => {
        groupsTemp.push({
          id: doc.id,
          teams: [...doc.data().teams].sort(
            (a, b) =>
              b.points - a.points ||
              b.goalsFor - b.goalsAgainst - (a.goalsFor - a.goalsAgainst) ||
              b.goalsFor - a.goalsFor
          ),
        });
      });
      setGroups(groupsTemp);
    });
    return () => unsub;
  }, []);
  return (
    <div>
      <CountDownTimer />
      <section className="rules">
        <div>
          <h3>Guess</h3>
          <p>guess the score of every game, submit your guess every days to gain points</p>
        </div>
        <div>
          <h3>points</h3>
          <p>guess which team wins correctly and get 1 point, accurate score add 2 points</p>
        </div>
        <div>
          <h3>Easy</h3>
          <p>create a group and invite your friends to play</p>
        </div>
      </section>
      <Signin />
      {groups &&
        groups.map(({ id, teams }) => (
          <div key={id} className="group">
            <p>Group {id}</p>
            <table>
              <thead>
                <tr>
                  <th>Team</th>
                  <th>GP</th>
                  <th>Points</th>
                  <th>W</th>
                  <th>L</th>
                  <th>T</th>
                  <th>GF</th>
                  <th>GA</th>
                  <th>GD</th>
                </tr>
              </thead>
              {teams.map(
                ({
                  country,
                  code,
                  gamesPlayed,
                  goalsAgainst,
                  goalsFor,
                  loss,
                  win,
                  tie,
                  points,
                }) => (
                  <tbody key={country}>
                    <tr>
                      <th className="group-team">
                        <Flag country={code} />
                        <span>{country}</span>
                      </th>
                      <th>{gamesPlayed}</th>
                      <th>{points}</th>
                      <th>{win}</th>
                      <th>{loss}</th>
                      <th>{tie}</th>
                      <th>{goalsFor}</th>
                      <th>{goalsAgainst}</th>
                      <th>{goalsFor - goalsAgainst}</th>
                    </tr>
                  </tbody>
                )
              )}
            </table>
          </div>
        ))}
      <button onClick={importTeams}>Import</button>
    </div>
  );
}
