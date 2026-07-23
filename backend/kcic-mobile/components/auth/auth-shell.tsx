import Link from "next/link"
import type { ReactNode } from "react"

export function AuthShell({
  title,
  description,
  children,
}: {
  title: string
  description: string
  children: ReactNode
}) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f5f7f4] px-5 py-12">
      <section className="w-full max-w-md border border-[#dfe8dc] bg-white p-7 shadow-sm">
        <Link href="/" className="text-sm font-bold text-[#05734f]">
          KCIC Climate Hub
        </Link>
        <h1 className="mt-7 text-3xl font-bold tracking-normal text-[#101828]">{title}</h1>
        <p className="mt-2 text-sm leading-6 text-[#667085]">{description}</p>
        <div className="mt-7">{children}</div>
      </section>
    </main>
  )
}