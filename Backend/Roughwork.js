const express = require('express');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 443;

app.use(cors());
app.use(express.json());

const ssh2 = require('ssh2');

const sshConfig = {
  host: '172.16.90.3',
  port: 22,
  username: 'vasikaran',
  password: 'Vasikaran@123'
};

function executeCommand(conn, command) {
  return new Promise((resolve, reject) => {
    conn.exec(command, (err, stream) => {
      if (err) {
        reject(err);
        return;
      }

      let data = '';
      stream.on('data', (chunk) => {
        data += chunk;
      });

      stream.on('end', () => {
        resolve(data.trim());
      });
    });
  });
}

app.post('/fetch-directories', (req, res) => {
  // Your fetchDirectories logic here
  const username = req.body.username;
  fetchDirectories((err, directories) => {
    if (err) {
      console.error('Error fetching directories:', err);
      res.status(500).json({ error: 'Failed to fetch directories' });
    } else {
      res.json({ directories });
    }
  });
});

app.get('/fetch-directory-contents/:directory', (req, res) => {
  // Your fetchDirectoryContents logic here
  const directory = req.params.directory;
  fetchDirectoryContents(directory, (err, contents) => {
    if (err) {
      console.error('Error fetching directory contents:', err);
      res.status(500).json({ error: 'Failed to fetch directory contents' });
    } else {
      res.json({ contents });
    }
  });
});

app.get('/fetch-subdirectory-contents/:parentDirectory/:subDirectory', (req, res) => {
  // Your fetchSubdirectoryContents logic here
  const parentDirectory = req.params.parentDirectory;
  const subDirectory = req.params.subDirectory;
  const fullDirectory = `${parentDirectory}/${subDirectory}`;

  fetchDirectoryContents(fullDirectory, (err, contents) => {
    if (err) {
      console.error('Error fetching subdirectory contents:', err);
      res.status(500).json({ error: 'Failed to fetch subdirectory contents' });
    } else {
      res.json({ contents });
    }
  });
});

// Mock data for existing usernames (replace with actual data)
const existingUsernames = ['vk2', 'vk3', 'vk4'];

app.get('/fetch-usernames', (req, res) => {
  res.json({ usernames: existingUsernames });
});

app.post('/create-directory-and-run', async (req, res) => {
  const username = req.body.username;
  const runName = req.body.runName;
  const userDirectory = `/pd/projects/data/sigmasense/sdc300/users/${username}`;

  const conn = new ssh2.Client();

  conn.on('ready', async () => {
    try {
      // Check if the user directory exists
      await executeCommand(conn, `ls ${userDirectory}`);

      // Directory already exists, check if run name exists
      try {
        await executeCommand(conn, `ls ${userDirectory}/${runName}`);
        res.status(400).json({ error: 'Run name already exists for this user' });
      } catch (runErr) {
        // Run name doesn't exist, create it
        await executeCommand(conn, `mkdir ${userDirectory}/${runName}`);
        res.json({ message: 'Run directory created successfully' });
      }
    } catch (err) {
      // Directory doesn't exist, create it
      await executeCommand(conn, `mkdir ${userDirectory}`);

      // Directory created, now create the run name
      await executeCommand(conn, `mkdir ${userDirectory}/${runName}`);
      res.json({ message: 'User directory and run created successfully' });
    } finally {
      conn.end();
    }
  });

  conn.on('error', (err) => {
    res.status(500).json({ error: 'SSH connection error' });
  });

  conn.connect(sshConfig);
});

app.listen(port, () => {
  console.log(`Server is running on port: ${port}`);
});


// today

const express = require('express');
const cors = require('cors');
const ssh2 = require('ssh2');
const app = express();
const port = process.env.PORT || 443;

app.use(cors());
app.use(express.json());

// SSH Configuration
// const sshConfig = {
//   host: '172.16.90.3', // Replace with your server's IP or hostname
//   port: 22,
//   username: 'vasikaran', // Replace with your SSH username
//   password: 'Vasikaran@123' // Replace with your SSH password or use other authentication methods
// };

// Create a route to verify SSH credentials




// // SSH Configuration
const sshConfig = {
  host: '172.16.90.3', // Replace with your server's IP or hostname
  port: 22,
  // You can define default values for username and password here if needed
};

// Function to execute commands on the remote server
function executeCommand(conn, command) {
  return new Promise((resolve, reject) => {
    conn.exec(command, (err, stream) => {
      if (err) {
        reject(err);
      }
      let data = '';
      stream.on('data', (chunk) => {
        data += chunk;
      });
      stream.on('end', () => {
        resolve(data.trim());
      });
    });
  });
}

// Create a route to verify SSH credentials
app.post('/verify-ssh-credentials', async (req, res) => {
  const { username, password } = req.body;
  console.log('Received username:', username); // Add this line

  // Perform SSH credentials verification logic here
  const conn = new ssh2.Client();

  conn.on('ready', () => {
    res.json({ success: true });
    conn.end(); // Close the SSH connection
  });

  conn.on('error', () => {
    res.status(401).json({ success: false });
  });

  const config = {
    ...sshConfig, // Use the default configuration
    username: username,
    password: password,
  };

  conn.connect(config);
});


// Create a route to fetch usernames from the Linux server
app.get('/fetch-usernames', async (req, res) => {
  const conn = new ssh2.Client();
  
  conn.on('ready', async () => {
    try {
      const usernames = await executeCommand(conn, 'ls /pd/projects/data/sigmasense/sdc300/users');
      const usernamesArray = usernames.split('\n');
      res.json({ usernames: usernamesArray });
    } catch (err) {
      console.error('Error fetching usernames:', err);
      res.status(500).json({ error: 'Failed to fetch usernames' });
    } finally {
      conn.end();
    }
  });

  conn.on('error', (err) => {
    console.error('SSH connection error:', err);
    res.status(500).json({ error: 'SSH connection error' });
  });

  conn.connect(sshConfig);
});

// Create directory and run command route
app.post('/create-directory-and-run', async (req, res) => {
  const username = req.body.username;
  const runName = req.body.runName;
  const userDirectory = `/pd/projects/data/sigmasense/sdc300/users/${username}/${runName}`;

  const conn = new ssh2.Client();

  conn.on('ready', async () => {
    try {
      // Check if user directory exists
      const checkDirectoryExists = await executeCommand(conn, `ls ${userDirectory}`);
      
      if (checkDirectoryExists) {
        res.json({ message: 'User directory already exists' });
      } else {
        // Directory doesn't exist, create it
        await executeCommand(conn, `mkdir -p ${userDirectory}`);
        res.json({ message: 'User directory and run created successfully' });
      }
    } catch (err) {
      console.error('Error creating directories:', err);
      res.status(500).json({ error: 'Failed to create directories' });
    } finally {
      conn.end(); // Close the SSH connection
    }
  });

  conn.on('error', (err) => {
    console.error('SSH connection error:', err);
    res.status(500).json({ error: 'SSH connection error' });
  });

  conn.connect(sshConfig);
});


app.listen(port, () => {
  console.log(`Server is running on port: ${port}`);
});





// second sample

// SSH Configuration for fetchusers
const sshConfigg = {
  host: '172.16.90.3', // Replace with your server's IP or hostname
  port: 22,
  username: 'vasikaran', // Replace with your SSH username
  password: 'Vasikaran@123' // Replace with your SSH password or use other authentication methods
};

// // SSH Configuration
const sshConfig = {
  host: '172.16.90.3', // Replace with your server's IP or hostname
  port: 22,
  debug: console.log, // Add this line for debugging
  // You can define default values for username and password here if needed
};

// Function to execute commands on the remote server
function executeCommand(conn, command) {
  return new Promise((resolve, reject) => {
    conn.exec(command, (err, stream) => {
      if (err) {
        reject(err);
      }
      let data = '';
      stream.on('data', (chunk) => {
        data += chunk;
      });
      stream.on('end', () => {
        resolve(data.trim());
      });
    });
  });
}

// Create a route to verify SSH credentials
app.post('/verify-ssh-credentials', async (req, res) => {
  const { username, password } = req.body;
  console.log('Received username:', username); // Add this line

  // Perform SSH credentials verification logic here
  const conn = new ssh2.Client();

  conn.on('ready', () => {
    res.json({ success: true });
    conn.end(); // Close the SSH connection
  });

  conn.on('error', () => {
    res.status(401).json({ success: false });
  });
  console.log('Username before connecting:', username);
  const config = {
    ...sshConfig, // Use the default configuration
    username: username,
    password: password,
  };

  conn.connect(config);
});


// Create a route to fetch usernames from the Linux server
app.get('/fetch-usernames', async (req, res) => {
  const conn = new ssh2.Client();
  
  conn.on('ready', async () => {
    try {
      const usernames = await executeCommand(conn, 'ls /pd/projects/data/sigmasense/sdc300/users');
      const usernamesArray = usernames.split('\n');
      res.json({ usernames: usernamesArray });
    } catch (err) {
      console.error('Error fetching usernames:', err);
      res.status(500).json({ error: 'Failed to fetch usernames' });
    } finally {
      conn.end();
    }
  });

  conn.on('error', (err) => {
    console.error('SSH connection error:', err);
    res.status(500).json({ error: 'SSH connection error' });
  });

  conn.connect(sshConfigg);
});

// Create directory and run command route
app.post('/create-directory-and-run', async (req, res) => {
  const username = req.body.username;
  const runName = req.body.runName;
  const userDirectory = `/pd/projects/data/sigmasense/sdc300/users/${username}/${runName}`;

  const conn = new ssh2.Client();

  conn.on('ready', async () => {
    try {
      // Check if user directory exists
      const checkDirectoryExists = await executeCommand(conn, `ls ${userDirectory}`);
      
      if (checkDirectoryExists) {
        res.json({ message: 'User directory already exists' });
      } else {
        // Directory doesn't exist, create it
        await executeCommand(conn, `mkdir -p ${userDirectory}`);
        res.json({ message: 'User directory and run created successfully' });
      }
    } catch (err) {
      console.error('Error creating directories:', err);
      res.status(500).json({ error: 'Failed to create directories' });
    } finally {
      conn.end(); // Close the SSH connection
    }
  });

  conn.on('error', (err) => {
    console.error('SSH connection error:', err);
    res.status(500).json({ error: 'SSH connection error' });
  });

  conn.connect(sshConfigg);
});


app.listen(port, () => {
  console.log(`Server is running on port: ${port}`);
});