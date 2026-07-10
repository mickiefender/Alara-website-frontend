"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { assignmentAPI } from "@/lib/api"
import { useToast } from "@/components/ui/use-toast"

interface Assignment {
  id: string
  title: string
  description?: string
  due_date?: string
}

interface AssignmentSubmissionModalProps {
  assignment?: Assignment | null
  isOpen: boolean
  onClose: () => void
}

export default function AssignmentSubmissionModal({ assignment, isOpen, onClose }: AssignmentSubmissionModalProps) {
  const [submissionType, setSubmissionType] = useState("file")
  const [file, setFile] = useState<File | null>(null)
  const [textSubmission, setTextSubmission] = useState("")
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  if (!assignment) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Error: No Assignment Data</DialogTitle>
          </DialogHeader>
          <p className="py-4 text-muted-foreground text-sm">Assignment information is not available. Please refresh the page and try again.</p>
          <DialogFooter>
            <Button onClick={onClose}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    )
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFile(e.target.files[0])
      setTextSubmission("")
    }
  }

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setTextSubmission(e.target.value)
    setFile(null)
  }

  const handleSubmit = async () => {
    if (!file && !textSubmission) {
      toast({
        title: "No submission provided",
        description: "Please either upload a file or enter text to submit.",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    if (!assignment.id) {
      toast({
        title: "Invalid Assignment",
        description: "Assignment ID is missing. Please refresh.",
        variant: "destructive",
      })
      setLoading(false)
      return
    }
    try {
      const formData = new FormData()
      formData.append("assignment", assignment.id.toString())
      if (file) {
        formData.append("file", file)
      } else if (textSubmission) {
        formData.append("text_submission", textSubmission)
      }

      console.log("[DEBUG] Submitting FormData contents:")
      for (let [key, value] of formData.entries()) {
        console.log(`  ${key}:`, value)
      }
      
      await assignmentAPI.submitAssignment(formData)
      toast({
        title: "Assignment submitted",
        description: "Your assignment has been submitted successfully.",
      })
      onClose()
    } catch (error: any) {
      console.error("Full error object:", error)
      
      let description = "There was an error submitting your assignment."
      
      if (error && typeof error === 'object' && 'response' in error && error.response) {
        const status = error.response.status
        console.error("Error status:", status)
        console.error("Error response data:", error.response.data)
        
        if (status === 400) {
          if (error.response.data?.detail) {
            description = `Error: ${error.response.data.detail}`
          } else if (error.response.data?.non_field_errors?.[0]) {
            description = error.response.data.non_field_errors[0]
          } else if (Array.isArray(error.response.data)) {
            description = error.response.data.join(', ')
          }
        } else if (error.response.data) {
          try {
            description = `Server Error (${status}): ${JSON.stringify(error.response.data)}`
          } catch {
            description = `Server Error (${status})`
          }
        }
      } else {
        // Network error or other
        console.error("Non-axios error:", error?.message || error || 'Unknown error')
        description = error?.message || 'Network error. Please check your connection and try again.'
      }
      
      toast({
        title: "Submission failed",
        description,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Submit Assignment: {assignment?.title || 'Untitled Assignment'}</DialogTitle>
        </DialogHeader>
        <Tabs value={submissionType} onValueChange={setSubmissionType} className="w-full">
          <TabsList>
            <TabsTrigger value="file">File Upload</TabsTrigger>
            <TabsTrigger value="text">Text Submission</TabsTrigger>
          </TabsList>
          <TabsContent value="file">
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="file" className="text-right">
                  File
                </Label>
                <Input id="file" type="file" className="col-span-3" onChange={handleFileChange} />
              </div>
            </div>
          </TabsContent>
          <TabsContent value="text">
            <div className="grid gap-4 py-4">
              <Textarea
                placeholder="Type your submission here."
                className="col-span-4"
                value={textSubmission}
                onChange={handleTextChange}
              />
            </div>
          </TabsContent>
        </Tabs>
        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="secondary">
              Cancel
            </Button>
          </DialogClose>
          <Button onClick={handleSubmit} disabled={loading || !assignment.id}>
            {loading ? "Submitting..." : "Submit"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
