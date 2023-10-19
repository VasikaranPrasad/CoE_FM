import React, { useState, useEffect } from "react";
import axios from "axios";
import Backendapi from "./Backendapi";

function FileViewer({ filePath, onClose }) {
  const [fileContent, setFileContent] = useState("");
  const fileExtension = filePath.split(".").pop();
  const storedSshUsername = sessionStorage.getItem("sshUsername");
  const storedSshPassword = sessionStorage.getItem("sshPassword");

  useEffect(() => {
    async function fetchFileContent() {
      try {
        const response = await axios.get(
          `${Backendapi.REACT_APP_BACKEND_API_URL}/fetch-file-content`,
          {
            params: { path: filePath },
            auth: {
              username: storedSshUsername,
              password: storedSshPassword,
            },
          }
        );
        setFileContent(response.data.content);
      } catch (error) {
        console.error("Error fetching file content:", error);
      }
    }

    fetchFileContent();
  }, [filePath, storedSshUsername, storedSshPassword]);

  return (
    <div className="file-viewer">
      <div className={`file-content ${fileExtension}`}>
        {fileContent}
      </div>
      <button onClick={onClose} className="close-button">
        Close
      </button>
    </div>
  );
}

export default FileViewer;
