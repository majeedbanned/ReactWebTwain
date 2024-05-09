import React, { Component } from 'react';
import { useLocation } from 'react-router-dom';
import logo from './logo.svg';
import DWTLogo from './icon-dwt.svg';
import DynamsoftLogo from './logo-dynamsoft-white-159X39.svg';
import './App.css';
import DWT from './DynamsoftSDK';

// Create a functional component to use hooks
function App() {
  const location = useLocation();
  
  // Helper function to parse query strings
  const parseQuery = (query) => {
    return new URLSearchParams(query);
  }

  // Get the 'page' query parameter
  const page = parseQuery(location.search).get('page');

  console.log('>>>>>>>>',page)

  return (
    <div className="App">
      <header className="App-header">
        <a href="https://www.dynamsoft.com/Products/WebTWAIN_Overview.aspx" target="_blank" rel="noopener noreferrer" >
          <img src={DWTLogo} className="dwt-logo" alt="Dynamic Web TWAIN Logo" />
        </a>
        <div style={{ width: "10px" }}></div>
        <a href="https://reactjs.org/" target="_blank" rel="noopener noreferrer" >
          <img src={logo} className="App-logo" alt="logo" />
        </a>
        <div style={{ width: "770px" }}></div>
        <a href="https://www.dynamsoft.com" target="_blank" rel="noopener noreferrer" >
          <img src={DynamsoftLogo} className="ds-logo" alt="Dynamsoft Logo" />
        </a>
      </header>
      <br />
      <DWT
        features={[
          "scan",
          "camera",
          "load",
          "save",
          "upload",
          "barcode",
          "uploader"
        ]}
        page={page} // Passing 'page' as a prop
      />
    </div>
  );
}

export default App;
