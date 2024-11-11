import { useNavigate } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import supabase from "../api/supabase";
import { login as loginApi } from "../api/authService";
import { useUser } from "@/context/UserContext";

export function useLogin() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { setUserData, setLoggedIn } = useUser(); // Remove setUserGroups

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

      // Re-fetch session after login to ensure it’s up to date
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();
      if (sessionError || !session) {
        console.error("Session error after login");
        return;
      }

      // Fetch user details after login
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

      setUserData(userData); // Set user data in context
      setLoggedIn(true);

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
