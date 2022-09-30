import Flag from "react-flagkit";
import { useGetStandings } from "../lib/hooks";

export default function standings() {
  const { loading, groups } = useGetStandings();
  return !loading ? (
    groups.map(({ id, teams }) => (
      <div key={id} className="group-container">
        <h4>Group {id}</h4>
        <div className="group">
          <table>
            <thead>
              <tr>
                <th>Teams</th>
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
              ({ country, code, gamesPlayed, goalsAgainst, goalsFor, loss, win, tie, points }) => (
                <tbody key={country}>
                  <tr>
                    <th className="group-team">
                      <Flag country={code} size={37} className="mr shadow" />
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
      </div>
    ))
  ) : (
    <div className="loader"></div>
  );
}
