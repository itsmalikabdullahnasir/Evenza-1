import { Loader2 } from "lucide-react"

export default function Loading() {
  return (
    <div className="flex h-[calc(100vh-200px)] items-center justify-center">
      <div className="flex flex-col items-center gap-2">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <h3 className="text-xl font-semibold">Loading messages...</h3>
      </div>
    </div>
  )
}
