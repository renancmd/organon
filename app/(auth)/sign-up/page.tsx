"use client";

import Link from "next/link";
import { Hexagon, Mail, Lock, Github, User } from "lucide-react";
import "../../globals.css"; 

export default function SignUpPage() {
  const handleSubmit = () => {};

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4 sm:p-8">
      
      <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-8 shadow-lg transition-colors duration-300 dark:border-gray-800 dark:bg-[#1a1a1a]">
        
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-brand/10 text-brand">
            <Hexagon size={32} strokeWidth={2.5} />
          </div>
          <h1 className="mb-2 text-2xl font-bold text-text-primary dark:text-white tracking-tight">
            Create an account
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Enter your details below to get started with Organon.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          
          <div className="flex flex-col gap-2">
            <label htmlFor="name" className="text-sm font-medium dark:text-white text-text-primary">
              Full Name
            </label>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                <User size={18} />
              </div>
              <input
                type="text"
                id="name"
                placeholder="John Doe"
                required
                className="w-full rounded-lg border border-gray-300 bg-transparent py-2.5 pl-10 pr-4 dark:text-white text-text-primary placeholder:text-gray-400 focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand dark:border-gray-700 dark:placeholder:text-gray-500 transition-colors"
              />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="email" className="text-sm font-medium dark:text-white text-text-primary">
              Email
            </label>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                <Mail size={18} />
              </div>
              <input
                type="email"
                id="email"
                placeholder="you@example.com"
                required
                className="w-full rounded-lg border border-gray-300 bg-transparent py-2.5 pl-10 pr-4 dark:text-white text-text-primary placeholder:text-gray-400 focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand dark:border-gray-700 dark:placeholder:text-gray-500 transition-colors"
              />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="password" className="text-sm font-medium dark:text-white text-text-primary">
              Password
            </label>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                <Lock size={18} />
              </div>
              <input
                type="password"
                id="password"
                placeholder="Create a password"
                required
                className="w-full rounded-lg border border-gray-300 bg-transparent py-2.5 pl-10 pr-4 dark:text-white text-text-primary placeholder:text-gray-400 focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand dark:border-gray-700 dark:placeholder:text-gray-500 transition-colors"
              />
            </div>
          </div>

          <div className="flex items-center text-sm">
            <label className="flex items-center gap-2 cursor-pointer text-gray-600 dark:hover:text-white dark:text-gray-400 hover:text-text-primary transition-colors">
              <input 
                type="checkbox" 
                required
                className="rounded border-gray-300 text-brand focus:ring-brand dark:border-gray-700 dark:bg-transparent"
              />
              <span>I agree to the <Link href="#" className="text-brand hover:underline">Terms</Link> and <Link href="#" className="text-brand hover:underline">Privacy Policy</Link></span>
            </label>
          </div>

          <button
            type="submit"
            className="mt-2 w-full rounded-lg bg-brand py-2.5 text-sm font-semibold text-white shadow-sm hover:opacity-90 transition-opacity"
          >
            Create Account
          </button>
        </form>

        <div className="my-6 flex items-center gap-4 before:h-px before:flex-1 before:bg-gray-200 after:h-px after:flex-1 after:bg-gray-200 dark:before:bg-gray-800 dark:after:bg-gray-800">
          <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Or register with</span>
        </div>

        <button
          type="button"
          className="flex w-full items-center justify-center gap-2 rounded-lg border border-gray-300 bg-transparent py-2.5 dark:text-white text-sm font-medium text-text-primary hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800 transition-colors"
        >
          <Github size={18} />
          GitHub
        </button>

        <div className="mt-8 text-center text-sm text-gray-600 dark:text-gray-400">
          Already have an account?{" "}
          <Link href="/sign-in" className="font-medium text-brand hover:underline">
            Sign in
          </Link>
        </div>

      </div>
    </div>
  );
}
