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
            className={cn("p-6", className)}
            classNames={{
                months: "flex flex-col sm:flex-row space-y-6 sm:space-x-12 sm:space-y-0 p-2",
                month: "space-y-6",
                caption: "flex justify-center pt-1 relative items-center mb-4",
                caption_label: "text-base font-bold text-white",
                nav: "space-x-1 flex items-center",
                nav_button: cn(
                    "h-9 w-9 bg-transparent p-0 opacity-70 hover:opacity-100 border border-white/10 rounded-2xl flex items-center justify-center hover:bg-white/10 transition-all"
                ),
                nav_button_previous: "absolute left-2",
                nav_button_next: "absolute right-2",
                table: "w-full border-collapse",
                head_row: "flex mb-4 gap-4",
                head_cell:
                    "text-gray-400 rounded-md w-16 font-medium text-sm uppercase tracking-widest",
                row: "flex w-full mt-4 gap-4",
                cell: "h-16 w-16 text-center text-sm p-0 relative focus-within:relative focus-within:z-20",
                day: cn(
                    "h-16 w-16 p-0 font-normal aria-selected:opacity-100 hover:bg-white/10 hover:text-white rounded-2xl flex items-center justify-center transition-all cursor-pointer text-xl"
                ),
                day_range_end: "day-range-end",
                day_selected:
                    "bg-primary text-white hover:bg-primary/90 hover:text-white focus:bg-primary focus:text-white rounded-xl",
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
