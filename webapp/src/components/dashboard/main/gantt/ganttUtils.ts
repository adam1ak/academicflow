import { SubjectScheduleItem, SubjectDetailResponse } from "../../../../types/plan"
import { DeadlineResponse } from "../../../../types/deadline"

export const TOTAL_WEEKS = 12
export const LABEL_WIDTH = 170
export const ROW_HEIGHT = 48
export const BAR_HEIGHT = 28

export interface GanttRowData {
  name: string
  classroom: string | null
  status: "ready" | "blocked" | "completed"
  startWeek: number
  endWeek: number
  duration: number
}

export interface GanttDeadlineMark {
  id: number
  week: number
  label: string
  type: string
  color: string
}

export function hashCode(str: string): number {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash)
  }
  return Math.abs(hash)
}

export function getDeadlineColor(type: string): string {
  switch (type.toLowerCase()) {
    case "exam":
      return "var(--color-accent-red)"
    case "assignment":
      return "var(--color-accent-amber)"
    case "project":
      return "var(--color-accent-purple)"
    case "task":
      return "var(--color-accent-pink)"
    default:
      return "var(--color-accent-teal)"
  }
}

export function mapDeadlines(
  deadlines: DeadlineResponse[],
  startDateStr?: string | null
): GanttDeadlineMark[] {
  if (!startDateStr || deadlines.length === 0) return []
  const startDate = new Date(startDateStr)

  return deadlines.map(d => {
    const dueDate = new Date(d.due_date)
    const diffMs = dueDate.getTime() - startDate.getTime()
    const diffDays = Math.max(0, Math.floor(diffMs / (24 * 60 * 60 * 1000)))
    const week = Math.max(1, Math.min(TOTAL_WEEKS, Math.floor(diffDays / 7) + 1))

    return {
      id: d.id,
      week,
      label: d.title,
      type: d.type.toLowerCase().trim(),
      color: getDeadlineColor(d.type)
    }
  })
}

export function buildRows(
  schedule: SubjectScheduleItem[],
  subjects: SubjectDetailResponse[]
): GanttRowData[] {
  const subjectMap = new Map(subjects.map(s => [s.name, s]))

  return schedule
    .map(item => {
      const subject = subjectMap.get(item.name)
      const startWeek = item.start_time
      const endWeek = item.end_time
      const duration = endWeek - startWeek
      const status = subject?.status || "ready"

      return {
        name: item.name,
        classroom: subject?.classroom || null,
        status,
        startWeek,
        endWeek,
        duration
      }
    })
    .sort((a, b) => a.startWeek - b.startWeek)
}
