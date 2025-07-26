'use client'
import Dashboard from '../../components/Dashboard/Dashboard'
import PrivateRoute from '../../components/PrivateRoute'

export default function DashboardPage() {
    return (
        <PrivateRoute>
            <Dashboard />
        </PrivateRoute>
    )
}
