import { cn } from "@/lib/utils";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "danger" | "ghost";
  size?: "sm" | "md" | "lg";
};

export function Button({
  className,
  variant = "primary",
  size = "md",
  ...props
}: ButtonProps) {
  return (
    <button
      type="button"
      className={cn(
        "inline-flex items-center justify-center rounded-lg font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-iaas-green disabled:cursor-not-allowed disabled:opacity-60",
        variant === "primary" && "bg-iaas-green text-white hover:bg-iaas-green/90",
        variant === "secondary" &&
          "border border-iaas-earth/30 bg-white text-iaas-earth hover:bg-iaas-light",
        variant === "danger" && "bg-red-600 text-white hover:bg-red-700",
        variant === "ghost" && "text-iaas-green hover:bg-iaas-light",
        size === "sm" && "px-3 py-1.5 text-sm",
        size === "md" && "px-4 py-2 text-sm",
        size === "lg" && "px-6 py-3 text-base",
        className,
      )}
      {...props}
    />
  );
}
