import { useMemo } from "react"
import { usePlan } from "../context/PlanContext"
import { PLAN_COLORS, ColorTheme } from "./usePlanHealth"

export interface MetricItem {
    value: string | number
    description: string
    theme: ColorTheme 
}

export interface DynamicColorTheme {
    hex: string
    text: string
    bg: string
}

export interface ScheduleHealthItem extends MetricItem {
    label: string
    score: number
    prereqCoverage: number
    loadBalance: number
    deadlineSpacing: number
    colorHex: string
    textColorClass: string
    prereqColor: DynamicColorTheme
    loadColor: DynamicColorTheme
    spacingColor: DynamicColorTheme
}

export interface PlanStatistics {
    activeCourses: MetricItem
    completion: MetricItem
    creditLoad: MetricItem
    scheduleHealth: ScheduleHealthItem
}

const getDynamicTheme = (score: number): DynamicColorTheme => {
    if (score >= 85) return { hex: "#4ade80", text: "text-accent-green", bg: "bg-accent-green" }
    if (score >= 70) return { hex: "#c084fc", text: "text-accent-purple", bg: "bg-accent-purple" }
    if (score >= 50) return { hex: "#fbbf24", text: "text-accent-amber", bg: "bg-accent-amber" }
    return { hex: "#ef4444", text: "text-accent-red", bg: "bg-accent-red" }
}

const getCompletionTheme = (pct: number): ColorTheme => {
    if (pct >= 80) return PLAN_COLORS.green
    if (pct >= 50) return PLAN_COLORS.purple
    return PLAN_COLORS.orange
}

const getCreditTheme = (credits: number): ColorTheme => {
    if (credits > 21) return PLAN_COLORS.orange
    if (credits > 12) return PLAN_COLORS.purple
    return PLAN_COLORS.blue
}

const getHealthTheme = (score: number): ColorTheme => {
    if (score >= 85) return PLAN_COLORS.green
    if (score >= 70) return PLAN_COLORS.purple
    if (score >= 50) return PLAN_COLORS.orange
    return PLAN_COLORS.red
}

export function usePlanStats(): PlanStatistics {
    const { subjects, deadlines } = usePlan()

    const stats = useMemo((): PlanStatistics => {
        const totalCount = subjects.length

        if (totalCount === 0) {
            const redDynamic = getDynamicTheme(0)
            return {
                activeCourses: {
                    value: 0,
                    description: "0 unlocked · 0 locked",
                    theme: PLAN_COLORS.blue
                },
                completion: {
                    value: "0%",
                    description: "0 of 0 topics done",
                    theme: PLAN_COLORS.orange
                },
                creditLoad: {
                    value: "0 ECTS",
                    description: "Estimated Workload",
                    theme: PLAN_COLORS.blue
                },
                scheduleHealth: {
                    value: "0%",
                    label: "Empty Plan",
                    description: "0 conflicts detected",
                    score: 0,
                    prereqCoverage: 0,
                    loadBalance: 0,
                    deadlineSpacing: 0,
                    colorHex: redDynamic.hex,
                    textColorClass: redDynamic.text,
                    prereqColor: redDynamic,
                    loadColor: redDynamic,
                    spacingColor: redDynamic,
                    theme: PLAN_COLORS.red
                }
            }
        }

        const unlockedCount = subjects.filter(s => s.status === "ready").length
        const lockedCount = subjects.filter(s => s.status === "blocked").length

        const completedCount = subjects.filter(s => s.status === "completed").length
        const completionPercentage = Math.round((completedCount / totalCount) * 100)

        const creditLoadValue = totalCount * 3

        const prereqCoverage = Math.round(((completedCount + unlockedCount) / totalCount) * 100)
        const loadBalance = Math.max(50, 100 - (lockedCount * 8))
        const deadlineSpacing = Math.max(60, 100 - (deadlines.length * 5))

        const healthScore = Math.round((prereqCoverage + loadBalance + deadlineSpacing) / 3)

        let healthLabel = "Critical"
        if (healthScore >= 85) {
            healthLabel = "Excellent"
        } else if (healthScore >= 70) {
            healthLabel = "Good Standing"
        } else if (healthScore >= 50) {
            healthLabel = "Needs Attention"
        }

        const conflictsCount = deadlines.length > 2 ? 1 : 0

        const mainHealthDynamic = getDynamicTheme(healthScore)
        const prereqColor = getDynamicTheme(prereqCoverage)
        const loadColor = getDynamicTheme(loadBalance)
        const spacingColor = getDynamicTheme(deadlineSpacing)

        return {
            activeCourses: {
                value: totalCount,
                description: `${unlockedCount} unlocked · ${lockedCount} locked`,
                theme: PLAN_COLORS.blue
            },
            completion: {
                value: `${completionPercentage}%`,
                description: `${completedCount} of ${totalCount} topics done`,
                theme: getCompletionTheme(completionPercentage)
            },
            creditLoad: {
                value: `${creditLoadValue} ECTS`,
                description: "Estimated Workload",
                theme: getCreditTheme(creditLoadValue)
            },
            scheduleHealth: {
                value: `${healthScore}%`,
                label: healthLabel,
                description: `${conflictsCount} conflict${conflictsCount !== 1 ? "s" : ""} detected`,
                score: healthScore,
                prereqCoverage,
                loadBalance,
                deadlineSpacing,
                colorHex: mainHealthDynamic.hex,
                textColorClass: mainHealthDynamic.text,
                prereqColor,
                loadColor,
                spacingColor,
                theme: getHealthTheme(healthScore)
            }
        }
    }, [subjects, deadlines])

    return stats
}