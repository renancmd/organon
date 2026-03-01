"use client";

import { useState, useEffect } from "react";
import { X, Calendar, Clock, Palette, Repeat, CheckCircle2, MapPin, Trash2 } from "lucide-react";
import { updateEvent, deleteEvent, getAreas, getEvents } from "../../services/db.service.ts";

interface EditEventModalProps {
	isOpen: boolean;
	eventId: string | null;
	onClose: () => void;
	onSuccess: () => void;
}

interface Area {
	id: string;
	name?: string;
	color: string;
}

const RECURRENCE_OPTIONS = ["None", "Daily", "Weekly", "Monthly"];

export default function EditEventModal({ isOpen, eventId, onClose, onSuccess }: EditEventModalProps) {
	const [name, setName] = useState("");
	const [date, setDate] = useState("");
	const [startTime, setStartTime] = useState("");
	const [endTime, setEndTime] = useState("");
	const [location, setLocation] = useState("");
	const [recurrence, setRecurrence] = useState("None");

	const [areas, setAreas] = useState<Area[]>([]);
	const [selectedArea, setSelectedArea] = useState("");
	const [isLoading, setIsLoading] = useState(false);

	useEffect(() => {
		if (!isOpen || !eventId) return;

		const loadData = async () => {
			setIsLoading(true);
			try {

				const [fetchedAreas, fetchedEvents] = await Promise.all([
					getAreas(),
					getEvents()
				]);

				setAreas(fetchedAreas as Area[]);


				const eventToEdit = (fetchedEvents as any[]).find((e) => e.id === eventId);

				if (eventToEdit) {
					setName(eventToEdit.name || "");
					setDate(eventToEdit.date || "");
					setStartTime(eventToEdit.startTime || "");
					setEndTime(eventToEdit.endTime || "");
					setLocation(eventToEdit.location || "");
					setRecurrence(eventToEdit.recurrence || "None");


					const matchedArea = (fetchedAreas as Area[]).find(a => a.color === eventToEdit.color);
					if (matchedArea) {
						setSelectedArea(matchedArea.id);
					} else if (fetchedAreas.length > 0) {
						setSelectedArea(fetchedAreas[0].id);
					}
				}
			} catch (error) {
				console.error("Failed to load event data:", error);
			} finally {
				setIsLoading(false);
			}
		};

		loadData();
	}, [isOpen, eventId]);

	if (!isOpen) return null;

	const handleSave = async () => {
		if (!eventId) return;
		if (!name || !date) {
			alert("Please fill in the required fields (Name and Date).");
			return;
		}

		setIsLoading(true);

		const areaColor = areas.find(a => a.id === selectedArea)?.color || "bg-blue-500";

		const updatedEventData = {
			name,
			date,
			startTime,
			endTime,
			location,
			recurrence,
			color: areaColor,
		};

		try {
			await updateEvent(eventId, updatedEventData);
			onSuccess();
			onClose();
		} catch (error) {
			console.error("Failed to update event:", error);
			alert("Failed to update event. Please try again.");
		} finally {
			setIsLoading(false);
		}
	};

	const handleDelete = async () => {
		if (!eventId) return;
		const confirmDelete = window.confirm("Are you sure you want to delete this event?");
		if (!confirmDelete) return;

		setIsLoading(true);
		try {
			await deleteEvent(eventId);
			onSuccess();
			onClose();
		} catch (error) {
			console.error("Failed to delete event:", error);
			alert("Failed to delete event.");
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<div
			className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm transition-opacity"
			onClick={onClose}
			onKeyDown={(e) => e.key === "Escape" && onClose()}
		>
			<div
				className="flex w-full max-w-md flex-col rounded-xl border border-gray-200 bg-white shadow-2xl dark:border-gray-800 dark:bg-[#1a1a1a]"
				onClick={(e) => e.stopPropagation()}
			>
				<div className="flex items-center justify-between border-b border-gray-100 px-6 py-4 dark:border-gray-800/60">
					<h2 className="text-xl font-bold text-text-primary dark:text-white">Edit Event</h2>
					<button
						onClick={onClose}
						className="rounded-md p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800 dark:hover:text-gray-300 transition-colors"
					>
						<X size={20} />
					</button>
				</div>

				{isLoading ? (
					<div className="flex min-h-[300px] items-center justify-center">
						<span className="text-gray-500">Loading event details...</span>
					</div>
				) : (
					<>
						<div className="flex flex-col gap-5 p-6">
							<input
								type="text"
								value={name}
								onChange={(e) => setName(e.target.value)}
								placeholder="Event title"
								className="w-full bg-transparent text-2xl font-semibold text-text-primary placeholder:text-gray-400 focus:outline-none dark:text-white dark:placeholder:text-gray-600"
								autoFocus
							/>

							<div className="flex flex-col gap-2">
								<label className="flex items-center gap-2 text-sm font-medium text-gray-600 dark:text-gray-400">
									<Calendar size={16} /> Date <span className="text-red-500">*</span>
								</label>
								<input
									type="date"
									value={date}
									onChange={(e) => setDate(e.target.value)}
									className="w-full rounded-lg border border-gray-300 bg-transparent px-3 py-2 text-sm text-text-primary focus:border-brand focus:outline-none dark:border-gray-700 dark:text-white [color-scheme:light] dark:[color-scheme:dark]"
								/>
							</div>

							<div className="flex gap-4">
								<div className="flex flex-1 flex-col gap-2">
									<label className="flex items-center gap-2 text-sm font-medium text-gray-600 dark:text-gray-400">
										<Clock size={16} /> Start Time
									</label>
									<input
										type="time"
										value={startTime}
										onChange={(e) => setStartTime(e.target.value)}
										className="w-full rounded-lg border border-gray-300 bg-transparent px-3 py-2 text-sm text-text-primary focus:border-brand focus:outline-none dark:border-gray-700 dark:text-white [color-scheme:light] dark:[color-scheme:dark]"
									/>
								</div>
								<div className="flex flex-1 flex-col gap-2">
									<label className="flex items-center gap-2 text-sm font-medium text-gray-600 dark:text-gray-400">
										<Clock size={16} className="opacity-0" /> End Time
									</label>
									<input
										type="time"
										value={endTime}
										onChange={(e) => setEndTime(e.target.value)}
										className="w-full rounded-lg border border-gray-300 bg-transparent px-3 py-2 text-sm text-text-primary focus:border-brand focus:outline-none dark:border-gray-700 dark:text-white [color-scheme:light] dark:[color-scheme:dark]"
									/>
								</div>
							</div>

							<div className="flex flex-col gap-2">
								<label className="flex items-center gap-2 text-sm font-medium text-gray-600 dark:text-gray-400">
									<MapPin size={16} /> Location
								</label>
								<input
									type="text"
									value={location}
									onChange={(e) => setLocation(e.target.value)}
									placeholder="e.g. Home Office"
									className="w-full rounded-lg border border-gray-300 bg-transparent px-3 py-2 text-sm text-text-primary focus:border-brand focus:outline-none dark:border-gray-700 dark:text-white"
								/>
							</div>

							<div className="flex flex-col gap-5 sm:flex-row sm:justify-between border-t border-gray-100 pt-5 dark:border-gray-800/60">
								<div className="flex flex-col gap-2">
									<label className="flex items-center gap-2 text-sm font-medium text-gray-600 dark:text-gray-400">
										<Repeat size={16} /> Recurrence
									</label>
									<select
										value={recurrence}
										onChange={(e) => setRecurrence(e.target.value)}
										className="w-full rounded-lg border border-gray-300 bg-transparent px-3 py-2 text-sm text-text-primary focus:border-brand focus:outline-none dark:border-gray-700 dark:text-white"
									>
										{RECURRENCE_OPTIONS.map((opt) => (
											<option key={opt} value={opt} className="dark:bg-[#1a1a1a]">
												{opt}
											</option>
										))}
									</select>
								</div>

								<div className="flex flex-col gap-2">
									<label className="flex items-center gap-2 text-sm font-medium text-gray-600 dark:text-gray-400">
										<Palette size={16} /> Area Color
									</label>
									<div className="flex items-center gap-3 pt-1 flex-wrap">
										{areas.length > 0 ? (
											areas.map((area) => (
												<button
													type="button"
													key={area.id}
													title={area.name || "Area Color"}
													onClick={() => setSelectedArea(area.id)}
													className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-all ${area.color || 'bg-blue-500'} ${selectedArea === area.id
														? "scale-110 ring-2 ring-brand ring-offset-2 dark:ring-offset-[#1a1a1a]"
														: "hover:scale-110"
														}`}
												>
													{selectedArea === area.id ? (
														<CheckCircle2 size={16} className="text-white drop-shadow-md" />
													) : (
														<span className="hidden">{area.name || "Color"}</span>
													)}
												</button>
											))
										) : (
											<span className="text-xs text-gray-400">Loading areas...</span>
										)}
									</div>
								</div>
							</div>
						</div>

						<div className="flex items-center justify-between rounded-b-xl border-t border-gray-100 bg-gray-50 px-6 py-4 dark:border-gray-800/60 dark:bg-gray-800/20">
							<button
								onClick={handleDelete}
								disabled={isLoading}
								className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-red-500 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/30 transition-colors disabled:opacity-50"
								title="Delete Event"
							>
								<Trash2 size={18} />
							</button>
							<div className="flex gap-3">
								<button
									onClick={onClose}
									disabled={isLoading}
									className="rounded-lg px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-200 dark:text-gray-300 dark:hover:bg-gray-800 transition-colors disabled:opacity-50"
								>
									Cancel
								</button>
								<button
									onClick={handleSave}
									disabled={isLoading}
									className="rounded-lg bg-brand px-5 py-2 text-sm font-semibold text-white shadow-sm hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center gap-2"
								>
									{isLoading ? "Saving..." : "Save Changes"}
								</button>
							</div>
						</div>
					</>
				)}
			</div>
		</div>
	);
}
