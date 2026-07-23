"use client"

import Link from "next/link"
import { FormEvent, useState } from "react"

import { authClient } from "@/lib/auth-client"

export function SignInForm() {
  const [error, setError] = useState("")
  const [pending, setPending] = useState(false)

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setPending(true)
    setError("")

    const form = new FormData(event.currentTarget)
    const result = await authClient.signIn.email({
      email: String(form.get("email") ?? ""),
      password: String(form.get("password") ?? ""),
    })

    setPending(false)
    if (result.error) {
      setError(result.error.message ?? "Unable to sign in.")
      return
    }

    window.location.href = "/"
  }

  async function signInWithGoogle() {
    setPending(true)
    setError("")

    const result = await authClient.signIn.social({
      provider: "google",
      callbackURL: "/",
    })

    if (result?.error) {
      setError(result.error.message ?? "Google sign-in could not be completed.")
      setPending(false)
    }
  }
  return (
    <form onSubmit={submit} className="space-y-4">
      <label className="block text-sm font-semibold">
        Email
        <input name="email" type="email" required className="mt-2 h-11 w-full border border-[#cbd5c8] px-3" />
      </label>
      <label className="block text-sm font-semibold">
        Password
        <input name="password" type="password" required minLength={8} className="mt-2 h-11 w-full border border-[#cbd5c8] px-3" />
      </label>
      {error ? <p className="text-sm text-red-700">{error}</p> : null}
      <button disabled={pending} className="h-11 w-full bg-[#7acb2b] font-bold text-white disabled:opacity-60">
        {pending ? "Signing in..." : "Sign in"}
      </button>
      <div className="flex items-center gap-3">
        <div className="h-px flex-1 bg-[#dfe8dc]" />
        <span className="text-xs font-semibold uppercase text-[#667085]">or</span>
        <div className="h-px flex-1 bg-[#dfe8dc]" />
      </div>
      <button
        type="button"
        disabled={pending}
        onClick={signInWithGoogle}
        className="h-11 w-full border border-[#cbd5c8] bg-white font-bold text-[#101828] disabled:opacity-60"
      >
        Continue with Google
      </button>      <p className="text-center text-sm text-[#667085]">
        New to KCIC? <Link href="/sign-up" className="font-bold text-[#05734f]">Create an account</Link>
      </p>
    </form>
  )
}