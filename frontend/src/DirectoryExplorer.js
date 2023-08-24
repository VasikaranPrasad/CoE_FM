import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFolder } from '@fortawesome/free-solid-svg-icons';
import './DirectoryExplorer.css'; // Import your CSS file for styling
import Backendapi from './Backendapi';

const DirectoryExplorer = () => {
  const [directoryTree, setDirectoryTree] = useState([]);
  const [currentPath, setCurrentPath] = useState([]);
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState('small'); // 'list' or 'small'

  useEffect(() => {
    fetchDirectoryTree();
  }, []);

  const fetchDirectoryTree = async (path = '/') => {
    try {
      setLoading(true);
      const response = await fetch(`${Backendapi.REACT_APP_BACKEND_API_URL}/fetch-directory?path=${encodeURIComponent(path)}`);
      const data = await response.json();
      setDirectoryTree(data.contents);
      setCurrentPath(path);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching directory tree:', error);
      setLoading(false);
    }
  };

  const handleDirectoryClick = (itemName) => {
    const newPath = `${currentPath}/${itemName}`;
    fetchDirectoryTree(newPath);
  };

  const handleBackClick = () => {
    const newPath = currentPath.split('/').slice(0, -1).join('/');
    fetchDirectoryTree(newPath);
  };

  const handleViewModeToggle = () => {
    setViewMode(currentMode => (currentMode === 'list' ? 'small' : 'list'));
  };

  return (
    <div className="directory-explorer">
      <h1>Directory Explorer</h1>
      <p>Current Path: {currentPath}</p>
      <button onClick={handleBackClick}>Back</button>
      <button onClick={handleViewModeToggle} className="toggle-button">Change View</button>
      <ul className={`directory-list ${viewMode}`}>
        {loading ? (
          <p>Loading...</p>
        ) : (
          directoryTree.map((item, index) => (
            <li key={index} onClick={() => handleDirectoryClick(item)} className={viewMode}>
              <div className="folder-item">
                <FontAwesomeIcon icon={faFolder} className="folder-icon" size="5x" style={{ color: 'grey' }} />
                <span className="folder-name">{item}</span>
              </div>
            </li>
          ))
        )}
      </ul>
    </div>
  );
};

export default DirectoryExplorer;




































// import React, { useState, useEffect } from 'react';
// import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
// import { faFolder } from '@fortawesome/free-solid-svg-icons';


// const DirectoryExplorer = () => {
//   const [directoryTree, setDirectoryTree] = useState([]);
//   const [currentPath, setCurrentPath] = useState([]);
//   const [loading, setLoading] = useState(false);
  
 

//   useEffect(() => {
//     fetchDirectoryTree();
//   }, []);

//   const fetchDirectoryTree = async (path = '/') => {
//     try {
//       setLoading(true);
//       const response = await fetch(`http://localhost:443/fetch-directory?path=${encodeURIComponent(path)}`);
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

//   const handleBackClick = () => {
//     const newPath = currentPath.split('/').slice(0, -1).join('/');
//     fetchDirectoryTree(newPath);
//   };

//   return (
//     <div className="directory-explorer">
//       <h1>Directory Explorer</h1>
//       <p>Current Path: {currentPath}</p>
//       <button onClick={handleBackClick}>Back</button>
//       <ul className="directory-list">
//         {loading ? (
//           <p>Loading...</p>
//         ) : (
//           directoryTree.map((item, index) => (
//             <li key={index} onClick={() => handleDirectoryClick(item)}>
//               <FontAwesomeIcon icon={faFolder} className="folder-icon" />
//               {item}
//             </li>
//           ))
//         )}
//       </ul>
//     </div>
//   );
// };

// export default DirectoryExplorer;
