"use client"

import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock, MapPin } from "lucide-react"
import { useState } from "react"

interface CalendarEvent {
  id: number
  title: string
  date: number
  color: string
  time?: string
  location?: string
}

const events: CalendarEvent[] = [
  { id: 1, title: "Parent-Teacher Meeting", date: 5, color: "bg-violet-500", time: "9:00 AM", location: "Main Hall" },
  { id: 2, title: "Science Fair", date: 12, color: "bg-emerald-500", time: "10:00 AM", location: "Science Block" },
  { id: 3, title: "Mid-Term Exams", date: 18, color: "bg-amber-500", time: "8:00 AM", location: "All Classrooms" },
  { id: 4, title: "Sports Day", date: 25, color: "bg-rose-500", time: "7:00 AM", location: "School Field" },
]

export function EventCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date())
  
  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ]

  const daysInMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
  const firstDayOfMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth(), 1).getDay()

  const days = []
  for (let i = 0; i < firstDayOfMonth(currentDate); i++) {
    days.push(null)
  }
  for (let i = 1; i <= daysInMonth(currentDate); i++) {
    days.push(i)
  }

  const getEventsForDay = (day: number) => events.filter(e => e.date === day)
  
  const formatDate = () => {
    return currentDate.toLocaleDateString("en-US", { month: "long", year: "numeric" })
  }

  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))
  }

  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))
  }

  const today = new Date()
  const isToday = (day: number) => 
    day === today.getDate() && 
    currentDate.getMonth() === today.getMonth() && 
    currentDate.getFullYear() === today.getFullYear()

  // Upcoming events
  const upcomingEvents = events
    .filter(e => e.date >= today.getDate())
    .slice(0, 3)

  return (
    <div className="space-y-4">
      {/* Calendar Header */}
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
          <CalendarIcon className="w-4 h-4 text-slate-500" />
          Event Calendar
        </h3>
        <div className="flex items-center gap-1">
          <button 
            onClick={goToPreviousMonth}
            className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
          >
            <ChevronLeft size={18} className="text-slate-600 dark:text-slate-400" />
          </button>
          <span className="text-sm font-medium text-slate-700 dark:text-slate-300 min-w-[120px] text-center">
            {formatDate()}
          </span>
          <button 
            onClick={goToNextMonth}
            className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
          >
            <ChevronRight size={18} className="text-slate-600 dark:text-slate-400" />
          </button>
        </div>
      </div>

      {/* Day Names */}
      <div className="grid grid-cols-7 gap-1">
        {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((d) => (
          <div key={d} className="text-center text-xs font-medium text-slate-500 dark:text-slate-400 py-2">
            {d}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1">
        {days.map((day, idx) => {
          const dayEvents = day ? getEventsForDay(day) : []
          const hasEvents = dayEvents.length > 0
          
          return (
            <div 
              key={idx} 
              className={`
                aspect-square p-1 rounded-xl flex flex-col items-center justify-start
                ${day ? "hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors" : ""}
              `}
            >
              {day && (
                <>
                  <div 
                    className={`
                      w-7 h-7 flex items-center justify-center rounded-full text-xs font-medium
                      ${isToday(day) 
                        ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900" 
                        : "text-slate-700 dark:text-slate-300"
                      }
                    `}
                  >
                    {day}
                  </div>
                  {/* Event dots */}
                  {hasEvents && (
                    <div className="flex gap-0.5 mt-0.5">
                      {dayEvents.slice(0, 3).map((event) => (
                        <div 
                          key={event.id}
                          className={`w-1.5 h-1.5 rounded-full ${event.color}`}
                        />
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          )
        })}
      </div>

      {/* Upcoming Events */}
      {upcomingEvents.length > 0 && (
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
          <h4 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">
            Upcoming Events
          </h4>
          <div className="space-y-2">
            {upcomingEvents.map((event) => (
              <div 
                key={event.id}
                className="flex items-start gap-3 p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
              >
                <div className={`w-2 h-2 rounded-full mt-1.5 ${event.color}`} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-900 dark:text-white truncate">
                    {event.title}
                  </p>
                  <div className="flex items-center gap-3 mt-0.5">
                    {event.time && (
                      <span className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
                        <Clock className="w-3 h-3" />
                        {event.time}
                      </span>
                    )}
                    {event.location && (
                      <span className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
                        <MapPin className="w-3 h-3" />
                        {event.location}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

