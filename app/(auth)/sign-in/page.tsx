"use client";

import { Hexagon, Mail, Lock, Github } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { login } from "../../../services/auth.service";
import Link from "next/link";
import "../../globals.css";

export default function SignInPage() {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");

	const router = useRouter();

	// Login
	const handleLoginSubmit = (e: React.SubmitEvent) => {
		e.preventDefault();

		login(email, password);
		router.push("/");

	}

	return (
		<div className="flex min-h-screen items-center justify-center bg-background p-4 sm:p-8">

			<div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-8 shadow-lg transition-colors duration-300 dark:border-gray-800 dark:bg-[#1a1a1a]">

				<div className="mb-8 flex flex-col items-center text-center">
					<div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-brand/10 text-brand">
						<Hexagon size={32} strokeWidth={2.5} />
					</div>
					<h1 className="mb-2 text-2xl font-bold text-text-primary dark:text-white tracking-tight">
						Sign in to Organon
					</h1>
					<p className="text-sm text-gray-500 dark:text-gray-400">
						Welcome back! Please enter your details to login into Organon.
					</p>
				</div>

				<form onSubmit={handleLoginSubmit} className="flex flex-col gap-5">

					<div className="flex flex-col gap-2">
						<label htmlFor="email" className="text-sm font-medium dark:text-white text-text-primary">
							Email
						</label>
						<div className="relative">
							<div className="pointer-eve-none absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
								<Mail size={18} />
							</div>
							<input
								type="email"
								id="email"
								placeholder="you@example.com"
								required
								value={email}
								onChange={(e) => setEmail(e.target.value)}
								className="w-full rounded-lg border border-gray-300 bg-transparent py-2.5 pl-10 pr-4 dark:text-white text-text-primary placeholder:text-gray-400 focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand dark:border-gray-700 dark:placeholder:text-gray-500 transition-colors"
							/>
						</div>
					</div>

					<div className="flex flex-col gap-2">
						<label htmlFor="password" className="text-sm font-medium dark:text-white text-text-primary">
							Password
						</label>
						<div className="relative">
							<div className="pointer-eve-none absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
								<Lock size={18} />
							</div>
							<input
								type="password"
								id="password"
								placeholder="••••••••"
								required
								value={password}
								onChange={(e) => setPassword(e.target.value)}
								className="w-full rounded-lg border border-gray-300 bg-transparent py-2.5 pl-10 pr-4 dark:text-white text-text-primary placeholder:text-gray-400 focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand dark:border-gray-700 dark:placeholder:text-gray-500 transition-colors"
							/>
						</div>
					</div>

					<div className="flex items-center justify-between text-sm">
						<label className="flex items-center gap-2 cursor-pointer text-gray-600 dark:hover:text-white dark:text-gray-400 hover:text-text-primary transition-colors">
							<input
								type="checkbox"
								className="rounded border-gray-300 text-brand focus:ring-brand dark:border-gray-700 dark:bg-transparent"
							/>
							Remember me
						</label>
						<Link href="/forgot-password" className="font-medium text-brand hover:underline">
							Forgot password?
						</Link>
					</div>


					<button
						type="submit"
						className="mt-2 w-full rounded-lg bg-brand py-2.5 text-sm font-semibold text-white shadow-sm hover:opacity-90 transition-opacity"
					>
						Sign In
					</button>
				</form>


				<div className="my-6 flex items-center gap-4 before:h-px before:flex-1 before:bg-gray-200 after:h-px after:flex-1 after:bg-gray-200 dark:before:bg-gray-800 dark:after:bg-gray-800">
					<span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Or continue with</span>
				</div>


				<button
					type="button"
					className="flex w-full items-center justify-center gap-2 rounded-lg border border-gray-300 bg-transparent py-2.5 dark:text-white text-sm font-medium text-text-primary hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800 transition-colors"
				>
					<Github size={18} />
					GitHub
				</button>


				<div className="mt-8 text-center text-sm text-gray-600 dark:text-gray-400">
					Don&apos;t have an account?{" "}
					<Link href="/sign-up" className="font-medium text-brand hover:underline">
						Sign up
					</Link>
				</div>

			</div>
		</div>
	);
}
