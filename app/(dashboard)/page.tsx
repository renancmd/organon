"use client";
import { useAuth } from "../../providers/auth-provider";
import Overview from "../../components/Overview/overview";
import JournalWidget from "../../components/JournalWidget/journal-widget";

export default function Home() {
	const { user } = useAuth();

	if (!user) {
		return <h1>You need to be logged to access this page</h1>;
	}

	return (
		<div className="bg-background flex">
			<Overview />
			<JournalWidget />
		</div>
	);
}
