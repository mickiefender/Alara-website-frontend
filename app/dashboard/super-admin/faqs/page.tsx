"use client"

import { useState } from "react"
import { HelpCircle, Plus, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { getErrorMessage, platformAPI } from "@/lib/api"
import type { AnyObj } from "@/components/super-admin/types"
import { useFetch } from "@/components/super-admin/use-fetch"
import { PageHeader } from "@/components/super-admin/page-header"

export default function FaqManagementPage() {
  const faqs = useFetch<AnyObj[]>(
    () => platformAPI.faqs().then((response) => response.data || []),
    [],
  )
  const [question, setQuestion] = useState("")
  const [answer, setAnswer] = useState("")
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState("")

  async function addFaq(event: React.FormEvent) {
    event.preventDefault()
    if (!question.trim() || !answer.trim()) {
      setMessage("Enter both a question and an answer.")
      return
    }
    setBusy(true)
    setMessage("")
    try {
      await platformAPI.createFaq({ question: question.trim(), answer: answer.trim() })
      setQuestion("")
      setAnswer("")
      await faqs.reload()
      setMessage("FAQ added and published on the homepage.")
    } catch (error) {
      setMessage(getErrorMessage(error))
    } finally {
      setBusy(false)
    }
  }

  async function removeFaq(id: number) {
    setBusy(true)
    setMessage("")
    try {
      await platformAPI.deleteFaq(id)
      await faqs.reload()
      setMessage("FAQ removed from the homepage.")
    } catch (error) {
      setMessage(getErrorMessage(error))
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="space-y-6 p-4 md:p-6">
      <PageHeader title="Homepage FAQs" description="Add and remove frequently asked questions shown on the public homepage." />
      {message && <p className="rounded-lg bg-muted p-3 text-sm">{message}</p>}
      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><HelpCircle className="h-5 w-5" /> Add an FAQ</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={addFaq} className="space-y-4">
            <div className="space-y-2"><Label htmlFor="faq-question">Question</Label><Input id="faq-question" value={question} onChange={(event) => setQuestion(event.target.value)} placeholder="What is Alara?" /></div>
            <div className="space-y-2"><Label htmlFor="faq-answer">Answer</Label><Textarea id="faq-answer" value={answer} onChange={(event) => setAnswer(event.target.value)} placeholder="Write a clear answer..." rows={5} /></div>
            <Button type="submit" disabled={busy}><Plus className="mr-2 h-4 w-4" />Add FAQ</Button>
          </form>
        </CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle>Published FAQs ({faqs.data?.length || 0})</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {faqs.loading && <p className="text-sm text-muted-foreground">Loading FAQs...</p>}
          {!faqs.loading && !faqs.data?.length && <p className="text-sm text-muted-foreground">No FAQs published yet.</p>}
          {faqs.data?.map((faq) => (
            <div key={faq.id} className="flex items-start gap-4 rounded-lg border border-border p-4">
              <div className="flex-1"><h3 className="font-semibold">{faq.question}</h3><p className="mt-2 whitespace-pre-wrap text-sm text-muted-foreground">{faq.answer}</p></div>
              <Button variant="ghost" size="icon" disabled={busy} aria-label={`Remove ${faq.question}`} onClick={() => removeFaq(faq.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
