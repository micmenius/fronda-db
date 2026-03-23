'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { NOTE_TAGS } from '@/lib/types'

export default function AddNoteForm({
  aboutUserId,
}: {
  aboutUserId: string
}) {
  const supabase = createClient()
  const router = useRouter()
  const [content, setContent] = useState('')
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [saving, setSaving] = useState(false)

  function toggleTag(tag: string) {
    setSelectedTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    )
  }

  async function handleSubmit() {
    if (!content.trim()) return
    setSaving(true)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    await supabase.from('private_notes').insert({
      about_user_id: aboutUserId,
      author_id: user.id,
      tags: selectedTags,
      content: content.trim(),
    })

    setSaving(false)
    setContent('')
    setSelectedTags([])
    router.refresh()
  }

  return (
    <div className="border-t border-red-900/30 pt-4 mt-4">
      <h3 className="text-sm font-medium text-red-300 mb-3">+ Новая заметка</h3>

      <div className="flex flex-wrap gap-1.5 mb-3">
        {NOTE_TAGS.map((tag) => (
          <button key={tag} onClick={() => toggleTag(tag)}
            className={`px-2 py-1 rounded text-xs transition-colors ${
              selectedTags.includes(tag)
                ? 'bg-red-800 text-red-200'
                : 'bg-gray-800 text-gray-500 hover:bg-gray-700'
            }`}>
            {selectedTags.includes(tag) ? '✓ ' : ''}{tag}
          </button>
        ))}
      </div>

      <textarea value={content} onChange={(e) => setContent(e.target.value)}
        rows={2} placeholder="Комментарий..."
        className="w-full bg-gray-900 border border-red-900/30 rounded-lg px-4 py-2 text-white text-sm resize-none focus:border-red-700 focus:outline-none mb-3" />

      <button onClick={handleSubmit} disabled={saving || !content.trim()}
        className="px-4 py-1.5 bg-red-900/50 hover:bg-red-900/70 disabled:bg-gray-800 text-red-300 rounded-lg text-sm transition-colors">
        {saving ? 'Сохраняю...' : 'Добавить заметку'}
      </button>
    </div>
  )
}
