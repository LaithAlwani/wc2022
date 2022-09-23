import { useContext } from "react";
import { Link } from "react-router-dom";
import { UserContext } from "../../lib/context";
import { signOut } from "firebase/auth";
import { auth } from "../../lib/firebaseConfig";
import toast from "react-hot-toast";

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
        <Link to="/games">Games</Link>
        {user && username && (
          <>
            <Link to="/#">My Groups</Link>
            <Link to="/" onClick={handleLogout}>
              Log Out
            </Link>
            <img src={user.photoURL} alt={username} className="avatar" />
          </>
        )}
      </div>
    </nav>
  );
}
