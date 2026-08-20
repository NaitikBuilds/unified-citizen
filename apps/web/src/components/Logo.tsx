interface LogoProps {
  size?: "sm" | "md" | "lg";
  showText?: boolean;
}

export default function Logo({ size = "md", showText = true }: LogoProps) {
  const sizes = {
    sm: { icon: "h-8 w-8", text: "text-lg" },
    md: { icon: "h-10 w-10", text: "text-xl" },
    lg: { icon: "h-14 w-14", text: "text-3xl" },
  };

  return (
    <div className="flex items-center gap-2">
      <img
        src="/civix-logo.png"
        alt="CIVIX"
        className={`${sizes[size].icon} rounded-full object-cover border-2 border-white/20 shadow-sm`}
      />
      {showText && (
        <span className={`font-bold ${sizes[size].text} text-white`}>
          CIVIX
        </span>
      )}
    </div>
  );
}
