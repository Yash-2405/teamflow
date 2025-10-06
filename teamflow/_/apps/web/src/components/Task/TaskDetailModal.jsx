import { useState, useEffect } from "react";
import {
  X,
  Edit,
  Trash2,
  Sparkles,
  Save,
  User,
} from "lucide-react";
import { formatDate, getPriorityColor } from "@/utils/helpers";

export function TaskDetailModal({
  task,
  onClose,
  onUpdateTask,
  onDeleteTask,
  onSummarizeTask,
}) {
  const [editingTask, setEditingTask] = useState(null);
  const [aiSummarizing, setAiSummarizing] = useState(false);
  const [taskSummary, setTaskSummary] = useState("");

  useEffect(() => {
    if (!task) {
      setEditingTask(null);
      setTaskSummary("");
    } else {
        // Reset editing state when task changes but modal is kept open
        setEditingTask(null);
        setTaskSummary("");
    }
  }, [task]);

  if (!task) return null;

  const handleSaveChanges = async () => {
    if (editingTask) {
      const updatedTask = await onUpdateTask(task.id, editingTask);
      if (updatedTask) {
        setEditingTask(null);
      }
    }
  };

  const handleDelete = async () => {
    const success = await onDeleteTask(task.id);
    if (success) {
      onClose();
    }
  };

  const handleSummarize = async () => {
    if (task.description) {
      setAiSummarizing(true);
      setTaskSummary("");
      const summary = await onSummarizeTask(task.description);
      setTaskSummary(summary);
      setAiSummarizing(false);
    }
  };

  const isEditing = editingTask !== null;
  const currentTask = isEditing ? editingTask : task;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            Task Details
          </h2>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setEditingTask(isEditing ? null : { ...task })}
              className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
            >
              <Edit className="h-4 w-4" />
            </button>
            <button
              onClick={handleDelete}
              className="p-2 text-gray-400 hover:text-red-600 rounded-lg hover:bg-gray-100"
            >
              <Trash2 className="h-4 w-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Modal Content */}
        <div className="p-6 space-y-6">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Title
            </label>
            {isEditing ? (
              <input
                type="text"
                value={editingTask.title || ""}
                onChange={(e) =>
                  setEditingTask((prev) => ({
                    ...prev,
                    title: e.target.value,
                  }))
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            ) : (
              <h3 className="text-lg font-medium text-gray-900">
                {task.title}
              </h3>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            {isEditing ? (
              <textarea
                value={editingTask.description || ""}
                onChange={(e) =>
                  setEditingTask((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Add a description..."
              />
            ) : (
              <div className="text-gray-700">
                {task.description || "No description available."}
              </div>
            )}
          </div>

          {/* Task Properties Grid */}
          <div className="grid grid-cols-2 gap-4">
            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              {isEditing ? (
                <select
                  value={editingTask.status || "todo"}
                  onChange={(e) =>
                    setEditingTask((prev) => ({
                      ...prev,
                      status: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="todo">To Do</option>
                  <option value="in_progress">In Progress</option>
                  <option value="done">Done</option>
                </select>
              ) : (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                  {task.status === "todo"
                    ? "To Do"
                    : task.status === "in_progress"
                      ? "In Progress"
                      : "Done"}
                </span>
              )}
            </div>

            {/* Priority */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Priority
              </label>
              {isEditing ? (
                <select
                  value={editingTask.priority || "medium"}
                  onChange={(e) =>
                    setEditingTask((prev) => ({
                      ...prev,
                      priority: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              ) : (
                <span
                  className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getPriorityColor(task.priority)}`}
                >
                  {task.priority || "Medium"}
                </span>
              )}
            </div>

            {/* Story Points */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Story Points
              </label>
              {isEditing ? (
                <input
                  type="number"
                  min="1"
                  max="20"
                  value={editingTask.story_points || 1}
                  onChange={(e) =>
                    setEditingTask((prev) => ({
                      ...prev,
                      story_points: parseInt(e.target.value),
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              ) : (
                <span className="text-gray-700">
                  {task.story_points || 1}
                </span>
              )}
            </div>

            {/* Assignee */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Assignee
              </label>
              <div className="flex items-center gap-2">
                {task.assignee?.avatar ? (
                  <img
                    src={task.assignee.avatar}
                    alt={task.assignee.username}
                    className="h-6 w-6 rounded-full object-cover"
                  />
                ) : (
                  <div className="h-6 w-6 rounded-full bg-gray-300 flex items-center justify-center">
                    <User className="h-3 w-3 text-gray-500" />
                  </div>
                )}
                <span className="text-gray-700">
                  {task.assignee?.username || "Unassigned"}
                </span>
              </div>
            </div>
          </div>

          {/* AI Summarization */}
          {task.description && (
            <div className="border-t border-gray-200 pt-6">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-medium text-gray-700">
                  AI Summary
                </h4>
                <button
                  onClick={handleSummarize}
                  disabled={aiSummarizing}
                  className="inline-flex items-center gap-2 px-3 py-1 text-xs font-medium text-blue-600 bg-blue-50 rounded-md hover:bg-blue-100 disabled:opacity-50"
                >
                  <Sparkles className="h-3 w-3" />
                  {aiSummarizing ? "Summarizing..." : "Generate Summary"}
                </button>
              </div>
              {taskSummary && (
                <div className="bg-gray-50 rounded-md p-3 text-sm text-gray-700">
                  {taskSummary}
                </div>
              )}
              {aiSummarizing && (
                <div className="bg-gray-50 rounded-md p-3 text-sm text-gray-500 flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                  Generating AI summary...
                </div>
              )}
            </div>
          )}

          {/* Timestamps */}
          <div className="border-t border-gray-200 pt-6 grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-500">Created:</span>
              <div className="text-gray-700">
                {formatDate(task.created_at)}
              </div>
            </div>
            {task.updated_at &&
              task.updated_at !== task.created_at && (
                <div>
                  <span className="text-gray-500">Updated:</span>
                  <div className="text-gray-700">
                    {formatDate(task.updated_at)}
                  </div>
                </div>
              )}
          </div>
        </div>

        {/* Modal Footer */}
        {isEditing && (
          <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200">
            <button
              onClick={() => setEditingTask(null)}
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveChanges}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <Save className="h-4 w-4" />
              Save Changes
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
