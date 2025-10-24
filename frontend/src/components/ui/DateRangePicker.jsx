import React, { useState, useRef, useEffect } from "react"

function formatDate(d) {
    if (!d) return ""
    return d.toLocaleDateString("fr-FR", { day: "2-digit", month: "short" })
}

function startOfMonth(date) {
    return new Date(date.getFullYear(), date.getMonth(), 1)
}

function addMonths(date, n) {
    return new Date(date.getFullYear(), date.getMonth() + n, 1)
}

export default function DateRangePicker({ value = { start: null, end: null }, onChange }) {
    const [start, setStart] = useState(value.start)
    const [end, setEnd] = useState(value.end)
    const [open, setOpen] = useState(false)
    const [month, setMonth] = useState(startOfMonth(start || new Date()))
    const ref = useRef(null)

    useEffect(() => {
        function onDoc(e) {
            if (!ref.current?.contains(e.target)) setOpen(false)
        }
        document.addEventListener("mousedown", onDoc)
        return () => document.removeEventListener("mousedown", onDoc)
    }, [])

    useEffect(() => {
        if (onChange) onChange({ start, end })
    }, [start, end])

    function handleDayClick(day) {
        // normalize time portion
        const clicked = new Date(day.getFullYear(), day.getMonth(), day.getDate())
        if (!start || (start && end)) {
            setStart(clicked)
            setEnd(null)
        } else {
            if (clicked < start) {
                setEnd(start)
                setStart(clicked)
            } else {
                setEnd(clicked)
            }
        }
    }

    function generateCalendar(monthDate) {
        // Monday as first day of week
        const first = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1)
        const firstDayIndex = (first.getDay() + 6) % 7 // 0..6 where 0 = Monday
        const days = []
        // 6 weeks grid = 42 cells
        const startDate = new Date(first)
        startDate.setDate(first.getDate() - firstDayIndex)
        for (let i = 0; i < 42; i++) {
            const d = new Date(startDate)
            d.setDate(startDate.getDate() + i)
            days.push(d)
        }
        return days
    }

    function inRange(d) {
        if (!start) return false
        if (start && !end) return d.getTime() === start.getTime()
        return d >= start && d <= end
    }

    return (
        <div className="relative inline-block" ref={ref}>
            <button
                type="button"
                onClick={() => setOpen((v) => !v)}
                className="w-44 text-left border border-gray-200 rounded-md px-4 py-2 bg-white flex items-center justify-between"
                aria-expanded={open}
            >
        <span className="text-sm text-gray-700">
          {start ? formatDate(start) : "Début"} — {end ? formatDate(end) : "Fin"}
        </span>
                <span className="text-xs text-gray-500">▾</span>
            </button>

            {open && (
                <div className="absolute z-50 mt-2 bg-white rounded-lg shadow-lg p-4 w-[320px]">
                    <div className="flex items-center justify-between mb-3">
                        <button
                            type="button"
                            onClick={() => setMonth((m) => addMonths(m, -1))}
                            className="px-2 py-1 rounded hover:bg-gray-100"
                        >
                            ‹
                        </button>
                        <div className="font-medium">
                            {month.toLocaleDateString("fr-FR", { month: "long", year: "numeric" })}
                        </div>
                        <button
                            type="button"
                            onClick={() => setMonth((m) => addMonths(m, 1))}
                            className="px-2 py-1 rounded hover:bg-gray-100"
                        >
                            ›
                        </button>
                    </div>

                    <div className="grid grid-cols-7 gap-1 text-center text-xs text-gray-500 mb-2">
                        {["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"].map((d) => (
                            <div key={d} className="py-1">{d}</div>
                        ))}
                    </div>

                    <div className="grid grid-cols-7 gap-1 text-sm">
                        {generateCalendar(month).map((d) => {
                            const isCurrentMonth = d.getMonth() === month.getMonth()
                            const isToday = new Date().toDateString() === d.toDateString()
                            const selected = inRange(d)
                            const isStart = start && d.getTime() === start.getTime()
                            const isEnd = end && d.getTime() === end.getTime()
                            return (
                                <button
                                    key={d.toISOString()}
                                    type="button"
                                    onClick={() => handleDayClick(d)}
                                    className={
                                        [
                                            "py-2 rounded",
                                            isCurrentMonth ? "text-gray-800" : "text-gray-300",
                                            selected ? "bg-primary/20" : "bg-transparent",
                                            isStart || isEnd ? "bg-primary text-white" : "",
                                            isToday && !selected ? "ring-1 ring-gray-200" : ""
                                        ].join(" ")
                                    }
                                >
                                    <div className="text-center text-sm">{d.getDate()}</div>
                                </button>
                            )
                        })}
                    </div>

                    <div className="flex items-center justify-between mt-3">
                        <button
                            type="button"
                            onClick={() => { setStart(null); setEnd(null); }}
                            className="text-sm text-gray-600 hover:underline"
                        >
                            Réinitialiser
                        </button>
                        <button
                            type="button"
                            onClick={() => setOpen(false)}
                            className="bg-primary text-white px-3 py-1 rounded"
                        >
                            Fermer
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}
