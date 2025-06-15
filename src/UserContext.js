import React, { createContext, useState } from 'react';

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
    const [fullName, setFullName] = useState(localStorage.getItem('fullName') || '');

    const updateFullName = (name) => {
        localStorage.setItem('fullName', name);
        setFullName(name);
    };

    return (
        <UserContext.Provider value={{ fullName, updateFullName }}>
            {children}
        </UserContext.Provider>
    );
};
