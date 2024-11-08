import React, { createContext, useState, useContext, useEffect } from "react";
import supabase from "../api/supabase";
import Spinner from "../components/Spinner";

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [userData, setUserData] = useState(null); // State to store user data
  const [userGroups, setUserGroups] = useState([]); // State to store user groups
  const [loading, setLoading] = useState(true); // State to track loading
  const [loggedIn, setLoggedIn] = useState(false); // State to track logged-in status
  const [error, setError] = useState(null); // State to track errors

  // Effect to fetch user data on initial mount if a user is already logged in
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const {
          data: { user },
          error,
        } = await supabase.auth.getUser();

        if (error) throw new Error(error.message);

        if (user) {
          const { data: userDetails, error: userError } = await supabase
            .from("user_list")
            .select("*")
            .eq("user_uuid", user.id)
            .single();

          if (userError) throw new Error(userError.message);

          setUserData(userDetails);
          setLoggedIn(true);
        }
      } catch (err) {
        setError(err.message);
        console.error("Error fetching user data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []); // Empty dependency array means this runs once on mount

  return (
    <UserContext.Provider
      value={{
        userData,
        userGroups,
        setUserData,
        setUserGroups, // Make setUserGroups available in context
        loading,
        loggedIn,
        setLoggedIn,
        error,
      }}
    >
      {loading ? (
        <Spinner />
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : (
        children
      )}
    </UserContext.Provider>
  );
};

// Custom hook to use the UserContext
export const useUser = () => {
  return useContext(UserContext);
};
