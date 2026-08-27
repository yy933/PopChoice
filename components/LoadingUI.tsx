export default function LoadingUI({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center my-12 gap-4">
      <div className="w-12 h-12 border-4 border-[#37ec80] border-t-transparent rounded-full animate-spin"></div>
      <p
        className="text-white text-center text-lg mt-2"
        style={{ fontFamily: "var(--font-roboto-slab), serif" }}
      >
        {children}
      </p>
    </div>
  );
}
