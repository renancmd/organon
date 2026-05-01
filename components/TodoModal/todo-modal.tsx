"use client";

import { useState, useEffect } from "react";
import {
    X, Calendar, Clock, Flag, Paperclip, Plus, Trash2, CheckCircle2
} from "lucide-react";
import { getAreas, createTask } from "../../services/db.service";

interface TodoModalProps {
    isOpen: boolean;
    onClose: () => void;
}

type Area = {
    id: string;
    name: string;
    color: string;
};

export default function TodoModal({ isOpen, onClose }: TodoModalProps) {
    const [taskName, setTaskName] = useState("");
    const [description, setDescription] = useState("");
    const [priority, setPriority] = useState<"low" | "medium" | "high">("low");
    const [date, setDate] = useState("");
    const [time, setTime] = useState("");

    const [areas, setAreas] = useState<Area[]>([]);
    const [selectedArea, setSelectedArea] = useState("");
    const [isLoadingAreas, setIsLoadingAreas] = useState(false);

    // Updated Subtasks state to include date and time
    const [subtasks, setSubtasks] = useState<{ id: string; title: string; date: string; time: string }[]>([]);
    const [newSubtask, setNewSubtask] = useState("");
    const [newSubtaskDate, setNewSubtaskDate] = useState("");
    const [newSubtaskTime, setNewSubtaskTime] = useState("");

    useEffect(() => {
        if (!isOpen) return;

        const fetchAreas = async () => {
            setIsLoadingAreas(true);
            try {
                const fetchedAreas = await getAreas();
                setAreas(fetchedAreas as Area[]);

                if (fetchedAreas.length > 0) {
                    setSelectedArea(fetchedAreas[0].id);
                }
            } catch (error) {
                console.error("Failed to fetch areas:", error);
            } finally {
                setIsLoadingAreas(false);
            }
        };

        fetchAreas();
    }, [isOpen]);

    if (!isOpen) return null;

    const handleAddSubtask = () => {
        if (!newSubtask.trim()) return;
        setSubtasks([...subtasks, { 
            id: Math.random().toString(), 
            title: newSubtask,
            date: newSubtaskDate,
            time: newSubtaskTime
        }]);
        
        // Reset subtask inputs after adding
        setNewSubtask("");
        setNewSubtaskDate("");
        setNewSubtaskTime("");
    };

    const removeSubtask = (id: string) => {
        setSubtasks(subtasks.filter((task) => task.id !== id));
    };

    const handleSubmit = async () => {
        const areaColor = areas.find(a => a.id === selectedArea)?.color || "#3b82f6";

        const priorityMap = {
            low: "Baixa",
            medium: "Média",
            high: "Alta"
        };

        // Format subtasks for the database
        const formattedSubtasks = subtasks.map((st, index) => ({
            id: `sub-${Date.now()}${index}`,
            name: st.title,
            completed: false,
            date: st.date,
            time: st.time,
            dueDate: st.date && st.time ? `${st.date}T${st.time}` : ""
        }));

        const newTaskData = {
            name: taskName,
            description: description,
            color: areaColor,
            date: date,
            time: time,
            dueDate: date && time ? `${date}T${time}` : "",
            priority: priorityMap[priority],
            completed: false,
            createdAt: new Date().toISOString(),
            subtasks: formattedSubtasks
        };

        try {
            createTask(newTaskData);

            // Clean up state
            setTaskName("");
            setDescription("");
            setDate("");
            setTime("");
            setSubtasks([]);
            setNewSubtaskDate("");
            setNewSubtaskTime("");
            onClose();
        } catch (error) {
            console.error("Failed to create task:", error);
        }
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm transition-opacity"
            onClick={onClose}
            onKeyDown={(e) => e.key === "Escape" && onClose()}
        >
            <div
                className="flex w-full max-w-2xl flex-col rounded-xl border border-gray-200 bg-white shadow-2xl dark:border-gray-800 dark:bg-[#1a1a1a]"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4 dark:border-gray-800/60">
                    <h2 className="text-xl font-bold text-text-primary">New Task</h2>
                    <button
                        onClick={onClose}
                        className="rounded-md p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800 dark:hover:text-gray-300 transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Body */}
                <div className="flex max-h-[70vh] flex-col gap-6 overflow-y-auto p-6 scrollbar-hide">
                    {/* Task Title Input */}
                    <input
                        type="text"
                        value={taskName}
                        onChange={(e) => setTaskName(e.target.value)}
                        placeholder="What needs to be done?"
                        className="w-full bg-transparent text-2xl font-semibold text-text-primary placeholder:text-gray-400 focus:outline-none dark:placeholder:text-gray-600"
                        autoFocus
                    />

                    {/* Description Input */}
                    <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Add a description..."
                        rows={3}
                        className="w-full resize-none rounded-lg border border-gray-300 bg-transparent p-3 text-sm text-text-primary placeholder:text-gray-400 focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand dark:border-gray-700 dark:placeholder:text-gray-500 transition-colors"
                    />

                    {/* Date and Time Pickers (Main Task) */}
                    <div className="flex flex-col gap-4 sm:flex-row">
                        <div className="flex flex-1 flex-col gap-2">
                            <label className="flex items-center gap-2 text-sm font-medium text-gray-600 dark:text-gray-400">
                                <Calendar size={16} /> Date
                            </label>
                            <input
                                type="date"
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                                className="w-full rounded-lg border border-gray-300 bg-transparent px-3 py-2 text-sm text-text-primary focus:border-brand focus:outline-none dark:border-gray-700 [color-scheme:light] dark:[color-scheme:dark]"
                            />
                        </div>
                        <div className="flex flex-1 flex-col gap-2">
                            <label className="flex items-center gap-2 text-sm font-medium text-gray-600 dark:text-gray-400">
                                <Clock size={16} /> Time
                            </label>
                            <input
                                type="time"
                                value={time}
                                onChange={(e) => setTime(e.target.value)}
                                className="w-full rounded-lg border border-gray-300 bg-transparent px-3 py-2 text-sm text-text-primary focus:border-brand focus:outline-none dark:border-gray-700 [color-scheme:light] dark:[color-scheme:dark]"
                            />
                        </div>
                    </div>

                    {/* Priority and Area row */}
                    <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between border-y border-gray-100 py-6 dark:border-gray-800/60">
                        <div className="flex flex-col gap-3">
                            <label className="flex items-center gap-2 text-sm font-medium text-gray-600 dark:text-gray-400">
                                <Flag size={16} /> Priority
                            </label>
                            <div className="flex gap-2">
                                {(["low", "medium", "high"] as const).map((p) => (
                                    <button
                                        key={p}
                                        onClick={() => setPriority(p)}
                                        className={`rounded-full px-4 py-1.5 text-xs font-semibold capitalize transition-all ${priority === p
                                            ? "bg-brand text-white shadow-md"
                                            : "bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700"
                                            }`}
                                    >
                                        {p}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="flex flex-col gap-3">
                            <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                Life Area
                            </label>
                            <div className="flex items-center gap-3">
                                {isLoadingAreas ? (
                                    <span className="text-sm text-gray-500">Loading areas...</span>
                                ) : areas.length > 0 ? (
                                    areas.map((area) => (
                                        <button
                                            key={area.id}
                                            onClick={() => setSelectedArea(area.id)}
                                            title={area.name}
                                            className={`flex h-8 w-8 items-center justify-center rounded-full transition-transform ${area.color} ${selectedArea === area.id
                                                ? "scale-110 ring-2 ring-brand ring-offset-2 dark:ring-offset-[#1a1a1a]"
                                                : "hover:scale-110"
                                                }`}
                                        >
                                            {selectedArea === area.id && <CheckCircle2 size={16} className="text-white drop-shadow-md" />}
                                        </button>
                                    ))
                                ) : (
                                    <span className="text-sm italic text-gray-400">No areas found</span>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Subtasks Section */}
                    <div className="flex flex-col gap-3">
                        <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                            Subtasks
                        </label>

                        {/* Subtask Input Form */}
                        <div className="flex flex-col gap-2 rounded-lg border border-gray-200 dark:border-gray-800 p-3">
                            <input
                                type="text"
                                value={newSubtask}
                                onChange={(e) => setNewSubtask(e.target.value)}
                                onKeyDown={(e) => e.key === "Enter" && handleAddSubtask()}
                                placeholder="Add a subtask..."
                                className="w-full bg-transparent px-1 py-1 text-sm text-text-primary focus:outline-none"
                            />
                            
                            <div className="flex gap-2">
                                <input
                                    type="date"
                                    value={newSubtaskDate}
                                    onChange={(e) => setNewSubtaskDate(e.target.value)}
                                    className="flex-1 rounded-md border border-gray-300 bg-transparent px-2 py-1.5 text-xs text-text-primary focus:border-brand focus:outline-none dark:border-gray-700 [color-scheme:light] dark:[color-scheme:dark]"
                                />
                                <input
                                    type="time"
                                    value={newSubtaskTime}
                                    onChange={(e) => setNewSubtaskTime(e.target.value)}
                                    className="flex-1 rounded-md border border-gray-300 bg-transparent px-2 py-1.5 text-xs text-text-primary focus:border-brand focus:outline-none dark:border-gray-700 [color-scheme:light] dark:[color-scheme:dark]"
                                />
                                <button
                                    onClick={handleAddSubtask}
                                    className="flex items-center justify-center rounded-md bg-brand px-3 py-1.5 text-white shadow-sm hover:opacity-90 transition-opacity"
                                >
                                    <Plus size={16} />
                                </button>
                            </div>
                        </div>

                        {/* Subtask List */}
                        {subtasks.length > 0 && (
                            <ul className="mt-2 flex flex-col gap-2">
                                {subtasks.map((task) => (
                                    <li key={task.id} className="flex flex-col justify-between rounded-md bg-gray-50 px-3 py-2 text-sm dark:bg-gray-800/40">
                                        <div className="flex items-center justify-between">
                                            <span className="text-text-primary font-medium">{task.title}</span>
                                            <button onClick={() => removeSubtask(task.id)} className="text-gray-400 hover:text-red-500">
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                        {/* Show Date/Time if they exist */}
                                        {(task.date || task.time) && (
                                            <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                                                {task.date && (
                                                    <span className="flex items-center gap-1">
                                                        <Calendar size={12} /> {task.date}
                                                    </span>
                                                )}
                                                {task.time && (
                                                    <span className="flex items-center gap-1">
                                                        <Clock size={12} /> {task.time}
                                                    </span>
                                                )}
                                            </div>
                                        )}
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </div>

                {/* Footer Controls */}
                <div className="flex items-center justify-between rounded-b-xl bg-gray-50 px-6 py-4 dark:bg-gray-800/20">
                    <button className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-200 dark:text-gray-400 dark:hover:bg-gray-800 transition-colors">
                        <Paperclip size={18} />
                        <span className="hidden sm:inline">Attach File</span>
                    </button>

                    <div className="flex gap-3">
                        <button
                            onClick={onClose}
                            className="rounded-lg px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-200 dark:text-gray-300 dark:hover:bg-gray-800 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSubmit}
                            className="rounded-lg bg-brand px-5 py-2 text-sm font-semibold text-white shadow-sm hover:opacity-90 transition-opacity"
                        >
                            Create Task
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
