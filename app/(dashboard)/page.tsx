"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../providers/auth-provider";
import Overview from "../../components/Overview/overview";
import JournalWidget from "../../components/JournalWidget/journal-widget";
import HabitWidget from "../../components/HabitWidget/habit-widget"; // <-- Import the new widget

export default function Home() {
	const { user } = useAuth();
	const router = useRouter();

	useEffect(() => {
		if (!user) {
			router.push("/sign-in");
		}
	}, [user, router]);

	if (!user) {
		return <h1>You need to be logged in to access this page</h1>;
	}

	return (
		// Added flex-col, padding, and a max-width container to keep it looking clean
		<div className="bg-background flex flex-col w-full min-h-screen pt-8 pb-12">
			<div className="mx-auto w-full max-w-7xl px-6 md:px-8 flex flex-col gap-8">

				{/* Top Row: Overview and Journal */}
				<div className="flex flex-col lg:flex-row gap-8 w-full">
					<div className="flex-1">
						<Overview />
					</div>
					<div className="w-full lg:w-1/3">
						<JournalWidget />
					</div>
				</div>

				{/* Bottom Row: Full width Habit Widget */}
				<div className="w-full">
					<HabitWidget />
				</div>

			</div>
		</div>
	);
}
