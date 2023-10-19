import './App.css';
import { BrowserRouter as Router, Routes, Route, Link, BrowserRouter } from 'react-router-dom';
import VncUserLogin from './vncUserLogin';
import Welcome from './Welcome';
import CreateRun from './CretaeRun';
import SshCredentials from './SshCredentials';
import DirectoryExplorer from './DirectoryExplorer';
import FileEditor from './FileEditor';
import FileViewer from './FileViewer';



function App() {
  return (
   <BrowserRouter>
   <Routes>
    <Route path='/vnc' element={<VncUserLogin />} />
    <Route path='welcome' element={<Welcome />} />
    <Route path='createrun' element={<CreateRun />} />
    <Route path='/' element={<SshCredentials />} />
    <Route path='DirectoryExplorer' element={<DirectoryExplorer />} />
    <Route path='/fileeditor' element={<FileEditor />} />
    <Route path='/fileViewer' element={<FileViewer />} />
   </Routes>
   </BrowserRouter>
  );
}

export default App;
