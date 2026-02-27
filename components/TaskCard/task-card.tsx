"use client";

import { Calendar, Clock, Flag, GripVertical } from "lucide-react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

export type Priority = "low" | "medium" | "high";

export interface TaskCardProps {
	id: string;
	title: string;
	date: string;
	time: string;
	priority: Priority;
	// 👇 Added an onEdit trigger prop
	onEdit?: (id: string) => void;
}

const priorityConfig = {
	low: { color: "text-green-600 dark:text-green-400", bg: "bg-green-100 dark:bg-green-950/30", label: "Low" },
	medium: { color: "text-amber-600 dark:text-amber-400", bg: "bg-amber-100 dark:bg-amber-950/30", label: "Medium" },
	high: { color: "text-red-600 dark:text-red-400", bg: "bg-red-100 dark:bg-red-950/30", label: "High" },
};

export default function TaskCard({ id, title, date, time, priority, onEdit }: TaskCardProps) {
	const config = priorityConfig[priority];

	// Set up the drag-and-drop hooks for this specific card
	const {
		attributes,
		listeners,
		setNodeRef,
		transform,
		transition,
		isDragging,
	} = useSortable({ id });

	// Apply smooth animations when dragging
	const style = {
		transform: CSS.Transform.toString(transform),
		transition,
		opacity: isDragging ? 0.4 : 1, // Make the card slightly transparent while dragging
		zIndex: isDragging ? 10 : 1,
	};

	return (
		<div
			ref={setNodeRef}
			style={style}
			// 👇 Added onClick here to trigger the edit modal
			onClick={() => onEdit?.(id)}
			className={`cursor-pointer group flex flex-col gap-3 rounded-lg border bg-white p-4 shadow-sm transition-colors sm:flex-row sm:items-center sm:justify-between ${isDragging ? "border-brand dark:border-brand shadow-md" : "border-gray-200 dark:border-gray-700/60 dark:bg-gray-800/40 hover:border-brand dark:hover:border-brand"
				}`}
		>

			{/* Left Side: Drag Handle, Checkbox & Title */}
			<div className="flex items-start gap-3 sm:items-center">

				{/* The Drag Handle (Grip Icon) */}
				<div
					{...attributes}
					{...listeners}
					// 👇 Prevent drag clicks from opening the modal
					onPointerDown={(e) => e.stopPropagation()}
					onClick={(e) => e.stopPropagation()}
					className="mt-0.5 cursor-grab text-gray-400 hover:text-brand focus:outline-none active:cursor-grabbing sm:mt-0"
				>
					<GripVertical size={18} />
				</div>

				<input
					type="checkbox"
					// 👇 Prevent checkbox clicks from opening the modal
					onClick={(e) => e.stopPropagation()}
					onChange={(e) => {
						// Place your complete-task logic here
					}}
					className="mt-1 h-4 w-4 shrink-0 cursor-pointer rounded border-gray-300 text-brand focus:ring-brand dark:border-gray-600 dark:bg-transparent sm:mt-0"
				/>
				<span className="font-medium text-text-primary dark:text-gray-100 line-clamp-2">
					{title}
				</span>
			</div>

			{/* Right Side: Metadata (Date, Time, Priority) */}
			<div className="ml-10 flex flex-wrap items-center gap-3 text-sm text-gray-500 dark:text-gray-400 sm:ml-0 sm:flex-nowrap">
				<div className="flex items-center gap-1.5">
					<Calendar size={14} />
					<span>{date}</span>
				</div>

				<div className="flex items-center gap-1.5">
					<Clock size={14} />
					<span>{time}</span>
				</div>

				{/* Priority Badge */}
				<div className={`flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${config.bg} ${config.color}`}>
					<Flag size={12} />
					<span>{config.label}</span>
				</div>
			</div>

		</div>
	);
}
