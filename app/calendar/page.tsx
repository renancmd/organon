"use client";

import { useState, useEffect, useMemo } from "react";
import { Plus, ChevronLeft, ChevronRight, CalendarDays, CalendarRange } from "lucide-react";
import {
	format,
	startOfMonth,
	endOfMonth,
	startOfWeek,
	endOfWeek,
	eachDayOfInterval,
	isSameMonth,
	isSameDay,
	addMonths,
	subMonths,
	addWeeks,
	subWeeks,
	startOfDay,
	parseISO,
	addDays
} from "date-fns";
import { getEvents } from "../../services/db.service.ts";
import NewEventModal from "../../components/EventNewModal/new-event-modal.tsx";
import EditEventModal from "../../components/EditEventModal/edit-event-modal.tsx"; // Make sure path is correct!

interface CalendarEvent {
	id: string;
	color: string;
	createdAt: string;
	date: string;
	endTime: string;
	location?: string;
	name: string;
	recurrence: string;
	startTime: string;
}

type GroupedEvents = Record<string, CalendarEvent[]>;

function EventTag({ event, onClick }: { event: CalendarEvent, onClick: (id: string) => void }) {
	return (
		<div
			onClick={(e) => {
				e.stopPropagation();
				onClick(event.id);
			}}
			className={`mt-1 flex items-center gap-1.5 rounded p-1 text-xs font-medium text-white ${event.color} truncate cursor-pointer hover:opacity-80 transition-opacity`}
			title={`${event.name} (${event.startTime} - ${event.endTime})`}
		>
			<span className="shrink-0">{event.startTime}</span>
			<span className="truncate">{event.name}</span>
		</div>
	);
}

interface MonthViewProps {
	currentDate: Date;
	eventsByDate: GroupedEvents;
	onEventClick: (id: string) => void;
}

function MonthView({ currentDate, eventsByDate, onEventClick }: MonthViewProps) {
	const startDayOfMonth = startOfMonth(currentDate);
	const endDayOfMonth = endOfMonth(currentDate);
	const startDayOfGrid = startOfWeek(startDayOfMonth);
	const endDayOfGrid = endOfWeek(endDayOfMonth);

	const daysInGrid = eachDayOfInterval({ start: startDayOfGrid, end: endDayOfGrid });
	const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
	const today = startOfDay(new Date());

	return (
		<div className="flex-1 overflow-hidden border-t border-gray-100 dark:border-gray-800/60">
			<div className="grid grid-cols-7 border-b border-gray-100 dark:border-gray-800/60 text-center font-medium text-gray-600 dark:text-gray-400">
				{weekDays.map(day => (
					<div key={day} className="py-2.5 text-sm">{day}</div>
				))}
			</div>
			<div className="grid grid-cols-7 flex-1">
				{daysInGrid.map(day => {
					const isCurrentMonthDay = isSameMonth(day, currentDate);
					const isTodayDay = isSameDay(day, today);
					const dateString = format(day, 'yyyy-MM-dd');
					const dayEvents = eventsByDate[dateString] || [];

					return (
						<div key={dateString} className={`group min-h-[120px] p-2 border-r border-b border-gray-100 dark:border-gray-800/60 transition-colors ${!isCurrentMonthDay ? "bg-gray-50 dark:bg-gray-800/40" : ""}`}>
							<div className="flex items-center justify-between">
								<span className={`flex h-7 w-7 items-center justify-center rounded-full text-sm font-semibold transition-colors ${!isCurrentMonthDay ? "text-gray-400 dark:text-gray-600" : "text-text-primary"} ${isTodayDay ? "bg-brand text-white" : ""}`}>
									{format(day, 'd')}
								</span>
								<button title="New Event on this day" className="p-1 opacity-0 group-hover:opacity-100 text-brand rounded-md transition-opacity">
									<Plus size={16} />
								</button>
							</div>
							<div className="mt-1 space-y-1 overflow-y-auto pr-1 h-[calc(100%-2.5rem)] scrollbar-thin scrollbar-thumb-gray-200 dark:scrollbar-thumb-gray-700">
								{dayEvents.map(event => (
									<EventTag key={event.id} event={event} onClick={onEventClick} />
								))}
							</div>
						</div>
					);
				})}
			</div>
		</div>
	);
}

interface WeekViewProps {
	currentDate: Date;
	eventsByDate: GroupedEvents;
	onEventClick: (id: string) => void;
}

function WeekView({ currentDate, eventsByDate, onEventClick }: WeekViewProps) {
	const startDayOfWeek = startOfWeek(currentDate);
	const hours = Array.from({ length: 24 }, (_, i) => `${i.toString().padStart(2, '0')}:00`);
	const today = startOfDay(new Date());

	const daysOfWeek = useMemo(() => {
		return Array.from({ length: 7 }, (_, i) => addDays(startDayOfWeek, i));
	}, [startDayOfWeek]);

	const getEventPosition = (event: CalendarEvent): { top: string, height: string } => {
		const sTime = event.startTime || "00:00";
		const eTime = event.endTime || "01:00";

		const startTime = parseISO(`${event.date}T${sTime}`);
		const endTime = parseISO(`${event.date}T${eTime}`);
		const durationHours = (endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60);
		const startOfDayTime = parseISO(`${event.date}T00:00`);
		const offsetHours = (startTime.getTime() - startOfDayTime.getTime()) / (1000 * 60 * 60);

		const hourHeightRem = 4;
		const remToPxFactor = 16;
		const top = offsetHours * hourHeightRem * remToPxFactor;
		const height = durationHours * hourHeightRem * remToPxFactor;

		return {
			top: `${top}px`,
			height: `${height}px`,
		};
	};

	return (
		<div className="flex flex-1 overflow-hidden border-t border-gray-100 dark:border-gray-800/60">

			<div className="w-16 shrink-0 flex flex-col pt-16 border-r border-gray-100 dark:border-gray-800/60 bg-gray-50 dark:bg-gray-800/20">
				{hours.map(hour => (
					<div key={hour} className={`h-[4rem] pr-3 text-right text-xs text-gray-500`}>{hour}</div>
				))}
			</div>


			<div className="flex-1 flex overflow-x-auto scrollbar-hide">
				{daysOfWeek.map(day => {
					const dateString = format(day, 'yyyy-MM-dd');
					const dayEvents = eventsByDate[dateString] || [];
					const isTodayDay = isSameDay(day, today);

					return (
						<div key={dateString} className={`flex-1 min-w-[150px] flex flex-col border-r border-gray-100 dark:border-gray-800/60 last:border-r-0 ${isTodayDay ? "bg-gray-50/50 dark:bg-gray-800/30" : ""}`}>

							<div className="h-16 flex items-center justify-center border-b border-gray-100 dark:border-gray-800/60">
								<div className="text-center">
									<div className={`text-sm font-semibold ${isTodayDay ? "text-brand" : "text-text-primary"}`}>{format(day, 'EEE')}</div>
									<div className={`mt-0.5 text-xs text-gray-500 font-medium ${isTodayDay ? "text-brand/80" : ""}`}>{format(day, 'd MMM')}</div>
								</div>
							</div>


							<div className="flex-1 relative">

								{hours.map((_, i) => (
									<div key={i} style={{ top: `${i * 4}rem` }} className="absolute left-0 right-0 border-t border-gray-100 dark:border-gray-800/40"></div>
								))}

								{dayEvents.map(event => {
									const position = getEventPosition(event);

									return (
										<div
											key={event.id}
											onClick={(e) => {
												e.stopPropagation();
												onEventClick(event.id);
											}}
											style={{ ...position }}
											className={`absolute left-0 right-0 rounded p-2 text-xs font-medium text-white ${event.color} space-y-1 z-10 m-1 cursor-pointer hover:opacity-90 transition-opacity`}
											title={`${event.name} (${event.startTime} - ${event.endTime})`}
										>
											<div className="font-bold truncate">{event.name}</div>
											<div className="truncate opacity-90">{event.startTime} - {event.endTime}</div>
										</div>
									);
								})}
							</div>
						</div>
					);
				})}
			</div>
		</div>
	);
}

export default function CalendarPage() {
	const [currentDate, setCurrentDate] = useState<Date>(new Date());
	const [viewMode, setViewMode] = useState<'month' | 'week'>('month');
	const [events, setEvents] = useState<CalendarEvent[]>([]);
	const [isLoadingEvents, setIsLoadingEvents] = useState(false);

	// Modals State
	const [isNewEventModalOpen, setIsNewEventModalOpen] = useState(false);
	const [editingEventId, setEditingEventId] = useState<string | null>(null);

	const eventsByDate = useMemo(() => {
		return events.reduce<GroupedEvents>((acc, event) => {
			acc[event.date] = acc[event.date] || [];
			acc[event.date].push(event);
			return acc;
		}, {});
	}, [events]);

	const loadEvents = async () => {
		setIsLoadingEvents(true);
		try {
			const fetchedEvents = await getEvents();
			setEvents(fetchedEvents as CalendarEvent[]);
		} catch (error) {
			console.error("Failed to load events:", error);
		} finally {
			setIsLoadingEvents(false);
		}
	};

	useEffect(() => {
		loadEvents();
	}, []);

	const handlePrevious = () => {
		setCurrentDate(viewMode === 'month' ? subMonths(currentDate, 1) : subWeeks(currentDate, 1));
	};

	const handleNext = () => {
		setCurrentDate(viewMode === 'month' ? addMonths(currentDate, 1) : addWeeks(currentDate, 1));
	};

	const setViewModeWrapper = (mode: 'month' | 'week') => {
		setViewMode(mode);
		if (mode === 'month') {
			setCurrentDate(startOfMonth(currentDate));
		} else {
			setCurrentDate(startOfWeek(currentDate));
		}
	}

	return (
		<div className="flex h-full flex-col rounded-xl border border-gray-200 bg-white shadow-2xl dark:border-gray-800 dark:bg-[#1a1a1a] overflow-hidden">

			<div className="flex flex-col gap-4 border-b border-gray-100 p-6 dark:border-gray-800/60 sm:flex-row sm:items-center sm:justify-between">
				<div className="flex flex-col gap-3">
					<div className="flex items-center gap-3">
						<CalendarDays size={24} className="text-brand" />
						<h1 className="text-3xl font-bold text-text-primary dark:text-white">Calendar</h1>
					</div>
					<div className="flex items-center gap-3">
						<button
							onClick={handlePrevious}
							className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-gray-800 dark:hover:text-gray-300 transition-colors"
						>
							<ChevronLeft size={20} />
						</button>
						<span className="text-xl font-semibold text-text-primary">
							{viewMode === 'month' ? format(currentDate, 'MMMM yyyy') : `Week of ${format(startOfWeek(currentDate), 'MMM d, yyyy')}`}
						</span>
						<button
							onClick={handleNext}
							className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-gray-800 dark:hover:text-gray-300 transition-colors"
						>
							<ChevronRight size={20} />
						</button>
					</div>
				</div>

				<div className="flex items-center gap-3 flex-wrap">
					<div className="flex rounded-lg border border-gray-200 p-0.5 dark:border-gray-700">
						<button onClick={() => setViewModeWrapper('month')} className={`flex items-center gap-1.5 rounded-md px-4 py-1.5 text-sm font-semibold transition-all ${viewMode === 'month' ? "bg-brand text-white shadow-md" : "text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"}`}>
							<CalendarDays size={18} />
							<span>Month</span>
						</button>
						<button onClick={() => setViewModeWrapper('week')} className={`flex items-center gap-1.5 rounded-md px-4 py-1.5 text-sm font-semibold transition-all ${viewMode === 'week' ? "bg-brand text-white shadow-md" : "text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"}`}>
							<CalendarRange size={18} />
							<span>Week</span>
						</button>
					</div>
					<button
						onClick={() => setIsNewEventModalOpen(true)}
						className="flex items-center gap-2 rounded-lg bg-brand px-5 py-2 text-sm font-semibold text-white shadow-sm hover:opacity-90 transition-opacity"
					>
						<Plus size={18} />
						New Event
					</button>
				</div>
			</div>


			<div className="flex flex-1 overflow-hidden">
				{viewMode === 'month' ? (
					<MonthView
						currentDate={currentDate}
						eventsByDate={eventsByDate}
						onEventClick={(id) => setEditingEventId(id)}
					/>
				) : (
					<WeekView
						currentDate={currentDate}
						eventsByDate={eventsByDate}
						onEventClick={(id) => setEditingEventId(id)}
					/>
				)}
			</div>


			<NewEventModal
				isOpen={isNewEventModalOpen}
				onClose={() => setIsNewEventModalOpen(false)}
				onSuccess={loadEvents}
			/>

			<EditEventModal
				isOpen={!!editingEventId}
				eventId={editingEventId}
				onClose={() => setEditingEventId(null)}
				onSuccess={() => {
					setEditingEventId(null);
					loadEvents();
				}}
			/>
		</div>
	);
}
