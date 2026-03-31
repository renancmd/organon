"use client";

import { useAuth } from "../../../../providers/auth-provider";
import { useState, useEffect } from "react";
import { getProjectById, updateProject } from "../../../../services/db.service";
import { ArrowLeft, Edit2, Calendar, CheckCircle2, Circle, Plus, Trash2, X, Trophy } from "lucide-react";
import "../../../globals.css";
import { useParams } from "next/navigation";
import Link from "next/link";

export default function ProjectDetail() {
	const { user } = useAuth();
	const { projectId } = useParams() as { projectId: string };

	const [project, setProject] = useState<any>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [isEditing, setIsEditing] = useState(false);

	useEffect(() => {
		if (!user || !projectId) return;
		fetchData();
	}, [user, projectId]);

	const fetchData = async () => {
		try {
			setIsLoading(true);
			const data = await getProjectById(projectId);
			setProject(data);
		} catch (error) {
			console.error(error);
		} finally {
			setIsLoading(false);
		}
	};

	const saveToDB = async (updatedProject: any) => {
		setProject(updatedProject);
		await updateProject(projectId, updatedProject);
	};

	const calculateProgress = () => {
		if (!project?.objectives) return 0;
		const allGoals = project.objectives.flatMap((obj: any) => obj.goals || []);
		if (allGoals.length === 0) return 0;
		const completed = allGoals.filter((g: any) => g.done).length;
		return Math.round((completed / allGoals.length) * 100);
	};

	const progress = calculateProgress();

	// --- Actions ---
	const addObjective = () => {
		const newObj = { name: "New Objective", deadline: "", goals: [] };
		saveToDB({ ...project, objectives: [...(project.objectives || []), newObj] });
	};

	const addGoal = (objIndex: number) => {
		const newGoal = { id: `g-${Date.now()}`, name: "New Goal", done: false, deadline: "" };
		const updated = [...project.objectives];
		updated[objIndex].goals.push(newGoal);
		saveToDB({ ...project, objectives: updated });
	};

	const toggleGoal = (objIndex: number, goalIndex: number) => {
		const updated = [...project.objectives];
		updated[objIndex].goals[goalIndex].done = !updated[objIndex].goals[goalIndex].done;
		saveToDB({ ...project, objectives: updated });
	};

	if (isLoading) return <div className="p-8 text-center text-gray-500">Loading project...</div>;
	if (!project) return <div className="p-8 text-center">Project not found.</div>;

	return (
		<div className="w-full pt-8 pb-12">
			<div className="mx-auto flex w-full max-w-7xl items-center justify-between px-6 mb-8 md:px-8">
				<Link href="/projects" className="flex items-center gap-2 text-gray-500 hover:text-brand transition-colors">
					<ArrowLeft size={20} /> Back
				</Link>

				<button
					onClick={() => setIsEditing(!isEditing)}
					className={`flex items-center gap-2 rounded-lg px-4 py-2 font-semibold transition-all ${isEditing ? "bg-green-600 text-white" : "bg-brand text-white"}`}
				>
					{isEditing ? <CheckCircle2 size={18} /> : <Edit2 size={18} />}
					{isEditing ? "Save & Close" : "Edit Structure"}
				</button>
			</div>

			<div className="mx-auto w-full max-w-4xl px-6 md:px-8 flex flex-col gap-8">
				{/* PROJECT HEADER */}
				<div className="border border-gray-200 rounded-2xl bg-white p-8 dark:border-gray-800 dark:bg-[#181818] shadow-sm">
					{isEditing ? (
						<div className="space-y-4">
							<input
								className="text-3xl font-bold bg-transparent border-b border-brand w-full outline-none text-text-primary"
								value={project.name}
								onChange={(e) => saveToDB({ ...project, name: e.target.value })}
							/>
							<textarea
								className="w-full bg-transparent border border-gray-200 dark:border-gray-700 rounded-lg p-3 outline-none text-gray-600 dark:text-gray-300"
								value={project.description}
								onChange={(e) => saveToDB({ ...project, description: e.target.value })}
							/>
							<div className="flex items-center gap-2 text-sm text-gray-500">
								<Calendar size={16} />
								<span>Project Deadline:</span>
								<input
									type="date"
									className="bg-transparent border-b border-gray-300 dark:border-gray-700 outline-none p-1"
									value={project.deadline || ""}
									onChange={(e) => saveToDB({ ...project, deadline: e.target.value })}
								/>
							</div>
						</div>
					) : (
						<div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
							<div className="flex-1">
								<h1 className="text-4xl font-black text-text-primary">{project.name}</h1>
								<p className="text-gray-500 mt-2 leading-relaxed">{project.description}</p>
								{project.deadline && (
									<div className="mt-4 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-orange-500">
										<Calendar size={14} /> Due: {new Date(project.deadline).toLocaleDateString()}
									</div>
								)}
							</div>
							{progress === 100 && (
								<div className="flex items-center gap-2 text-yellow-500 font-bold bg-yellow-50 dark:bg-yellow-900/20 px-4 py-2 rounded-xl border border-yellow-200 dark:border-yellow-700/50 animate-bounce">
									<Trophy size={20} /> Project Complete!
								</div>
							)}
						</div>
					)}

					{/* PROGRESS BAR */}
					<div className="mt-8">
						<div className="flex justify-between items-end mb-2">
							<span className="text-xs font-bold uppercase tracking-widest text-gray-400">Project Completion</span>
							<span className="text-sm font-black text-brand">{progress}%</span>
						</div>
						<div className="h-3 w-full bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
							<div
								className="h-full bg-brand transition-all duration-500 ease-out"
								style={{ width: `${progress}%` }}
							/>
						</div>
					</div>
				</div>

				{/* ROADMAP / OBJECTIVES */}
				<div className="space-y-6">
					<div className="flex items-center justify-between">
						<h2 className="text-xl font-bold text-text-primary">Roadmap</h2>
						{isEditing && (
							<button onClick={addObjective} className="flex items-center gap-1 text-sm font-bold text-brand hover:underline">
								<Plus size={16} /> Add Objective
							</button>
						)}
					</div>

					{project.objectives?.map((obj: any, objIdx: number) => (
						<div key={objIdx} className="bg-white dark:bg-[#181818] border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden shadow-sm">
							<div className="bg-gray-50 dark:bg-black/20 p-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
								<div className="flex flex-1 items-center gap-4">
									{isEditing ? (
										<div className="flex flex-col flex-1 gap-2">
											<input
												className="font-bold bg-transparent border-b border-brand outline-none w-full"
												value={obj.name}
												onChange={(e) => {
													const updated = [...project.objectives];
													updated[objIdx].name = e.target.value;
													saveToDB({ ...project, objectives: updated });
												}}
											/>
											<div className="flex items-center gap-2 text-xs text-gray-400">
												<Calendar size={12} />
												<input
													type="date"
													className="bg-transparent border border-gray-200 dark:border-gray-700 rounded px-1"
													value={obj.deadline || ""}
													onChange={(e) => {
														const updated = [...project.objectives];
														updated[objIdx].deadline = e.target.value;
														saveToDB({ ...project, objectives: updated });
													}}
												/>
											</div>
										</div>
									) : (
										<div>
											<h3 className="font-bold text-text-primary">{obj.name}</h3>
											{obj.deadline && <p className="text-[10px] text-gray-400 uppercase font-bold">Ends: {new Date(obj.deadline).toLocaleDateString()}</p>}
										</div>
									)}
								</div>
								{isEditing && (
									<button onClick={() => {
										const updated = project.objectives.filter((_: any, i: number) => i !== objIdx);
										saveToDB({ ...project, objectives: updated });
									}} className="text-red-400 hover:text-red-600 transition-colors ml-4">
										<Trash2 size={18} />
									</button>
								)}
							</div>

							{/* GOALS */}
							<div className="p-4 space-y-4">
								{obj.goals?.map((goal: any, goalIdx: number) => (
									<div key={goal.id || goalIdx} className="flex items-center justify-between group">
										<div className="flex items-center gap-3 flex-1">
											<button onClick={() => toggleGoal(objIdx, goalIdx)} className="transition-transform active:scale-90">
												{goal.done ? <CheckCircle2 size={20} className="text-brand" /> : <Circle size={20} className="text-gray-300" />}
											</button>

											<div className="flex flex-col flex-1">
												{isEditing ? (
													<div className="flex flex-col gap-1">
														<input
															className="text-sm bg-transparent border-b border-gray-100 dark:border-gray-800 outline-none w-full"
															value={goal.name}
															onChange={(e) => {
																const updated = [...project.objectives];
																updated[objIdx].goals[goalIdx].name = e.target.value;
																saveToDB({ ...project, objectives: updated });
															}}
														/>
														<input
															type="date"
															className="text-[10px] text-gray-400 bg-transparent outline-none w-fit"
															value={goal.deadline || ""}
															onChange={(e) => {
																const updated = [...project.objectives];
																updated[objIdx].goals[goalIdx].deadline = e.target.value;
																saveToDB({ ...project, objectives: updated });
															}}
														/>
													</div>
												) : (
													<>
														<span className={`text-sm ${goal.done ? 'line-through text-gray-400' : 'text-gray-700 dark:text-gray-300'}`}>
															{goal.name}
														</span>
														{goal.deadline && <span className="text-[10px] text-gray-400 italic">By {new Date(goal.deadline).toLocaleDateString()}</span>}
													</>
												)}
											</div>
										</div>
										{isEditing && (
											<button onClick={() => {
												const updated = [...project.objectives];
												updated[objIdx].goals.splice(goalIdx, 1);
												saveToDB({ ...project, objectives: updated });
											}} className="text-gray-300 hover:text-red-500 transition-colors">
												<X size={14} />
											</button>
										)}
									</div>
								))}
								{isEditing && (
									<button
										onClick={() => addGoal(objIdx)}
										className="mt-2 flex items-center gap-1 text-xs text-brand font-bold opacity-70 hover:opacity-100 transition-opacity"
									>
										<Plus size={14} /> New Goal
									</button>
								)}
							</div>
						</div>
					))}
				</div>
			</div>
		</div>
	);
}
