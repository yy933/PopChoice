import Link from "next/link";
import Header from "@/components/Header";

export default function NotFound() {
  return (
    <main className="min-h-screen bg-[#030d2e] flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-[#030d2e] p-6 rounded-xl flex flex-col items-center text-center">
        {/*  Header */}
        <Header logo="🍿" title="PopChoice" />

        <div className="my-8">
          <h1 className="text-emerald-400 text-6xl font-extrabold mb-3">404</h1>
          <h2
            className="text-white text-2xl font-semibold mb-2"
            style={{ fontFamily: "var(--font-roboto-slab), serif" }}
          >
            Page Not Found
          </h2>
          <p className="text-gray-400 text-sm">
            Looks like you took a wrong turn into an empty movie theater!
          </p>
        </div>

        {/* Back to home */}
        <Link
          href="/"
          className="w-full py-3 px-4 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold rounded-lg transition duration-200 block text-center"
        >
          Back to PopChoice
        </Link>
      </div>
    </main>
  );
}
