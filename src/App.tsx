import React from 'react';
import './App.css';
import FileUpload from './components/fileUpload/fileUpload';
import Navbar from './components/navbar/navbar';

function App() {
  return (
    <div className=''>
      <Navbar />
      <FileUpload />
    </div>
  );
}

export default App;
