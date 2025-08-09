import React, { useEffect, useMemo, useState } from 'react'

const TEST_FALLBACK_EMAILS = [
  'Sincere@april.biz',
  'Shanna@melissa.tv',
  'Nathan@yesenia.net',
  'Julianne.OConner@kory.org',
  'Lucio_Hettinger@annie.ca',
  'Karley_Dach@jasper.info',
  'Telly.Hoeger@billy.biz',
  'Sherwood@rosamond.me',
  'Chaim_McDermott@dana.io',
  'Rey.Padberg@karina.biz'
]

function trimText(text, max = 220) {
  if (!text) return ''
  return text.length > max ? text.slice(0, max).trim() + '…' : text
}

function buildReplyDraft(ticket, customer, tone = 'friendly') {
  const name = customer?.name || 'there'
  const company = customer?.company?.name || 'your company'
  const city = customer?.address?.city || 'your city'
  const subject = ticket?.subject || 'your request'

  const base = `Hi ${name}, thanks for reaching out about "${subject}". I've reviewed your message and account with ${company} in ${city}. Here's what I can do next: `

  const continuationFriendly = 'I can assist with the issue and outline the next steps to resolve it promptly. Please confirm any extra details so I can proceed.'
  const continuationConcise = 'I can help resolve this. Please confirm any extra details to proceed.'

  return base + (tone === 'concise' ? continuationConcise : continuationFriendly)
}

async function fetchJson(url) {
  const res = await fetch(url)
  if (!res.ok) {
    const message = `Request failed (${res.status})`
    throw new Error(message)
  }
  return res.json()
}

export default function App() {
  const [clientError, setClientError] = useState(null)
  const [ticket, setTicket] = useState(null)
  const [ticketLoading, setTicketLoading] = useState(true)

  const [customer, setCustomer] = useState(null)
  const [posts, setPosts] = useState([])
  const [dataLoading, setDataLoading] = useState(false)
  const [dataError, setDataError] = useState(null)
  const [notFound, setNotFound] = useState(false)

  const [tone, setTone] = useState('friendly')
  const [copyStatus, setCopyStatus] = useState('idle')

  const draft = useMemo(() => buildReplyDraft(ticket, customer, tone), [ticket, customer, tone])

  // Initialize Zendesk client and read ticket fields
  useEffect(() => {
    let cancelled = false
    async function init() {
      setTicketLoading(true)
      setClientError(null)
      try {
        const client = window.ZAFClient ? window.ZAFClient.init() : null
        if (!client) throw new Error('ZAFClient not available')

        const result = await client.get([
          'ticket.requester.email',
          'ticket.subject',
          'ticket.description'
        ])
        if (cancelled) return

        const email = result['ticket.requester.email'] || ''
        const subject = result['ticket.subject'] || ''
        const description = result['ticket.description'] || ''

        setTicket({ email, subject, description })
      } catch (err) {
        // For local dev, fallback to a test email and mock ticket
        const fallbackEmail = TEST_FALLBACK_EMAILS[Math.floor(Math.random() * TEST_FALLBACK_EMAILS.length)]
        setTicket({
          email: fallbackEmail,
          subject: 'Issue with my recent order',
          description:
            'Hi team, I ran into an issue with my recent order. The shipment seems delayed and I have some questions about tracking updates.'
        })
        setClientError(err.message)
      } finally {
        if (!cancelled) setTicketLoading(false)
      }
    }
    init()
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    if (!ticket?.email) return
    refreshData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ticket?.email])

  async function refreshData() {
    if (!ticket?.email) return
    setDataLoading(true)
    setDataError(null)
    setNotFound(false)
    try {
      const users = await fetchJson(
        `https://jsonplaceholder.typicode.com/users?email=${encodeURIComponent(ticket.email)}`
      )
      if (!users || users.length === 0) {
        setCustomer(null)
        setPosts([])
        setNotFound(true)
        return
      }
      const user = users[0]
      setCustomer(user)
      const posts = await fetchJson(
        `https://jsonplaceholder.typicode.com/posts?userId=${encodeURIComponent(user.id)}`
      )
      setPosts(posts?.slice(-3).reverse() || [])
    } catch (err) {
      setDataError(err.message || 'Failed to fetch data')
      setCustomer(null)
      setPosts([])
    } finally {
      setDataLoading(false)
    }
  }

  function regenerate() {
    // Just toggles tone back and forth to simulate regeneration variety
    setTone((prev) => (prev === 'friendly' ? 'concise' : 'friendly'))
  }

  async function copyToClipboard(text) {
    try {
      await navigator.clipboard.writeText(text)
      setCopyStatus('success')
      setTimeout(() => setCopyStatus('idle'), 1500)
    } catch (err) {
      setCopyStatus('error')
      setTimeout(() => setCopyStatus('idle'), 2000)
    }
  }

  const loading = ticketLoading || dataLoading

  return (
    
    <div className="container">
      <header className="app-header">
        <div className="title">ZenYC Public API Mini</div>
        <div className="subtitle">built by Ahmed Pervez</div>
      </header>

      {clientError && (
        <div className="alert info">Running in local dev mode. {clientError}</div>
      )}

      {/* Ticket Section */}
      <section className="card">
        <div className="card-header">Ticket</div>
        <div className="card-body">
          {ticketLoading ? (
            <Skeleton lines={3} />
          ) : (
            <div className="item-grid">
              <Row label="Email" value={ticket?.email || '—'} />
              <Row label="Subject" value={trimText(ticket?.subject)} />
              <Row label="Description" value={trimText(ticket?.description, 260)} />
            </div>
          )}
        </div>
      </section>

      {/* Customer Section */}
      <section className="card">
        <div className="card-header with-actions">
          <span>Customer</span>
          <div className="actions">
            <button className="btn" onClick={refreshData} disabled={dataLoading}>
              Refresh
            </button>
          </div>
        </div>
        <div className="card-body">
          {loading ? (
            <Skeleton lines={3} />
          ) : notFound ? (
            <div className="alert warn">Customer not found for this email.</div>
          ) : dataError ? (
            <div className="alert error">
              {dataError}
              <button className="btn btn-inline" onClick={refreshData}>Retry</button>
            </div>
          ) : (
            <div className="item-grid">
              <Row label="Name" value={customer?.name} />
              <Row label="Company" value={customer?.company?.name} />
              <Row label="City" value={customer?.address?.city} />
              <Row label="Website" value={customer?.website} />
            </div>
          )}
        </div>
      </section>

      {/* Posts Section */}
      <section className="card">
        <div className="card-header">Recent Posts</div>
        <div className="card-body">
          {loading ? (
            <Skeleton lines={3} />
          ) : notFound ? (
            <div className="muted">—</div>
          ) : (
            <ul className="post-list">
              {(posts || []).slice(0, 3).map((p) => (
                <li key={p.id}>• {p.title}</li>
              ))}
              {posts?.length === 0 && <li className="muted">No posts</li>}
            </ul>
          )}
        </div>
      </section>

      {/* Reply Draft */}
      <section className="card">
        <div className="card-header with-actions">
          <span>Reply Draft</span>
          <div className="actions">
            <select
              className="select"
              value={tone}
              onChange={(e) => setTone(e.target.value)}
              disabled={loading}
            >
              <option value="friendly">Friendly</option>
              <option value="concise">Concise</option>
            </select>
            <button className="btn" onClick={regenerate} disabled={loading}>Regenerate</button>
            <button className="btn" onClick={() => copyToClipboard(draft)} disabled={loading}>
              {copyStatus === 'success' ? 'Copied' : copyStatus === 'error' ? 'Copy Failed' : 'Copy'}
            </button>
          </div>
        </div>
        <div className="card-body">
          {loading ? <Skeleton lines={3} /> : <textarea className="draft" value={draft} readOnly />}
        </div>
      </section>

      <footer className="footer">Built with React 18 + Vite 5</footer>
    </div>
  )
}

function Row({ label, value }) {
  return (
    <div className="row">
      <div className="label">{label}</div>
      <div className="value">{value || '—'}</div>
    </div>
  )
}

function Skeleton({ lines = 3 }) {
  return (
    <div className="skeleton">
      {Array.from({ length: lines }).map((_, i) => (
        <div className="sk-line" key={i} />)
      )}
    </div>
  )
}


