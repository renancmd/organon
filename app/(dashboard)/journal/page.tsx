"use client";

import { useAuth } from "../../../providers/auth-provider";
import { useState, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, FileText, Plus, Loader2, Edit2, Trash2 } from "lucide-react";
import "../../globals.css";
import JournalModal from "../../../components/JournalModal/journal-modal";
import { getJournalEntries, createJournalEntry, deleteJournalEntry } from "../../../services/db.service";

export type JournalEntry = {
	id: string;
	date: string;
	grateful: string;
	memory: string;
	attachment?: { type: 'image' | 'file'; url: string; name: string };
};

export default function Journal() {
	const { user } = useAuth();

	const [entries, setEntries] = useState<JournalEntry[]>([]);
	const [currentIndex, setCurrentIndex] = useState(0);
	const [isFlipping, setIsFlipping] = useState(false);
	const [searchDate, setSearchDate] = useState("");

	const [isModalOpen, setIsModalOpen] = useState(false);
	const [entryToEdit, setEntryToEdit] = useState<JournalEntry | null>(null);
	const [isLoading, setIsLoading] = useState(true);

	const fetchEntriesData = useCallback(async () => {
		try {
			setIsLoading(true);
			const data = await getJournalEntries() as JournalEntry[];

			const sortedData = data.sort((a, b) =>
				new Date(a.date).getTime() - new Date(b.date).getTime()
			);

			setEntries(sortedData);

			if (sortedData.length > 0) {
				const lastIndex = sortedData.length - 1;
				setCurrentIndex(lastIndex % 2 === 0 ? lastIndex : lastIndex - 1);
			}
		} catch (error) {
			console.error("Failed to fetch journal entries:", error);
		} finally {
			setIsLoading(false);
		}
	}, []);

	useEffect(() => {
		if (user) fetchEntriesData();
	}, [user, fetchEntriesData]);

	const handleSaveEntry = async (newEntryData: Omit<JournalEntry, "id">) => {
		try {
			await createJournalEntry(newEntryData);

			const updatedData = await getJournalEntries() as JournalEntry[];
			const sortedData = updatedData.sort((a, b) =>
				new Date(a.date).getTime() - new Date(b.date).getTime()
			);
			setEntries(sortedData);

			const newIndex = sortedData.findIndex(e => e.date === newEntryData.date);
			const targetPageIndex = newIndex % 2 === 0 ? newIndex : newIndex - 1;

			setTimeout(() => triggerPageTurn(Math.max(0, targetPageIndex)), 100);
		} catch (error) {
			console.error("Failed to save journal entry:", error);
		}
	};

	const handleDeleteEntry = async (dateId: string) => {
		const confirmDelete = window.confirm("Are you sure you want to delete this journal entry? This cannot be undone.");
		if (!confirmDelete) return;

		try {
			await deleteJournalEntry(dateId);

			const updatedEntries = entries.filter(e => e.date !== dateId);
			setEntries(updatedEntries);

			if (updatedEntries.length === 0) {
				setCurrentIndex(0);
			} else if (currentIndex >= updatedEntries.length) {
				const lastIndex = updatedEntries.length - 1;
				setCurrentIndex(lastIndex % 2 === 0 ? lastIndex : lastIndex - 1);
			}
		} catch (error) {
			console.error("Failed to delete journal entry:", error);
		}
	};

	const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
		const dateStr = e.target.value;
		setSearchDate(dateStr);

		if (dateStr) {
			const foundIndex = entries.findIndex(entry => entry.date === dateStr);
			if (foundIndex !== -1) {
				triggerPageTurn(foundIndex % 2 === 0 ? foundIndex : foundIndex - 1);
			}
		}
	};

	const triggerPageTurn = (newIndex: number) => {
		if (newIndex === currentIndex) return;
		setIsFlipping(true);
		setTimeout(() => {
			setCurrentIndex(newIndex);
			setIsFlipping(false);
		}, 300);
	};

	const handleNext = () => {
		if (currentIndex + 2 < entries.length) triggerPageTurn(currentIndex + 2);
	};

	const handlePrev = () => {
		if (currentIndex - 2 >= 0) triggerPageTurn(currentIndex - 2);
	};

	const openNewModal = () => {
		setEntryToEdit(null);
		setIsModalOpen(true);
	};

	const openEditModal = (entry: JournalEntry) => {
		setEntryToEdit(entry);
		setIsModalOpen(true);
	};

	if (!user) return <h1>You need to be logged in to access this page</h1>;

	const leftEntry = entries[currentIndex];
	const rightEntry = entries[currentIndex + 1];

	return (
		<div className="w-full min-h-screen pt-8 pb-12 flex flex-col items-center">

			<div className="w-full max-w-6xl px-6 flex flex-col md:flex-row justify-between items-center mb-10 gap-4">
				<div className="flex items-center gap-4">
					<h1 className="text-3xl font-black text-text-primary flex items-center gap-2">
						<FileText className="text-brand" size={28} />
						My Journal
					</h1>
					{isLoading && <Loader2 className="animate-spin text-brand" size={24} />}
				</div>

				<div className="flex items-center gap-4">
					<div className="flex items-center gap-2 bg-white dark:bg-[#181818] border border-gray-200 dark:border-gray-800 rounded-lg p-2 shadow-sm">
						<CalendarIcon size={18} className="text-gray-400 ml-2" />
						<input
							type="date"
							value={searchDate}
							onChange={handleSearch}
							className="bg-transparent border-none outline-none text-sm text-text-primary cursor-pointer px-2"
						/>
					</div>

					<button
						onClick={openNewModal}
						className="flex items-center gap-2 rounded-lg bg-brand px-4 py-2 font-semibold text-white shadow-sm transition-opacity hover:opacity-90"
					>
						<Plus size={18} /> New Entry
					</button>
				</div>
			</div>

			<div className="relative w-full max-w-6xl px-6 flex justify-center perspective-[1500px]">

				<button
					onClick={handlePrev}
					disabled={currentIndex === 0}
					className="absolute left-0 lg:-left-12 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white dark:bg-[#181818] shadow-md border border-gray-200 dark:border-gray-800 text-gray-500 hover:text-brand disabled:opacity-30 disabled:hover:text-gray-500 transition-colors z-10"
				>
					<ChevronLeft size={24} />
				</button>

				<button
					onClick={handleNext}
					disabled={currentIndex + 2 >= entries.length}
					className="absolute right-0 lg:-right-12 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white dark:bg-[#181818] shadow-md border border-gray-200 dark:border-gray-800 text-gray-500 hover:text-brand disabled:opacity-30 disabled:hover:text-gray-500 transition-colors z-10"
				>
					<ChevronRight size={24} />
				</button>

				<div className="flex w-full aspect-[4/3] lg:aspect-[16/9] max-h-[900px] shadow-2xl rounded-sm rounded-r-2xl rounded-l-2xl overflow-hidden bg-[#faf8f5] dark:bg-[#1e1e1e] border-8 border-[#e6e2da] dark:border-[#111]">

					<div className="w-1/2 h-full border-r border-black/10 dark:border-black/50 shadow-[inset_-15px_0_20px_-15px_rgba(0,0,0,0.1)] dark:shadow-[inset_-15px_0_20px_-15px_rgba(0,0,0,0.5)] flex flex-col p-8 md:p-12 lg:p-16 relative group">
						<div className={`h-full w-full transition-all duration-300 ease-in-out ${isFlipping ? 'opacity-0 scale-95 translate-x-4' : 'opacity-100 scale-100 translate-x-0'}`}>
							{isLoading ? (
								<div className="flex items-center justify-center h-full text-gray-500 italic px-2">Loading journal...</div>
							) : leftEntry ? (
								<EntryContent
									entry={leftEntry}
									onEdit={() => openEditModal(leftEntry)}
									onDelete={() => handleDeleteEntry(leftEntry.date)}
								/>
							) : (
								<EmptyPage />
							)}
						</div>
						<div className="absolute bottom-6 left-8 text-xs text-gray-400 font-serif">{currentIndex + 1}</div>
					</div>

					<div className="w-1/2 h-full border-l border-white/50 dark:border-white/5 shadow-[inset_15px_0_20px_-15px_rgba(0,0,0,0.05)] dark:shadow-[inset_15px_0_20px_-15px_rgba(0,0,0,0.3)] flex flex-col p-8 md:p-12 lg:p-16 relative group">
						<div className={`h-full w-full transition-all duration-300 ease-in-out ${isFlipping ? 'opacity-0 scale-95 -translate-x-4' : 'opacity-100 scale-100 translate-x-0'}`}>
							{isLoading ? (
								<div className="flex items-center justify-center h-full text-gray-500 italic px-2">Loading journal...</div>
							) : rightEntry ? (
								<EntryContent
									entry={rightEntry}
									onEdit={() => openEditModal(rightEntry)}
									onDelete={() => handleDeleteEntry(rightEntry.date)}
								/>
							) : (
								<EmptyPage />
							)}
						</div>
						<div className="absolute bottom-6 right-8 text-xs text-gray-400 font-serif">{currentIndex + 2}</div>
					</div>

				</div>
			</div>

			<JournalModal
				isOpen={isModalOpen}
				entryToEdit={entryToEdit}
				onClose={() => setIsModalOpen(false)}
				onSave={handleSaveEntry}
			/>
		</div>
	);
}

function EntryContent({ entry, onEdit, onDelete }: { entry: JournalEntry, onEdit: () => void, onDelete: () => void }) {
	const formattedDate = new Date(entry.date + 'T12:00:00Z').toLocaleDateString(undefined, {
		year: 'numeric',
		month: '2-digit',
		day: '2-digit'
	});

	return (
		<div className="flex flex-col h-full text-text-primary relative">
			<div className="flex items-center justify-between border-b-2 border-brand/20 pb-4 mb-6 lg:mb-8 shrink-0">
				<h2 className="text-xl md:text-2xl lg:text-3xl font-black font-serif text-brand">
					{formattedDate}
				</h2>
				<div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
					<button
						onClick={onEdit}
						className="p-2 text-gray-400 hover:text-brand hover:bg-brand/10 rounded-lg transition-colors"
						title="Edit Entry"
					>
						<Edit2 size={20} />
					</button>
					<button
						onClick={onDelete}
						className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
						title="Delete Entry"
					>
						<Trash2 size={20} />
					</button>
				</div>
			</div>

			<div className="flex-1 flex flex-col gap-6 lg:gap-8 overflow-y-auto scrollbar-hide pr-2 pb-8">
				<section>
					<h3 className="text-sm lg:text-base font-bold uppercase tracking-widest text-gray-400 mb-2 lg:mb-3">What are you grateful for today?</h3>
					<p className="text-base md:text-lg lg:text-xl leading-relaxed font-serif text-gray-700 dark:text-gray-300 break-words whitespace-pre-wrap">
						{entry.grateful}
					</p>
				</section>

				<section>
					<h3 className="text-sm lg:text-base font-bold uppercase tracking-widest text-gray-400 mb-2 lg:mb-3">What memory do you want to keep?</h3>
					<p className="text-base md:text-lg lg:text-xl leading-relaxed font-serif text-gray-700 dark:text-gray-300 break-words whitespace-pre-wrap">
						{entry.memory}
					</p>
				</section>

				{entry.attachment && (
					<section className="mt-6 border-t border-gray-200 dark:border-gray-800 pt-6">
						{entry.attachment.type === 'image' ? (
							<div className="rounded-lg overflow-hidden border border-gray-200 dark:border-gray-800 shadow-sm relative group cursor-pointer bg-black/5 dark:bg-white/5">
								<img
									src={entry.attachment.url}
									alt={entry.attachment.name}
									className="w-full h-auto max-h-64 object-cover"
								/>
							</div>
						) : (
							<div className="inline-flex items-center gap-3 p-3 rounded-lg bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 hover:bg-brand/10 hover:border-brand/30 transition-colors cursor-pointer">
								<FileText size={20} className="text-brand" />
								<span className="text-sm lg:text-base font-medium text-gray-600 dark:text-gray-400">
									{entry.attachment.name}
								</span>
							</div>
						)}
					</section>
				)}
			</div>
		</div>
	);
}

function EmptyPage() {
	return (
		<div className="flex flex-col items-center justify-center h-full opacity-30">
			<div className="w-16 h-1 bg-gray-300 dark:bg-gray-700 rounded-full mb-4" />
			<p className="font-serif italic text-gray-500 text-lg">Blank Page</p>
		</div>
	);
}
