'use client'
import { Layout, Page, Spinner } from '@shopify/polaris'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'

export default function HomePage() {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading) {
      if (user) {
        router.push('/dashboard')
      } else {
        router.push('/login')
      }
    }
  }, [user, loading, router])

  if (loading) {
    return (
      <Page>
        <Layout>
          <Layout.Section>
            <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem' }}>
              <Spinner size="large" />
            </div>
          </Layout.Section>
        </Layout>
      </Page>
    )
  }

  return null
}
