import { ButtonHTMLAttributes, forwardRef } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: "primary" | "secondary" | "ghost";
    size?: "sm" | "md" | "lg";
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className = "", variant = "primary", size = "md", children, ...props }, ref) => {
        const baseStyles =
            "font-bold rounded-full transition-all duration-300 flex items-center justify-center";

        const variants = {
            primary:
                "bg-primary hover:bg-primary/90 text-white hover:shadow-[0_0_20px_rgba(43,140,238,0.4)] hover:scale-105 active:scale-95",
            secondary:
                "border border-white/10 text-white hover:bg-white/10",
            ghost: "text-white hover:text-primary",
        };

        const sizes = {
            sm: "h-8 px-4 text-sm",
            md: "h-10 px-6 text-sm",
            lg: "h-12 px-8 text-base",
        };

        return (
            <button
                ref={ref}
                className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
                {...props}
            >
                {children}
            </button>
        );
    }
);

Button.displayName = "Button";
