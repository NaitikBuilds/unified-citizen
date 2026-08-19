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
        src="/favicon.svg"
        alt="Unified Citizen"
        className={sizes[size].icon}
      />
      {showText && (
        <span className={`font-bold ${sizes[size].text} text-primary`}>
          Unified Citizen
        </span>
      )}
    </div>
  );
}
