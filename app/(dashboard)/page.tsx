"use client";
import { useEffect } from "react"; // 1. Import useEffect
import { useRouter } from "next/navigation";
import { useAuth } from "../../providers/auth-provider";
import Overview from "../../components/Overview/overview";
import JournalWidget from "../../components/JournalWidget/journal-widget";

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
		<div className="bg-background flex">
			<Overview />
			<JournalWidget />
		</div>
	);
}
