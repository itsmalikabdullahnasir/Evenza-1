import type { Metadata } from "next"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export const metadata: Metadata = {
  title: "Terms of Service - Evenza",
  description: "Terms of service for the Evenza platform",
}

export default function TermsOfServicePage() {
  return (
    <div className="container py-12">
      <Card>
        <CardHeader className="space-y-1">
          <CardTitle className="text-3xl">Terms of Service</CardTitle>
          <CardDescription>Last updated: March 16, 2025</CardDescription>
        </CardHeader>
        <CardContent className="prose max-w-none prose-headings:font-heading">
          <p>
            These Terms of Service ("Terms") govern your access to and use of the Evenza platform, including any
            content, functionality, and services offered on or through our website.
          </p>

          <h2>Acceptance of Terms</h2>
          <p>
            By using our platform, you accept and agree to be bound by these Terms. If you do not agree to these Terms,
            you must not access or use our platform.
          </p>

          <h2>User Accounts</h2>
          <p>
            When you create an account with us, you must provide information that is accurate, complete, and current at
            all times. Failure to do so constitutes a breach of the Terms, which may result in immediate termination of
            your account.
          </p>
          <p>
            You are responsible for safeguarding the password that you use to access our platform and for any activities
            or actions under your password. You agree not to disclose your password to any third party.
          </p>

          <h2>Event and Trip Registrations</h2>
          <p>By registering for events or trips through our platform, you agree to:</p>
          <ul>
            <li>Provide accurate personal and payment information</li>
            <li>Comply with the specific rules and requirements for each event or trip</li>
            <li>Pay all fees associated with your registration</li>
            <li>Accept our cancellation and refund policies as specified for each event or trip</li>
          </ul>

          <h2>Interview Applications</h2>
          <p>
            When submitting interview applications through our platform, you confirm that all information provided is
            accurate and truthful. You understand that misrepresentation may result in disqualification from the
            interview process.
          </p>

          <h2>Payment Terms</h2>
          <p>
            We accept payments through the methods specified on our platform. You agree to pay all charges at the prices
            listed for your registrations. All payments must be received before your registration is confirmed.
          </p>

          <h2>Cancellations and Refunds</h2>
          <p>
            Cancellation and refund policies may vary by event, trip, or interview. The specific policy for each will be
            clearly stated at the time of registration. Generally:
          </p>
          <ul>
            <li>Cancellations made 14 days or more before the event/trip date may be eligible for a full refund</li>
            <li>Cancellations made between 7-13 days before the event/trip date may be eligible for a 50% refund</li>
            <li>Cancellations made less than 7 days before the event/trip date are generally not refundable</li>
            <li>Special circumstances may be considered on a case-by-case basis</li>
          </ul>

          <h2>Intellectual Property</h2>
          <p>
            Our platform and its original content, features, and functionality are owned by Evenza and are protected by
            international copyright, trademark, patent, trade secret, and other intellectual property laws.
          </p>

          <h2>Prohibited Uses</h2>
          <p>You may use our platform only for lawful purposes and in accordance with these Terms. You agree not to:</p>
          <ul>
            <li>Use our platform in any way that violates any applicable law or regulation</li>
            <li>Engage in any conduct that restricts or inhibits anyone's use or enjoyment of the platform</li>
            <li>Attempt to gain unauthorized access to our platform, user accounts, or computer systems</li>
            <li>Use the platform to transmit any malware, viruses, or other disruptive code</li>
            <li>Harvest or collect email addresses or other contact information of users</li>
          </ul>

          <h2>Limitation of Liability</h2>
          <p>
            In no event will Evenza, its affiliates, or their licensors, service providers, employees, agents, officers,
            or directors be liable for damages of any kind arising out of or in connection with your use of our
            platform.
          </p>

          <h2>Changes to Terms</h2>
          <p>
            We may revise and update these Terms from time to time at our sole discretion. All changes are effective
            immediately when posted. Your continued use of the platform following the posting of revised Terms means
            that you accept and agree to the changes.
          </p>

          <h2>Contact Us</h2>
          <p>If you have any questions about these Terms, please contact us at terms@evenza.com.</p>
        </CardContent>
      </Card>
    </div>
  )
}
