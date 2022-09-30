import { useState, useEffect, useCallback } from "react";
import { auth, db } from "../lib/firebaseConfig";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { getDoc, doc, writeBatch, increment, serverTimestamp } from "firebase/firestore";
import { useContext } from "react";
import { UserContext } from "../lib/context";
import { toast } from "react-hot-toast";
import debounce from "lodash.debounce";
import { useNavigate } from "react-router-dom";
import { FcGoogle } from "react-icons/fc";

export default function Login() {
  const navigate = useNavigate();
  const { user, username, loading } = useContext(UserContext);
  
  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    try {
      const { user } = await signInWithPopup(auth, provider);
      const userDoc = await getDoc(doc(db, "users", user.uid));
      if (userDoc.data()) {
        toast.success(`Welcome ${userDoc.data().username}`);
        navigate("/matches");
      }
    } catch (error) {
      // Handle Errors here.
      const errorCode = error.code;
      const errorMessage = error.message;
      // The email of the user's account used.
      // The AuthCredential type that was used.
      const credential = GoogleAuthProvider.credentialFromError(error);
      // ...
    }
  };

  return (
    <div>
      <h1>Login</h1>
      {user ? (
        !username && <UsernameForm />
      ) : (
        <section className="sign-in">
          <button onClick={signInWithGoogle}>
            <FcGoogle size={24} />
            Sign in{" "}
          </button>
        </section>
      )}
    </div>
  );
}

const UsernameForm = () => {
  const [formValue, setFormValue] = useState("");
  const [isValid, setIsValid] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const { user } = useContext(UserContext);

  const handleChange = (e) => {
    const rawVal = e.target.value;
    const val = rawVal;
    const re = /^.{3,25}$/;
    if (val.length < 3) {
      setFormValue(val);
      setLoading(false);
      setIsValid(false);
    }

    if (re.test(val)) {
      setFormValue(val);
      setLoading(true);
      setIsValid(false);
    }
  };

  const checkUsername = useCallback(
    debounce(async (username) => {
      if (username.length >= 3) {
        const usernameRef = doc(db, "usernames", username);
        try {
          const userDoc = await getDoc(usernameRef);
          if (!userDoc.exists()) setIsValid(true);
          setLoading(false);
        } catch (e) {
          console.log("doc not found");
        }
      }
    }, 500),
    []
  );

  const saveNewUser = async (newUser) => {
    const usernameDoc = doc(db, "usernames", formValue);
    const userDoc = doc(db, "users", user.uid);
    const batch = writeBatch(db);
    batch.set(userDoc, newUser);
    batch.set(usernameDoc, { uid: user.uid });
    batch.set(doc(db, "site-stats", "main"), { users: increment(1) }, { merge: true });
    try {
      await batch.commit();
      toast.success(`Welcome ${formValue}`);
      navigate("/matches");
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if(!formValue) return toast.error("Username cannot be empty")
    const newUser = {
      avatar: user.photoURL,
      username: formValue,
      displayName: user.displayName,
      email: user.email,
      guesses: 0,
      points: 0,
      accurateGuess: 0,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      lastlogin: serverTimestamp(),
    };
    saveNewUser(newUser);
  };

  useEffect(() => {
    checkUsername(formValue);
  }, [formValue, checkUsername]);
  return (
    <form onSubmit={handleSubmit} className="choose-name-form">
      <h3>Choose A Display Name</h3>
      <p>Your display name is unique and is 3-15 characters long</p>
      <input type="text" name="username" value={formValue} onChange={handleChange}/>
      <button>Choose</button>
      <UsernameMessage username={formValue} isValid={isValid} loading={loading} />
    </form>
  );
};

const UsernameMessage = ({ username, isValid, loading }) => {
  if (username.length > 0 && username.length < 3) {
    return <p style={{ color: "red" }}>username is too short</p>;
  } else if (loading) {
    return <p>checking.....</p>;
  } else if (isValid) {
    return <p style={{ color: "green" }}>"{username}" is available</p>;
  } else if (username && !isValid) {
    return <p style={{ color: "red" }}>"{username}" is already taken</p>;
  } else {
    return <p></p>;
  }
};
