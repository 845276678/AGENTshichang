'use client'

import React, { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { FormField } from '@/components/ui/FormField'
import { PasswordStrengthMeter } from '@/components/ui/PasswordStrengthMeter'
import { Badge } from '@/components/ui/badge'
import { 
  Shield, 
  Key, 
  Smartphone, 
  Clock, 
  Monitor,
  MapPin,
  AlertTriangle,
  CheckCircle,
  Trash2
} from 'lucide-react'

interface LoginSession {
  id: string
  device: string
  location: string
  ipAddress: string
  lastActive: string
  isCurrent: boolean
}

const mockSessions: LoginSession[] = [
  {
    id: '1',
    device: 'Chrome on Windows',
    location: 'New York, US',
    ipAddress: '192.168.1.1',
    lastActive: '2 minutes ago',
    isCurrent: true
  },
  {
    id: '2',
    device: 'Safari on iPhone',
    location: 'New York, US',
    ipAddress: '192.168.1.2',
    lastActive: '2 hours ago',
    isCurrent: false
  }
]

export function SecuritySettings() {
  const { user } = useAuth()
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handlePasswordChange = async () => {
    if (newPassword !== confirmPassword) {
      alert('Passwords do not match')
      return
    }

    setIsLoading(true)
    try {
      // TODO: Implement password change API
      await new Promise(resolve => setTimeout(resolve, 1000))
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    } catch (error) {
      console.error('Password change failed:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleRevokeSession = async (sessionId: string) => {
    try {
      // TODO: Implement session revocation
      console.log('Revoking session:', sessionId)
    } catch (error) {
      console.error('Session revocation failed:', error)
    }
  }

  return (
    <div className="space-y-6">
      {/* Password Change */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="h-5 w-5" />
            Change Password
          </CardTitle>
          <CardDescription>
            Update your password to keep your account secure
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <FormField label="Current Password" error="" required>
            <Input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="Enter your current password"
            />
          </FormField>

          <FormField label="New Password" error="" required>
            <Input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Enter a new password"
            />
          </FormField>

          {newPassword && (
            <PasswordStrengthMeter password={newPassword} />
          )}

          <FormField label="Confirm New Password" error="" required>
            <Input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm your new password"
            />
          </FormField>

          <Button 
            onClick={handlePasswordChange}
            disabled={isLoading || !currentPassword || !newPassword || !confirmPassword}
          >
            {isLoading ? 'Updating...' : 'Update Password'}
          </Button>
        </CardContent>
      </Card>

      {/* Two-Factor Authentication */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Smartphone className="h-5 w-5" />
            Two-Factor Authentication
          </CardTitle>
          <CardDescription>
            Add an extra layer of security to your account
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 rounded-lg border">
            <div className="space-y-1">
              <div className="font-medium">Authenticator App</div>
              <div className="text-sm text-muted-foreground">
                {twoFactorEnabled 
                  ? 'Two-factor authentication is enabled'
                  : 'Use an authenticator app to generate codes'
                }
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={twoFactorEnabled ? "success" : "secondary"}>
                {twoFactorEnabled ? 'Enabled' : 'Disabled'}
              </Badge>
              <Button 
                variant={twoFactorEnabled ? "destructive" : "default"}
                size="sm"
                onClick={() => setTwoFactorEnabled(!twoFactorEnabled)}
              >
                {twoFactorEnabled ? 'Disable' : 'Enable'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Login History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Active Sessions
          </CardTitle>
          <CardDescription>
            Manage devices that have access to your account
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {mockSessions.map((session) => (
            <div
              key={session.id}
              className="flex items-center justify-between p-4 rounded-lg border"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Monitor className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <div className="font-medium">{session.device}</div>
                  <div className="text-sm text-muted-foreground flex items-center gap-2">
                    <MapPin className="h-3 w-3" />
                    {session.location}
                    {session.isCurrent && (
                      <Badge variant="success" className="text-xs ml-2">
                        Current
                      </Badge>
                    )}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {session.ipAddress} • Last active {session.lastActive}
                  </div>
                </div>
              </div>
              {!session.isCurrent && (
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleRevokeSession(session.id)}
                >
                  <Trash2 className="h-3 w-3 mr-1" />
                  Revoke
                </Button>
              )}
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Security Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Security Status
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-3 p-3 rounded-lg border">
              <CheckCircle className="h-5 w-5 text-success-600" />
              <div>
                <div className="font-medium">Email Verified</div>
                <div className="text-sm text-muted-foreground">Your email is confirmed</div>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-lg border">
              <AlertTriangle className="h-5 w-5 text-warning-600" />
              <div>
                <div className="font-medium">2FA Recommended</div>
                <div className="text-sm text-muted-foreground">Enable two-factor auth</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}