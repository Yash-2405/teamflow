import React, { useState } from "react";
import { TaskCard } from "./TaskCard";
import { NewTaskInput } from "./NewTaskInput";

export function KanbanColumn({
  title,
  status,
  tasks,
  onTaskDrop,
  onTaskClick,
  onAddTask,
}) {
  const [isAddingTask, setIsAddingTask] = useState(false);

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const taskId = parseInt(e.dataTransfer.getData("text/plain"));
    onTaskDrop(taskId, status);
  };
  
  const handleAddTask = (taskTitle, taskStatus) => {
    onAddTask(taskTitle, taskStatus);
    setIsAddingTask(false);
  }

  return (
    <div
      className="flex-1 w-full bg-white border border-gray-200 rounded-md flex flex-col"
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
        <h2 className="text-sm font-semibold text-gray-700">{title}</h2>
        <button
          onClick={() => setIsAddingTask(true)}
          className="uppercase text-[10px] tracking-wider text-gray-500 px-3 py-1 border border-gray-300 rounded-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-400"
        >
          New Task
        </button>
      </div>
      <div className="flex flex-col px-6 py-4 gap-4 flex-1">
        {tasks.map((task) => (
          <TaskCard key={task.id} task={task} onClick={() => onTaskClick(task)} />
        ))}
        {isAddingTask && (
          <NewTaskInput
            status={status}
            onAddTask={handleAddTask}
            onCancel={() => setIsAddingTask(false)}
          />
        )}
      </div>
    </div>
  );
}
