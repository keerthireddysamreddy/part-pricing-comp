import React, { useState } from 'react';
import axios from 'axios';
import './App.css'; 

const App = () => {
  const [partNumber, setPartNumber] = useState('');
  const [volume, setVolume] = useState('');
  const [results, setResults] = useState([]);

  const handleSubmit = async () => {
    try {
      const response = await axios.post('http://localhost:5000/api/search', { partNumber, volume });
      setResults(response.data);
    } catch (error) {
      console.error('Error fetching data', error);
    }
  };

  return (
    <div className="app-container">
      <h1>Search for Parts</h1>
      <div className="input-container">
        <input
          type="text"
          placeholder="Part Number"
          value={partNumber}
          onChange={(e) => setPartNumber(e.target.value)}
          className="input-box"
        />
        <input
          type="number"
          placeholder="Volume"
          value={volume}
          onChange={(e) => setVolume(e.target.value)}
          className="input-box"
        />
        <button onClick={handleSubmit} className="submit-button">
          Enter
        </button>
      </div>
      <table className="results-table">
        <thead>
          <tr>
            <th>Part Number</th>
            <th>Manufacturer</th>
            <th>Provider</th>
            <th>Volume</th>
            <th>Unit Price</th>
            <th>Total Price</th>
          </tr>
        </thead>
        <tbody>
          {results.map((result, index) => (
            <tr key={index}>
              <td>{result.partNumber}</td>
              <td>{result.manufacturer}</td>
              <td>{result.provider}</td>
              <td>{result.volume}</td>
              <td>{result.unitPrice}</td>
              <td>{result.totalPrice}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default App;
