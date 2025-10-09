import type { ReactNode } from "react";


interface TabsListProps {
    className?: string;
    children: ReactNode;
}

const TabsList = ({ className, children }: TabsListProps) => {
    return (
        <div className={`flex border-b  ${className}`}>
            {children}
        </div>
    );
}

