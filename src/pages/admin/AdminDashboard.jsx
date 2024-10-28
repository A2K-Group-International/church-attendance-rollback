import AdminChart from "../../components/admin/AdminChart";
import AdminSidebar from "../../components/admin/AdminSidebar";
import { useUser } from "@/context/UserContext"; // Import the custom hook to access UserContext
import AdminCalendar from "./AdminCalendar";

export default function AdminDashboard() {
  const { userData } = useUser(); // Access userData from context

  if (!userData) {
    return <p>Loading user data...</p>; // Optionally handle loading state
  }

  return (
    // <AdminSidebar>
    <div>
      {/* <div className="p-4">
        <h1>Welcome, {userData.user_name}</h1>
        <p>Role: {userData.user_role}</p>
        <p>Email: {userData.email}</p>
      </div> */}
      <AdminCalendar />
    </div>
    // </AdminSidebar>
  );
}
