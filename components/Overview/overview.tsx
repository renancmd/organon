"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { CheckCircle2, Calendar as CalendarIcon, Loader2, Check } from "lucide-react";
import { getTasks, getEvents, completeTask } from "../../services/db.service.ts";
import { parseISO, isSameDay, addDays, startOfDay, isWithinInterval } from "date-fns";


import EditTodoModal from "../../components/EditTaskModal/edit-task-modal.tsx";
import EditEventModal from "../../components/EditEventModal/edit-event-modal.tsx";

type Tab = "today" | "tomorrow" | "next7";

export default function Overview() {
	const [activeTab, setActiveTab] = useState<Tab>("today");


	const [tasks, setTasks] = useState<any[]>([]);
	const [events, setEvents] = useState<any[]>([]);
	const [isLoading, setIsLoading] = useState(true);


	const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
	const [editingEventId, setEditingEventId] = useState<string | null>(null);


	const fetchDashboardData = useCallback(async (silent = false) => {
		if (!silent) setIsLoading(true);
		try {
			const [fetchedTasks, fetchedEvents] = await Promise.all([
				getTasks(),
				getEvents()
			]);
			setTasks(fetchedTasks || []);
			setEvents(fetchedEvents || []);
		} catch (error) {
			console.error("Failed to load overview data:", error);
		} finally {
			setIsLoading(false);
		}
	}, []);

	useEffect(() => {
		fetchDashboardData();
	}, [fetchDashboardData]);


	const handleToggleTaskComplete = async (taskId: string, currentStatus: boolean, e: React.MouseEvent) => {
		e.stopPropagation();

		try {
			await completeTask(!currentStatus, taskId);

			fetchDashboardData(true);
		} catch (error) {
			console.error("Failed to complete task:", error);
		}
	};


	const processedData = useMemo(() => {
		const result = {
			today: { tasks: [] as any[], events: [] as any[] },
			tomorrow: { tasks: [] as any[], events: [] as any[] },
			next7: { tasks: [] as any[], events: [] as any[] },
		};

		const today = startOfDay(new Date());
		const tomorrow = addDays(today, 1);
		const next7End = addDays(today, 7);

		tasks.forEach((task) => {
			if (task.completed) return;
			if (!task.date) return;

			const taskDate = startOfDay(parseISO(task.date));

			if (isSameDay(taskDate, today)) result.today.tasks.push(task);
			if (isSameDay(taskDate, tomorrow)) result.tomorrow.tasks.push(task);
			if (isWithinInterval(taskDate, { start: today, end: next7End })) {
				result.next7.tasks.push(task);
			}
		});

		events.forEach((event) => {
			if (!event.date) return;

			const eventDate = startOfDay(parseISO(event.date));

			if (isSameDay(eventDate, today)) result.today.events.push(event);
			if (isSameDay(eventDate, tomorrow)) result.tomorrow.events.push(event);
			if (isWithinInterval(eventDate, { start: today, end: next7End })) {
				result.next7.events.push(event);
			}
		});

		return result;
	}, [tasks, events]);

	const currentData = processedData[activeTab];

	return (
		<div className="mx-auto w-full max-w-6xl p-6 md:p-8">
			<div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition-colors duration-300 dark:border-gray-800 dark:bg-[#1a1a1a]">

				<div className="flex items-center justify-between mb-6">
					<h1 className="text-2xl font-bold text-text-primary">Overview</h1>
					{isLoading && <Loader2 className="animate-spin text-brand" size={20} />}
				</div>


				<div className="mb-6 flex flex-row gap-3 overflow-x-auto pb-2 scrollbar-hide">
					<TabButton
						label="Today"
						isActive={activeTab === "today"}
						onClick={() => setActiveTab("today")}
					/>
					<TabButton
						label="Tomorrow"
						isActive={activeTab === "tomorrow"}
						onClick={() => setActiveTab("tomorrow")}
					/>
					<TabButton
						label="Next 7 days"
						isActive={activeTab === "next7"}
						onClick={() => setActiveTab("next7")}
					/>
				</div>

				<div className="pt-6 border-t border-gray-100 dark:border-gray-800/60">
					<div className="grid grid-cols-1 gap-8 md:grid-cols-2 md:gap-12">


						<section>
							<div className="mb-4 flex items-center gap-2 border-b border-gray-200 pb-2 dark:border-gray-800">
								<CheckCircle2 className="text-brand" size={20} />
								<h2 className="text-xl font-semibold text-text-primary">Tasks</h2>
							</div>

							<ul className="flex flex-col gap-2">
								{!isLoading && currentData.tasks.length > 0 ? (
									currentData.tasks.map((task) => (
										<li
											key={task.id}
											onClick={() => setEditingTaskId(task.id)}
											className="group flex items-center gap-3 rounded-lg p-2 text-gray-700 transition-colors hover:bg-gray-100 cursor-pointer dark:text-gray-300 dark:hover:bg-gray-800"
										>

											<button
												onClick={(e) => handleToggleTaskComplete(task.id, task.completed, e)}
												className={`flex h-5 w-5 shrink-0 items-center justify-center rounded border transition-all hover:bg-gray-200 dark:hover:bg-gray-700 ${task.color ? task.color.replace('bg-', 'border-') : 'border-gray-400 dark:border-gray-600'}`}
											>

												<Check size={14} className="opacity-0 group-hover:opacity-30 transition-opacity text-gray-500 dark:text-gray-400" />
											</button>


											<div className="flex flex-wrap items-center gap-2">
												<span>{task.name}</span>
												{task.time && <span className="text-xs text-gray-500 dark:text-gray-400">({task.time})</span>}
											</div>
										</li>
									))
								) : (
									<p className="text-sm text-gray-500 italic px-2">
										{isLoading ? "Loading tasks..." : "No tasks scheduled."}
									</p>
								)}
							</ul>
						</section>


						<section>
							<div className="mb-4 flex items-center gap-2 border-b border-gray-200 pb-2 dark:border-gray-800">
								<CalendarIcon className="text-brand" size={20} />
								<h2 className="text-xl font-semibold text-text-primary">Events</h2>
							</div>

							<ul className="flex flex-col gap-2">
								{!isLoading && currentData.events.length > 0 ? (
									currentData.events.map((event) => (
										<li
											key={event.id}
											onClick={() => setEditingEventId(event.id)}
											className="flex items-center gap-3 rounded-lg p-2 text-gray-700 transition-colors hover:bg-gray-100 cursor-pointer dark:text-gray-300 dark:hover:bg-gray-800"
										>
											<div className={`h-3 w-3 rounded-full shrink-0 ${event.color || 'bg-brand'}`} />


											<div className="flex flex-wrap items-center gap-2">
												<span>{event.name}</span>
												{event.startTime && <span className="text-xs text-gray-500 dark:text-gray-400">({event.startTime})</span>}
											</div>
										</li>
									))
								) : (
									<p className="text-sm text-gray-500 italic px-2">
										{isLoading ? "Loading events..." : "No events scheduled."}
									</p>
								)}
							</ul>
						</section>

					</div>
				</div>
			</div>


			<EditTodoModal
				isOpen={!!editingTaskId}
				taskId={editingTaskId}
				onClose={() => {
					setEditingTaskId(null);
					fetchDashboardData(true);
				}}
			/>

			<EditEventModal
				isOpen={!!editingEventId}
				eventId={editingEventId}
				onClose={() => setEditingEventId(null)}
				onSuccess={() => {
					setEditingEventId(null);
					fetchDashboardData(true);
				}}
			/>
		</div>
	);
}

function TabButton({
	label,
	isActive,
	onClick
}: {
	label: string;
	isActive: boolean;
	onClick: () => void;
}) {
	return (
		<button
			onClick={onClick}
			className={`whitespace-nowrap rounded-full px-5 py-2 text-sm font-medium transition-all duration-200 ${isActive
				? "bg-brand text-white shadow-md"
				: "bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
				}`}
		>
			{label}
		</button>
	);
}
