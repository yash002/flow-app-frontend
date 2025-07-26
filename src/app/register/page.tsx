'use client'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import Register from '../../components/Auth/Register'
import { useAuth } from '../../contexts/AuthContext'

export default function RegisterPage() {
    const { user } = useAuth()
    const router = useRouter()

    useEffect(() => {
        if (user) {
            router.push('/dashboard')
        }
    }, [user, router])

    if (user) return null

    return <Register />
}
