'use client'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import Login from '../../components/Auth/Login'
import { useAuth } from '../../contexts/AuthContext'

export default function LoginPage() {
    const { user } = useAuth()
    const router = useRouter()

    useEffect(() => {
        if (user) {
            router.push('/dashboard')
        }
    }, [user, router])

    if (user) return null

    return <Login />
}
