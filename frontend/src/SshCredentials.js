import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './SshCredentials.css'; // Import your CSS file for styling
import Backendapi from './Backendapi';

function SshCredentials() {
  const [sshUsername, setSshUsername] = useState('');
  const [sshPassword, setSshPassword] = useState('');
  const [verificationResult, setVerificationResult] = useState('');

  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
     
        const response = await axios.post(`${Backendapi.REACT_APP_BACKEND_API_URL}/verify-ssh-credentials`, {
        username: sshUsername,
        password: sshPassword,
      });

      const data = response.data;
      if (data.success) {
        setVerificationResult('SSH credentials verified');
        sessionStorage.setItem('sshUsername', sshUsername);
        sessionStorage.setItem('sshPassword', sshPassword);
        navigate('/createrun');
      } else {
        setVerificationResult('Incorrect SSH credentials');
      }
    } catch (error) {
      console.error('Error verifying SSH credentials:', error);
    }
  };

  return (
    <div className="center-container">
      <div className="form-container">
        <h1>SSH Credentials Verification</h1>
        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label>SSH Username:</label>
            <input
              type="text"
              value={sshUsername} 
              onChange={(event) => setSshUsername(event.target.value)}
              placeholder="SSH Username"
              required
            />
          </div>
          <div className="input-group">
            <label>SSH Password:</label>
            <input
              type="text" // Change input type to password
              value={sshPassword}
              onChange={(event) => setSshPassword(event.target.value)}
              placeholder="SSH Password"
              required
            />
          </div>
          <button type="submit">Verify SSH Credentials</button>
        </form>
        <p className={`verification-message ${verificationResult === 'Incorrect SSH credentials' ? 'incorrect-message' : ''}`}>
          {verificationResult}
        </p>
      </div>
    </div>
  );
}

export default SshCredentials;






 // const response = await axios.post('http://localhost:443/verify-ssh-credentials', {