import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-2">Settings</h2>
        <p className="text-muted-foreground">Manage your account and preferences</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Profile Information</CardTitle>
          <CardDescription>Update your personal details</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Full Name</Label>
              <Input defaultValue="John Doe" />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input type="email" defaultValue="john@example.com" />
            </div>
            <div className="space-y-2">
              <Label>Organization</Label>
              <Input defaultValue="Environmental NGO" />
            </div>
            <div className="space-y-2">
              <Label>Role</Label>
              <Select defaultValue="manager">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Administrator</SelectItem>
                  <SelectItem value="manager">Land Manager</SelectItem>
                  <SelectItem value="analyst">Data Analyst</SelectItem>
                  <SelectItem value="viewer">Viewer</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <Button>Save Changes</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Regional Preferences</CardTitle>
          <CardDescription>Set your default monitoring region</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Default Region</Label>
            <Select defaultValue="all">
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Regions</SelectItem>
                <SelectItem value="north">Northern Plains</SelectItem>
                <SelectItem value="east">Eastern Valley</SelectItem>
                <SelectItem value="south">Southern Hills</SelectItem>
                <SelectItem value="west">Western Range</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button>Save Preferences</Button>
        </CardContent>
      </Card>
    </div>
  )
}
