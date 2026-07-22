import { useMemo } from "react";
import { usePlan } from "../../../context/PlanContext";
import { AlertItem, computeAlerts } from "./alertsRules";

export function useAlerts(): AlertItem[] {
    const { activePlan, subjects, deadlines } = usePlan()

    const alerts = useMemo(() => {
        const activeSchedule = activePlan?.schedule ?? []
        const maxConcurrent = activePlan?.max_concurrent ?? 3
        const startDate = activePlan?.start_date

        return computeAlerts({
            subjects,
            deadlines,
            activeSchedule,
            maxConcurrent,
            startDate
        })
    }, [activePlan, subjects, deadlines])

    return alerts
}