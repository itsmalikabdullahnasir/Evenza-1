import type { Metadata } from "next"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { CreditCard, Download, Eye } from "lucide-react"

export const metadata: Metadata = {
  title: "My Payments - Evenza",
  description: "View and manage your payments",
}

// This would typically come from a database
// TODO: Replace with actual database query
const getPayments = async () => {
  // In a real implementation, you would fetch this from your MongoDB database
  // Example:
  // await connectToDatabase();
  // const userId = "current-user-id"; // Get from auth
  // const payments = await Payment.find({ user: userId }).sort({ createdAt: -1 });

  return [
    {
      id: "1",
      type: "event",
      relatedTitle: "Tech Innovation Summit",
      amount: 99,
      date: "2025-03-01T10:30:00Z",
      status: "verified",
      proofImage: "/placeholder.svg?height=200&width=400&text=Payment Proof",
    },
    {
      id: "2",
      type: "trip",
      relatedTitle: "Mountain Retreat",
      amount: 299,
      date: "2025-02-15T14:45:00Z",
      status: "pending",
      proofImage: "/placeholder.svg?height=200&width=400&text=Payment Proof",
    },
    {
      id: "3",
      type: "membership",
      relatedTitle: "Annual Membership",
      amount: 50,
      date: "2025-01-10T09:15:00Z",
      status: "verified",
      proofImage: "/placeholder.svg?height=200&width=400&text=Payment Proof",
    },
  ]
}

export default async function PaymentsPage() {
  const payments = await getPayments()

  return (
    <div className="container py-12">
      <h1 className="text-3xl font-bold mb-8">My Payments</h1>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Payment History</CardTitle>
            <CardDescription>View all your payments and their status</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payments.map((payment) => (
                  <TableRow key={payment.id}>
                    <TableCell>{new Date(payment.date).toLocaleDateString()}</TableCell>
                    <TableCell className="capitalize">{payment.type}</TableCell>
                    <TableCell>{payment.relatedTitle}</TableCell>
                    <TableCell>${payment.amount.toFixed(2)}</TableCell>
                    <TableCell>
                      <Badge
                        className={
                          payment.status === "verified"
                            ? "bg-green-500"
                            : payment.status === "pending"
                              ? "bg-yellow-500"
                              : "bg-red-500"
                        }
                      >
                        {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" title="View Receipt">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" title="Download Receipt">
                        <Download className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Payment Methods</CardTitle>
            <CardDescription>We accept the following payment methods</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center p-4 border rounded-lg">
                <CreditCard className="h-8 w-8 mr-4 text-primary" />
                <div>
                  <h3 className="font-medium">Bank Transfer</h3>
                  <p className="text-sm text-muted-foreground">
                    Transfer to our bank account and upload proof of payment
                  </p>
                </div>
              </div>

              <div className="p-4 border rounded-lg">
                <h3 className="font-medium mb-2">Bank Account Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Bank Name:</p>
                    <p className="font-medium">Example Bank</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Account Name:</p>
                    <p className="font-medium">Evenza Society</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Account Number:</p>
                    <p className="font-medium">1234567890</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Branch Code:</p>
                    <p className="font-medium">012345</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
