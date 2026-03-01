"use client";

import { useState } from "react";
import { Calendar, Clock, Flag, GripVertical } from "lucide-react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { completeTask } from "../../services/db.service.ts";

export type Priority = "low" | "medium" | "high";

export interface TaskCardProps {
	id: string;
	title: string;
	date: string;
	time: string;
	priority: Priority;
	isCompleted?: boolean;
	onEdit?: (id: string) => void;
}

const priorityConfig = {
	low: { color: "text-green-600 dark:text-green-400", bg: "bg-green-100 dark:bg-green-950/30", label: "Low" },
	medium: { color: "text-amber-600 dark:text-amber-400", bg: "bg-amber-100 dark:bg-amber-950/30", label: "Medium" },
	high: { color: "text-red-600 dark:text-red-400", bg: "bg-red-100 dark:bg-red-950/30", label: "High" },
};

export default function TaskCard({ id, title, date, time, priority, isCompleted = false, onEdit }: TaskCardProps) {
	const config = priorityConfig[priority];


	const [completed, setCompleted] = useState(isCompleted);

	const {
		attributes,
		listeners,
		setNodeRef,
		transform,
		transition,
		isDragging,
	} = useSortable({ id });

	const style = {
		transform: CSS.Transform.toString(transform),
		transition,
		opacity: isDragging ? 0.4 : (completed ? 0.6 : 1),
		zIndex: isDragging ? 10 : 1,
	};


	const handleToggleComplete = async (e: React.ChangeEvent<HTMLInputElement>) => {
		e.stopPropagation();

		const newStatus = e.target.checked;
		setCompleted(newStatus);

		try {
			await completeTask(newStatus, id);
		} catch (error) {
			console.error("Failed to update task completion status:", error);
			setCompleted(!newStatus);
		}
	};

	return (
		<div
			ref={setNodeRef}
			style={style}
			onClick={() => onEdit?.(id)}
			className={`cursor-pointer group flex flex-col gap-3 rounded-lg border bg-white p-4 shadow-sm transition-colors sm:flex-row sm:items-center sm:justify-between ${isDragging
				? "border-brand dark:border-brand shadow-md"
				: "border-gray-200 dark:border-gray-700/60 dark:bg-gray-800/40 hover:border-brand dark:hover:border-brand"
				}`}
		>
			<div className="flex items-start gap-3 sm:items-center">
				<div
					{...attributes}
					{...listeners}
					onPointerDown={(e) => e.stopPropagation()}
					onClick={(e) => e.stopPropagation()}
					className="mt-0.5 cursor-grab text-gray-400 hover:text-brand focus:outline-none active:cursor-grabbing sm:mt-0"
				>
					<GripVertical size={18} />
				</div>

				<input
					type="checkbox"
					checked={completed}
					onClick={(e) => e.stopPropagation()}
					onChange={handleToggleComplete}
					className="mt-1 h-4 w-4 shrink-0 cursor-pointer rounded border-gray-300 text-brand focus:ring-brand dark:border-gray-600 dark:bg-transparent sm:mt-0"
				/>
				<span className={`font-medium text-text-primary dark:text-gray-100 line-clamp-2 transition-all ${completed ? "line-through text-gray-400 dark:text-gray-500" : ""
					}`}>
					{title}
				</span>
			</div>

			<div className="ml-10 flex flex-wrap items-center gap-3 text-sm text-gray-500 dark:text-gray-400 sm:ml-0 sm:flex-nowrap">
				<div className="flex items-center gap-1.5">
					<Calendar size={14} />
					<span>{date}</span>
				</div>

				<div className="flex items-center gap-1.5">
					<Clock size={14} />
					<span>{time}</span>
				</div>

				<div className={`flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${config.bg} ${config.color}`}>
					<Flag size={12} />
					<span>{config.label}</span>
				</div>
			</div>
		</div>
	);
}
