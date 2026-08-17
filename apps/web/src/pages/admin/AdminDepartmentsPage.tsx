import { useState, type FormEvent } from 'react'
import { Building2, Plus, SearchX } from 'lucide-react'
import { services } from '../../api/registry'
import { useAsync } from '../../hooks/useAsync'
import { getErrorMessage } from '../../utils/errors'
import {
  Button,
  ConfirmDialog,
  EmptyState,
  ErrorState,
  Input,
  Skeleton,
  Textarea,
} from '../../components/ui'
import { useToast } from '../../components/ui/toast-context'
import type { Department } from '../../contracts/department'

/** Admin department management — Civic Command (V4.5c). Real department service. */
export function AdminDepartmentsPage() {
  const { success: successToast, error: errorToast } = useToast()
  const query = useAsync(() => services.department.list(), [])

  const [showCreate, setShowCreate] = useState(false)
  const [createName, setCreateName] = useState('')
  const [createCode, setCreateCode] = useState('')
  const [createDescription, setCreateDescription] = useState('')
  const [isCreating, setIsCreating] = useState(false)

  const [editingId, setEditingId] = useState<string | null>(null)
  const [editName, setEditName] = useState('')
  const [editDescription, setEditDescription] = useState('')
  const [isSavingEdit, setIsSavingEdit] = useState(false)

  const [deactivating, setDeactivating] = useState<Department | null>(null)
  const [isDeactivating, setIsDeactivating] = useState(false)

  async function handleCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (isCreating || !createName.trim()) {
      return
    }
    setIsCreating(true)
    try {
      await services.department.create({
        name: createName.trim(),
        ...(createCode.trim() ? { code: createCode.trim() } : {}),
        ...(createDescription.trim() ? { description: createDescription.trim() } : {}),
      })
      successToast({ title: 'Department created', description: `${createName.trim()} has been added.` })
      setCreateName('')
      setCreateCode('')
      setCreateDescription('')
      setShowCreate(false)
      query.reload()
    } catch (createError) {
      errorToast({ title: 'Could not create department', description: getErrorMessage(createError) })
    } finally {
      setIsCreating(false)
    }
  }

  function beginEdit(department: Department) {
    setEditingId(department.id)
    setEditName(department.name)
    setEditDescription(department.description ?? '')
  }

  async function handleSaveEdit() {
    if (!editingId || isSavingEdit || !editName.trim()) {
      return
    }
    setIsSavingEdit(true)
    try {
      await services.department.update(editingId, {
        name: editName.trim(),
        ...(editDescription.trim() ? { description: editDescription.trim() } : {}),
      })
      successToast({ title: 'Department updated', description: 'The changes have been saved.' })
      setEditingId(null)
      query.reload()
    } catch (updateError) {
      errorToast({ title: 'Could not update department', description: getErrorMessage(updateError) })
    } finally {
      setIsSavingEdit(false)
    }
  }

  async function handleDeactivate() {
    if (!deactivating || isDeactivating) {
      return
    }
    setIsDeactivating(true)
    try {
      await services.department.deactivate(deactivating.id)
      successToast({ title: 'Department deactivated', description: `${deactivating.name} is no longer active.` })
      setDeactivating(null)
      query.reload()
    } catch (deactivateError) {
      errorToast({ title: 'Could not deactivate department', description: getErrorMessage(deactivateError) })
    } finally {
      setIsDeactivating(false)
    }
  }

  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="ad-hero-overline flex items-center gap-2.5 text-slate-400">
            <span className="size-1.5 rounded-full bg-admin-indigo" aria-hidden="true" />
            Civic Command / Structure
          </p>
          <h1 className="mt-2 font-editorial text-3xl font-semibold tracking-tight text-ucg-ink">
            Department management
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-slate-500">
            The civic structure — create units, update their mandates and
            deactivate departments.
          </p>
        </div>
        <Button
          type="button"
          onClick={() => setShowCreate((open) => !open)}
          className="rounded-full"
        >
          <Plus className="size-4" aria-hidden="true" />
          New department
        </Button>
      </div>

      {showCreate && (
        <form
          onSubmit={handleCreate}
          className="mb-6 rounded-2xl border border-admin-indigo/25 bg-white p-5"
        >
          <p className="dp-panel-label mb-4">Create department</p>
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="Name"
              name="dept-name"
              placeholder="e.g. Parks & Recreation"
              value={createName}
              onChange={(event) => setCreateName(event.target.value)}
              required
              className="ucg-input-field"
              labelClassName="auth-label"
            />
            <Input
              label="Code"
              name="dept-code"
              placeholder="e.g. PAR"
              value={createCode}
              onChange={(event) => setCreateCode(event.target.value)}
              className="ucg-input-field"
              labelClassName="auth-label"
            />
          </div>
          <div className="mt-4">
            <Textarea
              label="Description"
              name="dept-description"
              rows={3}
              placeholder="What does this department own and maintain?"
              value={createDescription}
              onChange={(event) => setCreateDescription(event.target.value)}
              className="ucg-input-field"
              labelClassName="auth-label"
            />
          </div>
          <div className="mt-4 flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setShowCreate(false)}>
              Cancel
            </Button>
            <Button type="submit" isLoading={isCreating} disabled={!createName.trim()}>
              Create department
            </Button>
          </div>
        </form>
      )}

      {query.isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {Array.from({ length: 6 }, (_, index) => (
            <Skeleton key={index} className="h-40 rounded-2xl" />
          ))}
        </div>
      ) : query.isError ? (
        <ErrorState
          title="Could not load departments"
          message={getErrorMessage(query.error)}
          onRetry={query.reload}
        />
      ) : (query.data?.length ?? 0) === 0 ? (
        <div className="rounded-2xl border border-ucg-fog bg-white p-4">
          <EmptyState
            icon={SearchX}
            title="No departments"
            description="Create the first department to start structuring the civic units."
          />
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {query.data?.map((department) => {
            const isEditing = editingId === department.id
            return (
              <section
                key={department.id}
                className="rounded-2xl border border-ucg-fog bg-white p-5"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="flex size-10 items-center justify-center rounded-xl bg-admin-indigo/10 text-admin-indigo">
                      <Building2 className="size-4.5" aria-hidden="true" />
                    </span>
                    <div>
                      <p className="dp-ticket">{department.code ?? department.id}</p>
                      <h2 className="font-editorial text-lg font-semibold tracking-tight text-ucg-ink">
                        {department.name}
                      </h2>
                    </div>
                  </div>
                  <span
                    className={
                      department.isActive === false
                        ? 'rounded-full bg-ucg-fog px-2.5 py-1 text-[0.625rem] font-semibold uppercase tracking-wide text-slate-500'
                        : 'rounded-full bg-emerald-500/10 px-2.5 py-1 text-[0.625rem] font-semibold uppercase tracking-wide text-emerald-700'
                    }
                  >
                    {department.isActive === false ? 'Inactive' : 'Active'}
                  </span>
                </div>

                {isEditing ? (
                  <div className="mt-4 space-y-3">
                    <Input
                      label="Name"
                      name="edit-name"
                      value={editName}
                      onChange={(event) => setEditName(event.target.value)}
                      className="ucg-input-field"
                      labelClassName="auth-label"
                    />
                    <Textarea
                      label="Description"
                      name="edit-description"
                      rows={2}
                      value={editDescription}
                      onChange={(event) => setEditDescription(event.target.value)}
                      className="ucg-input-field"
                      labelClassName="auth-label"
                    />
                    <div className="flex justify-end gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setEditingId(null)}
                      >
                        Cancel
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        isLoading={isSavingEdit}
                        disabled={!editName.trim()}
                        onClick={handleSaveEdit}
                      >
                        Save
                      </Button>
                    </div>
                  </div>
                ) : (
                  <>
                    <p className="mt-3 text-sm leading-relaxed text-slate-600">
                      {department.description ?? 'No description provided.'}
                    </p>
                    <div className="mt-4 flex justify-end gap-2">
                      <Button type="button" variant="outline" size="sm" onClick={() => beginEdit(department)}>
                        Edit
                      </Button>
                      {department.isActive !== false && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="text-ucg-critical hover:bg-red-50"
                          onClick={() => setDeactivating(department)}
                        >
                          Deactivate
                        </Button>
                      )}
                    </div>
                  </>
                )}
              </section>
            )
          })}
        </div>
      )}

      {deactivating && (
        <ConfirmDialog
          open
          title={`Deactivate ${deactivating.name}?`}
          description={`This marks the department as inactive. Grievances already routed to it stay intact, but it will no longer appear as an active unit.`}
          confirmLabel="Deactivate"
          variant="danger"
          isLoading={isDeactivating}
          onConfirm={handleDeactivate}
          onCancel={() => setDeactivating(null)}
        />
      )}
    </div>
  )
}
