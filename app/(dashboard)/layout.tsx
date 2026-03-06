import Sidebar from "../../components/Sidebar/sidebar";
import { ThemeProvider } from "../../providers/theme-provider";

export default function DashboardLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<div className="flex min-h-screen">
			<ThemeProvider
				attribute="class"
				defaultTheme="system"
				enableSystem
				disableTransitionOnChange
			>
				<Sidebar />

				<main className="flex-1 pb-16 md:pb-0 md:pl-20 transition-all duration-300">
					{children}
				</main>
			</ThemeProvider>
		</div>
	);
}
