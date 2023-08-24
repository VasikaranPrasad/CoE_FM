import React, { useState, useEffect } from "react";
import axios from "axios";
import { Treebeard } from "react-treebeard";

function VncUserLogin() {
  const [username, setUsername] = useState("");
  const [directories, setDirectories] = useState([]);
  const [selectedDirectory, setSelectedDirectory] = useState("");
  const [directoryContents, setDirectoryContents] = useState([]);
  const [subDirectories, setSubDirectories] = useState([]);
  const [treeData, setTreeData] = useState([]); // State to hold tree data
  const [loadingPaths, setLoadingPaths] = useState([]); // Track loading paths

  const fetchDirectories = async () => {
    try {
      const response = await axios.post(
        "http://localhost:443/fetch-directories",
        { username }
      );
      setDirectories(response.data.directories);
      console.log(response.data);
    } catch (error) {
      console.error("Error fetching directories:", error);
    }
  };

  const fetchDirectoryContents = async (directory) => {
    try {
      const response = await axios.get(
        `http://localhost:443/fetch-directory-contents/${directory}`
      );
      return response.data.contents;
    } catch (error) {
      console.error("Error fetching directory contents:", error);
      return [];
    }
  };

  const fetchSubDirectoryContents = async (parentDirectory, subDirectory) => {
    try {
      const response = await axios.get(
        `http://localhost:443/fetch-subdirectory-contents/${parentDirectory}/${subDirectory}`
      );
      // console.log(response.data);
      return response.data.contents;
    } catch (error) {
      console.error("Error fetching subdirectory contents:", error);
      return [];
    }
  };

  const handleUsernameSubmit = async (event) => {
    event.preventDefault();
    fetchDirectories();
  };

  const handleDirectorySelect = async (directory) => {
    setSelectedDirectory(directory);

    const contents = await fetchDirectoryContents(directory);
    setDirectoryContents(contents);

    const subDirectories = contents.filter((item) => item.endsWith("/"));
    setSubDirectories(subDirectories);
  };

  const handleSubDirectorySelect = async (subDirectory) => {
    const parentDirectory = selectedDirectory;
    const contents = await fetchSubDirectoryContents(
      parentDirectory,
      subDirectory
    );
    setDirectoryContents(contents);

    const subDirectories = contents.filter((item) => item.endsWith("/"));
    setSubDirectories(subDirectories);
  };

  // ... (fetchDirectories, fetchDirectoryContents, fetchSubDirectoryContents functions remain the same)

  const organizeDirectoriesAsTree = (flatDirectories) => {
    const treeStructure = {};

    flatDirectories.forEach((directory) => {
      const parts = directory.split("/");
      let currentLevel = treeStructure;

      parts.forEach((part) => {
        if (!currentLevel[part]) {
          currentLevel[part] = {};
        }
        currentLevel = currentLevel[part];
      });
    });

    return treeStructure;
  };

  // ... (other functions remain the same)

  useEffect(() => {
    fetchDirectories();
  }, []);

  useEffect(() => {
    const treeStructure = organizeDirectoriesAsTree(directories);
    const formattedTreeData = formatTreeData(treeStructure, "");

    setTreeData(formattedTreeData);
  }, [directories]);

  const formatTreeData = (data, parentPath, hierarchy = "") => {
    return Object.keys(data).map((name) => {
      const fullPath = parentPath ? `${parentPath}/${name}` : name;
      const displayPath = hierarchy ? `${hierarchy} -> ${name}` : name;
      const children = data[name]
        ? formatTreeData(data[name], fullPath, displayPath)
        : null;

      return {
        name: displayPath,
        path: fullPath,
        toggled: false,
        children: children,
      };
    });
  };

  const onToggle = async (node, toggled) => {
    node.toggled = toggled;

    // Update tree data to reflect the changes
    setTreeData(
      treeData.map((n) => {
        if (n.path === node.path) {
          n.toggled = toggled;
        }
        return n;
      })
    );

    // If the node is now expanded, fetch its children
    if (toggled && !loadingPaths.includes(node.path)) {
      setLoadingPaths([...loadingPaths, node.path]);

      try {
        const contents = await fetchDirectoryContents(node.path);

        const childNodes = contents.map((item) => ({
          name: item,
          path: `${node.path}/${item}`,
          toggled: false,
          loading: item.endsWith("/"),
          children: item.endsWith("/") ? [] : null,
        }));

        // Add fetched child nodes to the existing node's children array
        if (!node.children) {
          node.children = [];
        }
        node.children.push(...childNodes);

        setLoadingPaths(loadingPaths.filter((path) => path !== node.path));
        setTreeData(treeData);
      } catch (error) {
        console.error("Error fetching directory contents:", error);
      }
    }
  };

  return (
    <div className="App">
      <h1>SSH Directory App</h1>
      <form onSubmit={handleUsernameSubmit}>
        {/* ... Username input and submit button ... */}
      </form>
      {treeData.length > 0 && (
        <Treebeard
          data={treeData}
          onToggle={onToggle}
          key={selectedDirectory}
        />
      )}
      {/* {directories.length > 0 && (
        <table>
          <thead>
            <tr>
              <th>Directories</th>
            </tr>
          </thead>
          <tbody>
            {directories.map((directory) => (
              <tr
                key={directory}
                onClick={() => handleDirectorySelect(directory)}
              >
                <td>{directory}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      {selectedDirectory && (
        <div>
          <h2>Selected Directory: {selectedDirectory}</h2>
          <table>
            <thead>
              <tr>
                <th>Directory Contents</th>
              </tr>
            </thead>
            <tbody>
              {directoryContents.map((item) => (
                <tr key={item} onClick={() => handleSubDirectorySelect(item)}>
                  <td>{item}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {subDirectories.length > 0 && (
        <div>
          <h3>Subdirectories:</h3>
          <table>
            <thead>
              <tr>
                <th>Subdirectories</th>
              </tr>
            </thead>
            <tbody>
              {subDirectories.map((subDir) => (
                <tr
                  key={subDir}
                  onClick={() => handleSubDirectorySelect(subDir)}
                >
                  <td>{subDir}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )} */}
    </div>
  );
}

export default VncUserLogin;
