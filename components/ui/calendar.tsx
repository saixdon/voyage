"use client"

import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { DayPicker } from "react-day-picker"

import { cn } from "@/lib/utils"

export type CalendarProps = React.ComponentProps<typeof DayPicker>

function Calendar({
    className,
    classNames,
    showOutsideDays = true,
    ...props
}: CalendarProps) {
    return (
        <DayPicker
            showOutsideDays={showOutsideDays}
            className={cn("p-3", className)}
            classNames={{
                months: "flex flex-col p-0",
                month: "space-y-3",
                caption: "flex justify-center pt-1 relative items-center mb-2",
                caption_label: "text-sm font-semibold text-white",
                nav: "space-x-1 flex items-center",
                nav_button: cn(
                    "h-7 w-7 bg-transparent p-0 opacity-70 hover:opacity-100 border border-white/10 rounded-lg flex items-center justify-center hover:bg-white/10 transition-all"
                ),
                nav_button_previous: "absolute left-1",
                nav_button_next: "absolute right-1",
                table: "w-full border-collapse",
                head_row: "flex justify-around mb-1",
                head_cell:
                    "text-gray-400 font-medium text-[11px] uppercase tracking-widest w-9 flex items-center justify-center",
                row: "flex justify-around mt-1",
                cell: "relative p-0 text-center text-sm focus-within:relative focus-within:z-20",
                day: cn(
                    "h-9 w-9 p-0 font-normal aria-selected:opacity-100 hover:bg-white/10 hover:text-white rounded-lg flex items-center justify-center transition-all cursor-pointer text-sm"
                ),
                day_range_end: "day-range-end",
                day_selected:
                    "bg-primary text-white hover:bg-primary/90 hover:text-white focus:bg-primary focus:text-white rounded-lg",
                day_today: "bg-white/5 text-white border border-white/10",
                day_outside:
                    "day-outside text-gray-500 opacity-30 aria-selected:bg-primary/30 aria-selected:text-white aria-selected:opacity-30",
                day_disabled: "text-gray-500 opacity-50",
                day_range_middle:
                    "aria-selected:bg-primary/20 aria-selected:text-white rounded-none",
                day_hidden: "invisible",
                ...classNames,
            }}
            components={{
                Chevron: ({ orientation }) => {
                    if (orientation === "left") {
                        return <ChevronLeft className="h-4 w-4 text-white" />
                    }
                    return <ChevronRight className="h-4 w-4 text-white" />
                },
            }}
            {...props}
        />
    )
}
Calendar.displayName = "Calendar"

export { Calendar }
