import { checkSupabaseConnection } from "@/lib/supabase-check"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { CheckCircle, XCircle } from "lucide-react"

export default async function DbCheckPage() {
  const result = await checkSupabaseConnection()

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-4">Supabase Connection Check</h1>

      <Card>
        <CardHeader>
          <CardTitle>Connection Status</CardTitle>
          <CardDescription>Checking connection to your Supabase database</CardDescription>
        </CardHeader>
        <CardContent>
          {result.success ? (
            <Alert className="bg-green-50 border-green-200">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertTitle className="text-green-800">Connected</AlertTitle>
              <AlertDescription className="text-green-700">
                {result.message}
                {result.version && (
                  <div className="mt-2">
                    <strong>Version:</strong> {result.version}
                  </div>
                )}
              </AlertDescription>
            </Alert>
          ) : (
            <Alert className="bg-red-50 border-red-200">
              <XCircle className="h-4 w-4 text-red-600" />
              <AlertTitle className="text-red-800">Connection Failed</AlertTitle>
              <AlertDescription className="text-red-700">
                {result.error}
                {result.details && (
                  <div className="mt-2 overflow-x-auto">
                    <pre className="text-xs bg-red-100 p-2 rounded">{JSON.stringify(result.details, null, 2)}</pre>
                  </div>
                )}
              </AlertDescription>
            </Alert>
          )}

          <div className="mt-4">
            <h3 className="font-semibold mb-2">Environment Variables</h3>
            <div className="bg-muted p-3 rounded-md">
              <p>
                <strong>SUPABASE_URL:</strong> {process.env.SUPABASE_URL ? "✅ Set" : "❌ Not set"}
              </p>
              <p>
                <strong>SUPABASE_ANON_KEY:</strong> {process.env.SUPABASE_ANON_KEY ? "✅ Set" : "❌ Not set"}
              </p>
              <p>
                <strong>SUPABASE_SERVICE_ROLE_KEY:</strong>{" "}
                {process.env.SUPABASE_SERVICE_ROLE_KEY ? "✅ Set" : "❌ Not set"}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
