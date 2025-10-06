import { useState } from "react";

export function NewTaskInput({ status, onAddTask, onCancel }) {
  const [title, setTitle] = useState("");

  const handleAddTask = () => {
    if (title.trim()) {
      onAddTask(title, status);
      setTitle("");
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleAddTask();
    } else if (e.key === "Escape") {
      onCancel();
    }
  };

  return (
    <div className="border border-gray-200 rounded-sm p-5 bg-white">
      <input
        type="text"
        placeholder="New Task"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="w-full border-0 text-sm text-gray-700 placeholder-gray-400 focus:ring-0 focus:outline-none p-0"
        autoFocus
        onKeyPress={handleKeyPress}
      />
      <div className="flex gap-4 pt-4">
        <button
          onClick={handleAddTask}
          className="bg-blue-600 hover:bg-blue-700 text-white text-xs uppercase tracking-wide rounded px-6 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
        >
          Add
        </button>
        <button
          onClick={onCancel}
          className="text-gray-500 text-xs uppercase tracking-wide hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
