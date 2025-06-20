import React, { createContext, useState, useEffect } from 'react';
import { fetchCurrentUser, refreshAccessToken } from '../utils/api';

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [isLogedin, setisLogedin] = useState(false);
  const [userDetail, setuserDetail] = useState(null);
  const [loading, setLoading] = useState(true); 

  const checkLogin = async () => {
    try {
      const user = await fetchCurrentUser();
      setuserDetail(user.data);
      setisLogedin(true);
    } catch {
      try {
        const { accessToken } = await refreshAccessToken();
        localStorage.setItem('token', accessToken);
        const user = await fetchCurrentUser(); 
        setuserDetail(user.data);
        setisLogedin(true);
      } catch {
        setisLogedin(false);
        setuserDetail(null);
      }
    } finally {
      setLoading(false); 
    }
  };

  useEffect(() => {
    checkLogin();
  }, []);

  return (
    <UserContext.Provider
      value={{ isLogedin, setisLogedin, userDetail, setuserDetail, loading }}
    >
      {children}
    </UserContext.Provider>
  );
};
