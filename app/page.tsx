import Link from "next/link"

export default function Home() {
  return (
    <div className="font-sans grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20">
     <Link href="/sign-up">
      <button className="bg-blue-600 hover:bg-blue-700 transition-colors text-white font-semibold py-2 px-4 rounded">
        Sign Up
      </button>
     </Link>
    </div>
  );
}
