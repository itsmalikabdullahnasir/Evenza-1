"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface GalleryItem {
  id: number
  title: string
  description: string
  type: "image" | "video"
  url: string
  category: string
}

export function MediaGallery({ items }: { items: GalleryItem[] }) {
  const [selectedItem, setSelectedItem] = useState<GalleryItem | null>(null)
  const [activeTab, setActiveTab] = useState("all")

  const categories = ["all", ...new Set(items.map((item) => item.category))]

  const filteredItems = activeTab === "all" ? items : items.filter((item) => item.category === activeTab)

  return (
    <div className="space-y-8">
      <Tabs defaultValue="all" onValueChange={setActiveTab}>
        <div className="flex justify-center mb-8">
          <TabsList>
            {categories.map((category) => (
              <TabsTrigger key={category} value={category} className="capitalize">
                {category}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        {categories.map((category) => (
          <TabsContent key={category} value={category} className="mt-0">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredItems.map((item) => (
                <div
                  key={item.id}
                  className="overflow-hidden rounded-lg border bg-card shadow-sm cursor-pointer transition-all hover:shadow-md"
                  onClick={() => setSelectedItem(item)}
                >
                  <div className="aspect-video relative">
                    <img src={item.url || "/placeholder.svg"} alt={item.title} className="object-cover w-full h-full" />
                  </div>
                  <div className="p-4">
                    <h3 className="font-medium">{item.title}</h3>
                    <p className="text-sm text-muted-foreground">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>
        ))}
      </Tabs>

      <Dialog open={!!selectedItem} onOpenChange={(open) => !open && setSelectedItem(null)}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>{selectedItem?.title}</DialogTitle>
            <DialogDescription>{selectedItem?.description}</DialogDescription>
          </DialogHeader>
          <div className="aspect-video relative overflow-hidden rounded-md">
            {selectedItem && (
              <img
                src={selectedItem.url || "/placeholder.svg"}
                alt={selectedItem.title}
                className="object-contain w-full h-full"
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
