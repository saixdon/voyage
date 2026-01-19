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
                months: "flex flex-col sm:flex-row space-y-4 sm:space-x-8 sm:space-y-0",
                month: "space-y-4",
                caption: "flex justify-center pt-1 relative items-center",
                caption_label: "text-sm font-semibold text-white",
                nav: "space-x-1 flex items-center",
                nav_button: cn(
                    "h-8 w-8 bg-transparent p-0 opacity-70 hover:opacity-100 border border-white/10 rounded-xl flex items-center justify-center hover:bg-white/10 transition-all"
                ),
                nav_button_previous: "absolute left-2",
                nav_button_next: "absolute right-2",
                table: "w-full border-collapse space-y-1",
                head_row: "flex",
                head_cell:
                    "text-gray-400 rounded-md w-10 font-normal text-[0.8rem]",
                row: "flex w-full mt-2",
                cell: "h-10 w-10 text-center text-sm p-0 relative focus-within:relative focus-within:z-20",
                day: cn(
                    "h-10 w-10 p-0 font-normal aria-selected:opacity-100 hover:bg-white/10 hover:text-white rounded-xl flex items-center justify-center transition-all cursor-pointer"
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
                IconLeft: ({ ...props }) => <ChevronLeft className="h-4 w-4 text-white" />,
                IconRight: ({ ...props }) => <ChevronRight className="h-4 w-4 text-white" />,
            }}
            {...props}
        />
    )
}
Calendar.displayName = "Calendar"

export { Calendar }
