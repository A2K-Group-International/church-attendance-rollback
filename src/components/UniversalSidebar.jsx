import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Logout from "../authentication/Logout";
import { Sheet, SheetTrigger, SheetContent } from "../shadcn/sheet";
import { Button } from "../shadcn/button";
import NavigationItem from "./NavigationItem";
import FamilyIcon from "../assets/svg/family.svg";
import CalendarIcon from "../assets/svg/calendarIcon.svg";
import HamburgerIcon from "../assets/svg/hamburgerIcon.svg";
import RequestIcon from "../assets/svg/requestIcon.svg";
import DashboardIcon from "../assets/svg/dashboard.svg";
import CheckListIcon from "../assets/svg/checklist.svg";
import PersonIcon from "../assets/svg/person.svg";
import { useUser } from "../context/UserContext";

export default function UniversalSidebar({ children }) {
  const { userData, loggedIn } = useUser();
  const navigate = useNavigate();

  // State to display links based on user role (for testing)
  const [currentUserRole, setCurrentUserRole] = useState(
    userData?.user_role || "user",
  );
  const userName =
    `${userData?.user_name || ""} ${userData?.user_last_name || ""}`.trim();

  // If the user is not logged in, render the children without the sidebar
  if (!loggedIn) {
    return <>{children}</>;
  }

  // Define the links for different user roles
  const links = {
    admin: [
      { link: "/admin-dashboard", label: "Dashboard", icon: DashboardIcon },
      { link: "/attendance", label: "Attendance", icon: CheckListIcon },
      { link: "/groups", label: "Groups", icon: PersonIcon },
      { link: "/event", label: "Schedule", icon: CalendarIcon },
      { link: "/volunteers", label: "Request(s)", icon: RequestIcon },
    ],
    volunteer: [
      {
        link: "/volunteer-announcements",
        label: "Announcements",
        icon: CalendarIcon,
      },
      {
        link: "/volunteer-schedule",
        label: "Volunteer Events",
        icon: CalendarIcon,
      },
      {
        link: "/volunteer-duties",
        label: "Rota Management",
        icon: CalendarIcon,
      },
    ],
    user: [
      {
        link: "/user-announcements",
        label: "Announcements",
        icon: CalendarIcon,
      },
      { link: "/events-page", label: "Events", icon: CalendarIcon },
      { link: "/family", label: "Family", icon: FamilyIcon },
    ],
  };

  const currentLinks = links[currentUserRole] || [];

  return (
    <div className="flex h-screen w-full overflow-y-clip">
      {/* Large screens */}
      <div className="hidden lg:block lg:w-64 lg:shrink-0 lg:border-r lg:bg-gray-100 dark:lg:bg-gray-800">
        <div className="flex h-full flex-col justify-between px-4 py-6">
          <div className="space-y-4">
            <div className="text-lg font-semibold">{userName}</div>
            <div className="text-sm font-medium text-gray-600">
              {currentUserRole.charAt(0).toUpperCase() +
                currentUserRole.slice(1)}
            </div>
            <nav className="space-y-1">
              <ul>
                {currentLinks.map(({ link, label, icon }) => (
                  <NavigationItem key={link} link={link} icon={icon}>
                    {label}
                  </NavigationItem>
                ))}
              </ul>
            </nav>
          </div>

          {/* Placeholder buttons and Profile/Logout buttons */}
          <div className="mt-auto flex flex-col space-y-2">
            {/* Conditionally render buttons based on userData.user_role */}
            {userData.user_role === "admin" && (
              <>
                {/* Show return button to Admin only if not currently in Admin view */}
                {currentUserRole !== "admin" && (
                  <Button
                    variant="outline"
                    onClick={() => setCurrentUserRole("admin")}
                  >
                    Return to Admin
                  </Button>
                )}
                {/* Show switch buttons only if not currently in that role */}
                {currentUserRole !== "volunteer" && (
                  <Button
                    variant="outline"
                    onClick={() => setCurrentUserRole("volunteer")}
                  >
                    Switch to Volunteer
                  </Button>
                )}
                {currentUserRole !== "user" && (
                  <Button
                    variant="outline"
                    onClick={() => setCurrentUserRole("user")}
                  >
                    Switch to User
                  </Button>
                )}
              </>
            )}

            {userData.user_role === "volunteer" && (
              <>
                {/* Show return button to Volunteer only if not currently in Volunteer view */}
                {currentUserRole !== "volunteer" && (
                  <Button
                    variant="outline"
                    onClick={() => setCurrentUserRole("volunteer")}
                  >
                    Return to Volunteer
                  </Button>
                )}
                {/* Show switch button only if not currently in that role */}
                {currentUserRole !== "user" && (
                  <Button
                    variant="outline"
                    onClick={() => setCurrentUserRole("user")}
                  >
                    Switch to User
                  </Button>
                )}
              </>
            )}

            {userData.user_role === "user" && (
              <div>
                <p>You cannot switch to any other role.</p>
              </div>
            )}
          </div>

          <div className="mt-4 flex items-center justify-between">
            <Button onClick={() => navigate("/volunteer-profile")}>
              Profile
            </Button>
            <Logout />
          </div>
        </div>
      </div>

      {/* Small screens */}
      <div className="flex-1">
        <header className="sticky z-10 border-b bg-white p-0 px-4 py-3 dark:border-gray-800 dark:bg-gray-900 lg:hidden">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 font-bold">
              <span className="text-xl">Management Centre</span>
            </div>
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon">
                  <img
                    src={HamburgerIcon}
                    alt="Toggle Sidebar"
                    className="h-6 w-6"
                  />
                  <span className="sr-only">Toggle Navigation</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-64">
                <div className="flex h-full flex-col justify-between px-4 py-6">
                  <div className="space-y-4">
                    <div className="text-lg font-semibold">{userName}</div>
                    <div className="text-sm font-medium text-gray-600">
                      {currentUserRole.charAt(0).toUpperCase() +
                        currentUserRole.slice(1)}
                    </div>
                    <nav className="space-y-1">
                      <ul>
                        {currentLinks.map(({ link, label, icon }) => (
                          <NavigationItem key={link} link={link} icon={icon}>
                            {label}
                          </NavigationItem>
                        ))}
                      </ul>
                    </nav>
                  </div>
                  <div className="flex items-center justify-between">
                    <Button onClick={() => navigate("/volunteer-profile")}>
                      Profile
                    </Button>
                    <Logout />
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </header>
        {children}
      </div>
    </div>
  );
}
