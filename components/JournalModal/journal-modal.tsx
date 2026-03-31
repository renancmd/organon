"use client";

import { useState, useEffect, useRef } from "react";
import { X, Paperclip, Save, Image as ImageIcon, FileText } from "lucide-react";

type JournalEntry = {
	id: string;
	date: string;
	grateful: string;
	memory: string;
	attachment?: { type: 'image' | 'file'; url: string; name: string };
};

interface JournalModalProps {
	isOpen: boolean;
	entryToEdit: JournalEntry | null; // NEW: Accept an entry to edit
	onClose: () => void;
	onSave: (entry: Omit<JournalEntry, "id">) => void;
}

export default function JournalModal({ isOpen, entryToEdit, onClose, onSave }: JournalModalProps) {
	const [date, setDate] = useState("");
	const [grateful, setGrateful] = useState("");
	const [memory, setMemory] = useState("");
	const [attachment, setAttachment] = useState<{ type: 'image' | 'file'; url: string; name: string } | undefined>();

	const fileInputRef = useRef<HTMLInputElement>(null);

	// NEW: Populate form if editing, otherwise reset
	useEffect(() => {
		if (isOpen) {
			if (entryToEdit) {
				setDate(entryToEdit.date);
				setGrateful(entryToEdit.grateful);
				setMemory(entryToEdit.memory);
				setAttachment(entryToEdit.attachment);
			} else {
				setDate(new Date().toISOString().split('T')[0]);
				setGrateful("");
				setMemory("");
				setAttachment(undefined);
			}
		}
	}, [isOpen, entryToEdit]);

	if (!isOpen) return null;

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
		}
	};

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (!grateful.trim() || !memory.trim() || !date) return;

		onSave({
			date,
			grateful,
			memory,
			attachment
		});
		onClose();
	};

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 transition-opacity">
			<div className="relative w-full max-w-2xl rounded-2xl bg-white p-6 md:p-8 shadow-xl dark:bg-[#181818] dark:border dark:border-gray-800">
				<button
					onClick={onClose}
					className="absolute right-4 top-4 text-gray-400 hover:text-text-primary transition-colors"
				>
					<X size={20} />
				</button>

				{/* NEW: Dynamic Title */}
				<h2 className="mb-6 text-2xl font-bold text-text-primary font-serif">
					{entryToEdit ? "Edit Journal Entry" : "New Journal Entry"}
				</h2>

				<form onSubmit={handleSubmit} className="flex flex-col gap-6">
					<div className="flex flex-col gap-2">
						<label className="text-sm font-medium text-text-primary uppercase tracking-widest text-gray-500">
							Entry Date
						</label>
						<input
							type="date"
							value={date}
							onChange={(e) => setDate(e.target.value)}
							disabled={!!entryToEdit} // NEW: Disable date if editing
							className="w-full md:w-fit rounded-lg border border-gray-300 bg-transparent p-3 text-text-primary focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand dark:border-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
							required
						/>
					</div>

					<div className="flex flex-col gap-2">
						<label className="text-sm font-bold text-text-primary uppercase tracking-widest text-gray-400">
							What are you grateful for today?
						</label>
						<textarea
							rows={3}
							value={grateful}
							onChange={(e) => setGrateful(e.target.value)}
							className="w-full resize-y rounded-lg border border-gray-300 bg-transparent p-3 text-text-primary font-serif placeholder:font-sans placeholder:text-gray-400 focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand dark:border-gray-700 dark:placeholder:text-gray-500 transition-colors"
							required
						/>
					</div>

					<div className="flex flex-col gap-2">
						<label className="text-sm font-bold text-text-primary uppercase tracking-widest text-gray-400">
							What memory do you want to keep?
						</label>
						<textarea
							rows={4}
							value={memory}
							onChange={(e) => setMemory(e.target.value)}
							className="w-full resize-y rounded-lg border border-gray-300 bg-transparent p-3 text-text-primary font-serif placeholder:font-sans placeholder:text-gray-400 focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand dark:border-gray-700 dark:placeholder:text-gray-500 transition-colors"
							required
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
								onClick={() => setAttachment(undefined)}
								className="text-gray-400 hover:text-red-500 transition-colors ml-4"
							>
								<X size={16} />
							</button>
						</div>
					)}

					<div className="mt-4 flex flex-col gap-3 sm:flex-row sm:justify-between items-center pt-4 border-t border-gray-100 dark:border-gray-800">
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
							className="flex w-full sm:w-auto items-center justify-center gap-2 rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-medium text-text-primary hover:bg-gray-100 dark:border-gray-700 dark:hover:bg-gray-800 transition-colors"
						>
							<Paperclip size={18} />
							<span>{attachment ? "Change File" : "Attach Photo/File"}</span>
						</button>

						<div className="flex gap-3 w-full sm:w-auto">
							<button
								type="button"
								onClick={onClose}
								className="w-full sm:w-auto rounded-lg px-4 py-2 font-medium text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800 transition-colors"
							>
								Cancel
							</button>
							<button
								type="submit"
								disabled={!grateful.trim() || !memory.trim()}
								className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-lg bg-brand px-6 py-2.5 text-sm font-medium text-white shadow-sm hover:opacity-90 disabled:opacity-50 transition-opacity"
							>
								<Save size={18} />
								<span>Save Entry</span>
							</button>
						</div>
					</div>
				</form>
			</div>
		</div>
	);
}
