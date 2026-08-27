interface QuestionProps {
  children: React.ReactNode;
  rows?: number;
  value: string;
  onChange: React.ChangeEventHandler<HTMLTextAreaElement>;
  placeholder?: string;
}
export default function Question({children, rows, value, onChange, placeholder}: QuestionProps){
  return (
    <div>
      <label className="block text-white text-sm mb-2 font-medium">
        {children}
      </label>
      <textarea
        required
        rows={rows}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full bg-[#2a3660] text-white placeholder-gray-400 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#37ec80] text-sm resize-none"
        style={{ fontFamily: "var(--font-roboto-slab), serif" }}
      />
    </div>
  );
}