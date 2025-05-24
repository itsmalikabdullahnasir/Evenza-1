"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { CalendarIcon, Search } from "lucide-react"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { format } from "date-fns"

export function EventsFilter() {
  const [date, setDate] = useState<Date>()
  const [priceRange, setPriceRange] = useState([0])

  return (
    <div className="bg-card border rounded-lg p-4 shadow-sm">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input type="search" placeholder="Search events..." className="pl-8" />
          </div>
        </div>

        <div>
          <Select>
            <SelectTrigger>
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="technology">Technology</SelectItem>
              <SelectItem value="business">Business</SelectItem>
              <SelectItem value="arts">Arts</SelectItem>
              <SelectItem value="health">Health</SelectItem>
              <SelectItem value="finance">Finance</SelectItem>
              <SelectItem value="environment">Environment</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={"outline"}
                className={cn("w-full justify-start text-left font-normal", !date && "text-muted-foreground")}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {date ? format(date, "PPP") : "Pick a date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar mode="single" selected={date} onSelect={setDate} initialFocus />
            </PopoverContent>
          </Popover>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Price Range</span>
            <span>${priceRange[0]}</span>
          </div>
          <Slider defaultValue={[0]} max={200} step={5} onValueChange={setPriceRange} />
        </div>
      </div>

      <div className="flex justify-end mt-4">
        <Button variant="outline" className="mr-2">
          Reset
        </Button>
        <Button>Apply Filters</Button>
      </div>
    </div>
  )
}
