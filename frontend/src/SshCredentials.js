import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./SshCredentials.css";
import Backendapi from "./Backendapi";

function SshCredentials() {
  const [sshUsername, setSshUsername] = useState("");
  const [sshPassword, setSshPassword] = useState("");
  const [verificationResult, setVerificationResult] = useState("");
  const [showPassword, setShowPassword] = useState(false); // State to toggle password visibility

  const navigate = useNavigate();

  // const handleSubmit = async (event) => {
  //   event.preventDefault();
  //   try {
  //     const response = await axios.post(
  //       `${Backendapi.REACT_APP_BACKEND_API_URL}/verify-ssh-credentials`,
  //       {
  //         Lusername: sshUsername,
  //         password: sshPassword,
  //       }
  //     );

  //     const data = response.data;
  //     if (data.success) {
  //       setVerificationResult("SSH credentials verified");
  //       sessionStorage.setItem("sshUsername", sshUsername);
  //       sessionStorage.setItem("sshPassword", sshPassword);
  //       navigate("/createrun");
  //     } else {
  //       setVerificationResult("Incorrect SSH credentials");
  //     }
  //   } catch (error) {
  //     console.error("Error verifying SSH credentials:", error);
  //   }
  // };


  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      const response = await axios.post(
        `${Backendapi.REACT_APP_BACKEND_API_URL}/verify-ssh-credentials`,
        {
          Lusername: sshUsername,
          password: sshPassword,
        }
      );
  
      const data = response.data;
      if (data.success) {
        toast.success("Login successful");
        sessionStorage.setItem("sshUsername", sshUsername);
        sessionStorage.setItem("sshPassword", sshPassword);
        navigate("/createrun");
      } else {
        toast.error("Username or password is incorrect");
      }
    } catch (error) {
      console.error("Error verifying SSH credentials:", error);
      toast.error("Username or password is incorrect");
    }
  };
  
  
  return (
    <div className="center-container">
      <ToastContainer />
      <div className="form-container">
        <h1>Login</h1>
        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label>Username</label>
            <input
              type="text"
              value={sshUsername}
              onChange={(event) => setSshUsername(event.target.value)}
              placeholder="SSH Username"
              required
            />
          </div>
          <div className="input-group">
            <label>Password</label>
            <div className="password-input-container">
              <input
                type={showPassword ? "text" : "password"} // Toggle password visibility
                value={sshPassword}
                onChange={(event) => setSshPassword(event.target.value)}
                placeholder="SSH Password"
                required
              />
              <FontAwesomeIcon
                icon={showPassword ? faEye : faEyeSlash}
                className="password-icon"
                onClick={() => setShowPassword(!showPassword)}
              />
            </div>
          </div>

          <button type="submit">Login</button>
        </form>
        <p
          className={`verification-message ${
            verificationResult === "Incorrect SSH credentials"
              ? "incorrect-message"
              : ""
          }`}
        >
          {verificationResult}
        </p>
      </div>
    </div>
  );
}

export default SshCredentials;


