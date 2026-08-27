export default function Header() {
  return (
    <header className="flex flex-col items-center mb-6">
      <span className="text-6xl mb-2" role="img" aria-label="popcorn">
        🍿
      </span>
      <h1
        className="text-4xl text-white tracking-wide"
        style={{ fontFamily: "var(--font-carter), cursive" }}
      >
        PopChoice
      </h1>
    </header>
  );
}
