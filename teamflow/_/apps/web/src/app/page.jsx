"use client";

import React, { useState } from "react";
import { useTeamFlowDashboard } from "@/hooks/useTeamFlowDashboard";
import { Sidebar } from "@/components/Layout/Sidebar";
import { Header } from "@/components/Layout/Header";
import { DashboardView } from "@/components/Dashboard/DashboardView";
import { AnalyticsView } from "@/components/Analytics/AnalyticsView";
import { TaskDetailModal } from "@/components/Task/TaskDetailModal";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { ChevronRight, User } from "lucide-react";
import { formatDate } from "@/utils/helpers";

export default function TeamFlowDashboard() {
  const {
    tasks,
    loading,
    user,
    currentView,
    activities,
    error,
    setCurrentView,
    getTasksByStatus,
    addTask,
    moveTask,
    updateTask,
    deleteTask,
    summarizeTask,
  } = useTeamFlowDashboard();

  const [selectedTask, setSelectedTask] = useState(null);

  const openTaskModal = (task) => {
    setSelectedTask(task);
  };

  const closeTaskModal = () => {
    setSelectedTask(null);
  };

  const handleUpdateTask = async (taskId, updates) => {
    const updated = await updateTask(taskId, updates);
    if (updated) {
      setSelectedTask(updated);
    }
    return updated;
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-white font-inter">
      <Sidebar
        currentView={currentView}
        setCurrentView={setCurrentView}
        activitiesCount={activities.length}
      />

      <Header
        user={user}
        currentView={currentView}
        setCurrentView={setCurrentView}
      />

      <main className="md:ml-16">
        {currentView === "dashboard" && (
          <DashboardView
            tasks={tasks}
            getTasksByStatus={getTasksByStatus}
            moveTask={moveTask}
            openTaskModal={openTaskModal}
            addTask={addTask}
            error={error}
          />
        )}

        {currentView === "analytics" && (
          <AnalyticsView
            tasks={tasks}
            activities={activities}
            getTasksByStatus={getTasksByStatus}
          />
        )}

        {currentView === "activities" && (
          <>
            <nav className="px-6 md:pl-24 pt-6 text-xs text-gray-400 space-x-2">
              <span>Dashboard</span>
              <ChevronRight className="inline h-3 w-3" />
              <span className="text-gray-500">Activity Feed</span>
            </nav>

            <h1 className="px-6 md:pl-24 pt-2 text-3xl font-semibold text-gray-700">
              Activity Feed
            </h1>

            <section className="px-6 md:pl-24 pt-8 pb-8">
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Recent Team Activity
                  </h3>
                  <span className="text-sm text-gray-500">
                    {activities.length} activities
                  </span>
                </div>

                <div className="space-y-4">
                  {activities.length > 0 ? (
                    activities.map((activity) => (
                      <div
                        key={activity.id}
                        className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                      >
                        <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                          <User className="h-5 w-5 text-blue-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-gray-900">
                            <span className="font-medium">
                              {activity.user?.username || "Unknown user"}
                            </span>{" "}
                            <span className="text-blue-600 font-medium">
                              {activity.action}
                            </span>{" "}
                            a {activity.entity_type}
                            {activity.details?.title && (
                              <span className="text-gray-600">
                                : "{activity.details.title}"
                              </span>
                            )}
                          </p>
                          <div className="flex items-center gap-4 mt-1">
                            <p className="text-xs text-gray-500">
                              {formatDate(activity.created_at)}
                            </p>
                            {activity.details?.from_status &&
                              activity.details?.to_status && (
                                <span className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded">
                                  {activity.details.from_status} →{" "}
                                  {activity.details.to_status}
                                </span>
                              )}
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-12">
                      <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        No activity yet
                      </h3>
                      <p className="text-gray-500">
                        Team activities will appear here as tasks are created
                        and updated.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </section>
          </>
        )}
      </main>

      {selectedTask && (
        <TaskDetailModal
          task={selectedTask}
          onClose={closeTaskModal}
          onUpdateTask={handleUpdateTask}
          onDeleteTask={deleteTask}
          onSummarizeTask={summarizeTask}
        />
      )}
    </div>
  );
}
