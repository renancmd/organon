"use client";

import { useState, useEffect, useCallback } from "react";
import { Icon } from "@iconify/react";
import { CheckCircle2, Circle, Loader2 } from "lucide-react";
import { getHabits, updateHabit } from "../../services/db.service";

type Habit = {
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

export default function HabitWidget() {
	const [habits, setHabits] = useState<Habit[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [activeTab, setActiveTab] = useState<"today" | "tomorrow" | "actives">("today");

	const todayObj = new Date();
	const tomorrowObj = new Date(todayObj);
	tomorrowObj.setDate(tomorrowObj.getDate() + 1);

	const todayDayIndex = todayObj.getDay();
	const tomorrowDayIndex = tomorrowObj.getDay();

	const todayStr = todayObj.toISOString().split('T')[0];
	const tomorrowStr = tomorrowObj.toISOString().split('T')[0];

	const fetchHabitsData = useCallback(async () => {
		try {
			const data = await getHabits();
			setHabits(data as Habit[]);
		} catch (error) {
			console.error("Failed to fetch widget habits:", error);
		} finally {
			setIsLoading(false);
		}
	}, []);

	useEffect(() => {
		fetchHabitsData();
	}, [fetchHabitsData]);

	// --- Filtering Logic ---
	const isHabitFinished = (habit: Habit) => {
		if (!habit.goalDays) return false;
		const end = new Date(habit.startDate);
		end.setDate(end.getDate() + habit.goalDays);
		return new Date() > end;
	};

	const activeHabits = habits.filter(h => !isHabitFinished(h));

	const todayHabits = activeHabits.filter(h =>
		h.frequency === "daily" || (h.frequency === "weekly" && h.specificDays?.includes(todayDayIndex))
	);

	const tomorrowHabits = activeHabits.filter(h =>
		h.frequency === "daily" || (h.frequency === "weekly" && h.specificDays?.includes(tomorrowDayIndex))
	);

	const displayHabits =
		activeTab === "today" ? todayHabits :
			activeTab === "tomorrow" ? tomorrowHabits :
				activeHabits;

	const targetDateStr = activeTab === "tomorrow" ? tomorrowStr : todayStr;

	// --- Checkbox Logic (Firebase connected) ---
	const toggleHabit = async (habitId: string, targetCount: number) => {
		if (activeTab === "actives") return;

		const habit = habits.find(h => h.id === habitId);
		if (!habit) return;

		const currentCount = habit.history[targetDateStr] || 0;
		const newCount = currentCount >= targetCount ? 0 : currentCount + 1;
		const updatedHabit = { ...habit, history: { ...habit.history, [targetDateStr]: newCount } };

		// Optimistic UI Update
		setHabits(habits.map(h => h.id === habitId ? updatedHabit : h));

		// Background Firebase Update
		try {
			await updateHabit(habitId, updatedHabit);
		} catch (error) {
			console.error("Failed to update widget habit:", error);
			fetchHabitsData(); // Revert on failure
		}
	};

	if (isLoading) {
		return (
			<div className="border border-gray-200 dark:border-gray-800 rounded-2xl bg-white dark:bg-[#181818] p-12 flex justify-center items-center text-brand">
				<Loader2 className="animate-spin" size={32} />
			</div>
		);
	}

	return (
		<div className="border border-gray-200 rounded-2xl bg-white shadow-sm dark:border-gray-800 dark:bg-[#181818] overflow-hidden flex flex-col">

			{/* Widget Header & Tabs */}
			<div className="border-b border-gray-100 dark:border-gray-800 p-4 md:px-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
				<h2 className="text-xl font-bold text-text-primary flex items-center gap-2">
					<Icon icon="mdi:checkbox-marked-circle-outline" className="text-brand" width="24" />
					Habits
				</h2>

				<div className="flex items-center gap-2 bg-gray-50 dark:bg-black p-1 rounded-lg w-fit">
					{(["today", "tomorrow", "actives"] as const).map((tab) => (
						<button
							key={tab}
							onClick={() => setActiveTab(tab)}
							className={`px-4 py-1.5 text-sm font-semibold rounded-md transition-all capitalize ${activeTab === tab
									? "bg-white dark:bg-[#181818] text-brand shadow-sm"
									: "text-gray-500 hover:text-text-primary"
								}`}
						>
							{tab}
						</button>
					))}
				</div>
			</div>

			{/* Widget Content */}
			<div className="p-4 md:px-6 bg-gray-50/50 dark:bg-transparent min-h-[200px]">
				{displayHabits.length === 0 ? (
					<div className="flex flex-col items-center justify-center h-full py-10 text-gray-500">
						<p>No habits scheduled for {activeTab}.</p>
					</div>
				) : (
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
						{displayHabits.map(habit => {
							const currentCount = habit.history[targetDateStr] || 0;
							const isCompleted = currentCount >= habit.target;
							const isActivesTab = activeTab === "actives";

							return (
								<div key={habit.id} className="flex items-center justify-between p-4 bg-white dark:bg-[#181818] border border-gray-100 dark:border-gray-800 rounded-xl hover:border-brand/30 transition-colors">
									<div className="flex items-center gap-3">
										<div className={`p-2 rounded-lg ${isCompleted && !isActivesTab ? 'bg-brand text-white' : 'bg-brand/10 text-brand'}`}>
											<Icon icon={habit.icon} width="20" height="20" />
										</div>
										<div className="flex flex-col">
											<span className={`font-semibold text-sm ${isCompleted && !isActivesTab ? 'line-through text-gray-400' : 'text-text-primary'}`}>
												{habit.name}
											</span>
											{habit.target > 1 && !isActivesTab && (
												<span className="text-[10px] text-gray-400 font-medium">
													Progress: {currentCount}/{habit.target}
												</span>
											)}
										</div>
									</div>

									{!isActivesTab && (
										<button
											onClick={() => toggleHabit(habit.id, habit.target)}
											className="transition-transform active:scale-90"
										>
											{isCompleted ? (
												<CheckCircle2 size={24} className="text-brand" />
											) : (
												<Circle size={24} className="text-gray-300 hover:text-brand/50" />
											)}
										</button>
									)}
								</div>
							);
						})}
					</div>
				)}
			</div>
		</div>
	);
}
