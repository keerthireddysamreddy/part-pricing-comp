import React from 'react';

const NavBar = ({ onCartToggle }) => {
    return (
        <nav>
            <button onClick={onCartToggle}>Toggle Cart</button>
        </nav>
    );
};

export default NavBar;
