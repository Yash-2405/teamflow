import { Clock, User } from "lucide-react";
import { formatDate, getPriorityColor } from "@/utils/helpers";

export function TaskCard({ task, onClick }) {
  const handleDragStart = (e, taskId) => {
    e.dataTransfer.setData("text/plain", taskId);
  };

  return (
    <div
      draggable
      onDragStart={(e) => handleDragStart(e, task.id)}
      onClick={onClick}
      className="border border-gray-200 rounded-sm p-5 bg-white hover:shadow-md transition-shadow cursor-pointer"
    >
      <div className="flex items-start justify-between mb-2">
        <h3 className="text-sm font-medium text-gray-700 leading-snug flex-1">
          {task.title}
        </h3>
        {task.priority && (
          <span
            className={`text-xs px-2 py-1 rounded-full border ${getPriorityColor(task.priority)}`}
          >
            {task.priority}
          </span>
        )}
      </div>
      {task.story_points && (
        <div className="text-xs text-gray-500 mb-2">
          Story Points: {task.story_points}
        </div>
      )}
      <div className="flex items-center justify-between text-xs text-gray-400">
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
          <span className="text-gray-500">
            {task.assignee?.username || "Unassigned"}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <Clock className="h-3 w-3" />
          {formatDate(task.created_at)}
        </div>
      </div>
    </div>
  );
}
