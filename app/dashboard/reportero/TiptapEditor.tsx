'use client'

// Editor Tiptap — cargado solo en cliente vía next/dynamic
// Tiptap requiere DOM APIs — no funciona con SSR

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { useEffect } from 'react'

interface TiptapEditorProps {
  content: string
  onChange: (html: string) => void
  placeholder?: string
}

export default function TiptapEditor({ content, onChange, placeholder = 'Escribe el contenido aquí…' }: TiptapEditorProps) {
  const editor = useEditor({
    extensions: [StarterKit],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML())
    },
    editorProps: {
      attributes: {
        style: 'min-height: 300px; outline: none; font-family: var(--font-body); font-size: var(--text-base); color: var(--color-text); line-height: 1.75;',
      },
    },
  })

  // Sincronizar si el contenido externo cambia (ej: reset del form)
  useEffect(() => {
    if (editor && content === '' && editor.getText() !== '') {
      editor.commands.clearContent()
    }
  }, [content, editor])

  if (!editor) return null

  const btnStyle = (active: boolean): React.CSSProperties => ({
    fontFamily: 'var(--font-ui)', fontSize: 11, fontWeight: 600,
    padding: '3px 8px', borderRadius: 'var(--radius-sm)',
    border: `1px solid ${active ? 'var(--color-border-gold)' : 'var(--color-border)'}`,
    background: active ? 'var(--color-gold-highlight)' : 'transparent',
    color: active ? 'var(--color-gold)' : 'var(--color-text-muted)',
    cursor: 'pointer',
  })

  return (
    <div style={{ border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
      {/* Toolbar */}
      <div style={{
        display: 'flex', gap: 4, flexWrap: 'wrap', padding: 'var(--space-2) var(--space-3)',
        background: 'var(--color-surface-offset)', borderBottom: '1px solid var(--color-border)',
      }}>
        <button type="button" onClick={() => editor.chain().focus().toggleBold().run()}       style={btnStyle(editor.isActive('bold'))}>B</button>
        <button type="button" onClick={() => editor.chain().focus().toggleItalic().run()}     style={{ ...btnStyle(editor.isActive('italic')), fontStyle: 'italic' }}>I</button>
        <button type="button" onClick={() => editor.chain().focus().toggleStrike().run()}     style={{ ...btnStyle(editor.isActive('strike')), textDecoration: 'line-through' }}>S</button>
        <span style={{ width: 1, background: 'var(--color-border)', margin: '2px 4px' }} />
        <button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} style={btnStyle(editor.isActive('heading', { level: 2 }))}>H2</button>
        <button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} style={btnStyle(editor.isActive('heading', { level: 3 }))}>H3</button>
        <span style={{ width: 1, background: 'var(--color-border)', margin: '2px 4px' }} />
        <button type="button" onClick={() => editor.chain().focus().toggleBulletList().run()}  style={btnStyle(editor.isActive('bulletList'))}>• Lista</button>
        <button type="button" onClick={() => editor.chain().focus().toggleOrderedList().run()} style={btnStyle(editor.isActive('orderedList'))}>1. Lista</button>
        <button type="button" onClick={() => editor.chain().focus().toggleBlockquote().run()}  style={btnStyle(editor.isActive('blockquote'))}>❝</button>
        <span style={{ width: 1, background: 'var(--color-border)', margin: '2px 4px' }} />
        <button type="button" onClick={() => editor.chain().focus().undo().run()} style={btnStyle(false)}>↩</button>
        <button type="button" onClick={() => editor.chain().focus().redo().run()} style={btnStyle(false)}>↪</button>
      </div>

      {/* Editor area */}
      <div style={{ padding: 'var(--space-4) var(--space-5)', background: 'var(--color-surface-offset)' }}>
        <EditorContent editor={editor} />
        {editor.isEmpty && (
          <div style={{ position: 'absolute', pointerEvents: 'none', color: 'var(--color-text-faint)', fontFamily: 'var(--font-body)', fontSize: 'var(--text-base)' }}>
            {placeholder}
          </div>
        )}
      </div>
    </div>
  )
}
