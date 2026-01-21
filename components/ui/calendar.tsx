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
            className={cn("p-0", className)}
            classNames={{
                months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
                month: "space-y-4",
                month_caption: "flex justify-center pt-1 relative items-center mb-4",
                caption_label: "text-lg font-bold text-white",
                nav: "space-x-1 flex items-center absolute right-0 top-0",
                button_previous: cn(
                    "h-9 w-9 bg-transparent p-0 opacity-70 hover:opacity-100 rounded-full flex items-center justify-center hover:bg-white/10 transition-all text-blue-500"
                ),
                button_next: cn(
                    "h-9 w-9 bg-transparent p-0 opacity-70 hover:opacity-100 rounded-full flex items-center justify-center hover:bg-white/10 transition-all text-blue-500"
                ),
                month_grid: "w-full border-collapse space-y-1",
                weekdays: "flex",
                weekday: "text-gray-400 rounded-md w-11 font-medium text-[13px] text-center mb-2",
                week: "flex w-full mt-2",
                day: cn(
                    "h-11 w-11 p-0 font-normal aria-selected:opacity-100 hover:bg-white/10 hover:text-white rounded-full flex items-center justify-center transition-all cursor-pointer text-[14px] text-white"
                ),
                range_start: "day-range-start",
                range_end: "day-range-end",
                selected:
                    "bg-blue-600 text-white hover:bg-blue-500 hover:text-white rounded-full",
                today: "text-blue-500 font-bold",
                outside:
                    "day-outside text-gray-600 opacity-40 aria-selected:bg-blue-600/30 aria-selected:text-white aria-selected:opacity-40",
                disabled: "text-gray-600 opacity-20",
                range_middle:
                    "aria-selected:bg-blue-600/20 aria-selected:text-white rounded-none",
                hidden: "invisible",
                ...classNames,
            }}
            components={{
                Chevron: ({ orientation }) => {
                    if (orientation === "left") {
                        return <ChevronLeft className="h-6 w-6" />
                    }
                    return <ChevronRight className="h-6 w-6" />
                },
            }}
            {...props}
        />
    )
}
Calendar.displayName = "Calendar"

export { Calendar }
