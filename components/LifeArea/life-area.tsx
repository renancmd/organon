"use client";

import { useState, useEffect } from "react";
import { Plus, Edit2, Trash2, Check, X } from "lucide-react";
import { getAreas } from "../../services/db.service.ts";

// Define the shape of a Life Area
type Area = {
	id: string;
	name: string;
	color: string;
};

export default function LifeArea() {
	// Start with empty data and a loading state
	const [areas, setAreas] = useState<Area[]>([]);
	const [isLoading, setIsLoading] = useState(true);

	const [editingId, setEditingId] = useState<string | null>(null);
	const [editForm, setEditForm] = useState<{ name: string; color: string }>({ name: "", color: "" });

	// Fetch areas on component mount
	useEffect(() => {
		const fetchAreasData = async () => {
			try {
				const data = await getAreas();
				setAreas(data as Area[]);
			} catch (error) {
				console.error("Failed to fetch areas:", error);
			} finally {
				setIsLoading(false);
			}
		};

		fetchAreasData();
	}, []);

	const handleNewArea = () => {
		const newId = Math.random().toString(36).substr(2, 9);
		// Defaulting to a Tailwind class instead of a hex code
		const newArea = { id: newId, name: "", color: "bg-blue-500" };

		setAreas([...areas, newArea]);
		setEditingId(newId);
		setEditForm({ name: "", color: "bg-blue-500" });
	};

	const startEditing = (area: Area) => {
		setEditingId(area.id);
		setEditForm({ name: area.name, color: area.color });
	};

	const saveEdit = (id: string) => {
		if (!editForm.name.trim()) return;

		setAreas(areas.map((area) =>
			area.id === id ? { ...area, name: editForm.name, color: editForm.color } : area
		));

		// TODO: Call your Firebase update/create function here to persist changes to the DB

		setEditingId(null);
	};

	const cancelEdit = (id: string) => {
		const area = areas.find((a) => a.id === id);
		if (area && !area.name.trim()) {
			handleDelete(id);
		} else {
			setEditingId(null);
		}
	};

	const handleDelete = (id: string) => {
		setAreas(areas.filter((area) => area.id !== id));

		// TODO: Call your Firebase delete function here to remove it from the DB
	};

	return (
		<div className="mx-auto w-full max-w-6xl p-6 md:p-8">
			<div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition-colors duration-300 dark:border-gray-800 dark:bg-[#1a1a1a]">

				<div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-gray-100 pb-4 dark:border-gray-800/60">
					<h2 className="text-2xl font-bold text-text-primary dark:text-white">Life Areas</h2>

					<button
						onClick={handleNewArea}
						className="flex items-center justify-center gap-2 rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white shadow-sm hover:opacity-90 transition-opacity w-full sm:w-auto"
					>
						<Plus size={18} />
						<span>New area</span>
					</button>
				</div>

				<div className="flex flex-col gap-3">
					{isLoading ? (
						<p className="py-4 text-center text-sm text-gray-500">
							Loading your areas...
						</p>
					) : areas.length > 0 ? (
						areas.map((area) => (
							<div
								key={area.id}
								className="flex items-center justify-between rounded-lg border border-gray-200 bg-gray-50 p-3 transition-colors dark:border-gray-700/60 dark:bg-gray-800/30"
							>
								{editingId === area.id ? (
									<div className="flex w-full flex-col gap-3 sm:flex-row sm:items-center">
										<div className="flex flex-1 items-center gap-3">
											{/* Changed to text input since we are using Tailwind classes like 'bg-red-500' */}
											<input
												type="text"
												value={editForm.color}
												onChange={(e) => setEditForm({ ...editForm, color: e.target.value })}
												placeholder="e.g. bg-red-500"
												className="w-32 rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm text-text-primary focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand dark:border-gray-600 dark:bg-gray-900 dark:text-white transition-colors"
												title="Tailwind color class"
											/>
											<input
												type="text"
												value={editForm.name}
												onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
												placeholder="Area name..."
												className="w-full flex-1 rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm text-text-primary focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand dark:border-gray-600 dark:bg-gray-900 dark:text-white transition-colors"
												autoFocus
												onKeyDown={(e) => e.key === 'Enter' && saveEdit(area.id)}
											/>
										</div>
										<div className="flex items-center gap-2 self-end sm:self-auto">
											<button
												onClick={() => cancelEdit(area.id)}
												className="flex h-8 w-8 items-center justify-center rounded-md text-gray-500 hover:bg-gray-200 hover:text-gray-700 dark:hover:bg-gray-700 dark:hover:text-gray-300 transition-colors"
												title="Cancel"
											>
												<X size={16} />
											</button>
											<button
												onClick={() => saveEdit(area.id)}
												className="flex h-8 w-8 items-center justify-center rounded-md text-green-600 hover:bg-green-100 dark:text-green-500 dark:hover:bg-green-950/30 transition-colors"
												title="Save"
											>
												<Check size={16} />
											</button>
										</div>
									</div>
								) : (
									<>
										<div className="flex items-center gap-3">
											{/* Applied color dynamically using Tailwind classes */}
											<div className={`h-4 w-4 rounded-full shadow-sm ${area.color}`} />
											<span className="font-medium text-text-primary dark:text-gray-200">
												{area.name}
											</span>
										</div>
										<div className="flex items-center gap-1">
											<button
												onClick={() => startEditing(area)}
												className="flex h-8 w-8 items-center justify-center rounded-md text-gray-500 hover:bg-gray-200 hover:text-brand dark:hover:bg-gray-700 dark:hover:text-brand transition-colors"
												title="Edit area"
											>
												<Edit2 size={16} />
											</button>
											<button
												onClick={() => handleDelete(area.id)}
												className="flex h-8 w-8 items-center justify-center rounded-md text-gray-500 hover:bg-red-100 hover:text-red-600 dark:hover:bg-gray-700 dark:hover:text-red-500 transition-colors"
												title="Delete area"
											>
												<Trash2 size={16} />
											</button>
										</div>
									</>
								)}
							</div>
						))
					) : (
						<p className="py-4 text-center text-sm italic text-gray-500">
							No life areas created yet. Click "New area" to start organizing.
						</p>
					)}
				</div>

			</div>
		</div>
	);
}
