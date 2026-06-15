"use client"

import { useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { addGarment, updateGarmentDetails, deleteGarment } from "./actions"
import type { GarmentDirectoryItem } from "./data"

function getTagList(tags?: string) {
  return (tags ?? "")
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean)
}

function normalizeSearch(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim()
}

export default function GarmentDirectoryClient({
  initialGarments
}: {
  initialGarments: GarmentDirectoryItem[]
}) {
  const router = useRouter()
  const [search, setSearch] = useState("")
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingGarment, setEditingGarment] = useState<GarmentDirectoryItem | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isUpdatingDetails, setIsUpdatingDetails] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const CURRENCY = "€"

  // Client-side filtering
  const filtered = useMemo(() => {
    const queryParts = normalizeSearch(search).split(" ").filter(Boolean)

    if (queryParts.length === 0) {
      return initialGarments
    }

    return initialGarments.filter((g) => {
      const searchableText = normalizeSearch([
        g.name,
        g.code,
        g.altCode,
        g.brandName,
        g.color,
        g.tags
      ].filter(Boolean).join(" "))

      return queryParts.every((part) => searchableText.includes(part))
    })
  }, [initialGarments, search])

  async function handleAddGarment(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsSubmitting(true)
    const formData = new FormData(e.currentTarget)
    
    try {
      await addGarment(formData)
      setIsModalOpen(false)
      router.refresh()
      // Next.js will automatically re-fetch the data because of revalidatePath
    } catch (err) {
      console.error(err)
      alert("Failed to add garment")
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleUpdateDetails(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsUpdatingDetails(true)
    const formData = new FormData(e.currentTarget)

    try {
      await updateGarmentDetails(formData)
      setEditingGarment(null)
      router.refresh()
    } catch (err) {
      console.error(err)
      alert("Failed to update garment details")
    } finally {
      setIsUpdatingDetails(false)
    }
  }

  async function handleDelete() {
    if (!editingGarment) return
    if (!confirm(`Are you sure you want to delete ${editingGarment.name}?`)) return

    setIsDeleting(true)
    try {
      await deleteGarment(editingGarment.id)
      setEditingGarment(null)
      router.refresh()
    } catch (err) {
      console.error(err)
      alert("Failed to delete garment")
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div className="max-w-6xl">
      
      {/* Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div className="relative w-full max-w-md">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-brand-muted/80 pointer-events-none z-10" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>
          </svg>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by code, brand, color, name, or tag..."
            className="w-full pl-10 pr-4 py-2 bg-brand-panel-alt border border-brand-border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-red/40 focus:border-brand-red/60 text-brand-cream placeholder:text-brand-muted/80 transition-shadow"
          />
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="hub-accent-button px-4 py-2 rounded-xl font-medium whitespace-nowrap flex items-center gap-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
          Add Garment
        </button>
      </div>

      {/* Data Table */}
      <div className="bg-brand-panel border border-brand-border/80 rounded-2xl overflow-hidden shadow-[0_0_15px_rgba(0,0,0,0.2)] min-h-[600px]">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-brand-panel-alt border-b border-brand-border">
                <th className="p-4 text-xs font-semibold text-brand-muted uppercase tracking-wider">Edit</th>
                <th className="p-4 text-xs font-semibold text-brand-muted uppercase tracking-wider">Code</th>
                <th className="p-4 text-xs font-semibold text-brand-muted uppercase tracking-wider">Alt Code</th>
                <th className="p-4 text-xs font-semibold text-brand-muted uppercase tracking-wider">Brand</th>
                <th className="p-4 text-xs font-semibold text-brand-muted uppercase tracking-wider">Name</th>
                <th className="p-4 text-xs font-semibold text-brand-muted uppercase tracking-wider">Color</th>
                  <th className="p-4 text-xs font-semibold text-brand-muted uppercase tracking-wider">Type</th>
                  <th className="p-4 text-xs font-semibold text-brand-muted uppercase tracking-wider">Markup</th>
                  <th className="p-4 text-xs font-semibold text-brand-muted uppercase tracking-wider">Tags</th>
                <th className="p-4 text-xs font-semibold text-brand-muted uppercase tracking-wider">Base Price</th>
                <th className="p-4 text-xs font-semibold text-brand-muted uppercase tracking-wider">Extra Size Cost</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-border/60">
              {filtered.length === 0 ? (
                <tr>
                    <td colSpan={11} className="p-8 text-center text-brand-muted/80">
                    No garments found matching &quot;{search}&quot;
                  </td>
                </tr>
              ) : (
                filtered.map((g) => (
                  <tr key={g.id} className="hover:bg-brand-surface transition-colors">
                    <td className="p-4">
                      <button
                        type="button"
                        onClick={() => setEditingGarment(g)}
                        aria-label={`Edit details for ${g.name}`}
                        title="Edit details"
                        className="rounded-lg border border-brand-border p-2 text-brand-muted/80 transition-colors hover:border-brand-red/50 hover:bg-brand-red/16 hover:text-brand-red/90"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M12 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                          <path d="M18.375 2.625a1 1 0 0 1 3 3L12 15l-4 1 1-4Z"/>
                        </svg>
                      </button>
                    </td>
                    <td className="p-4 font-mono text-sm text-brand-cream/90">{g.code}</td>
                    <td className="p-4 font-mono text-sm text-brand-muted/80">{g.altCode || "-"}</td>
                    <td className="p-4 text-sm text-brand-cream/90">{g.brandName || "-"}</td>
                    <td className="p-4 font-medium text-brand-cream">{g.name}</td>
                    <td className="p-4 text-sm text-brand-muted">{g.color || "-"}</td>
                    <td className="p-4 text-sm text-brand-muted">{g.type}</td>
                    <td className="p-4 text-sm font-medium text-brand-cream/90">
                      {g.connectedMarkupValue !== null ? `${CURRENCY}${g.connectedMarkupValue.toFixed(2)}` : "-"}
                    </td>
                    <td className="p-4 min-w-56">
                      <div className="flex items-center gap-2">
                        <div className="flex flex-wrap gap-1.5">
                          {getTagList(g.tags).length > 0 ? (
                            getTagList(g.tags).map((tag) => (
                              <span key={tag} className="rounded-md border border-brand-border/80 bg-brand-panel-alt px-2 py-1 text-xs font-medium text-brand-cream/90">
                                {tag}
                              </span>
                            ))
                          ) : (
                            <span className="text-sm text-brand-muted-soft">No tags</span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="p-4 font-mono text-sm text-cyan-400 font-bold">{CURRENCY}{g.basePrice.toFixed(2)}</td>
                    <td className="p-4 font-mono text-sm text-brand-muted">
                      {g.extraSizeCost ? `${CURRENCY}${g.extraSizeCost.toFixed(2)}` : "-"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Garment Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="bg-brand-panel border border-brand-border rounded-2xl w-full max-w-md overflow-hidden shadow-[0_0_30px_rgba(0,0,0,0.5)]">
            <div className="p-6 border-b border-brand-border flex justify-between items-center">
              <h2 className="text-xl font-bold text-brand-cream">Add New Garment</h2>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-brand-muted/80 hover:text-brand-cream transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
              </button>
            </div>
            
            <form onSubmit={handleAddGarment} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-brand-muted mb-1">Garment Code</label>
                  <input required name="code" type="text" placeholder="e.g. GI5000" className="w-full border border-brand-border rounded-lg p-2.5 bg-brand-panel-alt text-brand-cream focus:ring-2 focus:ring-brand-red/40 focus:border-brand-red/60 outline-none transition-shadow" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-brand-muted mb-1">Alt Code</label>
                  <input name="altCode" type="text" placeholder="e.g. GD05" className="w-full border border-brand-border rounded-lg p-2.5 bg-brand-panel-alt text-brand-cream focus:ring-2 focus:ring-brand-red/40 focus:border-brand-red/60 outline-none transition-shadow" />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-brand-muted mb-1">Name</label>
                <input required name="name" type="text" placeholder="e.g. Heavy Cotton T-Shirt" className="w-full border border-brand-border rounded-lg p-2.5 bg-brand-panel-alt text-brand-cream focus:ring-2 focus:ring-brand-red/40 focus:border-brand-red/60 outline-none transition-shadow" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-brand-muted mb-1">Brand</label>
                  <input name="brandName" type="text" placeholder="e.g. Gildan" className="w-full border border-brand-border rounded-lg p-2.5 bg-brand-panel-alt text-brand-cream focus:ring-2 focus:ring-brand-red/40 focus:border-brand-red/60 outline-none transition-shadow" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-brand-muted mb-1">Color</label>
                  <input name="color" type="text" placeholder="e.g. White" className="w-full border border-brand-border rounded-lg p-2.5 bg-brand-panel-alt text-brand-cream focus:ring-2 focus:ring-brand-red/40 focus:border-brand-red/60 outline-none transition-shadow" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-brand-muted mb-1">Type</label>
                <select required name="type" className="w-full border border-brand-border rounded-lg p-2.5 bg-brand-panel-alt text-brand-cream focus:ring-2 focus:ring-brand-red/40 focus:border-brand-red/60 outline-none transition-shadow">
                  <option value="TSHIRT">T-Shirt</option>
                  <option value="LONGSLEEVE">Long Sleeve</option>
                  <option value="HOODIE">Hoodie</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-brand-muted mb-1">Tags</label>
                <textarea name="tags" rows={3} placeholder="e.g. budget, premium, black, heavyweight" className="w-full border border-brand-border rounded-lg p-2.5 bg-brand-panel-alt text-brand-cream focus:ring-2 focus:ring-brand-red/40 focus:border-brand-red/60 outline-none transition-shadow resize-none" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-brand-muted mb-1">Base Price ({CURRENCY})</label>
                  <input required name="basePrice" type="number" step="0.01" min="0" placeholder="0.00" className="w-full border border-brand-border rounded-lg p-2.5 bg-brand-panel-alt text-brand-cream focus:ring-2 focus:ring-brand-red/40 focus:border-brand-red/60 outline-none transition-shadow" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-brand-muted mb-1">Extra Size Cost ({CURRENCY})</label>
                  <input name="extraSizeCost" type="number" step="0.01" min="0" placeholder="Optional" className="w-full border border-brand-border rounded-lg p-2.5 bg-brand-panel-alt text-brand-cream focus:ring-2 focus:ring-brand-red/40 focus:border-brand-red/60 outline-none transition-shadow" />
                </div>
              </div>

              <div className="mt-8 flex justify-end gap-3 pt-2">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-brand-muted/80 hover:text-brand-cream font-medium transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="hub-accent-button px-6 py-2 rounded-xl font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? "Adding..." : "Add Garment"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Details Modal */}
      {editingGarment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="bg-brand-panel border border-brand-border rounded-2xl w-full max-w-md overflow-hidden shadow-[0_0_30px_rgba(0,0,0,0.5)]">
            <div className="p-6 border-b border-brand-border flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold text-brand-cream">Edit Details</h2>
                <p className="mt-1 text-sm text-brand-muted/80">{editingGarment.name}</p>
              </div>
              <button
                onClick={() => setEditingGarment(null)}
                className="text-brand-muted/80 hover:text-brand-cream transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
              </button>
            </div>

            <form onSubmit={handleUpdateDetails} className="p-6 space-y-4">
              <input type="hidden" name="id" value={editingGarment.id} />

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-brand-muted mb-1">Garment Code</label>
                  <input
                    required
                    name="code"
                    type="text"
                    defaultValue={editingGarment.code}
                    placeholder="e.g. GI5000"
                    className="w-full border border-brand-border rounded-lg p-2.5 bg-brand-panel-alt text-brand-cream focus:ring-2 focus:ring-brand-red/40 focus:border-brand-red/60 outline-none transition-shadow"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-brand-muted mb-1">Alt Code</label>
                  <input
                    name="altCode"
                    type="text"
                    defaultValue={editingGarment.altCode ?? ""}
                    placeholder="e.g. GD05"
                    className="w-full border border-brand-border rounded-lg p-2.5 bg-brand-panel-alt text-brand-cream focus:ring-2 focus:ring-brand-red/40 focus:border-brand-red/60 outline-none transition-shadow"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-brand-muted mb-1">Name</label>
                <input
                  required
                  name="name"
                  type="text"
                  defaultValue={editingGarment.name}
                  placeholder="e.g. Heavy Cotton T-Shirt"
                  className="w-full border border-brand-border rounded-lg p-2.5 bg-brand-panel-alt text-brand-cream focus:ring-2 focus:ring-brand-red/40 focus:border-brand-red/60 outline-none transition-shadow"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-brand-muted mb-1">Brand</label>
                  <input
                    name="brandName"
                    type="text"
                    defaultValue={editingGarment.brandName ?? ""}
                    placeholder="e.g. Gildan"
                    className="w-full border border-brand-border rounded-lg p-2.5 bg-brand-panel-alt text-brand-cream focus:ring-2 focus:ring-brand-red/40 focus:border-brand-red/60 outline-none transition-shadow"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-brand-muted mb-1">Color</label>
                  <input
                    name="color"
                    type="text"
                    defaultValue={editingGarment.color ?? ""}
                    placeholder="e.g. White"
                    className="w-full border border-brand-border rounded-lg p-2.5 bg-brand-panel-alt text-brand-cream focus:ring-2 focus:ring-brand-red/40 focus:border-brand-red/60 outline-none transition-shadow"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-brand-muted mb-1">Type</label>
                <select
                  required
                  name="type"
                  defaultValue={editingGarment.type}
                  className="w-full border border-brand-border rounded-lg p-2.5 bg-brand-panel-alt text-brand-cream focus:ring-2 focus:ring-brand-red/40 focus:border-brand-red/60 outline-none transition-shadow"
                >
                  <option value="TSHIRT">T-Shirt</option>
                  <option value="LONGSLEEVE">Long Sleeve</option>
                  <option value="HOODIE">Hoodie</option>
                </select>
              </div>



              <div>
                <label className="block text-sm font-medium text-brand-muted mb-1">Tags</label>
                <textarea
                  name="tags"
                  rows={4}
                  defaultValue={editingGarment.tags ?? ""}
                  placeholder="e.g. budget, premium, black, heavyweight"
                  className="w-full border border-brand-border rounded-lg p-2.5 bg-brand-panel-alt text-brand-cream focus:ring-2 focus:ring-brand-red/40 focus:border-brand-red/60 outline-none transition-shadow resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-brand-muted mb-1">Base Price ({CURRENCY})</label>
                  <input
                    required
                    name="basePrice"
                    type="number"
                    step="0.01"
                    min="0"
                    defaultValue={editingGarment.basePrice}
                    placeholder="0.00"
                    className="w-full border border-brand-border rounded-lg p-2.5 bg-brand-panel-alt text-brand-cream focus:ring-2 focus:ring-brand-red/40 focus:border-brand-red/60 outline-none transition-shadow"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-brand-muted mb-1">Extra Size Cost ({CURRENCY})</label>
                  <input
                    name="extraSizeCost"
                    type="number"
                    step="0.01"
                    min="0"
                    defaultValue={editingGarment.extraSizeCost ?? ""}
                    placeholder="Optional"
                    className="w-full border border-brand-border rounded-lg p-2.5 bg-brand-panel-alt text-brand-cream focus:ring-2 focus:ring-brand-red/40 focus:border-brand-red/60 outline-none transition-shadow"
                  />
                </div>
              </div>

              <div className="mt-8 flex justify-between gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={isDeleting || isUpdatingDetails}
                  className="px-4 py-2 text-brand-red hover:text-brand-red/90 hover:bg-brand-red/16 rounded-xl font-medium transition-colors"
                >
                  {isDeleting ? "Deleting..." : "Delete"}
                </button>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setEditingGarment(null)}
                    disabled={isDeleting || isUpdatingDetails}
                    className="px-4 py-2 text-brand-muted/80 hover:text-brand-cream font-medium transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isUpdatingDetails || isDeleting}
                    className="hub-accent-button px-6 py-2 rounded-xl font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isUpdatingDetails ? "Saving..." : "Save Details"}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  )
}
