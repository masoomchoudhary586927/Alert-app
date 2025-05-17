import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "../../../firebase/firebase";
import { signInWithEmailAndPassword } from "firebase/auth";

const StaffLogin = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("police");
  const [errorMessage, setErrorMessage] = useState("");
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [roleLocked, setRoleLocked] = useState(false);

  // ✅ Add Disaster role domains
  const roleDomains = {
    police: ["police.example.com", "police.gov.in"],
    firebrigade: ["fire.example.com", "firebrigade.gov.in"],
    ambulance: ["ambulance.example.com", "ambulance.gov.in"],
    disaster: ["disaster.example.com", "disaster.gov.in"], // ✅ NEW
    admin: ["admin.example.com", "admin.gov.in"]
  };

  useEffect(() => {
    if (email.includes("@")) {
      const domain = email.split("@")[1];
      let matchedRole = null;

      for (const [roleName, domains] of Object.entries(roleDomains)) {
        if (domains.includes(domain)) {
          matchedRole = roleName;
          break;
        }
      }

      if (matchedRole) {
        setRole(matchedRole);
        setRoleLocked(true);
        setErrorMessage("");
      } else {
        setRoleLocked(false);
        setErrorMessage("Email domain not recognized for any role");
      }
    }
  }, [email]);

  // ✅ Add Disaster dashboard route
  const roleRoutes = {
    police: "/police-dashboard",
    firebrigade: "/fire-brigade-dashboard",
    ambulance: "/ambulance-dashboard",
    disaster: "/disaster-dashboard", // ✅ NEW
    admin: "/admin-dashboard"
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setIsSigningIn(true);
    setErrorMessage("");

    const domain = email.split("@")[1];
    if (!roleDomains[role].includes(domain)) {
      setErrorMessage("This email is not authorized for the selected role");
      setIsSigningIn(false);
      return;
    }

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      localStorage.setItem("role", role);
      navigate(roleRoutes[role], { replace: true });
    } catch (error) {
      setErrorMessage(getFirebaseErrorMessage(error.code));
      setIsSigningIn(false);
    }
  };

  const getFirebaseErrorMessage = (errorCode) => {
    switch (errorCode) {
      case "auth/invalid-email": return "Invalid email address";
      case "auth/user-disabled": return "Account disabled";
      case "auth/user-not-found": return "No user found with this email";
      case "auth/wrong-password": return "Incorrect password";
      default: return "Login failed. Please try again.";
    }
  };

  return (
    <div className="h-screen flex justify-center items-center bg-gray-100">
      <div className="w-96 bg-white p-6 rounded shadow">
        <h2 className="text-2xl font-bold mb-4 text-center">Staff Login</h2>
        <form onSubmit={onSubmit} className="space-y-4">
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="w-full p-2 border rounded"
            disabled={roleLocked}
          >
            <option value="police">Police</option>
            <option value="firebrigade">Fire Brigade</option>
            <option value="ambulance">Ambulance</option>
            <option value="disaster">Disaster</option> {/* ✅ NEW */}
            <option value="admin">Admin</option>
          </select>

          <input
            type="email"
            placeholder="Email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-2 border rounded"
          />
          <input
            type="password"
            placeholder="Password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-2 border rounded"
          />

          {errorMessage && (
            <p className="text-red-500 text-sm">{errorMessage}</p>
          )}

          <button
            type="submit"
            disabled={isSigningIn}
            className={`w-full ${isSigningIn ? 'bg-indigo-400' : 'bg-indigo-600'} text-white p-2 rounded hover:bg-indigo-700`}
          >
            {isSigningIn ? "Logging in..." : "Login"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default StaffLogin;
