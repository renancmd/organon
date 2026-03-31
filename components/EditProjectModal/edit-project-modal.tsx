"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";
// Assumed imports - adjust paths as needed
import { getProjectById, updateProject, deleteProject } from "../../services/db.service";

interface EditProjectModalProps {
	isOpen: boolean;
	projectId: string | null;
	onClose: () => void;
}

export default function EditProjectModal({ isOpen, projectId, onClose }: EditProjectModalProps) {
	const [name, setName] = useState("");
	const [description, setDescription] = useState("");
	const [archived, setArchived] = useState(false);

	const [isLoading, setIsLoading] = useState(false);
	const [isSubmitting, setIsSubmitting] = useState(false);

	// Fetch existing project data when modal opens
	useEffect(() => {
		if (!isOpen || !projectId) return;

		const fetchProject = async () => {
			setIsLoading(true);
			try {
				const project = await getProjectById(projectId);
				if (project) {
					setName(project.name || "");
					setDescription(project.description || "");
					setArchived(project.archived || false);
				}
			} catch (error) {
				console.error("Failed to load project details:", error);
			} finally {
				setIsLoading(false);
			}
		};

		fetchProject();
	}, [isOpen, projectId]);

	if (!isOpen) return null;

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!name.trim() || !projectId) return;

		try {
			setIsSubmitting(true);
			await updateProject(projectId, { name, description, archived });
			onClose();
		} catch (error) {
			console.error("Failed to update project:", error);
		} finally {
			setIsSubmitting(false);
		}
	};

	const handleDelete = async () => {
		if (!projectId) return;

		const confirmDelete = window.confirm("Are you sure you want to delete this project? This action cannot be undone.");
		if (!confirmDelete) return;

		try {
			setIsSubmitting(true);
			await deleteProject(projectId);
			onClose();
		} catch (error) {
			console.error("Failed to delete project:", error);
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

				<h2 className="mb-6 text-2xl font-bold text-text-primary">Edit Project</h2>

				{isLoading ? (
					<div className="py-8 text-center text-gray-500">Loading details...</div>
				) : (
					<form onSubmit={handleSubmit} className="flex flex-col gap-4">
						<div>
							<label htmlFor="edit-name" className="mb-1 block text-sm font-medium text-gray-600 dark:text-gray-300">
								Project Name
							</label>
							<input
								id="edit-name"
								type="text"
								value={name}
								onChange={(e) => setName(e.target.value)}
								className="w-full rounded-lg border border-gray-200 bg-transparent p-3 text-text-primary outline-none focus:border-brand dark:border-gray-700 dark:focus:border-brand"
								required
							/>
						</div>

						<div>
							<label htmlFor="edit-description" className="mb-1 block text-sm font-medium text-gray-600 dark:text-gray-300">
								Description
							</label>
							<textarea
								id="edit-description"
								value={description}
								onChange={(e) => setDescription(e.target.value)}
								rows={4}
								className="w-full resize-none rounded-lg border border-gray-200 bg-transparent p-3 text-text-primary outline-none focus:border-brand dark:border-gray-700 dark:focus:border-brand"
							/>
						</div>

						<div className="flex items-center gap-2 mt-2">
							<input
								id="archived-toggle"
								type="checkbox"
								checked={archived}
								onChange={(e) => setArchived(e.target.checked)}
								className="h-4 w-4 rounded border-gray-300 text-brand focus:ring-brand"
							/>
							<label htmlFor="archived-toggle" className="text-sm font-medium text-gray-600 dark:text-gray-300 cursor-pointer">
								Archive this project
							</label>
						</div>

						<div className="mt-4 flex items-center justify-between">
							<button
								type="button"
								onClick={handleDelete}
								disabled={isSubmitting}
								className="text-sm font-medium text-red-500 hover:text-red-600 transition-colors disabled:opacity-50"
							>
								Delete Project
							</button>

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
									disabled={isSubmitting || !name.trim()}
									className="rounded-lg bg-brand px-4 py-2 font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
								>
									{isSubmitting ? "Saving..." : "Save Changes"}
								</button>
							</div>
						</div>
					</form>
				)}
			</div>
		</div>
	);
}
