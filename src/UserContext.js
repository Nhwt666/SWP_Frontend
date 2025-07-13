// Global User Context Provider
import React, { createContext, useState } from 'react';

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
    // User's full name - initialized from localStorage
    const [fullName, setFullName] = useState(localStorage.getItem('fullName') || '');
    
    // User's wallet balance - initialized from localStorage with validation
    const [wallet, setWallet] = useState(() => {
        const raw = localStorage.getItem('wallet');
        const value = Number(raw);
        return isNaN(value) ? 0 : value;
    });

    // Update user's full name and persist to localStorage
    const updateFullName = (name) => {
        localStorage.setItem('fullName', name);
        setFullName(name);
    };

    // Update wallet balance and persist to localStorage
    const updateWallet = (amount) => {
        localStorage.setItem('wallet', amount);
        setWallet(amount);
    };

    return (
        <UserContext.Provider value={{ 
            fullName, 
            updateFullName, 
            wallet, 
            updateWallet 
        }}>
            {children}
        </UserContext.Provider>
    );
};
