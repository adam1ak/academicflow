import { http, HttpResponse } from "msw"

export const handlers = [
    http.get('/api/v1/my-plans', () => {
        return HttpResponse.json([
            {
                id: 1,
                name: 'Computer Science Plan 1',
                max_concurrent: 3,
                semester: 'fall25',
                accent_color: 'blue',
                schedule: [{
                    name: 'Data Structures',
                    start_time: 0,
                    end_time: 3
                }]
            }
        ])
    }),
    http.get('/api/v1/plans/:id/subjects', () => {
        return HttpResponse.json([
            {
                id: 101,
                name: 'Data Structures',
                field: 'CS',
                duration: 3,
                classroom: 'Room 101',
                is_completed: false,
                status: 'ready',
                dependents: []
            }
        ])
    }),
    http.get('/api/v1/deadlines', () => {
        return HttpResponse.json([])
    })
]