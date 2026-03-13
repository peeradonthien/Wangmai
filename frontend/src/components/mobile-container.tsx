import { cn } from "@/lib/utils";

interface MobileContainerProps {
    children: React.ReactNode;
    className?: string;
}

export function MobileContainer({ children, className }: MobileContainerProps) {
    return (
        <div className="flex min-h-screen justify-center bg-gray-50/50">
            <div
                className={cn(
                    "w-full min-h-screen bg-background relative",
                    // Removed max-w-md constraint, added max-w-screen-xl for larger desktop containment if needed
                    // But user asked for fully responsive, so let's allow full width with sensible margins
                    "mx-auto",
                    className
                )}
            >
                {children}
            </div>
        </div>
    );
}
