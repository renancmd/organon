"use client";

import { useAuth } from "../../../providers/auth-provider";
import { useState, useEffect } from "react";
import TaskArea from "../../../components/TaskArea/task-area";
import TodoModal from "../../../components/TodoModal/todo-modal";
import EditTodoModal from "../../../components/EditTaskModal/edit-task-modal";
import TaskCard, { TaskCardProps, Priority } from "../../../components/TaskCard/task-card";
import { getAreas, getTasks } from "../../../services/db.service";
import { ChevronDown, ChevronRight } from "lucide-react";
import { DndContext, closestCenter } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import "../../globals.css";

type Area = {
	id: string;
	name: string;
	color: string;
};

type DBTask = {
	id: string;
	name: string;
	color: string;
	date: string;
	priority: string;
	completed: boolean;
	createdAt: string;
	time?: string;
};

type MappedTask = TaskCardProps & { color: string; completed: boolean };

export default function ToDo() {
	const { user } = useAuth();
	const [isModalOpen, setIsModalOpen] = useState(false);


	const [editingTaskId, setEditingTaskId] = useState<string | null>(null);

	const [isCompletedOpen, setIsCompletedOpen] = useState(false);

	const [areas, setAreas] = useState<Area[]>([]);
	const [allTasks, setAllTasks] = useState<MappedTask[]>([]);
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		if (!user) return;

		const fetchData = async () => {
			try {
				const [areasData, tasksData] = await Promise.all([getAreas(), getTasks()]);

				setAreas(areasData as Area[]);

				const mappedTasks = (tasksData as DBTask[]).map((task) => {
					let mappedPriority: Priority = "low";
					if (task.priority === "Alta" || task.priority === "high") mappedPriority = "high";
					if (task.priority === "Média" || task.priority === "medium") mappedPriority = "medium";

					return {
						id: task.id,
						title: task.name || "Untitled Task",
						date: task.date || "No date",
						time: task.time || "--:--",
						priority: mappedPriority,
						color: task.color,
						completed: task.completed || false
					};
				});

				setAllTasks(mappedTasks);
			} catch (error) {
				console.error("Failed to fetch data:", error);
			} finally {
				setIsLoading(false);
			}
		};

		fetchData();
	}, [user, isModalOpen, editingTaskId]);

	if (!user) {
		return <h1>You need to be logged in to access this page</h1>;
	}

	const activeTasks = allTasks.filter(task => !task.completed);
	const completedTasks = allTasks.filter(task => task.completed);

	return (
		<div className="w-full pt-8 pb-12">
			<div className="mx-auto flex w-full max-w-7xl justify-end px-6 mb-4 md:px-8">
				<button
					onClick={() => setIsModalOpen(true)}
					className="cursor-pointer rounded-lg bg-brand px-4 py-2 font-semibold text-white shadow-sm transition-opacity hover:opacity-90"
				>
					+ New Task
				</button>
			</div>


			<div className="mx-auto w-full max-w-7xl px-6 md:px-8">
				<div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
					{isLoading ? (
						<p className="col-span-full mt-8 text-center text-gray-500">
							Loading your tasks...
						</p>
					) : areas.length > 0 ? (
						areas.map((area) => {
							const areaTasks = activeTasks.filter(task => task.color === area.color);

							return (
								<TaskArea
									key={area.id}
									areaName={area.name}
									areaColor={area.color}
									initialTasks={areaTasks}

									onEdit={(id) => setEditingTaskId(id)}
								/>
							);
						})
					) : (
						<p className="col-span-full mt-8 text-center italic text-gray-500">
							No life areas found. Go to the areas page to create your first one!
						</p>
					)}
				</div>
			</div>


			{!isLoading && completedTasks.length > 0 && (
				<div className="mx-auto w-full max-w-7xl px-6 md:px-8 mt-12">
					<div className="border-t border-gray-200 dark:border-gray-800 pt-6">
						<button
							onClick={() => setIsCompletedOpen(!isCompletedOpen)}
							className="flex items-center gap-2 text-lg font-bold text-gray-600 hover:text-text-primary dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
						>
							{isCompletedOpen ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
							Completed Tasks ({completedTasks.length})
						</button>

						{isCompletedOpen && (
							<div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2 opacity-75">
								<DndContext id="dnd-completed" collisionDetection={closestCenter}>
									<SortableContext items={completedTasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
										{completedTasks.map((task) => (
											<TaskCard
												key={task.id}
												id={task.id}
												title={task.title}
												date={task.date}
												time={task.time}
												priority={task.priority}

												onEdit={(id) => setEditingTaskId(id)}
											/>
										))}
									</SortableContext>
								</DndContext>
							</div>
						)}
					</div>
				</div>
			)}


			<TodoModal
				isOpen={isModalOpen}
				onClose={() => setIsModalOpen(false)}
			/>


			<EditTodoModal
				isOpen={!!editingTaskId}
				taskId={editingTaskId}
				onClose={() => setEditingTaskId(null)}
			/>
		</div>
	);
}
