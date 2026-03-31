"use client";

import { useAuth } from "../../../providers/auth-provider";
import { useState, useEffect, useCallback } from "react";
import { Icon } from "@iconify/react";
import { Plus, Trophy, Loader2 } from "lucide-react";
import "../../globals.css";
import HabitModal from "../../../components/HabitModal/habit-modal";
// Import the new services
import { getHabits, createHabit, updateHabit, deleteHabit } from "../../../services/db.service";

export type Habit = {
	id: string;
	name: string;
	icon: string;
	frequency: "daily" | "weekly";
	specificDays?: number[];
	target: number;
	startDate: string;
	goalDays: number | null;
	history: Record<string, number>;
};

export default function HabitsTracker() {
	const { user } = useAuth();

	const [habits, setHabits] = useState<Habit[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [selectedHabitId, setSelectedHabitId] = useState<string | null>(null);

	// Modal States
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [habitToEdit, setHabitToEdit] = useState<Habit | null>(null);

	const fetchHabitsData = useCallback(async () => {
		try {
			setIsLoading(true);
			const data = await getHabits();
			setHabits(data as Habit[]);
			if (data.length > 0 && !selectedHabitId) {
				setSelectedHabitId(data[0].id);
			}
		} catch (error) {
			console.error("Failed to fetch habits:", error);
		} finally {
			setIsLoading(false);
		}
	}, [selectedHabitId]);

	useEffect(() => {
		if (user) fetchHabitsData();
	}, [user, fetchHabitsData]);

	const getTodayStr = () => new Date().toISOString().split('T')[0];

	const getCurrentWeek = () => {
		const today = new Date();
		const dayOfWeek = today.getDay();
		const sunday = new Date(today);
		sunday.setDate(today.getDate() - dayOfWeek);

		return Array.from({ length: 7 }).map((_, i) => {
			const d = new Date(sunday);
			d.setDate(sunday.getDate() + i);
			return d.toISOString().split('T')[0];
		});
	};

	const isHabitFinished = (habit: Habit) => {
		if (!habit.goalDays) return false;
		const start = new Date(habit.startDate);
		const end = new Date(start);
		end.setDate(start.getDate() + habit.goalDays);
		return new Date() > end;
	};

	// --- Firebase Connected Actions ---

	const toggleHabitHistory = async (habitId: string, dateStr: string, target: number) => {
		// 1. Find the habit
		const habit = habits.find(h => h.id === habitId);
		if (!habit) return;

		// 2. Calculate new count
		const currentCount = habit.history[dateStr] || 0;
		const newCount = currentCount >= target ? 0 : currentCount + 1;

		// 3. Create updated object
		const updatedHabit = {
			...habit,
			history: { ...habit.history, [dateStr]: newCount }
		};

		// 4. Optimistic UI update (feels instant to the user)
		setHabits(habits.map(h => h.id === habitId ? updatedHabit : h));

		// 5. Save to Firebase in background
		try {
			await updateHabit(habitId, updatedHabit);
		} catch (error) {
			console.error("Failed to update habit:", error);
			// Revert on failure by re-fetching
			fetchHabitsData();
		}
	};

	const handleSaveHabit = async (savedHabit: Partial<Habit>) => {
		try {
			if (habitToEdit) {
				// Update existing
				const updated = savedHabit as Habit;
				setHabits(habits.map(h => h.id === updated.id ? updated : h));
				await updateHabit(updated.id, updated);
			} else {
				// Create new
				const newHabitData = {
					...(savedHabit as Omit<Habit, "id" | "history" | "startDate">),
					startDate: getTodayStr(),
					history: {}
				};

				const newId = await createHabit(newHabitData);
				const completeHabit = { ...newHabitData, id: newId } as Habit;

				setHabits([...habits, completeHabit]);
				if (!selectedHabitId) setSelectedHabitId(newId);
			}
		} catch (error) {
			console.error("Failed to save habit:", error);
		}
	};

	const handleDeleteHabit = async (habitId: string) => {
		try {
			setHabits(habits.filter(h => h.id !== habitId));
			if (selectedHabitId === habitId) setSelectedHabitId(habits[0]?.id || null);
			await deleteHabit(habitId);
		} catch (error) {
			console.error("Failed to delete habit:", error);
		}
	};

	// --- UI Helpers ---
	const openEditModal = (habit: Habit) => {
		setHabitToEdit(habit);
		setIsModalOpen(true);
	};

	const openNewModal = () => {
		setHabitToEdit(null);
		setIsModalOpen(true);
	};

	const activeHabits = habits.filter(h => !isHabitFinished(h));
	const finishedHabits = habits.filter(h => isHabitFinished(h));
	const currentWeekDates = getCurrentWeek();
	const weekDaysShort = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

	const generateHeatmapGrid = () => {
		const days = [];
		const today = new Date();
		for (let i = 83; i >= 0; i--) {
			const d = new Date(today);
			d.setDate(today.getDate() - i);
			days.push(d.toISOString().split('T')[0]);
		}
		return days;
	};
	const heatmapDays = generateHeatmapGrid();
	const selectedHabit = activeHabits.find(h => h.id === selectedHabitId) || activeHabits[0];

	if (!user) return <h1>You need to be logged in.</h1>;

	return (
		<div className="w-full pt-8 pb-20">
			<div className="mx-auto flex w-full max-w-7xl justify-between items-center px-6 mb-8 md:px-8">
				<div className="flex items-center gap-4">
					<h1 className="text-3xl font-black text-text-primary">Habit Tracker</h1>
					{isLoading && <Loader2 className="animate-spin text-brand" size={24} />}
				</div>
				<button
					onClick={openNewModal}
					className="flex items-center gap-2 rounded-lg bg-brand px-4 py-2 font-semibold text-white shadow-sm transition-opacity hover:opacity-90"
				>
					<Plus size={18} /> New Habit
				</button>
			</div>

			<div className="mx-auto w-full max-w-7xl px-6 md:px-8 flex flex-col gap-10">
				{/* ACTIVE HABITS CARDS */}
				<section>
					{!isLoading && activeHabits.length === 0 ? (
						<div className="text-center py-12 border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-2xl">
							<p className="text-gray-500">No active habits. Click "New Habit" to get started!</p>
						</div>
					) : (
						<div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
							{activeHabits.map((habit) => (
								<div
									key={habit.id}
									onClick={() => openEditModal(habit)}
									className="border border-gray-200 rounded-2xl bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-[#181818] flex flex-col justify-between cursor-pointer hover:shadow-md transition-shadow group"
								>
									<div className="flex items-center justify-between mb-6">
										<div className="flex items-center gap-3">
											<div className="bg-brand/10 text-brand p-3 rounded-xl group-hover:bg-brand/20 transition-colors">
												<Icon icon={habit.icon} width="24" height="24" />
											</div>
											<div>
												<h3 className="font-bold text-lg text-text-primary group-hover:text-brand transition-colors">{habit.name}</h3>
												<p className="text-xs text-gray-500 uppercase tracking-wider">
													{habit.frequency === 'daily' ? 'Daily' : `${habit.specificDays?.length || 0} Days/Wk`}
													{habit.target > 1 && ` • Target: ${habit.target}`}
												</p>
											</div>
										</div>
									</div>

									{/* CHECKBOXES */}
									<div className="flex justify-between items-center">
										{currentWeekDates.map((dateStr, idx) => {
											const count = habit.history[dateStr] || 0;
											const isCompleted = count >= habit.target;
											const isToday = dateStr === getTodayStr();

											return (
												<div key={dateStr} className="flex flex-col items-center gap-2">
													<span className={`text-[10px] font-semibold ${isToday ? 'text-brand' : 'text-gray-400'}`}>
														{weekDaysShort[idx]}
													</span>
													<button
														onClick={(e) => {
															e.stopPropagation();
															toggleHabitHistory(habit.id, dateStr, habit.target);
														}}
														className={`h-8 w-8 rounded-full border-2 flex items-center justify-center transition-all ${isCompleted
																? 'bg-brand border-brand text-white scale-110'
																: count > 0
																	? 'bg-brand/30 border-brand/50 text-brand'
																	: 'bg-transparent border-gray-200 dark:border-gray-700 hover:border-brand/50'
															}`}
													>
														{count > 0 && count < habit.target ? <span className="text-xs">{count}</span> : null}
													</button>
												</div>
											);
										})}
									</div>
								</div>
							))}
						</div>
					)}
				</section>

				{/* CHARTS & HEATMAP SECTION */}
				{activeHabits.length > 0 && (
					<section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
						{/* Left: Overall Graphic */}
						<div className="border border-gray-200 rounded-2xl bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-[#181818] lg:col-span-1">
							<h2 className="text-lg font-bold text-text-primary mb-6">Activity Overview</h2>
							<div className="space-y-6">
								{activeHabits.map(habit => {
									const last30Days = generateHeatmapGrid().slice(-30);
									const completed = last30Days.filter(d => (habit.history[d] || 0) >= habit.target).length;
									const percentage = Math.round((completed / 30) * 100);

									return (
										<div key={habit.id}>
											<div className="flex justify-between text-sm mb-1">
												<span className="font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
													<Icon icon={habit.icon} /> {habit.name}
												</span>
												<span className="font-bold text-brand">{percentage}%</span>
											</div>
											<div className="h-2 w-full bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
												<div className="h-full bg-brand transition-all duration-500" style={{ width: `${percentage}%` }} />
											</div>
										</div>
									)
								})}
							</div>
						</div>

						{/* Right: GitHub Heatmap */}
						<div className="border border-gray-200 rounded-2xl bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-[#181818] lg:col-span-2 flex flex-col">
							<div className="flex flex-wrap items-center gap-2 mb-6 border-b border-gray-100 dark:border-gray-800 pb-4">
								{activeHabits.map(habit => (
									<button
										key={habit.id}
										onClick={() => setSelectedHabitId(habit.id)}
										className={`px-4 py-2 text-sm font-semibold rounded-lg transition-colors flex items-center gap-2 ${selectedHabitId === habit.id
												? 'bg-brand text-white'
												: 'bg-gray-50 text-gray-500 hover:bg-gray-100 dark:bg-black dark:text-gray-400 dark:hover:bg-gray-900'
											}`}
									>
										<Icon icon={habit.icon} /> {habit.name}
									</button>
								))}
							</div>

							{selectedHabit ? (
								<div className="flex-1 flex flex-col justify-center">
									<h3 className="font-bold text-text-primary mb-4 flex items-center gap-2">
										Consistency Map <span className="text-xs font-normal text-gray-400">(Last 12 Weeks)</span>
									</h3>
									<div className="grid grid-rows-7 grid-flow-col gap-1.5 overflow-x-auto pb-2">
										{heatmapDays.map((dateStr) => {
											const count = selectedHabit.history[dateStr] || 0;
											const isCompleted = count >= selectedHabit.target;
											const isPartial = count > 0 && !isCompleted;

											return (
												<div
													key={dateStr}
													title={`${dateStr}: ${count}/${selectedHabit.target}`}
													className={`h-3.5 w-3.5 sm:h-4 sm:w-4 rounded-sm transition-colors ${isCompleted
															? 'bg-brand'
															: isPartial
																? 'bg-brand/40'
																: 'bg-gray-100 dark:bg-gray-800'
														}`}
												/>
											)
										})}
									</div>
								</div>
							) : (
								<div className="text-center text-gray-500 py-10">Select a habit to view its heatmap.</div>
							)}
						</div>
					</section>
				)}

				{/* FINISHED HABITS */}
				{finishedHabits.length > 0 && (
					<section className="mt-8 border-t border-gray-200 dark:border-gray-800 pt-8 opacity-75">
						<h2 className="text-xl font-bold text-gray-500 mb-6 flex items-center gap-2">
							<Trophy size={20} /> Finished Habits
						</h2>
						<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
							{finishedHabits.map((habit) => (
								<div key={habit.id} className="flex items-center gap-4 border border-gray-200 rounded-xl p-4 bg-gray-50 dark:bg-black dark:border-gray-800">
									<div className="bg-gray-200 dark:bg-gray-800 text-gray-500 p-3 rounded-xl">
										<Icon icon={habit.icon} width="24" height="24" />
									</div>
									<div>
										<h3 className="font-bold text-gray-700 dark:text-gray-300">{habit.name}</h3>
										<p className="text-xs text-gray-400">
											Completed goal of {habit.goalDays} days
										</p>
									</div>
								</div>
							))}
						</div>
					</section>
				)}
			</div>

			<HabitModal
				isOpen={isModalOpen}
				habitToEdit={habitToEdit}
				onClose={() => setIsModalOpen(false)}
				onSave={handleSaveHabit}
				onDelete={handleDeleteHabit}
			/>
		</div>
	);
}
