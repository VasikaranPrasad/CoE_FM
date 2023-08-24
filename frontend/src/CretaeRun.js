import React, { useState, useEffect } from "react";
import axios from "axios";
import "./CreateRun.css"; // Import your CSS file
import { useNavigate } from "react-router-dom";
import Backendapi from "./Backendapi";

function CreateRun() {
  const [existingUsernames, setExistingUsernames] = useState([]);
  const [selectedUsername, setSelectedUsername] = useState("");
  const [newUsername, setNewUsername] = useState("");
  const [runName, setRunName] = useState("");
  const [selectedFileName, setSelectedFileName] = useState("");
  const [fileContent, setFileContent] = useState("");
  const [editingFile, setEditingFile] = useState(false);
  const [message, setMessage] = useState("");
  const [currentPath, setCurrentPath] = useState(""); // Define and initialize currentPath
  const [loading, setLoading] = useState(false); // Define loading state
  const [directoryTree, setDirectoryTree] = useState([]); // Define directoryTree state
  const navigate = useNavigate();

  const storedSshUsername = sessionStorage.getItem("sshUsername");
  const storedSshPassword = sessionStorage.getItem("sshPassword");

  useEffect(() => {
    async function fetchUsernames() {
      try {
        const response = await axios.get(
          `${Backendapi.REACT_APP_BACKEND_API_URL}/fetch-usernames`,
          {
            auth: {
              username: storedSshUsername,
              password: storedSshPassword,
            },
          }
        );
        setExistingUsernames(response.data.usernames);
      } catch (error) {
        console.error("Error fetching usernames:", error);
      }
    }

    fetchUsernames();
  }, [storedSshUsername, storedSshPassword]);


  // const fetchDirectoryTree = async (path = '/') => {
  //   try {
  //     setLoading(true);
  //     const response = await axios.get(
  //       `http://localhost:443/fetch-directory?path=${encodeURIComponent(path)}`,
  //       {
  //         auth: {
  //           username: storedSshUsername,
  //           password: storedSshPassword,
  //         },
  //       }
  //     );
  //     setDirectoryTree(response.data.contents);
  //     setCurrentPath(path); // Set the current path
  //     setLoading(false);
  //   } catch (error) {
  //     console.error('Error fetching directory tree:', error);
  //     setLoading(false);
  //   }
  // };

  const handleUsernameChange = (event) => {
    setSelectedUsername(event.target.value);
    setNewUsername(event.target.value);
    setMessage("");
  };

  const handleRunNameChange = (event) => {
    setRunName(event.target.value);
  };

  const handleFileNameChange = (event) => {
    setSelectedFileName(event.target.value);
    setEditingFile(false);
    setFileContent("");
    setMessage("");
  };

  const handleFileContentChange = (event) => {
    setFileContent(event.target.value);
  };

  const handleEditFile = async () => {
    try {
      const response = await axios.get(
        `${Backendapi.REACT_APP_BACKEND_API_URL}/fetch-file-content?path=${encodeURIComponent(
          currentPath + "/" + selectedFileName
        )}`,
        {
          auth: {
            username: storedSshUsername,
            password: storedSshPassword,
          },
        }
      );
      setFileContent(response.data.content);
      setEditingFile(true);
    } catch (error) {
      console.error("Error fetching file content:", error);
      setMessage("An error occurred while editing the file.");
    }
  };

  const handleSaveFile = async () => {
    try {
      await axios.post(
        `${Backendapi.REACT_APP_BACKEND_API_URL}/save-file`,
        {
          path: currentPath + "/" + selectedFileName,
          content: fileContent,
        },
        {
          auth: {
            username: storedSshUsername,
            password: storedSshPassword,
          },
        }
      );
      setMessage("File saved successfully.");
    } catch (error) {
      console.error("Error saving file:", error);
      setMessage("An error occurred while saving the file.");
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    console.log("Data being sent:", {
      username: newUsername || selectedUsername,
      runName: runName,
    });

    try {
      const response = await axios.post(
        `${Backendapi.REACT_APP_BACKEND_API_URL}/create-directory-and-run`,
        {
          username: newUsername || selectedUsername,
          runName: runName,
        },
        {
          auth: {
            username: storedSshUsername,
            password: storedSshPassword,
          },
        }
      );

      setMessage(response.data.message);
      navigate("/DirectoryExplorer");
    } catch (error) {
      setMessage("An error occurred.");
    }
  };

  return (
    <div className="container">
      <h1>Create Directory and Run</h1>
      <form onSubmit={handleSubmit}>
        <label>
          Username:
          <div className="dropdown-input">
            <div className="input-container">
              <input
                type="text"
                value={selectedUsername || newUsername}
                onChange={(event) => {
                  setSelectedUsername("");
                  setNewUsername(event.target.value);
                  setMessage("");
                }}
                placeholder="Username"
              />
              {!selectedUsername && (
                <div
                  className="dropdown-icon"
                  onClick={() => setSelectedUsername("")}
                >
                  &#9662;
                </div>
              )}
            </div>
            {!selectedUsername && (
              <select value={selectedUsername} onChange={handleUsernameChange}>
                <option value="">Select an existing username</option>
                {existingUsernames.map((username) => (
                  <option key={username} value={username}>
                    {username}
                  </option>
                ))}
              </select>
            )}
          </div>
        </label>
        <br />
        <label>
          Enter a run name:
          <input
            type="text"
            value={runName}
            onChange={handleRunNameChange}
            placeholder="Run name"
          />
        </label>
        <br />
        <label>
          Choose a file:
          <div className="dropdown-input">
            <div className="input-container">
              <input
                type="text"
                value={selectedFileName}
                onChange={handleFileNameChange}
                placeholder="File name"
              />
              <button onClick={handleEditFile}>Edit</button>
            </div>
          </div>
        </label>
        {editingFile && (
          <>
            <label>
              Edit file content:
              <textarea
                value={fileContent}
                onChange={handleFileContentChange}
              ></textarea>
            </label>
            <button onClick={handleSaveFile}>Save</button>
          </>
        )}
        <br />
        <div className="button-container">
          <button type="submit">Create Directory and Run</button>
        </div>
      </form>
      {message && <p className="message">{message}</p>}
    </div>
  );
}

export default CreateRun;





















































// import React, { useState, useEffect } from "react";
// import axios from "axios";
// import "./CreateRun.css"; // Import your CSS file
// import { useNavigate } from "react-router-dom";

// function CreateRun() {
//   const [existingUsernames, setExistingUsernames] = useState([]);
//   const [selectedUsername, setSelectedUsername] = useState("");
//   const [newUsername, setNewUsername] = useState("");
//   const [runName, setRunName] = useState("");
//   const [message, setMessage] = useState("");
//   const navigate = useNavigate();

//   const storedSshUsername = sessionStorage.getItem("sshUsername");
//   const storedSshPassword = sessionStorage.getItem("sshPassword");

//   useEffect(() => {
//     async function fetchUsernames() {
//       try {
//         const response = await axios.get(
//           "http://localhost:443/fetch-usernames",
//           {
//             auth: {
//               username: storedSshUsername,
//               password: storedSshPassword,
//             },
//           }
//         );
//         setExistingUsernames(response.data.usernames);
//       } catch (error) {
//         console.error("Error fetching usernames:", error);
//       }
//     }

//     fetchUsernames();
//   }, [storedSshUsername, storedSshPassword]);

//   const handleUsernameChange = (event) => {
//     setSelectedUsername(event.target.value);
//     setNewUsername(event.target.value);
//     setMessage("");
//   };

//   const handleRunNameChange = (event) => {
//     setRunName(event.target.value);
//   };

//   const handleSubmit = async (event) => {
//     event.preventDefault();

//     console.log("Data being sent:", {
//       username: newUsername || selectedUsername,
//       runName: runName,
//     });

//     try {
//       const response = await axios.post(
//         "http://localhost:443/create-directory-and-run",
//         {
//           username: newUsername || selectedUsername,
//           runName: runName,
//         },
//         {
//           auth: {
//             username: storedSshUsername,
//             password: storedSshPassword,
//           },
//         }
//       );

//       setMessage(response.data.message);
//       navigate("/DirectoryExplorer");
//     } catch (error) {
//       setMessage("An error occurred.");
//     }
//   };

//   return (
//     <div className="container">
//       <h1>Create Directory and Run</h1>
//       <form onSubmit={handleSubmit}>
//         <label>
//           Username:
//           <div className="dropdown-input">
//             <div className="input-container">
//               <input
//                 type="text"
//                 value={selectedUsername || newUsername}
//                 onChange={(event) => {
//                   setSelectedUsername("");
//                   setNewUsername(event.target.value);
//                   setMessage("");
//                 }}
//                 placeholder="Username"
//               />
//               {!selectedUsername && (
//                 <div
//                   className="dropdown-icon"
//                   onClick={() => setSelectedUsername("")}
//                 >
//                   &#9662;
//                 </div>
//               )}
//             </div>
//             {!selectedUsername && (
//               <select value={selectedUsername} onChange={handleUsernameChange}>
//                 <option value="">Select an existing username</option>
//                 {existingUsernames.map((username) => (
//                   <option key={username} value={username}>
//                     {username}
//                   </option>
//                 ))}
//               </select>
//             )}
//           </div>
//         </label>

//         <br />
//         <label>
//           Enter a run name:
//           <input
//             type="text"
//             value={runName}
//             onChange={handleRunNameChange}
//             placeholder="Run name"
//           />
//         </label>
//         <br />
//         <div className="button-container">
//           <button type="submit">Create Directory and Run</button>
//         </div>
//       </form>
//       {message && <p className="message">{message}</p>}
//     </div>
//   );
// }

// export default CreateRun;
