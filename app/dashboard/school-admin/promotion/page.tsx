"use client"

import { useState } from "react"
import { StudentPromotion } from "@/components/student-promotion"
import { PromotionHistory } from "@/components/promotion-history"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { History, Users } from "lucide-react"

export default function StudentPromotionPage() {
  const [refreshKey, setRefreshKey] = useState(0)

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Student Promotion</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Move students to their next class at the end of an academic year — bulk or one at a time,
          with preview, review, and full history.
        </p>
      </div>

      <Tabs defaultValue="promote">
        <TabsList>
          <TabsTrigger value="promote" className="gap-1.5">
            <Users className="h-4 w-4" />
            Promote Students
          </TabsTrigger>
          <TabsTrigger value="history" className="gap-1.5">
            <History className="h-4 w-4" />
            Promotion History
          </TabsTrigger>
        </TabsList>

        <TabsContent value="promote" className="mt-4">
          <StudentPromotion onPromoted={() => setRefreshKey((k) => k + 1)} />
        </TabsContent>

        <TabsContent value="history" className="mt-4">
          <PromotionHistory refreshKey={refreshKey} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
