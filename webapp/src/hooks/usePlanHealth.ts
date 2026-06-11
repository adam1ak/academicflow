import { useMemo } from "react";
import { PlanData } from "../types/plan";

export const PLAN_COLORS = {
    green: {
        statBar: "stat-bar-green",
        valueColor: "text-accent-green",
    },
    blue: {
        statBar: "stat-bar-blue",
        valueColor: "text-accent-blue",
    },
    purple: {
        statBar: "stat-bar-purple",
        valueColor: "text-accent-purple",
    },
    orange: {
        statBar: "stat-bar-amber",
        valueColor: "text-accent-amber",
    },
    red: {
        statBar: "stat-bar-red",
        valueColor: "text-accent-red",
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