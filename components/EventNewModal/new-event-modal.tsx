"use client";

import { useState, useEffect } from "react";
import { X, Calendar, Clock, Palette, Repeat, CheckCircle2, MapPin } from "lucide-react";
import { createEvent, getAreas } from "../../services/db.service";

interface NewEventModalProps {
	isOpen: boolean;
	onClose: () => void;
	onSuccess: () => void;
}


interface Area {
	id: string;
	name?: string;
	color: string;
}

const RECURRENCE_OPTIONS = ["None", "Daily", "Weekly", "Monthly"];

export default function NewEventModal({ isOpen, onClose, onSuccess }: NewEventModalProps) {

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
		if (isOpen) {
			const fetchAreas = async () => {
				try {
					const fetchedAreas = await getAreas();
					setAreas(fetchedAreas as Area[]);


					if (fetchedAreas.length > 0) {
						setSelectedArea(fetchedAreas[0].id);
					}
				} catch (error) {
					console.error("Failed to fetch areas:", error);
				}
			};

			fetchAreas();
		}
	}, [isOpen]);

	if (!isOpen) return null;

	const handleSave = async () => {

		if (!name || !date) {
			alert("Please fill in the required fields (Name and Date).");
			return;
		}

		setIsLoading(true);


		const areaColor = areas.find(a => a.id === selectedArea)?.color || "bg-blue-500";

		const now = new Date();
		const formattedCreatedAt = new Intl.DateTimeFormat("en-US", {
			month: "long",
			day: "numeric",
			year: "numeric",
			hour: "numeric",
			minute: "2-digit",
			second: "2-digit",
			hour12: true,
			timeZoneName: "short"
		}).format(now);

		const newEventData = {
			name,
			date,
			startTime,
			endTime,
			location,
			recurrence,
			color: areaColor,
			createdAt: formattedCreatedAt,
		};

		try {
			await createEvent(newEventData);
			resetForm();
			onSuccess();
			onClose();
		} catch (error) {
			console.error("Failed to create event:", error);
			alert("Failed to create event. Please try again.");
		} finally {
			setIsLoading(false);
		}
	};

	const resetForm = () => {
		setName("");
		setDate("");
		setStartTime("");
		setEndTime("");
		setLocation("");
		setRecurrence("None");
		setSelectedArea(areas.length > 0 ? areas[0].id : "");
	};

	const handleClose = () => {
		resetForm();
		onClose();
	};

	return (
		<div
			className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm transition-opacity"
			onClick={handleClose}
			onKeyDown={(e) => e.key === "Escape" && handleClose()}
		>
			<div
				className="flex w-full max-w-md flex-col rounded-xl border border-gray-200 bg-white shadow-2xl dark:border-gray-800 dark:bg-[#1a1a1a]"
				onClick={(e) => e.stopPropagation()}
			>

				<div className="flex items-center justify-between border-b border-gray-100 px-6 py-4 dark:border-gray-800/60">
					<h2 className="text-xl font-bold text-text-primary dark:text-white">New Event</h2>
					<button
						onClick={handleClose}
						className="rounded-md p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800 dark:hover:text-gray-300 transition-colors"
					>
						<X size={20} />
					</button>
				</div>


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
								<Clock size={16} /> Start Time <span className="text-xs text-gray-400 font-normal">(Optional)</span>
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
								<Clock size={16} className="opacity-0" /> End Time <span className="text-xs text-gray-400 font-normal">(Optional)</span>
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


				<div className="flex items-center justify-end gap-3 rounded-b-xl border-t border-gray-100 bg-gray-50 px-6 py-4 dark:border-gray-800/60 dark:bg-gray-800/20">
					<button
						onClick={handleClose}
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
						{isLoading ? "Saving..." : "Save Event"}
					</button>
				</div>
			</div>
		</div>
	);
}
