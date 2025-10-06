import { useState, useEffect, useCallback } from "react";

export function useTeamFlowDashboard() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [currentView, setCurrentView] = useState("dashboard");
  const [activities, setActivities] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [error, setError] = useState(null);

  const getTasksByStatus = useCallback(
    (status) => {
      return tasks.filter((task) => task.status === status);
    },
    [tasks],
  );

  const loadUser = async () => {
    try {
      setUser({
        id: 1,
        username: "admin",
        email: "admin@teamflow.com",
        role: "admin",
      });
    } catch (error) {
      console.error("Failed to load user:", error);
    }
  };

  const loadTasks = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/tasks");
      if (!response.ok) {
        throw new Error(`Failed to fetch tasks: ${response.status}`);
      }
      const data = await response.json();
      setTasks(data);
      setError(null);
    } catch (error) {
      console.error("Failed to load tasks:", error);
      setError("Failed to load tasks");
      setTasks([
        {
          id: 1,
          title: "Enhance your brand potential with giant advertising blimps",
          description:
            "Research and develop new advertising strategies using innovative blimp technology. This involves market analysis, cost estimation, and feasibility studies.",
          status: "todo",
          priority: "high",
          story_points: 5,
          assignee: {
            username: "Michael Russell",
            avatar:
              "https://images.pexels.com/photos/9589502/pexels-photo-9589502.jpeg?auto=compress&cs=tinysrgb&w=24&h=24&dpr=1",
          },
          created_at: "2024-11-30",
        },
        {
          id: 2,
          title: "Global travel and vacations luxury travel on a tight budget",
          description:
            "Create a comprehensive guide for budget-friendly luxury travel experiences worldwide.",
          status: "todo",
          priority: "medium",
          story_points: 3,
          assignee: {
            username: "Hilda Carter",
            avatar:
              "https://images.pexels.com/photos/6874467/pexels-photo-6874467.jpeg?auto=compress&cs=tinysrgb&w=24&h=24&dpr=1",
          },
          created_at: "2024-11-30",
        },
        {
          id: 3,
          title: "The basics of buying a telescope",
          description:
            "Write an educational article about telescope purchasing considerations for amateur astronomers.",
          status: "in_progress",
          priority: "low",
          story_points: 2,
          assignee: {
            username: "Duane Little",
            avatar:
              "https://images.pexels.com/photos/5264743/pexels-photo-5264743.jpeg?auto=compress&cs=tinysrgb&w=24&h=24&dpr=1",
          },
          created_at: "2024-03-08",
        },
        {
          id: 4,
          title:
            "Hollywood hairstyles do not require a trip to a high priced salon",
          description:
            "Develop DIY hairstyling tutorials for achieving celebrity looks at home.",
          status: "done",
          priority: "medium",
          story_points: 3,
          assignee: {
            username: "Lillie Dennis",
            avatar:
              "https://images.pexels.com/photos/5473385/pexels-photo-5473385.jpeg?auto=compress&cs=tinysrgb&w=24&h=24&dpr=1",
          },
          created_at: "2024-05-03",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const loadActivities = async () => {
    try {
      const response = await fetch("/api/activities");
      if (!response.ok) {
        throw new Error(`Failed to fetch activities: ${response.status}`);
      }
      const data = await response.json();
      setActivities(data);
    } catch (error) {
      console.error("Failed to load activities:", error);
      setActivities([
        {
          id: 1,
          action: "created",
          entity_type: "task",
          user: { username: "admin" },
          created_at: "2024-11-30T10:00:00Z",
          details: { title: "New task created" },
        },
        {
          id: 2,
          action: "updated",
          entity_type: "task",
          user: { username: "admin" },
          created_at: "2024-11-30T09:30:00Z",
          details: { title: "Task moved to In Progress" },
        },
      ]);
    }
  };

  const loadAnalytics = useCallback(async () => {
    try {
      const response = await fetch("/api/analytics");
      if (!response.ok) {
        throw new Error(`Failed to fetch analytics: ${response.status}`);
      }
      const data = await response.json();
      setAnalytics(data);
    } catch (error) {
      console.error("Failed to load analytics:", error);
      setAnalytics({
        overview: {
          total_tasks: tasks.length,
          todo_tasks: getTasksByStatus("todo").length,
          in_progress_tasks: getTasksByStatus("in_progress").length,
          completed_tasks: getTasksByStatus("done").length,
          completion_rate:
            tasks.length > 0
              ? Math.round(
                  (getTasksByStatus("done").length / tasks.length) * 100,
                )
              : 0,
        },
        recent_activities: activities.slice(0, 10),
      });
    }
  }, [tasks, activities, getTasksByStatus]);

  useEffect(() => {
    loadTasks();
    loadUser();
    loadActivities();
  }, []);

  useEffect(() => {
    if (currentView === "analytics") {
      loadAnalytics();
    }
  }, [currentView, loadAnalytics]);

  const addTask = async (title, status) => {
    if (!title.trim()) return;

    try {
      const response = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title,
          status: status,
          board_id: 1,
          created_by: user?.id,
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to create task: ${response.status}`);
      }

      const newTask = await response.json();
      setTasks((prev) => [...prev, newTask]);
      loadActivities();
    } catch (error) {
      console.error("Failed to add task:", error);
      setError("Failed to add task");
      const mockTask = {
        id: Date.now(),
        title: title,
        status: status,
        priority: "medium",
        story_points: 1,
        assignee: { username: user?.username || "Unknown", avatar: null },
        created_at: new Date().toISOString().split("T")[0],
      };
      setTasks((prev) => [...prev, mockTask]);
    }
  };

  const moveTask = async (taskId, newStatus) => {
    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        throw new Error(`Failed to update task: ${response.status}`);
      }

      setTasks((prev) =>
        prev.map((task) =>
          task.id === taskId ? { ...task, status: newStatus } : task,
        ),
      );
      loadActivities();
    } catch (error) {
      console.error("Failed to move task:", error);
      setTasks((prev) =>
        prev.map((task) =>
          task.id === taskId ? { ...task, status: newStatus } : task,
        ),
      );
    }
  };

  const updateTask = async (taskId, updates) => {
    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        throw new Error(`Failed to update task: ${response.status}`);
      }

      const updatedTask = await response.json();
      setTasks((prev) =>
        prev.map((task) => (task.id === taskId ? updatedTask : task)),
      );
      loadActivities();
      return updatedTask;
    } catch (error) {
      console.error("Failed to update task:", error);
      setError("Failed to update task");
      // For development, update locally
      const updatedTask = { ...tasks.find(t => t.id === taskId), ...updates };
      setTasks((prev) =>
        prev.map((task) => (task.id === taskId ? updatedTask : task)),
      );
      return updatedTask;
    }
  };

  const deleteTask = async (taskId) => {
    if (!confirm("Are you sure you want to delete this task?")) return false;

    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error(`Failed to delete task: ${response.status}`);
      }

      setTasks((prev) => prev.filter((task) => task.id !== taskId));
      loadActivities();
      return true;
    } catch (error) {
      console.error("Failed to delete task:", error);
      setError("Failed to delete task");
      return false;
    }
  };
  
  const summarizeTask = async (taskText) => {
    try {
      const response = await fetch("/api/summarize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: taskText,
          type: "task",
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to summarize: ${response.status}`);
      }

      const data = await response.json();
      return data.summary;
    } catch (error) {
      console.error("Failed to summarize task:", error);
      return "Failed to generate summary. Please try again later.";
    }
  };

  return {
    tasks,
    loading,
    user,
    currentView,
    activities,
    analytics,
    error,
    setCurrentView,
    getTasksByStatus,
    addTask,
    moveTask,
    updateTask,
    deleteTask,
    summarizeTask
  };
}
