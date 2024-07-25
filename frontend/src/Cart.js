import React from 'react';
import axios from 'axios';

const Cart = ({ cartItems, setCartItems }) => {
    const handleVolumeChange = async (index, volume) => {
        const updatedCart = [...cartItems];
        updatedCart[index].volume = volume;
        updatedCart[index].totalPrice = (updatedCart[index].unitPrice * volume).toFixed(4);
        setCartItems(updatedCart);

        await axios.put('http://localhost:5000/api/cart', {
            partNumber: updatedCart[index].partNumber,
            provider: updatedCart[index].provider,
            volume
        });
    };

    return (
        <div className="cart-sidebar">
            <h2>My Cart</h2>
            <table>
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
                    {cartItems.map((item, index) => (
                        <tr key={index}>
                            <td>{item.partNumber}</td>
                            <td>{item.manufacturer}</td>
                            <td>{item.provider}</td>
                            <td>
                                <input
                                    type="number"
                                    value={item.volume}
                                    onChange={(e) => handleVolumeChange(index, e.target.value)}
                                />
                            </td>
                            <td>{item.unitPrice}</td>
                            <td>{item.totalPrice}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default Cart;
