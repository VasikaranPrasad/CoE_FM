const express = require("express");
const cors = require("cors");
const ssh2 = require("ssh2");
const fs = require("fs").promises;
const path = require("path");

const app = express();
const port = process.env.PORT || 9015;

app.use(cors());
app.use(express.json());

// SSH Configuration for fetchusers
// const sshConfigg = {
//   host: "172.16.90.3", // Replace with your server's IP or hostname
//   port: 22,
//   username: "vasikaran", // Replace with your SSH username
//   password: "Vasikaran@123", // Replace with your SSH password or use other authentication methods
// };

// // // SSH Configuration
// const sshConfig = {
//   host: "172.16.90.3", // Replace with your server's IP or hostname
//   port: 22,
//   debug: console.log, // Add this line for debugging
//   // You can define default values for username and password here if needed
// };

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

// // Create a route to verify SSH credentials
// app.post('/verify-ssh-credentials', async (req, res) => {
//   const { username, password } = req.body;
//   console.log('Received username:', username); // Add this line

//   // Perform SSH credentials verification logic here
//   const conn = new ssh2.Client();

//   conn.on('ready', () => {
//     res.json({ success: true });
//     conn.end(); // Close the SSH connection
//   });

//   conn.on('error', () => {
//     res.status(401).json({ success: false });
//   });
//   console.log('Username before connecting:', username);
//   const config = {
//     ...sshConfig, // Use the default configuration
//     username: username,
//     password: password,
//   };

//   conn.connect(config);
// });

// // Create a route to fetch usernames from the Linux server
// app.get('/fetch-usernames', async (req, res) => {
//   const conn = new ssh2.Client();

//   conn.on('ready', async () => {
//     try {
//       const usernames = await executeCommand(conn, 'ls /pd/projects/data/sigmasense/sdc300/users');
//       const usernamesArray = usernames.split('\n');
//       res.json({ usernames: usernamesArray });
//     } catch (err) {
//       console.error('Error fetching usernames:', err);
//       res.status(500).json({ error: 'Failed to fetch usernames' });
//     } finally {
//       conn.end();
//     }
//   });

//   conn.on('error', (err) => {
//     console.error('SSH connection error:', err);
//     res.status(500).json({ error: 'SSH connection error' });
//   });

//   conn.connect(sshConfigg);
// });

// Function to create the SSH configuration object
function createSSHConfig(username, password) {
  return {
    host: "172.16.90.3", // Replace with your server's IP or hostname
    port: 22,
    username: username,
    password: password,
  };
}

// Route to verify SSH credentials
app.post("/verify-ssh-credentials", async (req, res) => {
  const { username, password } = req.body;

  const conn = new ssh2.Client();

  conn.on("ready", () => {
    res.json({ success: true });
    conn.end(); // Close the SSH connection
  });

  conn.on("error", () => {
    res.status(401).json({ success: false });
  });

  const config = createSSHConfig(username, password);
  conn.connect(config);
});

// Route to fetch usernames
app.get("/fetch-usernames", async (req, res) => {
  const { username, password } = req.query;

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

  const config = createSSHConfig(username, password);
  conn.connect(config);
});

// Create directory and run command route
app.post("/create-directory-and-run", async (req, res) => {
  const username = req.body.username;
  const runName = req.body.runName;
  const userDirectory = `/projects/data/sigmasense/sdc300/users/${username}/${runName}`;

  const conn = new ssh2.Client();

  conn.on("ready", async () => {
    try {
      // Check if user directory exists
      const checkDirectoryExists = await executeCommand(
        conn,
        `ls ${userDirectory}`
      );

      if (checkDirectoryExists) {
        res.json({ message: "User directory already exists" });
      } else {
        // Directory doesn't exist, create it
        await executeCommand(conn, `mkdir -p ${userDirectory}`);
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

  conn.connect(sshConfigg);
});

// Add this route to send the default directory path to the frontend
app.get("/default-directory", (req, res) => {
  const defaultPath = "ls /pd/projects/data/sigmasense/sdc300/users"; // Set your default path here
  res.json({ defaultPath });
});

// Modify the fetch-directory route to use the default path if no path is provided
app.get("/fetch-directory", async (req, res) => {
  const remoteDirectoryPath =
    req.query.path || "ls /pd/projects/data/sigmasense/sdc300/users";

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

  conn.connect(sshConfigg);
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