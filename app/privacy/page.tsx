import type { Metadata } from "next"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export const metadata: Metadata = {
  title: "Privacy Policy - Evenza",
  description: "Privacy policy for the Evenza platform",
}

export default function PrivacyPolicyPage() {
  return (
    <div className="container py-12">
      <Card>
        <CardHeader className="space-y-1">
          <CardTitle className="text-3xl">Privacy Policy</CardTitle>
          <CardDescription>Last updated: March 16, 2025</CardDescription>
        </CardHeader>
        <CardContent className="prose max-w-none prose-headings:font-heading">
          <p>
            At Evenza, we take your privacy seriously. This Privacy Policy describes how your personal information is
            collected, used, and shared when you visit or make a purchase from our website.
          </p>

          <h2>Information We Collect</h2>
          <p>
            When you visit our website, we automatically collect certain information about your device, including
            information about your web browser, IP address, time zone, and some of the cookies that are installed on
            your device.
          </p>
          <p>
            Additionally, as you browse the site, we collect information about the individual web pages that you view,
            what websites or search terms referred you to the site, and information about how you interact with the
            site. We refer to this automatically collected information as "Device Information."
          </p>

          <h3>Personal Information</h3>
          <p>We collect the following personal information when you register with us:</p>
          <ul>
            <li>Name</li>
            <li>Email address</li>
            <li>Phone number (optional)</li>
            <li>Emergency contact information (for trip registrations)</li>
            <li>Educational and professional information (for interview applications)</li>
            <li>Payment information (when registering for paid events or trips)</li>
          </ul>

          <h2>How We Use Your Information</h2>
          <p>We use the information we collect to:</p>
          <ul>
            <li>Process and confirm your event, trip, and interview registrations</li>
            <li>Communicate with you about your registrations, our services, and related news</li>
            <li>Improve our website and services</li>
            <li>Detect and prevent fraud</li>
            <li>Screen for potential risk and fraud</li>
            <li>Provide customer support</li>
          </ul>

          <h2>Data Retention</h2>
          <p>
            We will maintain your personal information for our records unless and until you ask us to delete this
            information.
          </p>

          <h2>Your Rights</h2>
          <p>
            If you are a resident of the European Economic Area (EEA), you have certain data protection rights. Evenza
            aims to take reasonable steps to allow you to correct, amend, delete, or limit the use of your Personal
            Data.
          </p>
          <p>You have the right to:</p>
          <ul>
            <li>Access and receive a copy of your personal data we hold</li>
            <li>Rectify any personal data that is inaccurate or incomplete</li>
            <li>Request the deletion of your personal data</li>
            <li>Object to the processing of your personal data</li>
            <li>Request the restriction of processing of your personal data</li>
            <li>Request the transfer of your personal data</li>
          </ul>

          <h2>Data Security</h2>
          <p>
            We have implemented appropriate technical and organizational security measures designed to protect the
            security of any personal information we process. However, please also remember that we cannot guarantee that
            the internet itself is 100% secure.
          </p>

          <h2>Changes to This Privacy Policy</h2>
          <p>
            We may update this privacy policy from time to time in order to reflect, for example, changes to our
            practices or for other operational, legal or regulatory reasons. We will notify you of any material changes
            to this policy.
          </p>

          <h2>Contact Us</h2>
          <p>
            For more information about our privacy practices, if you have questions, or if you would like to make a
            complaint, please contact us by e-mail at privacy@evenza.com.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
