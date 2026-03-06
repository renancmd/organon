import Sidebar from "../../components/Sidebar/sidebar";

export default function DashboardLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<div className="flex min-h-screen">
			{/* The Sidebar is fixed, so it doesn't take up normal document flow space */}
			<Sidebar />

			{/* Main content area dynamically pads itself so it doesn't hide behind the sidebar */}
			<main className="flex-1 pb-16 md:pb-0 md:pl-20 transition-all duration-300">
				{children}
			</main>
		</div>
	);
}
