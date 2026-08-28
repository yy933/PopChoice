import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
}
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
export default function Button({
  children,
  type = "button",
  className,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        "w-full bg-[#37ec80] hover:bg-[#2bd671] text-[#030d2e] font-bold py-3 rounded-xl transition duration-200 text-xl cursor-pointer font-[family-name:var(--font-carter)]",
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}
