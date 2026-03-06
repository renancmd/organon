"use client";

import { User, Mail, Camera, Edit2, Check, LogOut, Trash2 } from "lucide-react";
import { useState, useEffect } from "react";
import { getProfile, updateEmail } from "../../services/db.service";
import { logout } from "../../services/auth.service";

export default function ProfileCard() {
	const [email, setEmail] = useState<string>("");
	const [name, setName] = useState<string>("");

	useEffect(() => {
		getProfile()
			.then((profile) => {
				// Only update state if a valid profile was returned
				if (profile) {
					setEmail(profile.email);
					setName(profile.name);
				}
			})
			.catch((error) => {
				console.error("Error fetching profile:", error);
			});
	}, []);

	const handleLogout = () => {
		logout();
	}

	return (
		<div className="mx-auto w-full max-w-4xl p-6 md:p-8">

			<div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition-colors duration-300 dark:border-gray-800 dark:bg-[#1a1a1a]">

				<h1 className="mb-8 text-2xl font-bold text-text-primary dark:text-white">Profile Settings</h1>

				<div className="flex flex-col gap-8 md:flex-row md:items-start md:gap-12">

					<div className="flex flex-col items-center gap-4">
						<div className="relative flex h-32 w-32 items-center justify-center rounded-full bg-gray-100 border-4 border-white shadow-md dark:border-gray-800 dark:bg-gray-800">
							<User size={64} className="text-gray-400 dark:text-gray-500" />

							<button
								className="absolute bottom-0 right-0 flex h-10 w-10 items-center justify-center rounded-full bg-brand text-white shadow-lg hover:bg-blue-600 transition-colors"
								title="Change Avatar"
							>
								<Camera size={18} />
							</button>
						</div>
					</div>

					<div className="flex flex-1 flex-col gap-6 w-full">

						<div className="flex flex-col gap-2">
							<label className="text-sm font-medium text-gray-500 dark:text-gray-400">
								Full Name
							</label>
							<div className="flex items-center justify-between rounded-lg border border-gray-200 bg-gray-50 p-3 dark:border-gray-700 dark:bg-gray-800/50">

								<span className="text-gray-900 dark:text-white font-medium">{name}</span>

								<button
									className="ml-4 text-gray-400 hover:text-brand transition-colors"
								>
								</button>
							</div>
						</div>

						<div className="flex flex-col gap-2">
							<label className="text-sm font-medium text-gray-500 dark:text-gray-400">
								Email Address
							</label>
							<div className="flex items-center justify-between rounded-lg border border-gray-200 bg-gray-50 p-3 dark:border-gray-700 dark:bg-gray-800/50">

								<span className="text-gray-900 dark:text-white font-medium">{email}</span>

								<button
									className="ml-4 text-gray-400 hover:text-brand transition-colors"
								>
								</button>
							</div>
						</div>

					</div>
				</div>

				<div className="mt-10 border-t border-gray-100 pt-8 dark:border-gray-800/60">
					<div className="flex flex-col gap-4 sm:flex-row sm:items-center">

						<button onClick={handleLogout} className="flex items-center justify-center gap-2 rounded-lg px-5 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-50 dark:text-red-500 dark:hover:bg-red-950/30 transition-colors">
							<LogOut size={18} />
							Logout
						</button>

						<button className="flex items-center justify-center gap-2 rounded-lg bg-red-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-red-700 transition-colors sm:ml-auto">
							<Trash2 size={18} />
							Delete Account
						</button>

					</div>
				</div>

			</div>
		</div>
	);
}
