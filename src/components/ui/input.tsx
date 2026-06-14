import { cn } from "@/lib/utils";

type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

export function Input({ className, ...props }: InputProps) {
  return (
    <input
      className={cn(
        "w-full rounded-lg border border-iaas-earth/20 bg-white px-4 py-2.5 text-sm text-foreground shadow-sm outline-none transition placeholder:text-gray-400 focus:border-iaas-green focus:ring-2 focus:ring-iaas-green/20",
        className,
      )}
      {...props}
    />
  );
}
