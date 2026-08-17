import { useRef, useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { FileText, MapPin, Paperclip, Send, Sparkles, X } from 'lucide-react'
import type { Priority } from '../../contracts/grievance'
import { services } from '../../api/registry'
import { getErrorMessage } from '../../utils/errors'
import { GRIEVANCE_CATEGORIES } from '../../components/grievance/categoryMeta'
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Input,
  Select,
  Textarea,
} from '../../components/ui'
import { useToast } from '../../components/ui/toast-context'

interface FormErrors {
  title?: string
  description?: string
  category?: string
  location?: string
  files?: string
  form?: string
}

const TITLE_MIN = 5
const DESCRIPTION_MIN = 10
const MAX_FILES = 5
const MAX_FILE_SIZE_MB = 5

function validateFiles(files: File[]): string | undefined {
  if (files.length > MAX_FILES) {
    return `You can attach at most ${MAX_FILES} files.`
  }
  const oversized = files.find((file) => file.size > MAX_FILE_SIZE_MB * 1024 * 1024)
  if (oversized) {
    return `"${oversized.name}" exceeds the ${MAX_FILE_SIZE_MB} MB limit.`
  }
  return undefined
}

/**
 * Citizen grievance submission (Member 4 — Step 88). Fields match the backend
 * create-grievance contract exactly; identity comes from the authenticated
 * session — the citizen is never asked for a citizenId. Attachments are
 * uploaded after creation through the grievance service (real API supports
 * POST /grievances/:id/attachments).
 */
export function SubmitGrievancePage() {
  const navigate = useNavigate()
  const { success: successToast, error: errorToast } = useToast()

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('')
  const [priority, setPriority] = useState<Priority | ''>('')
  const [location, setLocation] = useState('')
  const [files, setFiles] = useState<File[]>([])
  const [errors, setErrors] = useState<FormErrors>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  function validate(): boolean {
    const next: FormErrors = {}
    if (title.trim().length < TITLE_MIN) {
      next.title = `Title must be at least ${TITLE_MIN} characters.`
    }
    if (description.trim().length < DESCRIPTION_MIN) {
      next.description = `Description must be at least ${DESCRIPTION_MIN} characters.`
    }
    if (!category) {
      next.category = 'Please choose a category.'
    }
    const fileError = validateFiles(files)
    if (fileError) {
      next.files = fileError
    }
    setErrors(next)
    return Object.keys(next).length === 0
  }

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const selected = Array.from(event.target.files ?? [])
    setFiles((current) => {
      const merged = [...current, ...selected].slice(0, MAX_FILES)
      setErrors((currentErrors) => {
        const fileError = validateFiles(merged)
        return { ...currentErrors, files: fileError }
      })
      return merged
    })
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  function removeFile(index: number) {
    setFiles((current) => current.filter((_, fileIndex) => fileIndex !== index))
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (isSubmitting) {
      return
    }
    if (!validate()) {
      return
    }

    setIsSubmitting(true)
    setErrors({})

    try {
      const created = await services.grievance.create({
        title: title.trim(),
        description: description.trim(),
        category,
        ...(priority ? { priority } : {}),
        ...(location.trim() ? { address: location.trim() } : {}),
      })

      // Best-effort attachment uploads — a failed upload must not fail the
      // grievance itself.
      for (const file of files) {
        try {
          await services.grievance.uploadAttachment(created.id, file)
        } catch (uploadError) {
          errorToast({
            title: `Could not upload "${file.name}"`,
            description: getErrorMessage(uploadError),
          })
        }
      }

      successToast({
        title: 'Grievance submitted',
        description: `${created.ticketId} has been submitted and is being classified.`,
      })

      navigate(`/citizen/grievances/${created.id}`)
    } catch (submitError) {
      setErrors({ form: getErrorMessage(submitError) })
      setIsSubmitting(false)
    }
  }

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-7">
        <p className="label-mono flex items-center gap-2 text-slate-400">
          <span className="size-1.5 rounded-full bg-ucg-blue" aria-hidden="true" />
          Citizen Portal / Report
        </p>
        <h2 className="mt-2 font-editorial text-3xl font-semibold tracking-tight text-ucg-ink">
          Report a grievance
        </h2>
        <p className="mt-2 max-w-xl text-sm leading-relaxed text-slate-500">
          Describe the issue in your own words. After submission, AI will suggest a
          category and priority, and route it to the right department — always
          available for human review.
        </p>
      </div>

      {errors.form && (
        <div role="alert" className="sg-alert mb-5">
          {errors.form}
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>About the issue</CardTitle>
            <CardDescription>
              What happened, and where? Be specific — it helps the department
              respond faster.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              label="Title"
              name="title"
              placeholder="Short summary of the problem"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              error={errors.title}
              disabled={isSubmitting}
              required
              className="ucg-input-field"
              labelClassName="auth-label"
            />

            <Textarea
              label="Description"
              name="description"
              rows={6}
              placeholder="Describe what you saw, when it started and how it affects you or your neighbourhood…"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              error={errors.description}
              hint={`At least ${DESCRIPTION_MIN} characters.`}
              disabled={isSubmitting}
              required
              className="ucg-input-field"
              labelClassName="auth-label"
            />

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Select
                label="Category"
                name="category"
                placeholder="Select a category"
                options={GRIEVANCE_CATEGORIES.map((option) => ({
                  value: option.value,
                  label: option.label,
                }))}
                value={category}
                onChange={(event) => setCategory(event.target.value)}
                error={errors.category}
                disabled={isSubmitting}
                required
                className="ucg-input-field"
                labelClassName="auth-label"
              />
              <Select
                label="Priority"
                name="priority"
                placeholder="Let AI decide"
                hint="Optional — AI suggests the priority automatically."
                options={[
                  { value: 'LOW', label: 'Low' },
                  { value: 'MEDIUM', label: 'Medium' },
                  { value: 'HIGH', label: 'High' },
                  { value: 'CRITICAL', label: 'Critical' },
                ]}
                value={priority}
                onChange={(event) => setPriority(event.target.value as Priority | '')}
                disabled={isSubmitting}
                className="ucg-input-field"
                labelClassName="auth-label"
              />
            </div>

            <Input
              label="Location"
              name="location"
              placeholder="Street, landmark or area"
              leftSlot={
                <MapPin className="size-4 text-slate-400" aria-hidden="true" />
              }
              value={location}
              onChange={(event) => setLocation(event.target.value)}
              error={errors.location}
              hint="Optional but strongly recommended."
              disabled={isSubmitting}
              className="ucg-input-field"
              labelClassName="auth-label"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Attachments</CardTitle>
            <CardDescription>
              Photos or documents help officers assess the issue. Up to {MAX_FILES}{' '}
              files, {MAX_FILE_SIZE_MB} MB each.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {files.length > 0 && (
              <ul className="space-y-2">
                {files.map((file, index) => (
                  <li
                    key={`${file.name}-${index}`}
                    className="sg-file-chip"
                  >
                    <FileText className="size-4 shrink-0 text-ucg-blue" aria-hidden="true" />
                    <div className="min-w-0 flex-1">
                      <p className="sg-file-name truncate">{file.name}</p>
                      <p className="sg-file-size">{(file.size / 1024).toFixed(0)} KB</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeFile(index)}
                      aria-label={`Remove ${file.name}`}
                      className="rounded-md p-1.5 text-slate-400 transition-colors hover:bg-slate-200 hover:text-slate-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
                    >
                      <X className="size-4" aria-hidden="true" />
                    </button>
                  </li>
                ))}
              </ul>
            )}

            {errors.files && (
              <p role="alert" className="text-xs font-medium text-red-600">
                {errors.files}
              </p>
            )}

            <div>
              <input
                ref={fileInputRef}
                id="grievance-attachments"
                type="file"
                multiple
                accept="image/*,.pdf,.doc,.docx"
                onChange={handleFileChange}
                disabled={isSubmitting || files.length >= MAX_FILES}
                className="sr-only"
              />
              <label
                htmlFor="grievance-attachments"
                className="sg-dropzone disabled:cursor-not-allowed disabled:opacity-55"
              >
                <Paperclip className="size-4" aria-hidden="true" />
                Add attachments
              </label>
            </div>
          </CardContent>
        </Card>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="sg-note flex items-start gap-2 max-w-sm">
            <Sparkles className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
            AI will suggest the best category, department and priority after you
            submit. You can always track progress from the dashboard.
          </p>
          <Button
            type="submit"
            size="lg"
            isLoading={isSubmitting}
            className="sm:min-w-48"
          >
            <Send className="size-4" aria-hidden="true" />
            Submit grievance
          </Button>
        </div>
      </form>
    </div>
  )
}
