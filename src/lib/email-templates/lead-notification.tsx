import * as React from 'react'
import { Body, Container, Head, Heading, Hr, Html, Preview, Section, Text } from '@react-email/components'
import type { TemplateEntry } from './registry'

interface Props {
  fullName?: string
  email?: string
  institution?: string
  jobTitle?: string
  country?: string
  message?: string
  interest?: 'demo' | 'pilot' | string
  language?: string
  sourcePath?: string
}

const LeadNotificationEmail = ({
  fullName,
  email,
  institution,
  jobTitle,
  country,
  message,
  interest,
  language,
  sourcePath,
}: Props) => {
  const kind = interest === 'pilot' ? 'un piloto' : 'una demostración'
  const rows: Array<[string, string | undefined]> = [
    ['Nombre', fullName],
    ['Correo', email],
    ['Institución', institution],
    ['Cargo', jobTitle],
    ['País', country],
    ['Idioma del formulario', language === 'en' ? 'Inglés' : 'Español'],
    ['Página', sourcePath],
  ]
  return (
    <Html lang="es" dir="ltr">
      <Head />
      <Preview>{`Nueva solicitud de ${kind}: ${institution ?? 'Kionas'}`}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Text style={eyebrow}>KIONAS · SOLICITUD INSTITUCIONAL</Text>
          <Heading style={h1}>Nueva solicitud de {kind}</Heading>
          <Text style={lead}>
            Alguien completó el formulario de la web institucional. Puedes responder directamente a este correo
            para escribirle.
          </Text>
          <Section style={card}>
            {rows.map(([label, value]) => (
              <Text key={label} style={row}>
                <span style={rowLabel}>{label}: </span>
                {value || '—'}
              </Text>
            ))}
          </Section>
          {message ? (
            <>
              <Text style={rowLabel}>Mensaje</Text>
              <Text style={messageStyle}>{message}</Text>
            </>
          ) : null}
          <Hr style={hr} />
          <Text style={footer}>La solicitud también quedó guardada en el panel de administración de Kionas.</Text>
        </Container>
      </Body>
    </Html>
  )
}

export const template = {
  component: LeadNotificationEmail,
  subject: (data: Record<string, any>) =>
    `Nueva solicitud de ${data.interest === 'pilot' ? 'piloto' : 'demostración'} — ${data.institution ?? 'Kionas'}`,
  displayName: 'Aviso de solicitud institucional',
  to: 'mnawraths92@gmail.com',
  previewData: {
    fullName: 'Ana Pérez',
    email: 'ana.perez@universidad.cl',
    institution: 'Universidad de ejemplo',
    jobTitle: 'Directora de innovación docente',
    country: 'Chile',
    message: 'Nos interesa explorar Kionas en un curso de ética profesional.',
    interest: 'pilot',
    language: 'es',
    sourcePath: '/contacto',
  },
} satisfies TemplateEntry

const main = { backgroundColor: '#ffffff', fontFamily: 'Helvetica, Arial, sans-serif', color: '#15233d' }
const container = { padding: '32px 28px', maxWidth: '560px' }
const eyebrow = { fontSize: '11px', letterSpacing: '2px', color: '#8a6d3b', margin: '0 0 12px' }
const h1 = { fontFamily: 'Georgia, serif', fontSize: '26px', fontWeight: 400, color: '#15233d', margin: '0 0 12px' }
const lead = { fontSize: '14px', lineHeight: '22px', color: '#4a5468', margin: '0 0 20px' }
const card = { backgroundColor: '#f4f1ea', borderRadius: '8px', padding: '16px 20px', margin: '0 0 20px' }
const row = { fontSize: '14px', lineHeight: '20px', margin: '4px 0', color: '#15233d' }
const rowLabel = { fontSize: '13px', fontWeight: 600, color: '#15233d' }
const messageStyle = { fontSize: '14px', lineHeight: '22px', color: '#15233d', whiteSpace: 'pre-line' as const, margin: '6px 0 0' }
const hr = { borderColor: '#e4dfd3', margin: '28px 0 16px' }
const footer = { fontSize: '12px', color: '#7a8292', margin: 0 }
