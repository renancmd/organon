"use client";
import { useAuth } from "../../../providers/auth-provider";
import "../../globals.css";

export default function Projects() {
	const { user } = useAuth();

	if (!user) {
		return <h1>You need to be logged to access this page</h1>;
	}

	return (
		<div className="w-full h-screen bg-background dark:bg-[#181818] flex items-center justify-center ">
			<h1 className="dark:text-white">Work in progress..</h1>
		</div>
	);
}
