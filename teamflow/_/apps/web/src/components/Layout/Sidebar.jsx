import {
  LayoutGrid,
  Puzzle,
  Mail,
  MessageSquare,
  Calendar,
  LineChart,
  Menu,
} from "lucide-react";

export function Sidebar({ currentView, setCurrentView, activitiesCount }) {
  const handleNavigation = (view) => {
    setCurrentView(view);
  };

  const handleMenuClick = () => {
    alert("Settings and more options coming soon!");
  };

  const handleTeamsClick = () => {
    alert("Team management features coming soon!");
  };

  const handleMessagesClick = () => {
    alert("Team chat and messaging coming soon!");
  };

  const handleCalendarClick = () => {
    alert("Sprint calendar and scheduling coming soon!");
  };

  const handleActivitiesClick = () => {
    setCurrentView("activities");
  };

  return (
    <aside className="hidden md:flex flex-col items-center gap-10 py-8 w-16 border-r border-gray-200 fixed left-0 top-0 h-full z-20">
      <div className="relative">
        <LayoutGrid
          className={`h-5 w-5 cursor-pointer transition-colors ${
            currentView === "dashboard"
              ? "text-blue-600"
              : "text-gray-400 hover:text-gray-600"
          }`}
          onClick={() => handleNavigation("dashboard")}
          title="Dashboard"
        />
        {currentView === "dashboard" && (
          <div className="absolute -left-2 top-0 bg-blue-600 h-6 w-1 rounded-r"></div>
        )}
      </div>

      <div className="relative">
        <Puzzle
          className="h-5 w-5 text-blue-600 cursor-pointer"
          onClick={handleTeamsClick}
          title="Project Management"
        />
        <div className="absolute -left-2 top-0 bg-blue-600 h-6 w-1 rounded-r"></div>
      </div>

      <div className="relative">
        <Mail
          className={`h-5 w-5 cursor-pointer transition-colors ${
            currentView === "activities"
              ? "text-blue-600"
              : "text-gray-400 hover:text-gray-600"
          }`}
          onClick={handleActivitiesClick}
          title="Activity Feed"
        />
        <span className="absolute -top-1 -right-1 bg-blue-600 text-[10px] text-white rounded-full px-[5px] min-w-[16px] text-center">
          {activitiesCount}
        </span>
        {currentView === "activities" && (
          <div className="absolute -left-2 top-0 bg-blue-600 h-6 w-1 rounded-r"></div>
        )}
      </div>

      <div className="relative">
        <MessageSquare
          className="h-5 w-5 text-gray-400 hover:text-gray-600 cursor-pointer transition-colors"
          onClick={handleMessagesClick}
          title="Team Chat"
        />
      </div>

      <div className="relative">
        <Calendar
          className="h-5 w-5 text-gray-400 hover:text-gray-600 cursor-pointer transition-colors"
          onClick={handleCalendarClick}
          title="Sprint Calendar"
        />
      </div>

      <div className="relative">
        <LineChart
          className={`h-5 w-5 cursor-pointer transition-colors ${
            currentView === "analytics"
              ? "text-blue-600"
              : "text-gray-400 hover:text-gray-600"
          }`}
          onClick={() => handleNavigation("analytics")}
          title="Analytics"
        />
        {currentView === "analytics" && (
          <div className="absolute -left-2 top-0 bg-blue-600 h-6 w-1 rounded-r"></div>
        )}
      </div>

      <div className="relative mt-auto">
        <Menu
          className="h-5 w-5 text-gray-400 hover:text-gray-600 cursor-pointer transition-colors"
          onClick={handleMenuClick}
          title="More Options"
        />
      </div>
    </aside>
  );
}
