import { useNavigate } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import supabase from "../api/supabase";
import { login as loginApi } from "../api/authService";
import { useUser } from "@/context/UserContext";

export function useLogin() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { setUserData, setUserGroups, setLoggedIn } = useUser(); // Access setUserGroups

  const {
    mutateAsync: login,
    isLoading,
    isError,
  } = useMutation({
    mutationFn: async ({ email, password }) => {
      const { user } = await loginApi({ email, password });
      return user;
    },
    onSuccess: async (user) => {
      queryClient.setQueriesData([user], user);
      setUserData(null); // Clear any previous user data on new login

      // Fetch user details
      const { data: userData, error } = await supabase
        .from("user_list")
        .select("*")
        .eq("user_uuid", user.id)
        .single();

      if (error || !userData) {
        console.error(error?.message || "Could not fetch user data");
        return;
      }

      if (!userData.is_confirmed) {
        console.error(
          "Account not yet approved. Please contact admin for approval.",
        );
        return alert(
          "Account not yet approved. Please contact admin for approval.",
        );
      }

      setUserData(userData);
      setLoggedIn(true);

      // Fetch user groups based on role
      let groupsData = [];
      if (userData.user_role === "admin") {
        const { data: allGroupsData, error: allGroupsError } = await supabase
          .from("group_list")
          .select("*");

        if (allGroupsError) {
          console.error(allGroupsError.message);
          return;
        }
        groupsData = allGroupsData;
      } else {
        const { data: userGroupsData, error: userGroupsError } = await supabase
          .from("group_user_assignments")
          .select("group_id, group_list(*)")
          .eq("user_id", userData.user_id);

        if (userGroupsError) {
          console.error(userGroupsError.message);
          return;
        }
        groupsData = userGroupsData.map((item) => item.group_list);
      }

      setUserGroups(groupsData); // Set groups in context

      // Navigate based on role
      if (userData.user_role === "admin") {
        navigate("/volunteer-announcements", { replace: true });
      } else if (userData.user_role === "user") {
        navigate("/user-announcements", { replace: true });
      } else if (userData.user_role === "volunteer") {
        navigate("/volunteer-announcements", { replace: true });
      }
    },
    onError: (err) => {
      console.log("Login error", err.message);
    },
  });

  return { login, isLoading, isError };
}
