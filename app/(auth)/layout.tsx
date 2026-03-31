import { ThemeProvider } from "../../providers/theme-provider";

export default function AuthLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<ThemeProvider
			attribute="class"
			defaultTheme="system"
			enableSystem
			disableTransitionOnChange
		>

			<main className="flex min-h-screen items-center justify-center">
				{children}
			</main>
		</ThemeProvider>
	);
}
