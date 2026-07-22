import { usePlan } from "../../../context/PlanContext"
import AlertCard from "./AlertCard"

interface AlertItem {
    type: "danger" | "warning" | "success" | "info"
    title: string
    description: string
}

function AlertsPanel() {
    const { activePlan, subjects, deadlines } = usePlan()

    const generateAlerts = (): AlertItem[] => {
        const alerts: AlertItem[] = []

        const now = new Date()
        const todayMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime()


        const activeSchedule = activePlan?.schedule ?? []
        const maxConcurrent = activePlan?.max_concurrent ?? 3

        const ONE_DAY_MS = 24 * 60 * 60 * 1000
        const FIVE_DAYS_MS = 5 * ONE_DAY_MS

        const incompleteSubjects = subjects.filter(s => !s.is_completed)

        // Rule 1: Detects clusters of 3 or more exams within a 5-day window.

        const exams = deadlines.filter(d => d.type.toLowerCase() === "exam")
            .map(d => {
                const date = new Date(d.due_date)
                date.setHours(0, 0, 0, 0)

                return {
                    ...d,
                    timestamp: date.getTime()
                }
            })
            .sort((a, b) => a.timestamp - b.timestamp)

        for (let i = 0; i < exams.length; i++) {
            const currentExam = exams[i]

            const windowEnd = currentExam.timestamp + FIVE_DAYS_MS
            const examsInWindow = [currentExam]

            for (let j = i + 1; j < exams.length; j++) {
                if (exams[j].timestamp <= windowEnd) {
                    examsInWindow.push(exams[j])
                } else break
            }

            if (examsInWindow.length >= 3) {
                const startDateStr = new Date(currentExam.timestamp).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric"
                })

                const endDateStr = new Date(examsInWindow[examsInWindow.length - 1].timestamp).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric"
                })

                alerts.push({
                    type: "danger",
                    title: "Exam Cluster Detected",
                    description: `You have ${examsInWindow.length} exams scheduled between ${startDateStr} and ${endDateStr}. Consider adjusting your study load.`
                })

                i = i + examsInWindow.length - 1
            }
        }


        // Rule 2: Warns if a single day has too many overlapping major/minor deadlines.

        const deadlinesByDay: Record<string, typeof deadlines> = {}
        deadlines.forEach(deadline => {
            const dateObj = new Date(deadline.due_date)
            const year = dateObj.getFullYear()
            const month = String(dateObj.getMonth() + 1).padStart(2, "0")
            const day = String(dateObj.getDate()).padStart(2, "0")
            const dateKey = `${year}-${month}-${day}`

            if (!deadlinesByDay[dateKey]) {
                deadlinesByDay[dateKey] = []
            }
            deadlinesByDay[dateKey].push(deadline)
        })

        Object.entries(deadlinesByDay).forEach(([dateKey, dayDeadlines]) => {
            const examCount = dayDeadlines.filter(d => d.type.toLowerCase() === "exam").length
            const projectCount = dayDeadlines.filter(d => d.type.toLowerCase() === "project").length
            const totalCount = dayDeadlines.length
            const minorCount = totalCount - (examCount + projectCount)

            const isUnfeasible = totalCount >= 3 || (totalCount >= 2 && (examCount + projectCount >= 1))

            if (isUnfeasible) {
                const dateStr = new Date(dateKey).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric"
                })

                let dynamicDescription = ""

                if (examCount > 0 && projectCount > 0) {
                    dynamicDescription = `${dateStr} • Critical: ${examCount} exam(s) & ${projectCount} project(s) scheduled simultaneously.`
                } else if (examCount > 1) {
                    dynamicDescription = `${dateStr} • Severe overload: ${examCount} exams on the same day.`
                } else if (projectCount > 1) {
                    dynamicDescription = `${dateStr} • High workload: ${projectCount} project deadlines collapsing.`
                } else if (examCount === 1) {
                    const suffix = minorCount > 0 ? ` mixed with ${minorCount} minor task(s)` : ""
                    dynamicDescription = `${dateStr} • 1 major exam${suffix}.`
                } else if (projectCount === 1) {
                    const suffix = minorCount > 0 ? ` mixed with ${minorCount} minor task(s)` : ""
                    dynamicDescription = `${dateStr} • 1 project deadline${suffix}.`
                } else {
                    dynamicDescription = `${dateStr} • Accumulation of ${minorCount} minor tasks.`
                }

                alerts.push({
                    type: examCount > 0 ? "danger" : "warning",
                    title: "Unfeasible Day",
                    description: dynamicDescription
                })
            }
        })

        // Rule 3: Detects hourly overlaps between exams scheduled on the same day.

        const timedExams = deadlines.filter(d => d.type.toLowerCase() == "exam")
            .map(d => ({
                ...d,
                exactTimestamp: new Date(d.due_date).getTime()
            }))
            .sort((a, b) => a.exactTimestamp - b.exactTimestamp)

        const EXAM_DURATION_MS = 60 * 60 * 1000
        for (let i = 0; i < timedExams.length - 1; i++) {
            const currentExam = timedExams[i]
            const nextExam = timedExams[i + 1]

            const currentExamEnd = currentExam.exactTimestamp + EXAM_DURATION_MS

            if (nextExam.exactTimestamp < currentExamEnd) {
                const dateStr = new Date(currentExam.exactTimestamp).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric"
                })

                const timeCurrent = new Date(currentExam.exactTimestamp).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false })

                const timeNext = new Date(nextExam.exactTimestamp).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false })

                alerts.push({
                    type: "danger",
                    title: "Exam Hourly Collision",
                    description: `${dateStr} • Time overlap between ${currentExam.title} (${timeCurrent}) and ${nextExam.title} (${timeNext}).`
                })
            }
        }

        // Rule 4: Generates alerts for exams occurring within the next 2-3 days.

        const examsWithDistance = deadlines.filter(d => d.type.toLowerCase() === "exam")
            .map(d => {
                const examDate = new Date(d.due_date);
                const examMidnight = new Date(examDate.getFullYear(), examDate.getMonth(), examDate.getDate()).getTime()
                const diffDays = Math.round((examMidnight - todayMidnight) / (1000 * 60 * 60 * 24))

                return {
                    title: d.title,
                    due_date: d.due_date,
                    diffDays
                }
            })

        examsWithDistance.forEach(exam => {
            if (exam.diffDays < 0) return

            const dateStr = new Date(exam.due_date).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric"
            })

            const timePhrase = exam.diffDays === 0
                ? "is today"
                : exam.diffDays === 1
                    ? "is tomorrow"
                    : `is in ${exam.diffDays} days`

            if (exam.diffDays <= 2) {
                alerts.push({
                    type: "danger",
                    title: "Exam Imminent",
                    description: `${dateStr} - ${exam.title} ${timePhrase}. Urgent preparation required.`
                })
            } else if (exam.diffDays === 3) {
                alerts.push({
                    type: "warning",
                    title: "Exam Approaching",
                    description: `${dateStr} • ${exam.title} ${timePhrase}. Review your material.`
                })
            }
        })

        // Rule 5: Warns if a single week has 4 or more deadlines.

        if (activePlan?.start_date) {
            const planStartMs = new Date(activePlan.start_date).getTime()

            const deadlinesWithWeeks = deadlines.map(d => {
                const deadlineMs = new Date(d.due_date).getTime()

                const diffDays = Math.floor((deadlineMs - planStartMs) / (1000 * 60 * 60 * 24))

                const weekNumber = Math.floor(diffDays / 7) + 1

                return {
                    title: d.title,
                    weekNumber
                }
            })

            const countByWeek: Record<number, number> = {}

            deadlinesWithWeeks.forEach(item => {
                if (!countByWeek[item.weekNumber]) countByWeek[item.weekNumber] = 0

                countByWeek[item.weekNumber]++
            })

            Object.entries(countByWeek).forEach(([weekStr, count]) => {
                if (count >= 4) {
                    const weekNumber = Number(weekStr)

                    alerts.push({
                        type: "warning",
                        title: "Heavy Week Detected",
                        description: `Week ${weekNumber} has ${count} deadlines scheduled. High risk of overload.`
                    })
                }
            })
        }

        // Rule 6: Warns if a project/assignment is due exactly one day before an exam.

        const examMidnights = new Map<number, string>()
        const nonExamTasks: { title: string; type: string; midnight: number }[] = []

        deadlines.forEach(d => {
            const date = new Date(d.due_date)
            const midnightTimestamp = new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime()

            if (d.type.toLowerCase() === "exam") {
                examMidnights.set(midnightTimestamp, d.title)
            } else {
                nonExamTasks.push({
                    title: d.title,
                    type: d.type,
                    midnight: midnightTimestamp
                })
            }
        })

        nonExamTasks.forEach(task => {
            const dayAfterTask = task.midnight + ONE_DAY_MS
            const examTitle = examMidnights.get(dayAfterTask)

            if (examTitle) {
                const dateStr = new Date(task.midnight).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric"
                })

                alerts.push({
                    type: "warning",
                    title: "No Study Buffer",
                    description: `${dateStr} - ${task.title} (${task.type}) is due the day before ${examTitle}.`
                })
            }
        })

        // Rule 7: Detects deadlines scheduled on Saturdays or Sundays.

        deadlines.forEach(d => {
            const date = new Date(d.due_date)
            const dayOfWeek = date.getDay()

            if (dayOfWeek === 0 || dayOfWeek === 6) {
                const dateStr = date.toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric"
                })

                const dayName = dayOfWeek === 0 ? "Sunday" : "Saturday"

                alerts.push({
                    type: "info",
                    title: "Weekend Deadline",
                    description: `${dateStr} (${dayName}) - ${d.title} (${d.type}) is due on a weekend.`
                })
            }
        })

        // ==========================================
        // 🕸️ GRUPA B: ZATORY W GRAFIE PRZEDMIOTÓW (Graph Bottlenecks)
        // ==========================================

        // Rule 8: Detects critical bottleneck subjects blocking downstream courses.

        const incompleteNames = new Set(incompleteSubjects.map(s => s.name))
        const adjacencyMap = new Map<string, string[]>()

        subjects.forEach(s => {
            adjacencyMap.set(s.name, s.dependents || [])
        })

        incompleteSubjects.forEach(subject => {
            const blockedNodes = new Set<string>()

            const queue: string[] = [...(adjacencyMap.get(subject.name) || [])]

            while (queue.length > 0) {
                const current = queue.shift()!

                if (!blockedNodes.has(current)) {
                    if (incompleteNames.has(current)) {
                        blockedNodes.add(current)
                    }

                    const neighbors = adjacencyMap.get(current) || []
                    queue.push(...neighbors)
                }
            }

            if (blockedNodes.size >= 4) {
                alerts.push({
                    type: "danger",
                    title: "Critical Bottleneck",
                    description: `${subject.name} is incomplete and blocks ${blockedNodes.size} downstream subjects.`
                })
            }
        })

        // Rule 9: Detects prerequisite deadlocks where no subject is ready.

        const hasIncompletePrereqs = new Map<string, boolean>()

        incompleteSubjects.forEach(s => {
            hasIncompletePrereqs.set(s.name, false)
        })

        incompleteSubjects.forEach(parent => {
            const dependents = parent.dependents || []
            dependents.forEach(childName => {
                if (incompleteNames.has(childName)) {
                    hasIncompletePrereqs.set(childName, true)
                }
            })
        })

        if (incompleteSubjects.length > 0) {
            const hasReadySubject = Array.from(hasIncompletePrereqs.values()).some(isBlocked => !isBlocked)


            if (!hasReadySubject) {
                alerts.push({
                    type: "danger",
                    title: "Deadlock Detected",
                    description: "All remaining subjects are blocked by unsatisfied prerequisites. No subjects are available to take."
                })
            }
        }

        // Rule 10: Warns about long linear sequences of prerequisites.

        const chainMemo = new Map<string, number>()

        const getChainDepth = (nodeName: string): number => {
            if (chainMemo.has(nodeName)) return chainMemo.get(nodeName)!

            const neighbors = (adjacencyMap.get(nodeName) || []).filter(name => incompleteNames.has(name))

            if (neighbors.length === 0) {
                chainMemo.set(nodeName, 1)
                return 1
            }

            let maxChildDepth = 0
            neighbors.forEach(neighbor => {
                maxChildDepth = Math.max(maxChildDepth, getChainDepth(neighbor))
            })

            const currentDepth = 1 + maxChildDepth
            chainMemo.set(nodeName, currentDepth)
            return currentDepth
        }

        incompleteSubjects.forEach(subject => {
            const chainLength = getChainDepth(subject.name)

            if (chainLength >= 4) {
                alerts.push({
                    type: "warning",
                    title: "Long Dependency Chain",
                    description: `${subject.name} starts a chain of ${chainLength} dependent subjects.`
                })
            }
        })

        // Rule 11: Highlights foundation subjects that directly block multiple courses.


        incompleteSubjects.forEach(subject => {
            const directDependents = subject.dependents || []
            const directCount = directDependents.filter(name => incompleteNames.has(name)).length

            if (directCount >= 3) {
                alerts.push({
                    type: "warning",
                    title: "Foundation Subject Risk",
                    description: `${subject.name} is incomplete and directly blocks ${directCount} subjects.`
                })
            }
        })

        // ==========================================
        // ⚖️ GRUPA C: LIMITI I OBCIĄŻENIE HARMONOGRAMU (Concurrency & ECTS)
        // ==========================================

        // Rule 12: Warns if any week exceeds the plan's concurrency limit.

        const subjectsPerWeek: Record<number, number> = {}
        for (let w = 1; w <= 12; w++) subjectsPerWeek[w] = 0

        activeSchedule.forEach(item => {
            if (!incompleteNames.has(item.name)) return

            for (let w = item.start_time; w < item.end_time; w++) {
                if (w >= 0 && w <= 12) {
                    const uiWeekNumber = w + 1
                    subjectsPerWeek[uiWeekNumber]++
                }
            }
        })

        const overloadedWeeks = Object.entries(subjectsPerWeek)
            .filter(([_, count]) => count > maxConcurrent)
            .map(([weekStr]) => Number(weekStr))
            .sort((a, b) => a - b)

        if (overloadedWeeks.length > 0) {
            const label = overloadedWeeks.length === 1 ? "Week" : "Weeks"
            const weeksList = overloadedWeeks.join(", ")

            alerts.push({
                type: "warning",
                title: "Concurrency Limit Exceeded",
                description: `${label} ${weeksList}: You have more active subjects running concurrently than your plan limit (${maxConcurrent}).`
            })
        }

        // Rule 13: Triggers if remaining incomplete subjects exceed 30 ECTS.

        const totalEcts = incompleteSubjects.length * 3
        if (totalEcts > 30) {
            alerts.push({
                type: "danger",
                title: "Extreme Credit Load",
                description: `Your plan includes ${totalEcts} ECTS points of remaining subjects. Consider spreading them out.`
            })
        }

        // Rule 14: Identifies empty weeks (zero load) in the middle of the semester.

        let freeWeeks: number[] = []

        if (incompleteSubjects.length > 0) {
            for (let w = 2; w <= 11; w++) {
                const count = subjectsPerWeek[w] || 0

                if (count === 0) freeWeeks.push(w)
            }
        }

        if (freeWeeks.length > 0) {
            const weekLabel = freeWeeks.length === 1 ? "week" : "weeks"
            const weeksList = freeWeeks.join(", ")

            alerts.push({
                type: "info",
                title: "Free Weeks",
                description: `In ${weekLabel} ${weeksList} you have no subjects scheduled. Use this time to rest or catch up.`
            })
        }

        // Rule 15: Warns if there is a severe load imbalance between weeks.

        const activeLoads = Object.values(subjectsPerWeek).filter(count => count > 0)

        if (activeLoads.length > 0) {
            const maxLoad = Math.max(...activeLoads)
            const minLoad = Math.min(...activeLoads)
            const loadDifference = maxLoad - minLoad

            if (loadDifference >= 4) {
                const busiestWeeks = Object.entries(subjectsPerWeek)
                    .filter(([_, count]) => count === maxLoad)
                    .map(([weekStr]) => Number(weekStr))
                    .sort((a, b) => a - b)
                    .join(", ")

                const lightestWeeks = Object.entries(subjectsPerWeek)
                    .filter(([_, count]) => count === minLoad && count > 0)
                    .map(([weekStr]) => Number(weekStr))
                    .sort((a, b) => a - b)
                    .join(", ")

                const busyLabel = busiestWeeks.includes(",") ? "Weeks" : "Week"
                const lightLabel = lightestWeeks.includes(",") ? "Weeks" : "Week"

                alerts.push({
                    type: "warning",
                    title: "Unbalanced Semester",
                    description: `Unbalanced schedule: ${busyLabel} ${busiestWeeks} (${maxLoad} subjects) vs ${lightLabel} ${lightestWeeks} (${minLoad} subject${minLoad > 1 ? "s" : ""}). Consider leveling your timeline.`
                })
            }
        }

        // Rule 16: Displays a success message if there are no critical danger or warning alerts.

        const hasCriticalAlerts = alerts.some(a => a.type === "danger" || a.type === "warning")
        if (!hasCriticalAlerts) {
            alerts.unshift({
                type: "success",
                title: "All Clear",
                description: "Your semester timeline looks balanced and free of potential deadline clashes."
            })
        }

        return alerts
    }

    const activeAlerts = generateAlerts()

    return (
        <section className="bg-surface border border-dim rounded-xl p-3.5">
            <p className="font-mono text-[10px] uppercase tracking-widest text-sec mb-3">Alerts</p>

            <div className="space-y-2.5">
                {activeAlerts.map((alert, index) => (
                    <AlertCard
                        key={index}
                        type={alert.type}
                        title={alert.title}
                        description={alert.description}
                    />
                ))}
            </div>
        </section>
    )
}

export default AlertsPanel