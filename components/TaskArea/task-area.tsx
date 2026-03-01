"use client";

import { useState, useEffect, useMemo } from "react";
import { Filter } from "lucide-react";
import {
	DndContext,
	closestCenter,
	KeyboardSensor,
	PointerSensor,
	useSensor,
	useSensors,
	DragEndEvent
} from "@dnd-kit/core";
import {
	arrayMove,
	SortableContext,
	sortableKeyboardCoordinates,
	verticalListSortingStrategy
} from "@dnd-kit/sortable";

import TaskCard, { TaskCardProps, Priority } from "../TaskCard/task-card";

interface TaskAreaProps {
	areaName?: string;
	areaColor?: string;
	initialTasks?: TaskCardProps[];
	onEdit?: (id: string) => void;
}

export default function TaskArea({
	areaName = "Career & Growth",
	areaColor = "bg-blue-500",
	initialTasks = [],
	onEdit
}: TaskAreaProps) {

	const [tasks, setTasks] = useState<TaskCardProps[]>(initialTasks);

	useEffect(() => {
		setTasks(initialTasks);
	}, [initialTasks]);

	const [priorityFilter, setPriorityFilter] = useState<Priority | "all">("all");
	const [timeFilter, setTimeFilter] = useState<"all" | "today" | "upcoming">("all");




	const filteredTasks = useMemo(() => {
		return tasks.filter((task) => {
			const matchesPriority = priorityFilter === "all" || task.priority === priorityFilter;
			let matchesTime = true;


			if (timeFilter === "today") {
				matchesTime = task.date === "Today";
			} else if (timeFilter === "upcoming") {
				matchesTime = task.date !== "Today";
			}
			return matchesPriority && matchesTime;
		});
	}, [tasks, priorityFilter, timeFilter]);


	const sensors = useSensors(
		useSensor(PointerSensor),
		useSensor(KeyboardSensor, {
			coordinateGetter: sortableKeyboardCoordinates,
		})
	);


	const handleDragEnd = (event: DragEndEvent) => {
		const { active, over } = event;

		if (over && active.id !== over.id) {
			setTasks((items) => {
				const oldIndex = items.findIndex((item) => item.id === active.id);
				const newIndex = items.findIndex((item) => item.id === over.id);
				return arrayMove(items, oldIndex, newIndex);
			});



		}
	};



	return (
		<div className="flex h-full flex-col rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition-colors duration-300 dark:border-gray-800 dark:bg-[#1a1a1a]">

			
			<div className="mb-6 flex flex-col gap-4 border-b border-gray-100 pb-5 dark:border-gray-800/60 sm:flex-row sm:items-center sm:justify-between">
				<div className="flex items-center gap-3">
					<div className={`h-5 w-5 shrink-0 rounded-md shadow-sm ${areaColor}`} />
					<h2 className="text-2xl font-bold text-text-primary dark:text-white">{areaName}</h2>
				</div>

				<div className="flex flex-wrap items-center gap-3">
					<div className="flex items-center gap-2 text-sm text-gray-500">
						<Filter size={16} />
						<span className="hidden sm:inline-block">Filter:</span>
					</div>

					<select
						value={timeFilter}
						onChange={(e) => setTimeFilter(e.target.value as "all" | "today" | "upcoming")}
						className="rounded-lg border border-gray-300 bg-gray-50 px-3 py-1.5 text-sm text-text-primary focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200"
					>
						<option value="all">Any Time</option>
						<option value="today">Today</option>
						<option value="upcoming">Upcoming</option>
					</select>

					<select
						value={priorityFilter}
						onChange={(e) => setPriorityFilter(e.target.value as Priority | "all")}
						className="rounded-lg border border-gray-300 bg-gray-50 px-3 py-1.5 text-sm text-text-primary focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200"
					>
						<option value="all">All</option>
						<option value="high">High</option>
						<option value="medium">Med</option>
						<option value="low">Low</option>
					</select>
				</div>
			</div>

			
			<DndContext
				id={`dnd-${areaName}`}
				sensors={sensors}
				collisionDetection={closestCenter}
				onDragEnd={handleDragEnd}
			>
				<SortableContext
					items={filteredTasks.map(task => task.id)}
					strategy={verticalListSortingStrategy}
				>
					<div className="flex flex-1 flex-col gap-3">
						{filteredTasks.length > 0 ? (
							filteredTasks.map((task) => (
								<TaskCard
									key={task.id}
									onEdit={onEdit}
									id={task.id}
									title={task.title}
									date={task.date}
									time={task.time}
									priority={task.priority}
									isCompleted={task.isCompleted}
								/>
							))
						) : (
							<div className="flex h-full items-center justify-center py-8 text-center text-gray-500 dark:text-gray-400">
								<p className="italic">No tasks in this area yet.</p>
							</div>
						)}
					</div>
				</SortableContext>
			</DndContext>

		</div>
	);
}
