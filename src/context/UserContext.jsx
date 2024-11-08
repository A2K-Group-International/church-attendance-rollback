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
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession();

        if (sessionError || !session) {
          setLoading(false);
          setError(null);
          return;
        }

        const { user } = session;
        const { data: userDetails, error: userError } = await supabase
          .from("user_list")
          .select("*")
          .eq("user_uuid", user.id)
          .single();

        if (userError) throw new Error(userError.message);

        setUserData(userDetails);
        setLoggedIn(true);
      } catch (err) {
        setError(err.message);
        console.error("Error fetching user data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []); // Empty dependency array means this runs once on mount

  // Effect to fetch user groups based on user role whenever userData is set
  useEffect(() => {
    const fetchUserGroups = async () => {
      if (userData) {
        let groupsData = [];
        try {
          if (userData.user_role === "admin") {
            const { data: allGroupsData, error: allGroupsError } =
              await supabase.from("group_list").select("*");
            if (allGroupsError) throw new Error(allGroupsError.message);
            groupsData = allGroupsData;
          } else {
            const { data: userGroupsData, error: userGroupsError } =
              await supabase
                .from("group_user_assignments")
                .select("group_id, group_list(*)")
                .eq("user_id", userData.user_id);
            if (userGroupsError) throw new Error(userGroupsError.message);
            groupsData = userGroupsData.map((item) => item.group_list);
          }
          setUserGroups(groupsData);
        } catch (error) {
          console.error("Error fetching user groups:", error.message);
          setError(error.message);
        }
      }
    };

    fetchUserGroups();
  }, [userData]); // Fetch user groups whenever userData is updated

  return (
    <UserContext.Provider
      value={{
        userData,
        userGroups,
        setUserData,
        setUserGroups,
        loading,
        loggedIn,
        setLoggedIn,
        error,
      }}
    >
      {loading ? <Spinner /> : children}
    </UserContext.Provider>
  );
};

// Custom hook to use the UserContext
export const useUser = () => {
  return useContext(UserContext);
};
