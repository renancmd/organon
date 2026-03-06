import { auth } from "../config/firebase";
import { signInWithEmailAndPassword, signOut } from "firebase/auth";

// Sign In
export const login = async (email: string, password: string) => {
  await signInWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      const user = userCredential.user;
      user ? true : false;
    })
    .catch((error) => {
      const errorCode = error.code;
      const errorMessage = error.message;
    });
};

// Logout
export const logout = () => {
  signOut(auth)
    .then(() => {
      console.log("User was logged out!");
    })
    .catch((error) => {
      console.error(error);
    });
};
