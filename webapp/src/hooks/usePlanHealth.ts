import { useMemo } from "react";
import { PlanData } from "../types/plan";

export const PLAN_COLORS = {
    green: {
        statBar: "bg-[linear-gradient(90deg,rgba(34,197,94,.27),rgba(34,197,94,.1),transparent)]",
        valueColor: "text-accent-green",
    },
    blue: {
        statBar: "bg-[linear-gradient(90deg,rgba(74,126,255,.27),rgba(74,126,255,.1),transparent)]",
        valueColor: "text-accent-blue",
    },
    purple: {
        statBar: "bg-[linear-gradient(90deg,rgba(167,139,250,.27),rgba(167,139,250,.1),transparent)]",
        valueColor: "text-accent-purple",
    },
    orange: {
        statBar: "bg-[linear-gradient(90deg,rgba(245,158,11,.27),rgba(245,158,11,.1),transparent)]",
        valueColor: "text-accent-amber",
    },
    red: {
        statBar: "bg-[linear-gradient(90deg,rgba(239,68,68,.27),rgba(239,68,68,.1),transparent)]",
        valueColor: "text-red-500",
    }
}

export interface ColorTheme {
    statBar: string
    valueColor: string
}

export interface PlanHealth {
    score: number
    label: string
    color: ColorTheme
}

export const usePlanHealth = (plan: PlanData | undefined): PlanHealth => {
    return useMemo(() => {
        if (!plan || !plan.schedule || plan.schedule.length <= 0) {
            return {
                score: 0,
                label: "Empty Plan",
                color: PLAN_COLORS.red
            }
        }

        let score = plan.schedule.length * 15
        score = Math.min(100, score)

        if (score >= 80) {
            return { score, label: "Excellent", color: PLAN_COLORS.green };
        } else if (score >= 50) {
            return { score, label: "Good", color: PLAN_COLORS.purple };
        } else {
            return { score, label: "Needs Attention", color: PLAN_COLORS.orange };
        }
    }, [plan])
}