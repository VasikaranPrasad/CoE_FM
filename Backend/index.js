const express = require("express");
const cors = require("cors");
const ssh2 = require("ssh2");
const fs = require("fs").promises;
const path = require("path");

const app = express();
const port = process.env.PORT || 9016;

app.use(cors());
app.use(express.json());


// Function to execute commands on the remote server
function executeCommand(conn, command) {
  return new Promise((resolve, reject) => {
    conn.exec(command, (err, stream) => {
      if (err) {
        reject(err);
      }
      let data = "";
      stream.on("data", (chunk) => {
        data += chunk;
      });
      stream.on("end", () => {
        resolve(data.trim());
      });
    });
  });
}
// Function to create the SSH configuration object
function createSSHConfig(Lusername, password) {
  return {
    host: "172.16.90.3", // Replace with your server's IP or hostname
    port: 22,
    username: Lusername,
    password: password,
  };
}

// Route to verify SSH credentials
app.post("/verify-ssh-credentials", async (req, res) => {
  const { Lusername, password } = req.body;

  const conn = new ssh2.Client();

  conn.on("ready", () => {
    res.json({ success: true });
    conn.end(); // Close the SSH connection
  });

  conn.on("error", () => {
    res.status(401).json({ success: false });
  });

  const config = createSSHConfig(Lusername, password);
  conn.connect(config);
});

// Route to fetch usernames
app.get("/fetch-usernames", async (req, res) => {
  // console.log(req.headers); 
  // const { username, password } = req.headers.user;

  const authHeader = req.headers.authorization;   
  if (!authHeader) {
      return res.status(401).json({ error: 'Authorization header missing' });
  }

  const base64Credentials = authHeader.split(' ')[1]; // split "Basic" from the actual encoded string
  const credentials = Buffer.from(base64Credentials, 'base64').toString('utf8'); // decode the base64 string
  const [Lusername, password] = credentials.split(':'); // split the string into username and password
  const conn = new ssh2.Client();

  conn.on("ready", async () => {
    try {
      const usernames = await executeCommand(
        conn,
        "ls /pd/projects/data/sigmasense/sdc300/users"
      );
      const usernamesArray = usernames.split("\n");
      res.json({ usernames: usernamesArray });
    } catch (err) {
      console.error("Error fetching usernames:", err);
      res.status(500).json({ error: "Failed to fetch usernames" });
    } finally {
      conn.end();
    }
  });

  conn.on("error", (err) => {
    console.error("SSH connection error:", err);
    res.status(500).json({ error: "SSH connection error" });
  });
  console.log("testing the credientials",Lusername, password);
  const config = createSSHConfig(Lusername, password);
  conn.connect(config);
});

// Create directory and run command route
app.post("/create-directory-and-run", async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ error: "Authorization header missing" });
  }

  const base64Credentials = authHeader.split(" ")[1];
  const credentials = Buffer.from(base64Credentials, "base64").toString("utf8");
  const [Lusername, password] = credentials.split(":");

  const username = req.body.username; // Use a different variable name
  const runName = req.body.runName;
  const userDirectory = `/projects/data/sigmasense/sdc300/users/${username}/${runName}`;

  console.log("User Directory:", userDirectory); // Debugging output

  const conn = new ssh2.Client();

  conn.on("ready", async () => {
    try {
      // Check if user directory exists
      const checkDirectoryExists = await executeCommand(conn, `ls ${userDirectory}`);
      console.log("Check Directory Exists:", checkDirectoryExists); // Debugging output

      if (checkDirectoryExists) {
        res.json({ message: "User directory already exists" });
      } else {
        // Directory doesn't exist, create it
        const createDirectoryCommand = `mkdir -p ${userDirectory}`;
        console.log("Create Directory Command:", createDirectoryCommand); // Debugging output
        await executeCommand(conn, createDirectoryCommand);
        res.json({ message: "User directory and run created successfully" });
      }
    } catch (err) {
      console.error("Error creating directories:", err);
      res.status(500).json({ error: "Failed to create directories" });
    } finally {
      conn.end(); // Close the SSH connection
    }
  });

  conn.on("error", (err) => {
    console.error("SSH connection error:", err);
    res.status(500).json({ error: "SSH connection error" });
  });

  const config = createSSHConfig(Lusername, password); // Use credUsername
  conn.connect(config);
});

// Add this route to send the default directory path to the frontend

app.get("/default-directory", (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ error: "Authorization header missing" });
  }

  const base64Credentials = authHeader.split(" ")[1];
  const credentials = Buffer.from(base64Credentials, "base64").toString("utf8");
  const [username, password] = credentials.split(":");
  const defaultPath = "ls /pd/projects/data/sigmasense/sdc300/users"; // Set your default path here
  res.json({ defaultPath });
});


app.get("/fetch-directory", async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ error: "Authorization header missing" });
  }

  const base64Credentials = authHeader.split(" ")[1];
  const credentials = Buffer.from(base64Credentials, "base64").toString("utf8");
  const [Lusername, password] = credentials.split(":");

  const remoteDirectoryPath = req.query.path || "ls /pd/projects/data/sigmasense/sdc300/users";

  const conn = new ssh2.Client();

  conn.on("ready", async () => {
    try {
      const command = `ls ${remoteDirectoryPath}`;
      const contents = await executeCommand(conn, command);
      const contentsArray = contents.split("\n");
      res.json({ contents: contentsArray });
    } catch (err) {
      console.error("Error fetching directory contents:", err);
      res.status(500).json({ error: "Failed to fetch directory contents" });
    } finally {
      conn.end();
    }
  });

  conn.on("error", (err) => {
    console.error("SSH connection error:", err);
    res.status(500).json({ error: "SSH connection error" });
  });

  const config = createSSHConfig(Lusername, password);
  conn.connect(config);
});


// ... (file choosing and editing)

app.get("/fetch-file-content", async (req, res) => {
  const filePath = req.query.path;
  try {
    const content = await executeCommand(conn, `cat ${filePath}`);
    res.json({ content });
  } catch (err) {
    console.error("Error fetching file content:", err);
    res.status(500).json({ error: "Failed to fetch file content" });
  }
});

app.post("/save-file", async (req, res) => {
  const filePath = req.body.path;
  const content = req.body.content;
  try {
    await executeCommand(conn, `echo "${content}" > ${filePath}`);
    res.json({ message: "File saved successfully" });
  } catch (err) {
    console.error("Error saving file:", err);
    res.status(500).json({ error: "Failed to save file" });
  }
});

// build file script

const _dirname = path.dirname("");
const builPath = path.join(_dirname, "../frontend/build");
// app.use(express.static(builPath))
app.use(express.static(path.join(builPath)));
app.get("/*", function (req, res) {
  res.sendFile(
    "index.html",
    { root: path.join(_dirname, "../frontend/build") },
    function (err) {
      if (err) {
        res.status(500).send(err);
      }
    }
  );
});

app.listen(port, () => {
  console.log(`Server is running on port: ${port}`);
});














// ******************************Old basic code*************************

// const express = require('express');
// const cors = require('cors');
// const app = express();
// const port = process.env.PORT || 443;

// app.use(cors());
// app.use(express.json());

// const ssh2 = require('ssh2');

// const sshConfig = {
//   host: '172.16.90.3',
//   port: 22,
//   username: 'vasikaran',
//   password: 'Vasikaran@123'
// };

// function fetchDirectoryContents(directory, callback) {
//   const conn = new ssh2.Client();

//   conn.on('ready', () => {
//     conn.exec(`ls /pd/projects/data/sigmasense/sdc300/users/${directory}`, (err, stream) => {
//       if (err) {
//         conn.end();
//         return callback(err);
//       }

//       let data = '';
//       stream.on('data', (chunk) => {
//         data += chunk;
//       });

//       stream.on('end', () => {
//         const directoryContents = data.split('\n').filter(item => item !== '');
//         conn.end();
//         callback(null, directoryContents);
//       });
//     });
//   });

//   conn.on('error', (err) => {
//     callback(err);
//   });

//   conn.connect(sshConfig);
// }

// function fetchDirectories(callback) {
//   const conn = new ssh2.Client();

//   conn.on('ready', () => {
//     conn.exec('ls /pd/projects/data/sigmasense/sdc300/users', (err, stream) => {
//       if (err) {
//         conn.end();
//         return callback(err);
//       }

//       let data = '';
//       stream.on('data', (chunk) => {
//         data += chunk;
//       });

//       stream.on('end', () => {
//         const directories = data.split('\n').filter(dir => dir !== '');
//         conn.end();
//         callback(null, directories);
//       });
//     });
//   });

//   conn.on('error', (err) => {
//     callback(err);
//   });

//   conn.connect(sshConfig);
// }

// app.post('/fetch-directories', (req, res) => {
//   const username = req.body.username;
//   fetchDirectories((err, directories) => {
//     if (err) {
//       console.error('Error fetching directories:', err);
//       res.status(500).json({ error: 'Failed to fetch directories' });
//     } else {
//       res.json({ directories });
//     }
//   });
// });

// app.get('/fetch-directory-contents/:directory', (req, res) => {
//   const directory = req.params.directory;
//   fetchDirectoryContents(directory, (err, contents) => {
//     if (err) {
//       console.error('Error fetching directory contents:', err);
//       res.status(500).json({ error: 'Failed to fetch directory contents' });
//     } else {
//       res.json({ contents });
//     }
//   });
// });

// app.get('/fetch-subdirectory-contents/:parentDirectory/:subDirectory', (req, res) => {
//     const parentDirectory = req.params.parentDirectory;
//     const subDirectory = req.params.subDirectory;
//     const fullDirectory = `${parentDirectory}/${subDirectory}`;

//     fetchDirectoryContents(fullDirectory, (err, contents) => {
//       if (err) {
//         console.error('Error fetching subdirectory contents:', err);
//         res.status(500).json({ error: 'Failed to fetch subdirectory contents' });
//       } else {
//         res.json({ contents });
//       }
//     });
//   });

// // Mock data for existing usernames (replace with actual data)
// const existingUsernames = ['vk2', 'vk3', 'vk4'];

//   app.get('/fetch-usernames', (req, res) => {
//     res.json({ usernames: existingUsernames });
//   });

// app.post('/create-directory-and-run', (req, res) => {
//   const username = req.body.username;
//   const runName = req.body.runName;
//   const userDirectory = `/pd/projects/data/sigmasense/sdc300/users/${username}`;

//   const conn = new ssh2.Client();

//   conn.on('ready', () => {
//     // Check if the user directory exists
//     conn.exec(`ls ${userDirectory}`, (err, stream) => {
//       if (err) {
//         // Directory doesn't exist, create it
//         conn.exec(`mkdir ${userDirectory}`, (mkdirErr, mkdirStream) => {
//           if (mkdirErr) {
//             conn.end();
//             return res.status(500).json({ error: 'Failed to create user directory' });
//           }

//           // Directory created, now create the run name
//           conn.exec(`mkdir ${userDirectory}/${runName}`, (runErr, runStream) => {
//             conn.end();
//             if (runErr) {
//               return res.status(500).json({ error: 'Failed to create run directory' });
//             }
//             res.json({ message: 'User directory and run created successfully' });
//           });
//         });
//       } else {
//         // Directory already exists, check if run name exists
//         conn.exec(`ls ${userDirectory}/${runName}`, (runErr, runStream) => {
//           conn.end();
//           if (runErr) {
//             // Run name doesn't exist, create it
//             conn.exec(`mkdir ${userDirectory}/${runName}`, (mkdirErr, mkdirStream) => {
//               if (mkdirErr) {
//                 return res.status(500).json({ error: 'Failed to create run directory' });
//               }
//               res.json({ message: 'Run directory created successfully' });
//             });
//           } else {
//             // Run name already exists
//             res.status(400).json({ error: 'Run name already exists for this user' });
//           }
//         });
//       }
//     });
//   });

//   conn.on('error', (err) => {
//     res.status(500).json({ error: 'SSH connection error' });
//   });

//   conn.connect(sshConfig);
// });

// // ... (existing routes and app.listen)

// function executeCommand(command) {
//   return new Promise((resolve, reject) => {
//     const conn = new ssh2.Client();

//     conn.on('ready', () => {
//       conn.exec(command, (err, stream) => {
//         if (err) {
//           conn.end();
//           reject(err);
//         }

//         let data = '';
//         stream.on('data', (chunk) => {
//           data += chunk;
//         });

//         stream.on('end', () => {
//           conn.end();
//           resolve(data.trim());
//         });
//       });
//     });

//     conn.on('error', (err) => {
//       reject(err);
//     });

//     conn.connect(sshConfig);
//   });
// }

// app.listen(port, () => {
//   console.log(`Server is running on port: ${port}`);
// });
