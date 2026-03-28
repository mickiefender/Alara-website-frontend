import { createContext, useContext, ReactNode } from 'react'
import type Quill from 'quill'

interface QuillEditorContextType {
  quillRef: React.MutableRefObject<Quill | null>
  getEditor: () => Quill
}

const QuillEditorContext = createContext<QuillEditorContextType | null>(null)

export function QuillEditorProvider({ 
  children, 
  quillRef 
}: { 
  children: ReactNode 
  quillRef: React.MutableRefObject<Quill | null> 
}) {
  const getEditor = () => quillRef.current as Quill
  
  return (
    <QuillEditorContext.Provider value={{ quillRef, getEditor }}>
      {children}
    </QuillEditorContext.Provider>
  )
}

export function useQuillEditor() {
  const context = useContext(QuillEditorContext)
  if (!context) {
    throw new Error('useQuillEditor must be used within QuillEditorProvider')
  }
  return context
}
