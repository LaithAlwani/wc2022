import { useContext } from "react";
import { Link } from "react-router-dom";
import { UserContext } from "../../lib/context";
import { signOut } from "firebase/auth";
import { auth } from "../../lib/firebaseConfig";
import toast from "react-hot-toast";
import Signin from "../Signin";
import {GiSoccerField} from "react-icons/gi"
import { GiSoccerKick } from "react-icons/gi"
import { MdGroups } from "react-icons/md"
import { MdLogout } from "react-icons/md"



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
        <Link to="matches"><GiSoccerField size={32}  /> Matches </Link>
        <Link to="groups"><GiSoccerKick size={32} /> Groups</Link>
        <Link to="my-groups"><MdGroups size={32} />Rakings</Link>
        {user ? (
          <>
            <Link to="" onClick={handleLogout}>
              <MdLogout size={32} />
              Log Out
            </Link>
            <img src={user.photoURL} alt={username} className="avatar" />
          </>
        ) : (
          <Signin />
        )}
      </div>
    </nav>
  );
}
