import { useContext } from "react";
import { Link } from "react-router-dom";
import { UserContext } from "../../lib/context";
import { signOut } from "firebase/auth";
import { auth } from "../../lib/firebaseConfig";
import toast from "react-hot-toast";
import { GiSoccerKick } from "react-icons/gi";
import { MdGroups } from "react-icons/md";
import { MdLogout } from "react-icons/md";
import { MdOutlineLogin } from "react-icons/md";
import { ImTable2 } from "react-icons/im";

export default function Navbar() {
  const { user, username, loading } = useContext(UserContext);
  const handleLogout = () => {
    signOut(auth)
      .then(() => {
        toast.success("see you soon");
      })
      .catch((err) => {
        toast.error(err.code);
      });
  };
  return (
    <nav>
      <Link to="/">
        <img src="/images/logo.png" alt="logo" className="logo" />
      </Link>
      <div className="links">
        <Link to="matches">
          <GiSoccerKick size={24} /> Matches{" "}
        </Link>
        <Link to="groups">
          <ImTable2 size={24} />
          Standings
        </Link>
        <Link to="rankings">
          <MdGroups size={24} />
          Rakings
        </Link>
        {user && username ? (
          <>
            <Link to="" onClick={handleLogout}>
              <MdLogout size={24} />
              Log Out
            </Link>
            <a href="#">
              <img src={user.photoURL} className="avatar" />
              {username.substring(0, 12)}
            </a>
          </>
        ) : (
          <Link to="login">
            <MdOutlineLogin size={24} />
            Login
          </Link>
        )}
      </div>
    </nav>
  );
}
