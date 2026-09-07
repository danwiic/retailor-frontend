'use client'

import { useEffect, useRef, useState } from 'react'
import { analyzeJd, asResult, parseResume, tailor } from '@/lib/api'
import {
  emptyJd,
  emptyResume,
  normalizeJd,
  normalizeResume,
  type JobDescription,
  type Resume,
  type ResumeSection,
} from '@/lib/types'
import { ArrowRightIcon, CheckIcon, DownloadIcon, FileIcon, RefreshIcon, UploadIcon } from './icons'
import { Navbar } from './navbar'

type Step = 'upload' | 'resume' | 'job' | 'tailor' | 'result'
const steps: { id: Step; label: string; note: string }[] = [
  { id: 'upload', label: 'Upload', note: 'Bring your resume' },
  { id: 'resume', label: 'Review resume', note: 'Check what we found' },
  { id: 'job', label: 'Job details', note: 'Add the exact posting' },
  { id: 'tailor', label: 'Tailor', note: 'Match the documents' },
  { id: 'result', label: 'Review result', note: 'Edit before download' },
]

function apiMessage(status: number, detail: string) {
  if (status === 429)
    return 'The daily limit for this browser has been reached. Try again tomorrow or use a different device.'
  if (status === 413)
    return 'That file or request is too large. Keep resumes under 5 MB and job descriptions under 6,000 characters.'
  if (status === 502 || status === 503)
    return 'The service is temporarily unavailable. Check your connection and try again.'
  return detail || 'Please check the fields and try again.'
}

function Field({
  label,
  value,
  onChange,
  multiline = false,
  hint,
}: {
  label: string
  value: string
  onChange: (value: string) => void
  multiline?: boolean
  hint?: string
}) {
  return (
    <label className="field">
      <span className="field__label">{label}</span>
      {multiline ? (
        <textarea
          className="textarea editor-textarea"
          value={value}
          onChange={e => onChange(e.target.value)}
        />
      ) : (
        <input className="input" value={value} onChange={e => onChange(e.target.value)} />
      )}
      {hint && <span className="field__note">{hint}</span>}
    </label>
  )
}

function ListField({
  label,
  values,
  onChange,
  placeholder,
}: {
  label: string
  values: string[]
  onChange: (values: string[]) => void
  placeholder: string
}) {
  return (
    <div className="field">
      <div className="field__label-row">
        <span className="field__label">{label}</span>
        <button className="text-button" type="button" onClick={() => onChange([...values, ''])}>
          + Add
        </button>
      </div>
      {values.map((value, index) => (
        <div className="list-row" key={`${label}-${index}`}>
          <input
            className="input"
            placeholder={placeholder}
            value={value}
            onChange={e => onChange(values.map((item, i) => (i === index ? e.target.value : item)))}
          />
          <button
            className="icon-button"
            type="button"
            aria-label={`Remove ${label} ${index + 1}`}
            onClick={() => onChange(values.filter((_, i) => i !== index))}
          >
            ×
          </button>
        </div>
      ))}
    </div>
  )
}

function Repeatable({
  label,
  values,
  onChange,
}: {
  label: string
  values: ResumeSection[]
  onChange: (values: ResumeSection[]) => void
}) {
  const update = (index: number, key: string, value: string) =>
    onChange(values.map((item, i) => (i === index ? { ...item, [key]: value } : item)))
  return (
    <div className="field">
      <div className="field__label-row">
        <span className="field__label">{label}</span>
        <button className="text-button" type="button" onClick={() => onChange([...values, {}])}>
          + Add
        </button>
      </div>
      {values.map((item, index) => (
        <div className="repeatable" key={`${label}-${index}`}>
          <div className="repeatable__head">
            <strong>
              {label} {index + 1}
            </strong>
            <button
              className="text-button text-button--danger"
              type="button"
              onClick={() => onChange(values.filter((_, i) => i !== index))}
            >
              Remove
            </button>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field
              label="Title / degree"
              value={String(item.title ?? item.degree ?? '')}
              onChange={v => update(index, 'title', v)}
            />
            <Field
              label="Company / school"
              value={String(item.company ?? item.school ?? '')}
              onChange={v => update(index, 'company', v)}
            />
            <Field
              label="Dates"
              value={String(item.years ?? item.dates ?? '')}
              onChange={v => update(index, 'years', v)}
            />
          </div>
          <Field
            label="Details"
            multiline
            value={String(
              item.description ?? (Array.isArray(item.bullets) ? item.bullets.join('\n') : '')
            )}
            onChange={v => update(index, 'description', v)}
            hint="One accomplishment per line"
          />
        </div>
      ))}
    </div>
  )
}

function ResumeEditor({
  resume,
  onChange,
}: {
  resume: Resume
  onChange: (resume: Resume) => void
}) {
  return (
    <div className="editor-stack">
      <div className="section-intro">
        <span className="eyebrow">Extracted resume</span>
        <h2>Review before we use it</h2>
        <p>
          AI parsing is a draft. Correct anything that is missing or off; your edits stay with this
          application.
        </p>
      </div>
      <div className="editor-sheet">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field
            label="Name"
            value={resume.name}
            onChange={name => onChange({ ...resume, name })}
          />
          <Field
            label="Contact"
            value={resume.contact.map(c => `${c.label}: ${c.value}`).join(' · ')}
            onChange={value =>
              onChange({
                ...resume,
                contact: value.split('·').map(item => {
                  const [label, ...rest] = item.split(':')
                  return {
                    label: label.trim() || 'contact',
                    value: rest.join(':').trim() || label.trim(),
                  }
                }),
              })
            }
            hint="Separate multiple items with ·"
          />
        </div>
        <Field
          label="Summary"
          multiline
          value={resume.summary}
          onChange={summary => onChange({ ...resume, summary })}
        />
        <ListField
          label="Skills"
          values={resume.skills}
          onChange={skills => onChange({ ...resume, skills })}
          placeholder="Skill or tool"
        />
        <Repeatable
          label="Experience"
          values={resume.experience}
          onChange={experience => onChange({ ...resume, experience })}
        />
        <Repeatable
          label="Projects"
          values={resume.projects}
          onChange={projects => onChange({ ...resume, projects })}
        />
        <Repeatable
          label="Education"
          values={resume.education}
          onChange={education => onChange({ ...resume, education })}
        />
      </div>
    </div>
  )
}

function JobEditor({
  jd,
  onChange,
}: {
  jd: JobDescription
  onChange: (jd: JobDescription) => void
}) {
  return (
    <div className="editor-stack">
      <div className="section-intro">
        <span className="eyebrow">Job requirements</span>
        <h2>Make the target precise</h2>
        <p>
          Review what the posting asks for. Retailor only works from the qualifications and
          responsibilities you confirm.
        </p>
      </div>
      <div className="editor-sheet">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Title" value={jd.title} onChange={title => onChange({ ...jd, title })} />
          <Field
            label="Company"
            value={jd.company}
            onChange={company => onChange({ ...jd, company })}
          />
          <Field
            label="Location"
            value={jd.location}
            onChange={location => onChange({ ...jd, location })}
          />
          <Field
            label="Employment type"
            value={jd.employment_type}
            onChange={employment_type => onChange({ ...jd, employment_type })}
          />
        </div>
        <ListField
          label="Requirements"
          values={jd.requirements}
          onChange={requirements => onChange({ ...jd, requirements })}
          placeholder="Required qualification"
        />
        <ListField
          label="Responsibilities"
          values={jd.responsibilities}
          onChange={responsibilities => onChange({ ...jd, responsibilities })}
          placeholder="Responsibility"
        />
        <ListField
          label="Nice to have"
          values={jd.nice_to_have}
          onChange={nice_to_have => onChange({ ...jd, nice_to_have })}
          placeholder="Preferred qualification"
        />
      </div>
    </div>
  )
}

function Document({
  resume,
  editable = false,
  onChange,
}: {
  resume: Resume
  editable?: boolean
  onChange?: (resume: Resume) => void
}) {
  return (
    <article className="document">
      <div className="document__head">
        <span className="eyebrow">{editable ? 'Tailored draft' : 'Original resume'}</span>
        <strong>{resume.name || 'Untitled resume'}</strong>
        <span>{resume.contact.map(c => c.value).join(' · ')}</span>
      </div>
      <div className="document__section">
        <h3>Summary</h3>
        {editable ? (
          <textarea
            className="document-input"
            value={resume.summary}
            onChange={e => onChange?.({ ...resume, summary: e.target.value })}
          />
        ) : (
          <p>{resume.summary || 'No summary provided.'}</p>
        )}
      </div>
      <div className="document__section">
        <h3>Experience</h3>
        {resume.experience.map((item, i) => (
          <div className="document__entry" key={i}>
            <strong>{String(item.title ?? 'Role')}</strong>
            <span>
              {String(item.company ?? 'Company')} {item.years ? `· ${String(item.years)}` : ''}
            </span>
            <p>
              {String(
                item.description ?? (Array.isArray(item.bullets) ? item.bullets.join(' ') : '')
              )}
            </p>
          </div>
        ))}
      </div>
      <div className="document__section">
        <h3>Skills</h3>
        {editable ? (
          <input
            className="document-input"
            value={resume.skills.join(', ')}
            onChange={e =>
              onChange?.({
                ...resume,
                skills: e.target.value
                  .split(',')
                  .map(x => x.trim())
                  .filter(Boolean),
              })
            }
          />
        ) : (
          <p>{resume.skills.join(' · ') || 'No skills provided.'}</p>
        )}
      </div>
    </article>
  )
}

function resumeWordCount(resume: Resume) {
  const sections = [
    resume.name,
    ...resume.contact.flatMap(contact => [contact.label, contact.value]),
    resume.summary,
    ...resume.skills,
    ...resume.experience.flatMap(section => Object.values(section)),
    ...resume.projects.flatMap(section => Object.values(section)),
    ...resume.education.flatMap(section => Object.values(section)),
  ]
  return sections
    .flatMap(value => (Array.isArray(value) ? value : [value]))
    .filter(value => typeof value === 'string')
    .join(' ')
    .trim()
    .split(/\s+/)
    .filter(Boolean).length
}

function LengthIndicator({ tailored, original }: { tailored: Resume; original: Resume }) {
  const tailoredWords = resumeWordCount(tailored)
  const originalWords = resumeWordCount(original)
  const tailoredPages = Math.max(1, Math.round((tailoredWords / 450) * 10) / 10)
  const originalPages = Math.max(1, Math.round((originalWords / 450) * 10) / 10)
  const isLong = tailoredPages > 2
  return (
    <div
      className={`length-indicator ${isLong ? 'length-indicator--attention' : ''}`}
      role="status"
      aria-live="polite"
    >
      <div>
        <strong>Estimated length</strong>
        <span>Based on roughly 450 words per resume page</span>
      </div>
      <div className="length-stat">
        <b>{tailoredWords.toLocaleString()}</b>
        <span>words</span>
      </div>
      <div className="length-stat">
        <b>~{tailoredPages.toFixed(1)}</b>
        <span>pages</span>
      </div>
      <span className="length-delta">
        Original: {originalWords.toLocaleString()} words · ~{originalPages.toFixed(1)} pages
      </span>
      {isLong && (
        <p>
          This draft is running longer than two pages. Tighten the editable content before
          downloading.
        </p>
      )}
    </div>
  )
}

export function Workflow() {
  const [step, setStep] = useState<Step>('upload')
  const [file, setFile] = useState<File | null>(null)
  const [resume, setResume] = useState(emptyResume())
  const [jdText, setJdText] = useState('')
  const [jd, setJd] = useState(emptyJd())
  const [tailored, setTailored] = useState<Resume | null>(null)
  const [downloadUrl, setDownloadUrl] = useState('')
  const [busy, setBusy] = useState<string | null>(null)
  const [error, setError] = useState('')
  const [hydrated, setHydrated] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const restored = useRef(false)
  useEffect(() => {
    const restore = window.setTimeout(() => {
      try {
        const raw = sessionStorage.getItem('retailor.workflow')
        if (raw) {
          const saved = JSON.parse(raw)
          setStep(saved.step ?? 'upload')
          setResume(normalizeResume(saved.resume))
          setJd(normalizeJd(saved.jd))
          setJdText(saved.jdText ?? '')
        }
      } catch {
        /* optional session state */
      }
      restored.current = true
    }, 0)
    return () => window.clearTimeout(restore)
  }, [])
  useEffect(() => {
    const ready = window.setTimeout(() => setHydrated(true), 0)
    return () => window.clearTimeout(ready)
  }, [])
  useEffect(() => {
    if (!restored.current) return
    try {
      sessionStorage.setItem('retailor.workflow', JSON.stringify({ step, resume, jd, jdText }))
    } catch {
      /* storage may be unavailable */
    }
  }, [step, resume, jd, jdText])
  async function upload(nextFile: File) {
    if (busy) return
    setError('')
    if (!/\.(pdf|docx?)$/i.test(nextFile.name) || nextFile.size > 5 * 1024 * 1024) {
      setError('Choose a PDF or DOCX file under 5 MB.')
      return
    }
    setFile(nextFile)
    setBusy('parse')
    try {
      const response = await parseResume(nextFile)
      const result = asResult(response.data, response.status, "We couldn't read that resume.")
      if (!result.ok) {
        setError(apiMessage(response.status, result.detail))
        return
      }
      setResume(normalizeResume(result.value))
      setStep('resume')
    } catch {
      setError("We couldn't reach the resume reader. Check your connection and try again.")
    } finally {
      setBusy(null)
    }
  }
  async function analyze() {
    setError('')
    if (jdText.trim().length < 1 || jdText.length > 6000) {
      setError('Add a job description between 1 and 6,000 characters.')
      return
    }
    setBusy('analyze')
    const response = await analyzeJd(jdText)
    const result = asResult(response.data, response.status, "We couldn't analyze that posting.")
    setBusy(null)
    if (!result.ok) {
      setError(apiMessage(response.status, result.detail))
      return
    }
    setJd(normalizeJd(result.value))
    setStep('job')
  }
  async function runTailor() {
    setError('')
    setBusy('tailor')
    const response = await tailor(resume, jd)
    const result = asResult(response.data, response.status, 'Tailoring did not finish.')
    setBusy(null)
    if (!result.ok) {
      setError(apiMessage(response.status, result.detail))
      return
    }
    const value = result.value as { tailored_resume?: unknown; download_url?: string }
    setTailored(normalizeResume(value.tailored_resume))
    setDownloadUrl(typeof value.download_url === 'string' ? value.download_url : '')
    setStep('result')
  }
  const index = steps.findIndex(item => item.id === step)
  const title =
    step === 'upload'
      ? 'Start with the resume you want to tailor.'
      : step === 'resume'
        ? 'Make the extracted resume yours.'
        : step === 'job'
          ? 'Give the role a clear target.'
          : step === 'tailor'
            ? 'Retailor is comparing both documents.'
            : 'Review the changes before you download.'
  return (
    <div className="workspace">
      <Navbar />
      <div className="workspace__body">
        <aside className="rail" aria-label="Workflow">
          <div className="rail__intro">
            <span className="eyebrow">Your application</span>
            <h1>Shape one resume for one role.</h1>
          </div>
          <nav>
            {steps.map((item, i) => (
              <button
                type="button"
                key={item.id}
                className={`rail-step ${step === item.id ? 'is-current' : ''} ${i < index ? 'is-done' : ''}`}
                onClick={() => i <= index && setStep(item.id)}
                disabled={hydrated ? i > index : undefined}
              >
                <span className="rail-step__number">
                  {i < index ? <CheckIcon width={14} height={14} /> : i + 1}
                </span>
                <span>
                  <strong>{item.label}</strong>
                  <small>{item.note}</small>
                </span>
              </button>
            ))}
          </nav>
          <p className="privacy-note">
            Your resume and job description stay in this session. We do not use them for analytics.
          </p>
        </aside>
        <main className="workspace__main">
          <div className="mobile-progress">
            <span>
              Step {index + 1} of {steps.length}
            </span>
            <strong>{steps[index].label}</strong>
            <div>
              <i style={{ width: `${((index + 1) / steps.length) * 100}%` }} />
            </div>
          </div>
          <div className="main-header">
            <div>
              <span className="eyebrow">{steps[index].label}</span>
              <h2>{title}</h2>
            </div>
            {file && (
              <span className="file-crumb">
                <FileIcon width={15} height={15} />
                {file.name}
              </span>
            )}
          </div>
          {error && (
            <div className="error-banner" role="alert">
              <RefreshIcon width={16} height={16} />
              <span>{error}</span>
            </div>
          )}
          {step === 'upload' && (
            <section className="upload-panel">
              <div className="upload-copy">
                <span className="upload-mark">
                  <UploadIcon width={22} height={22} />
                </span>
                <div>
                  <h3>Upload your resume</h3>
                  <p>
                    PDF or DOCX, up to 5 MB. We’ll extract the structure so you can review it first.
                  </p>
                </div>
              </div>
              <button
                type="button"
                className="dropzone dropzone--large"
                disabled={busy !== null}
                aria-busy={busy === 'parse'}
                onClick={() => inputRef.current?.click()}
                onDragOver={e => {
                  if (!busy) e.preventDefault()
                }}
                onDrop={e => {
                  e.preventDefault()
                  if (!busy) {
                    const f = e.dataTransfer.files[0]
                    if (f) void upload(f)
                  }
                }}
              >
                <input
                  ref={inputRef}
                  hidden
                  type="file"
                  accept=".pdf,.docx"
                  disabled={busy !== null}
                  onChange={e => {
                    const f = e.target.files?.[0]
                    if (f) void upload(f)
                  }}
                />
                <strong>
                  {busy === 'parse' ? 'Reading your resume…' : 'Drop it here or browse'}
                </strong>
                <span>PDF or DOCX · 5 MB maximum</span>
              </button>
              <p className="privacy-inline">
                You will review every extracted field before it is used.
              </p>
            </section>
          )}
          {step === 'resume' && (
            <>
              <ResumeEditor resume={resume} onChange={setResume} />
              <Actions
                back={() => setStep('upload')}
                next={() => setStep('job')}
                label="Continue to job"
              />
            </>
          )}
          {step === 'job' && (
            <>
              <section className="job-source">
                <Field
                  label="Original job description"
                  multiline
                  value={jdText}
                  onChange={setJdText}
                  hint={`${jdText.length.toLocaleString()} / 6,000 characters`}
                />
                <button
                  className="btn btn--primary"
                  type="button"
                  disabled={busy === 'analyze' || !jdText.trim()}
                  onClick={() => void analyze()}
                >
                  {busy === 'analyze' ? 'Analyzing…' : 'Analyze posting'}
                  <ArrowRightIcon width={16} height={16} />
                </button>
              </section>
              {jd.title && (
                <>
                  <JobEditor jd={jd} onChange={setJd} />
                  <Actions
                    back={() => setStep('resume')}
                    next={() => setStep('tailor')}
                    label="Review and tailor"
                  />
                </>
              )}
            </>
          )}
          {step === 'tailor' && (
            <section className="tailor-panel">
              <span className="eyebrow">Ready to run</span>
              <h3>{jd.title || 'This application'}</h3>
              <p>
                Retailor will use your reviewed resume and reviewed requirements. It will not invent
                experience or qualifications.
              </p>
              <div className="tailor-summary">
                <span>
                  <strong>{resume.name || 'Your resume'}</strong> reviewed
                </span>
                <span>
                  <strong>{jd.requirements.length + jd.responsibilities.length}</strong> role
                  details
                </span>
              </div>
              <Actions
                back={() => setStep('job')}
                next={() => void runTailor()}
                label={busy === 'tailor' ? 'Tailoring…' : 'Start tailoring'}
                disabled={busy === 'tailor'}
              />
            </section>
          )}
          {step === 'result' && tailored && (
            <>
              <div className="result-intro">
                <span className="success-dot">
                  <CheckIcon width={14} height={14} />
                </span>
                <p>Your tailored draft is ready. Review it as carefully as the original.</p>
              </div>
              <LengthIndicator tailored={tailored} original={resume} />
              <div className="comparison">
                <Document resume={resume} />
                <Document resume={tailored} editable onChange={setTailored} />
              </div>
              <div className="download-bar">
                <div>
                  <strong>Keep the final review yours.</strong>
                  <span>Make edits above, then use the temporary DOCX link.</span>
                </div>
                {downloadUrl && (
                  <a
                    className="btn btn--primary"
                    href={downloadUrl}
                    target="_blank"
                    rel="noreferrer"
                    download
                  >
                    Download DOCX <DownloadIcon width={16} height={16} />
                  </a>
                )}
                <button
                  className="btn btn--ghost"
                  type="button"
                  onClick={() => {
                    setStep('upload')
                    setFile(null)
                    setResume(emptyResume())
                    setJd(emptyJd())
                    setJdText('')
                    setTailored(null)
                    setDownloadUrl('')
                    setError('')
                    setBusy(null)
                    if (inputRef.current) inputRef.current.value = ''
                    try {
                      sessionStorage.removeItem('retailor.workflow')
                    } catch {
                      /* storage may be unavailable */
                    }
                  }}
                >
                  Start another application
                </button>
              </div>
            </>
          )}
          {step !== 'upload' && step !== 'result' && (
            <p className="session-note">
              Edits are kept while you move between steps. Nothing is submitted until you choose an
              action.
            </p>
          )}
        </main>
      </div>
    </div>
  )
}

function Actions({
  back,
  next,
  label,
  disabled = false,
}: {
  back: () => void
  next: () => void
  label: string
  disabled?: boolean
}) {
  return (
    <div className="actions">
      <button className="btn btn--ghost" type="button" onClick={back}>
        Back
      </button>
      <button className="btn btn--primary" type="button" onClick={next} disabled={disabled}>
        {label}
        <ArrowRightIcon width={16} height={16} />
      </button>
    </div>
  )
}
