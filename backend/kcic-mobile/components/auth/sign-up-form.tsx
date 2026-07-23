"use client"

import Link from "next/link"
import { FormEvent, useState } from "react"

import { authClient } from "@/lib/auth-client"

export function SignUpForm() {
  const [error, setError] = useState("")
  const [pending, setPending] = useState(false)

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setPending(true)
    setError("")

    const form = new FormData(event.currentTarget)
    const result = await authClient.signUp.email({
      name: String(form.get("name") ?? ""),
      email: String(form.get("email") ?? ""),
      password: String(form.get("password") ?? ""),
    })

    setPending(false)
    if (result.error) {
      setError(result.error.message ?? "Unable to create your account.")
      return
    }

    window.location.href = "/"
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <label className="block text-sm font-semibold">
        Full name
        <input name="name" required className="mt-2 h-11 w-full border border-[#cbd5c8] px-3" />
      </label>
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
        {pending ? "Creating account..." : "Create account"}
      </button>
      <p className="text-center text-sm text-[#667085]">
        Already registered? <Link href="/sign-in" className="font-bold text-[#05734f]">Sign in</Link>
      </p>
    </form>
  )
}