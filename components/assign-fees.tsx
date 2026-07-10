"use client"

import React, { useState, useEffect } from "react"
import { academicsAPI, usersAPI, billingAPI } from "@/lib/api"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"

import { useToast } from "@/hooks/use-toast"

export function AssignFees() {
  const { toast } = useToast()
  const [assignTo, setAssignTo] = useState("school")
  const [selectedClass, setSelectedClass] = useState("")
  const [selectedStudent, setSelectedStudent] = useState("")
  const [selectedFeeType, setSelectedFeeType] = useState("")

  const [feeTypesLoading, setFeeTypesLoading] = useState(false)
  const [classesLoading, setClassesLoading] = useState(false)
  const [studentsLoading, setStudentsLoading] = useState(false)
  const [feeTypes, setFeeTypes] = useState<any[]>([])
  const [classes, setClasses] = useState<any[]>([])
  const [students, setStudents] = useState<any[]>([])

  useEffect(() => {
    const loadFeeTypes = async () => {
      try {
        setFeeTypesLoading(true)
        const res = await billingAPI.feeTypes()
        setFeeTypes(res.data.results || res.data || [])
      } catch {
        // error handled in UI
      } finally {
        setFeeTypesLoading(false)
      }
    }

    const loadClasses = async () => {
      try {
        setClassesLoading(true)
        const res = await academicsAPI.classes()
        setClasses(res.data.results || res.data || [])
      } catch {
        // error handled in UI
      } finally {
        setClassesLoading(false)
      }
    }

    const loadStudents = async () => {
      try {
        setStudentsLoading(true)
        const res = await usersAPI.students()
        setStudents(res.data.results || res.data || [])
      } catch {
        // error handled in UI
      } finally {
        setStudentsLoading(false)
      }
    }

    loadFeeTypes()
    loadClasses()
    loadStudents()
  }, [])

  const handleAssignFee = async () => {
    try {
      await billingAPI.createFee({
        fee_type_id: selectedFeeType,
        assign_to: assignTo,
        class_id: selectedClass || null,
        student_id: selectedStudent || null,
      })
      toast({
        title: "Fee assigned successfully",
      })
    } catch (error) {
      toast({
        title: "Failed to assign fee",
        variant: "destructive",
      })
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Assign Fees</CardTitle>
        <CardDescription>
          Assign fees to the entire school, a specific class, or an individual
          student.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Dialog>
          <DialogTrigger asChild>
            <Button>Assign Fee</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Assign Fee</DialogTitle>
              <DialogDescription>
                Select a fee and assign it to the school, a class, or a
                student.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="fee-type" className="text-right">
                  Fee Type
                </Label>
                <Select
                  onValueChange={setSelectedFeeType}
                  value={selectedFeeType}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select a fee type" />
                  </SelectTrigger>
                  <SelectContent>
{feeTypesLoading ? <SelectItem value="loading">Loading...</SelectItem> : feeTypes.map((fee) => (
                      <SelectItem key={fee.id} value={fee.id}>
                        {fee.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Assign To</Label>
                <RadioGroup
                  defaultValue="school"
                  className="col-span-3 flex"
                  onValueChange={setAssignTo}
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="school" id="school" />
                    <Label htmlFor="school">School</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="class" id="class" />
                    <Label htmlFor="class">Class</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="student" id="student" />
                    <Label htmlFor="student">Student</Label>
                  </div>
                </RadioGroup>
              </div>
              {assignTo === "class" && (
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="class-select" className="text-right">
                    Class
                  </Label>
                  <Select
                    onValueChange={setSelectedClass}
                    value={selectedClass}
                  >
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Select a class" />
                    </SelectTrigger>
                    <SelectContent>
{classesLoading ? <SelectItem value="loading">Loading...</SelectItem> : classes.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name}
                      </SelectItem>
                    ))}
                      {classes?.map((c: any) => (
                        <SelectItem key={c.id} value={c.id}>
                          {c.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
              {assignTo === "student" && (
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="student-select" className="text-right">
                    Student
                  </Label>
                  <Select
                    onValueChange={setSelectedStudent}
                    value={selectedStudent}
                  >
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Select a student" />
                    </SelectTrigger>
                    <SelectContent>
                      {studentsLoading && <SelectItem value="loading">Loading...</SelectItem>}
{studentsLoading ? <SelectItem value="loading">Loading...</SelectItem> : students.map((s) => (
                      <SelectItem key={s.id} value={s.id}>
                        {s.name}
                      </SelectItem>
                    ))}
                      {students?.map((s: any) => (
                        <SelectItem key={s.id} value={s.id}>
                          {s.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
            <DialogFooter>
              <Button type="submit" onClick={handleAssignFee}>
                Assign
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  )
}