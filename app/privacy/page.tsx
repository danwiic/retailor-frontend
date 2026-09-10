import Link from 'next/link'
import type { Metadata } from 'next'
import { Navbar } from '@/components/navbar'
import { SiteFooter } from '@/components/footer'

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description:
    'Learn how Retailor processes resumes, job descriptions, external LLM requests, temporary exports, and browser device IDs.',
  robots: { index: true, follow: true },
}

export default function Privacy() {
  return (
    <div className="info-page">
      <Navbar />
      <main className="legal-main">
        <span className="eyebrow">Privacy</span>
        <h1>Privacy Policy</h1>
        <p className="legal-lede">
          Retailor is designed to handle the minimum information needed to tailor one resume to one
          job description. This page explains what happens when you use the tool.
        </p>
        <LegalSection title="What you provide">
          <p>
            You may provide a resume containing personal information such as your name, email
            address, phone number, employment history, education, and skills. You also provide the
            job-description text you paste into the tool.
          </p>
        </LegalSection>
        <LegalSection title="How your content is processed">
          <p>
            Your resume is uploaded to Retailor's backend for parsing. The resume and the job
            description are then sent to an external LLM service (GPT-5 mini), through the
            configured Azure AI Foundry integration, to extract or tailor content. Do not upload
            information you are not comfortable sending to these services.
          </p>
        </LegalSection>
        <LegalSection title="Generated files">
          <p>
            When tailoring is complete, Retailor generates a DOCX export and stores it in temporary
            object storage such as S3. The download URL is short-lived, and generated exports are
            subject to the storage lifecycle cleanup configured by the service. Treat the link as
            temporary and download the file promptly.
          </p>
        </LegalSection>
        <LegalSection title="Browser storage and device ID">
          <p>
            Retailor stores a browser-generated device ID in local storage for abuse prevention and
            may keep the current workflow in session storage so your edits survive navigation. The
            device ID is not an account or authentication identity.
          </p>
        </LegalSection>
        <LegalSection title="What we do not do">
          <p>
            We do not send resume or job-description content to analytics services, and the frontend
            does not log that content. Retailor does not sell your resume or job-description text.
          </p>
        </LegalSection>
        <LegalSection title="Your responsibility">
          <p>
            Review every parsed and tailored field before using it. Remove sensitive details that
            are not needed for your application, and do not rely on an AI-generated claim without
            verifying it.
          </p>
        </LegalSection>
        <p className="legal-foot">
          Questions about this policy can be directed to the project owner through{' '}
          <a href="https://danpirante.dev" target="_blank" rel="noreferrer">
            danpirante.dev
          </a>
          .
        </p>
        <Link href="/" className="btn btn--ghost">
          Back to Retailor
        </Link>
      </main>
    </div>
  )
}

function LegalSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="legal-section">
      <h2>{title}</h2>
      {children}
    </section>
  )
}
