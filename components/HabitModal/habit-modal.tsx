"use client";

import { useState, useEffect } from "react";
import { X, Trash2 } from "lucide-react";
import { Icon } from "@iconify/react";
import type { Habit } from "../../app/habits/page";

export const MAIN_ICONS = [
	"mdi:dumbbell", "mdi:book-open-page-variant", "mdi:water", "mdi:meditation",
	"mdi:run", "mdi:bed-empty", "mdi:food-apple", "mdi:code-braces", "mdi:currency-usd",
	"mdi:brain", "mdi:laptop", "mdi:piggy-bank"
];

const WEEK_DAYS = [
	{ id: 0, label: 'S' }, // Sunday
	{ id: 1, label: 'M' },
	{ id: 2, label: 'T' },
	{ id: 3, label: 'W' },
	{ id: 4, label: 'T' },
	{ id: 5, label: 'F' },
	{ id: 6, label: 'S' }, // Saturday
];

interface HabitModalProps {
	isOpen: boolean;
	habitToEdit: Habit | null;
	onClose: () => void;
	onSave: (habit: Omit<Habit, "id" | "history" | "startDate"> | Habit) => void;
	onDelete?: (habitId: string) => void;
}

export default function HabitModal({ isOpen, habitToEdit, onClose, onSave, onDelete }: HabitModalProps) {
	const [name, setName] = useState("");
	const [icon, setIcon] = useState(MAIN_ICONS[0]);
	const [frequency, setFrequency] = useState<"daily" | "weekly">("daily");

	// NEW: Array to store selected days (0-6)
	const [specificDays, setSpecificDays] = useState<number[]>([]);

	const [target, setTarget] = useState(1);
	const [isForever, setIsForever] = useState(true);
	const [goalDays, setGoalDays] = useState(30);

	useEffect(() => {
		if (habitToEdit && isOpen) {
			setName(habitToEdit.name);
			setIcon(habitToEdit.icon);
			setFrequency(habitToEdit.frequency);
			setSpecificDays(habitToEdit.specificDays || []);
			setTarget(habitToEdit.target);
			setIsForever(habitToEdit.goalDays === null);
			setGoalDays(habitToEdit.goalDays || 30);
		} else if (isOpen) {
			setName("");
			setIcon(MAIN_ICONS[0]);
			setFrequency("daily");
			setSpecificDays([]); // Default to none selected
			setTarget(1);
			setIsForever(true);
			setGoalDays(30);
		}
	}, [habitToEdit, isOpen]);

	if (!isOpen) return null;

	const toggleDay = (dayId: number) => {
		if (specificDays.includes(dayId)) {
			setSpecificDays(specificDays.filter(d => d !== dayId));
		} else {
			setSpecificDays([...specificDays, dayId].sort()); // Keep them in order
		}
	};

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (!name.trim()) return;

		const habitData = {
			...(habitToEdit || {}),
			name,
			icon,
			frequency,
			specificDays: frequency === "weekly" ? specificDays : [],
			target,
			goalDays: isForever ? null : goalDays,
		};

		onSave(habitData as Habit);
		onClose();
	};

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 transition-opacity">
			<div className="relative w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl dark:bg-[#181818] dark:border dark:border-gray-800 max-h-[90vh] overflow-y-auto">
				<button
					onClick={onClose}
					className="absolute right-4 top-4 text-gray-400 hover:text-text-primary transition-colors"
				>
					<X size={20} />
				</button>

				<h2 className="mb-6 text-2xl font-bold text-text-primary">
					{habitToEdit ? "Edit Habit" : "New Habit"}
				</h2>

				<form onSubmit={handleSubmit} className="flex flex-col gap-5">
					<div>
						<label className="mb-1 block text-sm font-medium text-gray-600 dark:text-gray-300">Habit Name</label>
						<input
							type="text"
							value={name}
							onChange={(e) => setName(e.target.value)}
							placeholder="e.g., Read 10 Pages"
							className="w-full rounded-lg border border-gray-200 bg-transparent p-3 outline-none focus:border-brand dark:border-gray-700"
							required
						/>
					</div>

					<div>
						<label className="mb-2 block text-sm font-medium text-gray-600 dark:text-gray-300">Choose Icon</label>
						<div className="grid grid-cols-6 gap-2">
							{MAIN_ICONS.map((i) => (
								<button
									key={i}
									type="button"
									onClick={() => setIcon(i)}
									className={`flex p-3 items-center justify-center rounded-lg border transition-all ${icon === i
										? "border-brand bg-brand/10 text-brand"
										: "border-gray-200 text-gray-400 hover:border-brand/50 dark:border-gray-700"
										}`}
								>
									<Icon icon={i} width="24" height="24" />
								</button>
							))}
						</div>
					</div>

					<div className="grid grid-cols-2 gap-4">
						<div>
							<label className="mb-1 block text-sm font-medium text-gray-600 dark:text-gray-300">Frequency</label>
							<select
								value={frequency}
								onChange={(e) => setFrequency(e.target.value as "daily" | "weekly")}
								className="w-full rounded-lg border border-gray-200 bg-transparent p-3 outline-none focus:border-brand dark:border-gray-700 dark:bg-[#181818]"
							>
								<option value="daily">Daily</option>
								<option value="weekly">Specific Days</option>
							</select>
						</div>
						<div>
							<label className="mb-1 block text-sm font-medium text-gray-600 dark:text-gray-300">
								Daily Target <span className="text-xs text-gray-400">(times/day)</span>
							</label>
							<input
								type="number"
								min="1"
								value={target}
								onChange={(e) => setTarget(parseInt(e.target.value) || 1)}
								className="w-full rounded-lg border border-gray-200 bg-transparent p-3 outline-none focus:border-brand dark:border-gray-700"
							/>
						</div>

						{/* NEW: The 7 Day Circular Selector */}
						{frequency === "weekly" && (
							<div className="col-span-2 mt-2">
								<label className="mb-2 block text-sm font-medium text-gray-600 dark:text-gray-300">Select Days</label>
								<div className="flex items-center justify-between gap-2">
									{WEEK_DAYS.map(day => {
										const isSelected = specificDays.includes(day.id);
										return (
											<button
												key={day.id}
												type="button"
												onClick={() => toggleDay(day.id)}
												className={`h-11 w-11 rounded-full font-bold text-sm transition-all ${isSelected
													? "bg-brand text-white shadow-md scale-105"
													: "bg-gray-100 text-gray-400 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-500 dark:hover:bg-gray-700"
													}`}
											>
												{day.label}
											</button>
										)
									})}
								</div>
							</div>
						)}
					</div>

					<div className="border-t border-gray-100 dark:border-gray-800 pt-4 mt-2">
						<label className="mb-2 block text-sm font-medium text-gray-600 dark:text-gray-300">Duration</label>
						<div className="flex items-center gap-4">
							<label className="flex items-center gap-2 cursor-pointer">
								<input
									type="radio"
									checked={isForever}
									onChange={() => setIsForever(true)}
									className="text-brand focus:ring-brand"
								/>
								<span className="text-sm dark:text-gray-300">Ongoing (Forever)</span>
							</label>
							<label className="flex items-center gap-2 cursor-pointer">
								<input
									type="radio"
									checked={!isForever}
									onChange={() => setIsForever(false)}
									className="text-brand focus:ring-brand"
								/>
								<span className="text-sm dark:text-gray-300">Specific Goal</span>
							</label>
						</div>

						{!isForever && (
							<div className="mt-3 flex items-center gap-2">
								<input
									type="number"
									min="1"
									value={goalDays}
									onChange={(e) => setGoalDays(parseInt(e.target.value) || 1)}
									className="w-24 rounded-lg border border-gray-200 bg-transparent p-2 outline-none focus:border-brand dark:border-gray-700 text-center"
								/>
								<span className="text-sm text-gray-500">days</span>
							</div>
						)}
					</div>

					<div className="mt-6 flex items-center justify-between">
						{habitToEdit && onDelete ? (
							<button
								type="button"
								onClick={() => {
									if (confirm("Delete this habit? This cannot be undone.")) {
										onDelete(habitToEdit.id);
										onClose();
									}
								}}
								className="text-red-500 hover:text-red-600 flex items-center gap-1 text-sm font-medium transition-colors"
							>
								<Trash2 size={16} /> Delete
							</button>
						) : <div />}

						<div className="flex gap-3">
							<button
								type="button"
								onClick={onClose}
								className="rounded-lg px-4 py-2 font-medium text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800 transition-colors"
							>
								Cancel
							</button>
							<button
								type="submit"
								disabled={!name.trim() || (frequency === 'weekly' && specificDays.length === 0)}
								className="rounded-lg bg-brand px-6 py-2 font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
							>
								Save Habit
							</button>
						</div>
					</div>
				</form>
			</div>
		</div>
	);
}
