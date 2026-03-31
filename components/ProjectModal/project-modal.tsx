"use client";

import { useState } from "react";
import { X } from "lucide-react";
// Assumed import - adjust path as needed
import { createProject } from "../../services/db.service";

interface ProjectModalProps {
	isOpen: boolean;
	onClose: () => void;
}

export default function ProjectModal({ isOpen, onClose }: ProjectModalProps) {
	const [name, setName] = useState("");
	const [description, setDescription] = useState("");
	const [isSubmitting, setIsSubmitting] = useState(false);

	if (!isOpen) return null;

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!name.trim()) return;

		try {
			setIsSubmitting(true);
			await createProject({ name, description, archived: false });

			// Reset form and close
			setName("");
			setDescription("");
			onClose();
		} catch (error) {
			console.error("Failed to create project:", error);
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 transition-opacity">
			<div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-xl dark:bg-[#181818] dark:border dark:border-gray-800">
				<button
					onClick={onClose}
					className="absolute right-4 top-4 text-gray-400 hover:text-text-primary transition-colors"
				>
					<X size={20} />
				</button>

				<h2 className="mb-6 text-2xl font-bold text-text-primary">New Project</h2>

				<form onSubmit={handleSubmit} className="flex flex-col gap-4">
					<div>
						<label htmlFor="name" className="mb-1 block text-sm font-medium text-gray-600 dark:text-gray-300">
							Project Name
						</label>
						<input
							id="name"
							type="text"
							value={name}
							onChange={(e) => setName(e.target.value)}
							placeholder="e.g., Website Redesign"
							className="w-full rounded-lg border border-gray-200 bg-transparent p-3 text-text-primary outline-none focus:border-brand dark:border-gray-700 dark:focus:border-brand"
							required
						/>
					</div>

					<div>
						<label htmlFor="description" className="mb-1 block text-sm font-medium text-gray-600 dark:text-gray-300">
							Description
						</label>
						<textarea
							id="description"
							value={description}
							onChange={(e) => setDescription(e.target.value)}
							placeholder="Briefly describe the project goals..."
							rows={4}
							className="w-full resize-none rounded-lg border border-gray-200 bg-transparent p-3 text-text-primary outline-none focus:border-brand dark:border-gray-700 dark:focus:border-brand"
						/>
					</div>

					<div className="mt-4 flex justify-end gap-3">
						<button
							type="button"
							onClick={onClose}
							className="rounded-lg px-4 py-2 font-medium text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800 transition-colors"
						>
							Cancel
						</button>
						<button
							type="submit"
							disabled={isSubmitting || !name.trim()}
							className="rounded-lg bg-brand px-4 py-2 font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
						>
							{isSubmitting ? "Creating..." : "Create Project"}
						</button>
					</div>
				</form>
			</div>
		</div>
	);
}
