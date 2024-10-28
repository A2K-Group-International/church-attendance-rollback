import React, { createContext, useState, useContext, useEffect } from "react";
import supabase from "../api/supabase"; // Adjust the import as needed

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [userData, setUserData] = useState(null); // State to store user data
  const [userGroups, setUserGroups] = useState([]); // State to store user groups
  const [loading, setLoading] = useState(true); // State to track loading
  const [loggedIn, setLoggedIn] = useState(false); // State to track logged-in status
  const [error, setError] = useState(null); // State to track errors

  // Effect to fetch user data only once after login
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const {
          data: { user },
          error,
        } = await supabase.auth.getUser(); // Get current user from Supabase

        if (user) {
          const { data: userDetails, error: userError } = await supabase
            .from("user_list")
            .select("*")
            .eq("user_uuid", user.id)
            .single();

          if (userError) {
            throw new Error(userError.message);
          }

          setUserData(userDetails); // Save user data in context
          setLoggedIn(true); // Set logged-in state to true
          console.log("User Data:", userDetails); // Log user data

          // Fetch groups based on user role
          if (userDetails.user_role === "admin") {
            // If the user is an admin, fetch all groups
            const { data: allGroupsData, error: allGroupsError } =
              await supabase.from("group_list").select("*"); // Adjust fields as necessary

            if (allGroupsError) {
              throw new Error(allGroupsError.message);
            }

            // Log the fetched group data
            console.log("Fetched All Groups Data:", allGroupsData);

            // Save the group details
            setUserGroups(allGroupsData); // Admin gets all groups
          } else {
            // Fetch groups associated with the user
            const { data: groupsData, error: groupsError } = await supabase
              .from("group_user_assignments")
              .select("group_id, group_list(*)") // Assuming group_list has the group details
              .eq("user_id", userDetails.user_id); // Replace user_id with the correct field from userDetails

            if (groupsError) {
              throw new Error(groupsError.message);
            }

            // Log the fetched group data
            console.log("Fetched Groups Data:", groupsData);

            // Save the group details
            setUserGroups(groupsData.map((item) => item.group_list)); // Assuming group_list contains the necessary details
            console.log(
              "User Groups:",
              groupsData.map((item) => item.group_list),
            ); // Log the processed user groups
          }
        }
      } catch (err) {
        setError(err.message); // Set error message
        console.error("Error fetching user data or groups:", err);
      } finally {
        setLoading(false); // Stop loading
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
        loading,
        loggedIn,
        setLoggedIn,
        error, // Provide error state
      }}
    >
      {loading ? (
        <p>Loading user data...</p>
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : (
        children
      )}
      {/* Show loading state or error */}
    </UserContext.Provider>
  );
};

// Custom hook to use the UserContext
export const useUser = () => {
  return useContext(UserContext);
};
