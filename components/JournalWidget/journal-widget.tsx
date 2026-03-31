"use client";

import { useState, useEffect, useRef } from "react";
import { Paperclip, Save, Image as ImageIcon, FileText, X, Loader2, CheckCircle2 } from "lucide-react";
import { createJournalEntry, getJournalEntries } from "../../services/db.service";

export default function JournalWidget() {
	const [grateful, setGrateful] = useState("");
	const [memory, setMemory] = useState("");
	const [attachment, setAttachment] = useState<{ type: 'image' | 'file'; url: string; name: string } | undefined>();

	const [isLoading, setIsLoading] = useState(true);
	const [isSaving, setIsSaving] = useState(false);
	const [isSaved, setIsSaved] = useState(false);

	const fileInputRef = useRef<HTMLInputElement>(null);
	const todayStr = new Date().toISOString().split('T')[0];

	useEffect(() => {
		const fetchTodayEntry = async () => {
			try {
				const entries = await getJournalEntries();
				const todayEntry = entries.find((e: any) => e.date === todayStr);

				if (todayEntry) {
					setGrateful(todayEntry.grateful);
					setMemory(todayEntry.memory);
					if (todayEntry.attachment) {
						setAttachment(todayEntry.attachment);
					}
				}
			} catch (error) {
				console.error("Failed to load today's journal entry:", error);
			} finally {
				setIsLoading(false);
			}
		};

		fetchTodayEntry();
	}, [todayStr]);

	const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (file) {
			const isImage = file.type.startsWith('image/');
			const tempUrl = URL.createObjectURL(file);
			setAttachment({
				type: isImage ? 'image' : 'file',
				name: file.name,
				url: tempUrl
			});
			setIsSaved(false);
		}
	};

	const handleSave = async () => {
		if (!grateful.trim() || !memory.trim()) return;

		try {
			setIsSaving(true);
			setIsSaved(false);
			await createJournalEntry({
				date: todayStr,
				grateful,
				memory,
				attachment
			});
			setIsSaved(true);

			setTimeout(() => setIsSaved(false), 3000);
		} catch (error) {
			console.error("Failed to save journal entry:", error);
		} finally {
			setIsSaving(false);
		}
	};

	if (isLoading) {
		return (
			<div className="flex flex-col items-center justify-center h-full rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-[#181818] text-brand">
				<Loader2 className="animate-spin" size={32} />
			</div>
		);
	}

	return (
		<div className="flex flex-col h-full rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition-colors duration-300 dark:border-gray-800 dark:bg-[#181818]">
			<div className="flex items-center justify-between mb-6">
				<h2 className="text-2xl font-bold text-text-primary">Journal</h2>
				<span className="text-sm font-medium text-gray-400">
					{new Date().toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
				</span>
			</div>

			<div className="flex-1 flex flex-col gap-6">
				<div className="flex flex-col gap-2">
					<label htmlFor="grateful-input" className="text-sm font-medium text-text-primary">
						What are you grateful for today?
					</label>
					<textarea
						id="grateful-input"
						rows={3}
						value={grateful}
						onChange={(e) => {
							setGrateful(e.target.value);
							setIsSaved(false);
						}}
						placeholder="Write down a few things..."
						className="w-full resize-y rounded-lg border border-gray-300 bg-transparent p-3 text-text-primary placeholder:text-gray-400 focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand dark:border-gray-700 dark:placeholder:text-gray-500 transition-colors"
					/>
				</div>

				<div className="flex flex-col gap-2">
					<label htmlFor="memory-input" className="text-sm font-medium text-text-primary">
						What memory do you want to keep?
					</label>
					<textarea
						id="memory-input"
						rows={3}
						value={memory}
						onChange={(e) => {
							setMemory(e.target.value);
							setIsSaved(false);
						}}
						placeholder="Describe a moment from today..."
						className="w-full resize-y rounded-lg border border-gray-300 bg-transparent p-3 text-text-primary placeholder:text-gray-400 focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand dark:border-gray-700 dark:placeholder:text-gray-500 transition-colors"
					/>
				</div>

				{attachment && (
					<div className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-gray-800">
						<div className="flex items-center gap-3 overflow-hidden">
							{attachment.type === 'image' ? (
								<ImageIcon size={20} className="text-brand shrink-0" />
							) : (
								<FileText size={20} className="text-brand shrink-0" />
							)}
							<span className="text-sm font-medium text-gray-700 dark:text-gray-300 truncate">
								{attachment.name}
							</span>
						</div>
						<button
							type="button"
							onClick={() => {
								setAttachment(undefined);
								setIsSaved(false);
							}}
							className="text-gray-400 hover:text-red-500 transition-colors ml-4"
						>
							<X size={16} />
						</button>
					</div>
				)}
			</div>

			<div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-end items-center">
				<input
					type="file"
					ref={fileInputRef}
					onChange={handleFileChange}
					className="hidden"
					accept="image/*,.pdf,.doc,.docx,.txt"
				/>

				<button
					type="button"
					onClick={() => fileInputRef.current?.click()}
					className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-medium text-text-primary hover:bg-gray-100 dark:border-gray-700 dark:hover:bg-gray-800 transition-colors"
				>
					<Paperclip size={18} />
					<span>{attachment ? "Change file" : "Link files"}</span>
				</button>

				<button
					type="button"
					onClick={handleSave}
					disabled={isSaving || !grateful.trim() || !memory.trim() || isSaved}
					className={`w-full sm:w-auto flex items-center justify-center gap-2 rounded-lg px-5 py-2.5 text-sm font-medium text-white shadow-sm transition-all duration-300 ${isSaved
							? "bg-green-600 hover:bg-green-700"
							: "bg-brand hover:opacity-90 disabled:opacity-50"
						}`}
				>
					{isSaving ? (
						<Loader2 size={18} className="animate-spin" />
					) : isSaved ? (
						<CheckCircle2 size={18} />
					) : (
						<Save size={18} />
					)}
					<span>{isSaving ? "Saving..." : isSaved ? "Saved" : "Save journal"}</span>
				</button>
			</div>
		</div>
	);
}
