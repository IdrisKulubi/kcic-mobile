"use client"

import Link from "next/link"

export function VerifyEmailForm() {
  return (
    <div className="space-y-4">
      <p className="text-sm leading-6 text-[#667085]">
        Enter the verification code from the KCIC email flow in the mobile app, or return to sign in.
      </p>
      <Link href="/sign-in" className="flex h-11 items-center justify-center bg-[#7acb2b] font-bold text-white">
        Return to sign in
      </Link>
    </div>
  )
}