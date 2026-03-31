"use client";

import { useAuth } from "../../../providers/auth-provider";
import { useState, useEffect } from "react";
// Assumed paths based on previous request - adjust as needed
import { getProjects } from "../../../services/db.service";
import ProjectModal from "../../../components/ProjectModal/project-modal";
import EditProjectModal from "../../../components/EditProjectModal/edit-project-modal";
import { ChevronDown, ChevronRight, Edit2 } from "lucide-react";
import "../../globals.css";
// IMPORT NEXT/NAVIGATION
import { useRouter } from "next/navigation";

// Define the Project type based on your requirements
export type Project = {
	id: string;
	name: string;
	description: string;
	archived: boolean;
	createdAt: string;
};

export default function Projects() {
	const { user } = useAuth();
	// INITIALIZE ROUTER
	const router = useRouter();

	// Modal states
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [editingProjectId, setEditingProjectId] = useState<string | null>(null);
	const [isArchivedOpen, setIsArchivedOpen] = useState(false);

	// Data states
	const [allProjects, setAllProjects] = useState<Project[]>([]);
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		if (!user) return;

		const fetchData = async () => {
			try {
				setIsLoading(true);
				// Fetch projects from your DB service
				const projectsData = await getProjects();

				// Map data if needed, similar to your ToDo component
				const mappedProjects: Project[] = (projectsData as Project[]).map((proj) => ({
					id: proj.id,
					name: proj.name || "Untitled Project",
					description: proj.description || "No description provided.",
					archived: proj.archived || false,
					createdAt: proj.createdAt,
				}));

				setAllProjects(mappedProjects);
			} catch (error) {
				console.error("Failed to fetch projects:", error);
			} finally {
				setIsLoading(false);
			}
		};

		fetchData();
	}, [user, isModalOpen, editingProjectId]);

	if (!user) {
		return <h1>You need to be logged in to access this page</h1>;
	}

	// Separate active and archived projects
	const activeProjects = allProjects.filter(project => !project.archived);
	const archivedProjects = allProjects.filter(project => project.archived);

	return (
		<div className="w-full pt-8 pb-12">
			{/* Top Action Bar */}
			<div className="mx-auto flex w-full max-w-7xl justify-end px-6 mb-4 md:px-8">
				<button
					onClick={() => setIsModalOpen(true)}
					className="cursor-pointer rounded-lg bg-brand px-4 py-2 font-semibold text-white shadow-sm transition-opacity hover:opacity-90"
				>
					+ New Project
				</button>
			</div>

			{/* Active Projects Grid */}
			<div className="mx-auto w-full max-w-7xl px-6 md:px-8">
				<div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
					{isLoading ? (
						<p className="col-span-full mt-8 text-center text-gray-500">
							Loading your projects...
						</p>
					) : activeProjects.length > 0 ? (
						activeProjects.map((project) => (
							<div
								key={project.id}
								// WRAP CARD CONTENT IN A CLICKABLE DIV FOR NAVIGATION
								onClick={() => router.push(`/projects/${project.id}`)}
								className="group relative flex flex-col justify-between cursor-pointer rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition-all hover:shadow-md dark:border-gray-800 dark:bg-[#181818]"
							>
								<div>
									<div className="flex items-start justify-between mb-2">
										<h3 className="text-xl font-bold text-text-primary line-clamp-1 group-hover:text-brand transition-colors">
											{project.name}
										</h3>
										<button
											// ADD E.STOPPROPAGATION TO THE EDIT BUTTON to prevent navigation when clicking Edit
											onClick={(e) => {
												e.stopPropagation();
												setEditingProjectId(project.id)
											}}
											className="text-gray-400 hover:text-brand transition-colors z-10"
											aria-label="Edit project"
										>
											<Edit2 size={18} />
										</button>
									</div>
									<p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-3">
										{project.description}
									</p>
								</div>
								<div className="mt-6 text-xs text-gray-400">
									Created: {new Date(project.createdAt).toLocaleDateString()}
								</div>
							</div>
						))
					) : (
						<p className="col-span-full mt-8 text-center italic text-gray-500">
							No active projects found. Click "+ New Project" to get started!
						</p>
					)}
				</div>
			</div>

			{/* Archived/Completed Projects Section */}
			{!isLoading && archivedProjects.length > 0 && (
				<div className="mx-auto w-full max-w-7xl px-6 md:px-8 mt-12">
					<div className="border-t border-gray-200 dark:border-gray-800 pt-6">
						<button
							onClick={() => setIsArchivedOpen(!isArchivedOpen)}
							className="flex items-center gap-2 text-lg font-bold text-gray-600 hover:text-text-primary dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
						>
							{isArchivedOpen ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
							Archived Projects ({archivedProjects.length})
						</button>

						{isArchivedOpen && (
							<div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 opacity-75">
								{archivedProjects.map((project) => (
									<div
										key={project.id}
										// WRAP ARCHIVED CARD CONTENT IN A CLICKABLE DIV
										onClick={() => router.push(`/projects/${project.id}`)}
										className="cursor-pointer group relative flex flex-col justify-between rounded-xl border border-gray-200 bg-gray-50 p-6 shadow-sm transition-all hover:shadow-md dark:border-gray-800 dark:bg-black"
									>
										<div>
											<div className="flex items-start justify-between mb-2">
												<h3 className="text-lg font-bold text-text-primary line-clamp-1 group-hover:text-brand transition-colors">
													{project.name}
												</h3>
												<button
													// ADD E.STOPPROPAGATION
													onClick={(e) => {
														e.stopPropagation();
														setEditingProjectId(project.id)
													}}
													className="text-gray-400 hover:text-brand transition-colors z-10"
												>
													<Edit2 size={16} />
												</button>
											</div>
											<p className="text-gray-500 dark:text-gray-500 text-sm line-clamp-2">
												{project.description}
											</p>
										</div>
									</div>
								))}
							</div>
						)}
					</div>
				</div>
			)}

			{/* Modals */}
			<ProjectModal
				isOpen={isModalOpen}
				onClose={() => setIsModalOpen(false)}
			/>

			<EditProjectModal
				isOpen={!!editingProjectId}
				projectId={editingProjectId}
				onClose={() => setEditingProjectId(null)}
			/>
		</div>
	);
}
