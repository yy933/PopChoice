type HeaderProps = {
  logo: string;
  title: string;
};
export default function Header({ logo, title }: HeaderProps) {
  return (
    <header className="flex flex-col items-center mb-6">
      <span className="text-6xl mb-2" role="img" aria-label="popcorn">
        {logo}
      </span>
      <h1
        className="text-4xl text-white tracking-wide"
        style={{ fontFamily: "var(--font-carter), cursive" }}
      >
        {title}
      </h1>
    </header>
  );
}
