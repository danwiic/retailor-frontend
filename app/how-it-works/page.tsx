import Link from 'next/link'
import type { Metadata } from 'next'
import { Navbar } from '@/components/navbar'
import { SiteFooter } from '@/components/footer'

export const metadata: Metadata = {
  title: 'How it works',
  description:
    'See how Retailor parses, reviews, and tailors one resume to one exact job description.',
  openGraph: {
    title: 'How Retailor works',
    description:
      'See how Retailor parses, reviews, and tailors one resume to one exact job description.',
  },
}

const steps = [
  [
    '01',
    'Bring your resume',
    'Upload a PDF or DOCX. Retailor extracts the structure, but does not treat the first pass as final.',
  ],
  [
    '02',
    'Review the source',
    'Check your identity, summary, skills, experience, projects, and education. Edit anything that needs correcting.',
  ],
  [
    '03',
    'Name the target',
    'Paste the exact job description. Review the role details and requirements Retailor found.',
  ],
  [
    '04',
    'Tailor, then review',
    'The edited resume and edited job details go into the tailoring request. The returned draft stays editable.',
  ],
  [
    '05',
    'Download when ready',
    'Compare the original and tailored versions, make your final edits, then use the temporary DOCX link.',
  ],
]

export default function HowItWorks() {
  return (
    <div className="info-page">
      <Navbar />
      <main className="info-main">
        <div className="info-lede">
          <span className="eyebrow">How it works</span>
          <h1>One resume. One role. A reviewable draft.</h1>
          <p>
            Retailor is a short, document-first workflow for tailoring a resume to the exact job you
            are applying for. It is not a chat and it does not replace your judgment.
          </p>
          <Link className="btn btn--primary" href="/">
            Start an application
          </Link>
        </div>
        <section className="how-list" aria-label="Retailor workflow">
          {steps.map(([number, title, detail]) => (
            <article key={number}>
              <span>{number}</span>
              <div>
                <h2>{title}</h2>
                <p>{detail}</p>
              </div>
            </article>
          ))}
        </section>
        <section className="info-callout">
          <strong>What Retailor will not do</strong>
          <p>
            It will not invent qualifications, credentials, experience, or achievements. AI output
            is a starting point for your review.
          </p>
        </section>
      </main>
    </div>
  )
}
