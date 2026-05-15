import { logout } from '../services/api'

import { useState, useEffect } from 'react'

import { getMyPlans } from '../services/api'

function DashboardPage({ setIsLogged }) {
    const [myPlans, setMyPlans] = useState([])

    useEffect(() => {
        const fetchPlans = async () => {
            try {
                const plans = await getMyPlans()
                console.log(plans)

                setMyPlans(plans)
            } catch (e) {
                console.log("Error while fetching plans: ", e);
            }
        }

        fetchPlans()
    }, [])

    const handleLogout = () => {
        logout()
        setIsLogged(false)
    }


    return (
        <div>
            <h1>Login succeed!</h1>
            <button onClick={handleLogout}>Log out</button>

            <h2>Your Study Plans</h2>

            {myPlans.length === 0 ? (
                <p>No plans generated yet.</p>
            ) : (
                myPlans.map((plan) => (
                    <div key={plan.id} style={{ border: '1px solid black', margin: '10px', padding: '10px' }}>
                        <h3>{plan.name}</h3>
                        <ul>
                            {plan.schedule.map((subject) => (
                                <li key={subject.name}>
                                    <strong>{subject.name}</strong> (Week: {subject.start_time} - {subject.end_time})
                                </li>
                            ))}
                        </ul>
                    </div>
                ))
            )}
        </div>
    )
}

export default DashboardPage
