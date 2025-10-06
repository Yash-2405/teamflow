import { ChevronRight, User } from "lucide-react";
import { formatDate } from "@/utils/helpers";

export function AnalyticsView({ tasks, activities, getTasksByStatus }) {
  return (
    <>
      <nav className="px-6 md:pl-24 pt-6 text-xs text-gray-400 space-x-2">
        <span>Dashboard</span>
        <ChevronRight className="inline h-3 w-3" />
        <span className="text-gray-500">Analytics</span>
      </nav>

      <h1 className="px-6 md:pl-24 pt-2 text-3xl font-semibold text-gray-700">
        Sprint Analytics
      </h1>

      <section className="px-6 md:pl-24 pt-8 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-sm font-medium text-gray-500 mb-2">
              Total Tasks
            </h3>
            <p className="text-2xl font-bold text-gray-900">
              {tasks.length}
            </p>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-sm font-medium text-gray-500 mb-2">
              To Do
            </h3>
            <p className="text-2xl font-bold text-blue-600">
              {getTasksByStatus("todo").length}
            </p>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-sm font-medium text-gray-500 mb-2">
              In Progress
            </h3>
            <p className="text-2xl font-bold text-yellow-600">
              {getTasksByStatus("in_progress").length}
            </p>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-sm font-medium text-gray-500 mb-2">
              Completed
            </h3>
            <p className="text-2xl font-bold text-green-600">
              {getTasksByStatus("done").length}
            </p>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Recent Activity
          </h3>
          <div className="space-y-4">
            {activities.slice(0, 10).map((activity) => (
              <div
                key={activity.id}
                className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg"
              >
                <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                  <User className="h-4 w-4 text-blue-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-900">
                    <span className="font-medium">
                      {activity.user?.username}
                    </span>{" "}
                    {activity.action} a {activity.entity_type}
                  </p>
                  <p className="text-xs text-gray-500">
                    {formatDate(activity.created_at)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
