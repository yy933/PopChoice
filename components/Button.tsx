export default function Button({ children }: { children: React.ReactNode }) {
  return (
    <button
      type="submit"
      className="mt-3 w-full bg-[#37ec80] hover:bg-[#2bd671] text-[#030d2e] font-bold py-3 rounded-xl transition duration-200 text-xl"
      style={{ fontFamily: "var(--font-carter), cursive" }}
    >
      {children}
    </button>
  );
}
