'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '@/hooks/useAuth'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'


import { 
  Settings, 
  Bell, 
  _Mail, 
  Shield, 
  Trash2,
  Download,
  Eye,
  _EyeOff,
  AlertTriangle
} from 'lucide-react'

interface NotificationSettings {
  emailNotifications: boolean
  marketingEmails: boolean
  securityAlerts: boolean
  agentUpdates: boolean
  weeklyDigest: boolean
}

interface PrivacySettings {
  profileVisibility: 'public' | 'private' | 'friends'
  showEmail: boolean
  showLocation: boolean
  allowDirectMessages: boolean
  indexBySearchEngines: boolean
}

export function AccountSettings() {
  const { user } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  
  const [notifications, setNotifications] = useState<NotificationSettings>({
    emailNotifications: user?.emailNotifications ?? true,
    marketingEmails: user?.marketingEmails ?? false,
    securityAlerts: true,
    agentUpdates: true,
    weeklyDigest: false
  })

  const [privacy, setPrivacy] = useState<PrivacySettings>({
    profileVisibility: 'public',
    showEmail: false,
    showLocation: true,
    allowDirectMessages: true,
    indexBySearchEngines: true
  })

  const handleNotificationChange = (key: keyof NotificationSettings) => {
    setNotifications(prev => ({
      ...prev,
      [key]: !prev[key]
    }))
  }

  const handlePrivacyChange = (key: keyof PrivacySettings, value: any) => {
    setPrivacy(prev => ({
      ...prev,
      [key]: value
    }))
  }

  const handleSaveSettings = async () => {
    setIsLoading(true)
    try {
      // TODO: Implement API calls to save settings
      await new Promise(resolve => setTimeout(resolve, 1000))
    } catch (error) {
      console.error('Failed to save settings:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleExportData = async () => {
    // TODO: Implement data export
    console.log('Exporting user data...')
  }

  const handleDeleteAccount = async () => {
    if (window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      // TODO: Implement account deletion
      console.log('Deleting account...')
    }
    setShowDeleteDialog(false)
  }

  const ToggleSwitch = ({ checked, onChange, disabled = false }: {
    checked: boolean
    onChange: () => void
    disabled?: boolean
  }) => (
    <button
      type="button"
      className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${
        checked ? 'bg-primary' : 'bg-secondary'
      }`}
      onClick={onChange}
      disabled={disabled}
    >
      <span
        className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
          checked ? 'translate-x-5' : 'translate-x-1'
        }`}
      />
    </button>
  )

  return (
    <div className="space-y-6">
      {/* Notification Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notification Preferences
          </CardTitle>
          <CardDescription>
            Choose what notifications you want to receive
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <div className="font-medium">Email Notifications</div>
                <div className="text-sm text-muted-foreground">
                  Receive notifications via email
                </div>
              </div>
              <ToggleSwitch
                checked={notifications.emailNotifications}
                onChange={() => handleNotificationChange('emailNotifications')}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <div className="font-medium">Security Alerts</div>
                <div className="text-sm text-muted-foreground">
                  Important security notifications
                </div>
              </div>
              <ToggleSwitch
                checked={notifications.securityAlerts}
                onChange={() => handleNotificationChange('securityAlerts')}
                disabled
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <div className="font-medium">Agent Updates</div>
                <div className="text-sm text-muted-foreground">
                  Notifications about your agents
                </div>
              </div>
              <ToggleSwitch
                checked={notifications.agentUpdates}
                onChange={() => handleNotificationChange('agentUpdates')}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <div className="font-medium">Marketing Emails</div>
                <div className="text-sm text-muted-foreground">
                  Product updates and promotions
                </div>
              </div>
              <ToggleSwitch
                checked={notifications.marketingEmails}
                onChange={() => handleNotificationChange('marketingEmails')}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <div className="font-medium">Weekly Digest</div>
                <div className="text-sm text-muted-foreground">
                  Weekly summary of your activity
                </div>
              </div>
              <ToggleSwitch
                checked={notifications.weeklyDigest}
                onChange={() => handleNotificationChange('weeklyDigest')}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Privacy Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Privacy Settings
          </CardTitle>
          <CardDescription>
            Control your privacy and data sharing preferences
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">
                Profile Visibility
              </label>
              <select
                value={privacy.profileVisibility}
                onChange={(e) => handlePrivacyChange('profileVisibility', e.target.value)}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
              >
                <option value="public">Public - Anyone can see</option>
                <option value="private">Private - Only you can see</option>
                <option value="friends">Friends - Only friends can see</option>
              </select>
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <div className="font-medium">Show Email Address</div>
                <div className="text-sm text-muted-foreground">
                  Display email on your public profile
                </div>
              </div>
              <ToggleSwitch
                checked={privacy.showEmail}
                onChange={() => handlePrivacyChange('showEmail', !privacy.showEmail)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <div className="font-medium">Show Location</div>
                <div className="text-sm text-muted-foreground">
                  Display location on your profile
                </div>
              </div>
              <ToggleSwitch
                checked={privacy.showLocation}
                onChange={() => handlePrivacyChange('showLocation', !privacy.showLocation)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <div className="font-medium">Allow Direct Messages</div>
                <div className="text-sm text-muted-foreground">
                  Let other users send you messages
                </div>
              </div>
              <ToggleSwitch
                checked={privacy.allowDirectMessages}
                onChange={() => handlePrivacyChange('allowDirectMessages', !privacy.allowDirectMessages)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <div className="font-medium">Search Engine Indexing</div>
                <div className="text-sm text-muted-foreground">
                  Allow search engines to index your profile
                </div>
              </div>
              <ToggleSwitch
                checked={privacy.indexBySearchEngines}
                onChange={() => handlePrivacyChange('indexBySearchEngines', !privacy.indexBySearchEngines)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Data Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Data Management
          </CardTitle>
          <CardDescription>
            Export or delete your account data
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-lg border">
              <div className="space-y-1">
                <div className="font-medium">Export Account Data</div>
                <div className="text-sm text-muted-foreground">
                  Download all your data in JSON format
                </div>
              </div>
              <Button variant="outline" onClick={handleExportData}>
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="border-destructive">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-5 w-5" />
            Danger Zone
          </CardTitle>
          <CardDescription>
            Irreversible and destructive actions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-lg border border-destructive bg-destructive/5">
              <div className="space-y-1">
                <div className="font-medium text-destructive">Delete Account</div>
                <div className="text-sm text-muted-foreground">
                  Permanently delete your account and all associated data
                </div>
              </div>
              <Button 
                variant="destructive" 
                onClick={() => setShowDeleteDialog(true)}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Account
              </Button>
            </div>

            {showDeleteDialog && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 rounded-lg border border-destructive bg-destructive/10"
              >
                <div className="space-y-3">
                  <div className="font-medium text-destructive">
                    Are you absolutely sure?
                  </div>
                  <div className="text-sm text-muted-foreground">
                    This action cannot be undone. This will permanently delete your account,
                    remove all your data, and cancel any active subscriptions.
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={handleDeleteAccount}
                    >
                      Yes, delete my account
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowDeleteDialog(false)}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button onClick={handleSaveSettings} disabled={isLoading}>
          <Settings className="h-4 w-4 mr-2" />
          {isLoading ? 'Saving...' : 'Save Settings'}
        </Button>
      </div>
    </div>
  )
}