import React, { createContext, useState } from 'react';

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
    const [fullName, setFullName] = useState(localStorage.getItem('fullName') || '');
    const [wallet, setWallet] = useState(() => {
        const raw = localStorage.getItem('wallet');
        const value = Number(raw);
        return isNaN(value) ? 0 : value;
    });

    const updateFullName = (name) => {
        localStorage.setItem('fullName', name);
        setFullName(name);
    };

    const updateWallet = (amount) => {
        localStorage.setItem('wallet', amount);
        setWallet(amount);
    };

    return (
        <UserContext.Provider value={{ fullName, updateFullName, wallet, updateWallet }}>
            {children}
        </UserContext.Provider>
    );
};
