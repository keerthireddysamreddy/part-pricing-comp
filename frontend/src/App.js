import React, { useState } from 'react';
import axios from 'axios';
import './App.css';

const App = () => {
  const [partNumber, setPartNumber] = useState('');
  const [volume, setVolume] = useState('');
  const [results, setResults] = useState([]);
  const [cart, setCart] = useState(null); // Store the cart item
  const [isCartOpen, setIsCartOpen] = useState(false); // Track cart visibility

  const handleSubmit = async () => {
    try {
      const response = await axios.post('http://localhost:5000/api/search', { partNumber, volume });
      setResults(response.data);
    } catch (error) {
      console.error('Error fetching data', error);
    }
  };

  const addToCart = (item) => {
    setCart(item);
    setIsCartOpen(true);
  };

  const handleCartVolumeChange = (newVolume) => {
    if (cart) {
      const updatedCart = { ...cart, volume: newVolume };
      setCart(updatedCart);
    }
  };

  const getLowestPriceProvider = () => {
    if (results.length === 0) return null;
    return results[0];
  };

  const lowestPriceProvider = getLowestPriceProvider();

  return (
    <div className="app-container">
      <div className="navbar">
        <button onClick={() => setIsCartOpen(!isCartOpen)}>
          {isCartOpen ? 'Close Cart' : 'Open Cart'}
        </button>
      </div>
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
            <th>Action</th>
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
              {result.totalPrice === lowestPriceProvider.totalPrice && (
                <td>
                  <button onClick={() => addToCart(result)}>Add to Cart</button>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
      {isCartOpen && cart && (
        <div className="cart-sidebar">
          <h2>My Cart</h2>
          <div className="cart-item">
            <p>Part Number: {cart.partNumber}</p>
            <p>Manufacturer: {cart.manufacturer}</p>
            <p>Provider: {cart.provider}</p>
            <div className="cart-volume">
              <p>Volume: </p>
              <input
                type="number"
                value={cart.volume}
                onChange={(e) => handleCartVolumeChange(Number(e.target.value))}
                className="input-box"
              />
            </div>
            <p>Unit Price: {cart.unitPrice}</p>
            <p>Total Price: {cart.totalPrice ? (cart.volume * cart.unitPrice).toFixed(4) : 0}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
