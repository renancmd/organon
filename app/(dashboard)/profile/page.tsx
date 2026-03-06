"use client";

import ProfileCard from "../../../components/Profile/profile-card";
import LifeArea from "../../../components/LifeArea/life-area";
import { useAuth } from "../../../providers/auth-provider";
import "../../globals.css";

export default function Profile() {
	const { user } = useAuth();

	if (!user) {
		return <h1>You need to be logged to access this page</h1>;
	}

	return (
		<div className="w-full h-screen bg-background dark:bg-[#181818] flex items-center justify-center ">
			<ProfileCard />
			<LifeArea />
		</div>
	);
}


