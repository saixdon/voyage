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
            className={cn("p-4", className)}
            classNames={{
                months: "flex flex-col",
                month: "space-y-4",
                caption: "flex justify-center pt-1 relative items-center mb-6",
                caption_label: "text-lg font-semibold text-white",
                nav: "space-x-1 flex items-center",
                nav_button: cn(
                    "h-8 w-8 bg-transparent p-0 opacity-70 hover:opacity-100 rounded-full flex items-center justify-center hover:bg-white/10 transition-all"
                ),
                nav_button_previous: "absolute left-1",
                nav_button_next: "absolute right-1",
                table: "w-full border-collapse",
                head_row: "grid grid-cols-7 mb-3",
                head_cell:
                    "text-gray-400 font-medium text-xs text-center py-2",
                row: "grid grid-cols-7 mb-2",
                cell: "relative p-1 text-center focus-within:relative focus-within:z-20",
                day: cn(
                    "h-10 w-10 mx-auto p-0 font-normal aria-selected:opacity-100 hover:bg-white/10 hover:text-white rounded-full flex items-center justify-center transition-all cursor-pointer text-sm"
                ),
                day_range_end: "day-range-end",
                day_selected:
                    "bg-primary text-white hover:bg-primary/90 hover:text-white focus:bg-primary focus:text-white",
                day_today: "bg-white/5 text-white border border-white/10",
                day_outside:
                    "day-outside text-gray-600 opacity-40 aria-selected:bg-primary/30 aria-selected:text-white aria-selected:opacity-40",
                day_disabled: "text-gray-600 opacity-40",
                day_range_middle:
                    "aria-selected:bg-primary/20 aria-selected:text-white rounded-none",
                day_hidden: "invisible",
                ...classNames,
            }}
            components={{
                Chevron: ({ orientation }) => {
                    if (orientation === "left") {
                        return <ChevronLeft className="h-5 w-5 text-white" />
                    }
                    return <ChevronRight className="h-5 w-5 text-white" />
                },
            }}
            {...props}
        />
    )
}
Calendar.displayName = "Calendar"

export { Calendar }
