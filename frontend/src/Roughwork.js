import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFolder } from "@fortawesome/free-solid-svg-icons";
import "./DirectoryExplorer.css"; // Import your CSS file for styling
import Backendapi from "./Backendapi";

const DirectoryExplorer = () => {
  const [directoryTree, setDirectoryTree] = useState([]);
  const [currentPath, setCurrentPath] = useState([]);
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState("small"); // 'list' or 'small'
  const [selectedFileContent, setSelectedFileContent] = useState("");

  const storedSshUsername = sessionStorage.getItem("sshUsername");
  const storedSshPassword = sessionStorage.getItem("sshPassword");

  useEffect(() => {
    fetchDirectoryTree();
  }, []);

  // const fetchDirectoryTree = async (path = "/") => {
  //   try {
  //     setLoading(true);
  //     const auth = `${storedSshUsername}:${storedSshPassword}`; // Use the stored SSH credentials
  //     const headers = new Headers({
  //       Authorization: `Basic ${btoa(auth)}`, // Encode credentials as base64
  //     });

  //     const response = await fetch(
  //       `${
  //         Backendapi.REACT_APP_BACKEND_API_URL
  //       }/fetch-directory?path=${encodeURIComponent(path)}`,
  //       { headers }
  //     );

  //     const data = await response.json();
  //     setDirectoryTree(data.contents);
  //     setCurrentPath(path);
  //     setLoading(false);
  //   } catch (error) {
  //     console.error("Error fetching directory tree:", error);
  //     setLoading(false);
  //   }
  // };



  const fetchDirectoryTree = async (path = "/") => {
    try {
      setLoading(true);
      const auth = `${storedSshUsername}:${storedSshPassword}`;
      const headers = new Headers({
        Authorization: `Basic ${btoa(auth)}`,
      });

      const response = await fetch(
        `${
          Backendapi.REACT_APP_BACKEND_API_URL
        }/fetch-directory?path=${encodeURIComponent(path)}`,
        { headers }
      );

      const data = await response.json();
      setDirectoryTree(data.contents);
      setCurrentPath(path);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching directory tree:", error);
      setLoading(false);
    }
  };

  // const handleDirectoryClick = (itemName) => {
  //   const newPath = `${currentPath}/${itemName}`;
  //   fetchDirectoryTree(newPath);
  // };

  // Inside handleDirectoryClick for files
  const handleDirectoryClick = async (itemName, isFile) => {
    if (isFile) {
      const filePath = `${currentPath}/${itemName}`;
      try {
        setLoading(true);
        const response = await fetch(
          `${
            Backendapi.REACT_APP_BACKEND_API_URL
          }/fetch-file-content?path=${encodeURIComponent(filePath)}`,
          { headers }
        );
        const data = await response.json();
        setSelectedFileContent(data.content);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching file content:", error);
        setLoading(false);
      }
    } else {
      const newPath = `${currentPath}/${itemName}`;
      fetchDirectoryTree(newPath);
    }
  };

  const handleBackClick = () => {
    const newPath = currentPath.split("/").slice(0, -1).join("/");
    fetchDirectoryTree(newPath);
  };

  const handleViewModeToggle = () => {
    setViewMode((currentMode) => (currentMode === "list" ? "small" : "list"));
  };

  
  const handleSaveFile = async () => {
    try {
      await axios.post(
        `${Backendapi.REACT_APP_BACKEND_API_URL}/save-file`,
        {
          path: `${currentPath}/${selectedFileName}`,
          content: selectedFileContent,
        },
        {
          auth: {
            username: storedSshUsername,
            password: storedSshPassword,
          },
        }
      );
      setMessage('File saved successfully.');
    } catch (error) {
      console.error('Error saving file:', error);
      setMessage('An error occurred while saving the file.');
    }
  };
  

  return (
    <div className="directory-explorer">
      <h1>Directory Explorer</h1>
      <p>Current Path: {currentPath}</p>
      <button onClick={handleBackClick}>Back</button>
      <button onClick={handleViewModeToggle} className="toggle-button">
        Change View
      </button>

      <ul className={`directory-list ${viewMode}`}>
        {loading ? (
          <p>Loading...</p>
        ) : (
          directoryTree.map((item, index) => (
            // <li key={index} onClick={() => handleDirectoryClick(item)} className={viewMode}>
            //   <div className="folder-item">
            //     <FontAwesomeIcon icon={faFolder} className="folder-icon" size="5x" style={{ color: 'grey' }} />
            //     <span className="folder-name">{item}</span>
            //   </div>
            // </li>
            const isFile = !item.includes("/") && item.includes(".txt"); // Change '.txt' to your desired file extension
            <li
              key={index}
              onClick={() => handleDirectoryClick(item, isFile)}
              className={viewMode}
            >
              <div className="folder-item">
                <FontAwesomeIcon
                  icon={isFile ? faFile : faFolder}
                  className={`folder-icon${isFile ? " file-icon" : ""}`}
                  size="5x"
                  style={{ color: isFile ? "blue" : "grey" }}
                />
                <span className="folder-name">{item}</span>
              </div>
            </li>
          ))
        )}
      </ul>

      {selectedFileContent !== "" && (
        <div className="file-editor">
          <textarea
            value={selectedFileContent}
            onChange={(event) => setSelectedFileContent(event.target.value)}
          ></textarea>
          <button onClick={handleSaveFile}>Save</button>
        </div>
      )}
    </div>
  );
};

export default DirectoryExplorer;

// import React, { useState, useEffect } from 'react';
// import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
// import { faFolder, faFile } from '@fortawesome/free-solid-svg-icons';
// import './DirectoryExplorer.css'; // Import your CSS file for styling
// import Backendapi from './Backendapi';

// const DirectoryExplorer = () => {
//   const [directoryTree, setDirectoryTree] = useState([]);
//   const [currentPath, setCurrentPath] = useState('/');
//   const [loading, setLoading] = useState(false);
//   const [viewMode, setViewMode] = useState('small'); // 'list' or 'small'
//   const [fileContent, setFileContent] = useState('');
//   const [editingFile, setEditingFile] = useState(false);
//   const [selectedFileName, setSelectedFileName] = useState(''); // Define selectedFileName state
//   const [message, setMessage] = useState(''); // Define message state

//   const storedSshUsername = sessionStorage.getItem('sshUsername');
//   const storedSshPassword = sessionStorage.getItem('sshPassword');

//   useEffect(() => {
//     fetchDirectoryTree();
//   }, []);

//   const fetchDirectoryTree = async (path = '/') => {
//     try {
//       setLoading(true);
//       const auth = `${storedSshUsername}:${storedSshPassword}`;
//       const headers = new Headers({
//         Authorization: `Basic ${btoa(auth)}`,
//       });

//       const response = await fetch(
//         `${Backendapi.REACT_APP_BACKEND_API_URL}/fetch-directory?path=${encodeURIComponent(path)}`,
//         { headers }
//       );

//       const data = await response.json();
//       setDirectoryTree(data.contents);
//       setCurrentPath(path);
//       setLoading(false);
//     } catch (error) {
//       console.error('Error fetching directory tree:', error);
//       setLoading(false);
//     }
//   };

//   const handleDirectoryClick = (itemName) => {
//     const newPath = `${currentPath}/${itemName}`;
//     fetchDirectoryTree(newPath);
//   };

//   // const handleFileClick = async (fileName) => {
//   //   try {
//   //     const filePath = `${currentPath}/${fileName}`;
//   //     const auth = `${storedSshUsername}:${storedSshPassword}`;
//   //     const headers = new Headers({
//   //       Authorization: `Basic ${btoa(auth)}`,
//   //     });

//   //     const response = await fetch(
//   //       `${Backendapi.REACT_APP_BACKEND_API_URL}/fetch-file-content?path=${encodeURIComponent(filePath)}`,
//   //       { headers }
//   //     );

//   //     const data = await response.json();
//   //     setFileContent(data.content);
//   //     setEditingFile(true);
//   //   } catch (error) {
//   //     console.error('Error fetching file content:', error);
//   //   }
//   // };

//   const handleFileClick = async (fileName) => {
//     try {
//       const filePath = `${currentPath}/${fileName}`;
//       const auth = `${storedSshUsername}:${storedSshPassword}`;
//       const headers = new Headers({
//         Authorization: `Basic ${btoa(auth)}`,
//       });

//       const response = await fetch(
//         `${Backendapi.REACT_APP_BACKEND_API_URL}/fetch-file-content?path=${encodeURIComponent(
//           filePath
//         )}`,
//         { headers }
//       );

//       const data = await response.json();
//       setFileContent(data.content);
//       setEditingFile(true);
//       setSelectedFileName(fileName); // Set selectedFileName
//     } catch (error) {
//       console.error('Error fetching file content:', error);
//     }
//   };

//   const handleBackClick = () => {
//     const newPath = currentPath.split('/').slice(0, -1).join('/');
//     fetchDirectoryTree(newPath);
//   };

//   const handleViewModeToggle = () => {
//     setViewMode((currentMode) => (currentMode === 'list' ? 'small' : 'list'));
//   };

//   const handleSaveFile = async () => {
//     try {
//       await fetch(`${Backendapi.REACT_APP_BACKEND_API_URL}/save-file`, {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//           Authorization: `Basic ${btoa(`${storedSshUsername}:${storedSshPassword}`)}`,
//         },
//         body: JSON.stringify({
//           path: `${currentPath}/${selectedFileName}`,
//           content: fileContent,
//         }),
//       });

//       setEditingFile(false);
//       setFileContent('');
//       setMessage('File saved successfully.');
//     } catch (error) {
//       console.error('Error saving file:', error);
//       setMessage('An error occurred while saving the file.');
//     }
//   };

//   return (
//     <div className="directory-explorer">
//       <h1>Directory Explorer</h1>
//       <p>Current Path: {currentPath}</p>
//       <button onClick={handleBackClick}>Back</button>
//       <button onClick={handleViewModeToggle} className="toggle-button">
//         Change View
//       </button>
//       <ul className={`directory-list ${viewMode}`}>
//         {loading ? (
//           <p>Loading...</p>
//         ) : (
//           directoryTree.map((item, index) => (
//             <li
//               key={index}
//               onClick={() =>
//                 item.includes('/') ? handleDirectoryClick(item) : handleFileClick(item)
//               }
//               className={viewMode}
//             >
//               {item.includes('/') ? (
//                 <div className="folder-item">
//                   <FontAwesomeIcon
//                     icon={faFolder}
//                     className="folder-icon"
//                     size="5x"
//                     style={{ color: 'grey' }}
//                   />
//                   <span className="folder-name">{item}</span>
//                 </div>
//               ) : (
//                 <div className="file-item">
//                   <FontAwesomeIcon
//                     icon={faFile}
//                     className="file-icon"
//                     size="5x"
//                     style={{ color: 'blue' }}
//                   />
//                   <span className="file-name">{item}</span>
//                 </div>
//               )}
//             </li>
//           ))
//         )}
//       </ul>
//       {editingFile && (
//         <div className="file-editor">
//           <textarea
//             value={fileContent}
//             onChange={(e) => setFileContent(e.target.value)}
//             className="file-content"
//           />
//           <button onClick={handleSaveFile} className="save-button">
//             Save
//           </button>
//         </div>
//       )}
//     </div>
//   );
// };

// export default DirectoryExplorer;
