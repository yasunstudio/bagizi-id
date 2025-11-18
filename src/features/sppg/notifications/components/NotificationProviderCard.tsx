/**
 * @fileoverview Notification Provider Configuration Card
 * @version Next.js 15.5.4
 * @author Bagizi-ID Development Team
 * 
 * Display notification provider status with configuration options
 */

'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Settings,
  CheckCircle2,
  XCircle,
  AlertCircle,
  MessageSquare,
  Mail,
  RefreshCw,
} from 'lucide-react'
import { cn } from '@/lib/utils'

// ================================ TYPES ================================

type ProviderType = 'WHATSAPP' | 'EMAIL'
type ProviderStatus = 'ACTIVE' | 'INACTIVE' | 'ERROR'

interface ProviderConfig {
  type: ProviderType
  name: string
  provider: string
  status: ProviderStatus
  isEnabled: boolean
  lastUsed?: Date
  totalSent?: number
  successRate?: number
  apiKey?: string
  errorMessage?: string
}

interface NotificationProviderCardProps {
  config: ProviderConfig
  onToggle: (enabled: boolean) => void
  onConfigure: () => void
  onTest: () => void
}

// ================================ COMPONENT ================================

export function NotificationProviderCard({
  config,
  onToggle,
  onConfigure,
  onTest,
}: NotificationProviderCardProps) {
  const [isToggling, setIsToggling] = useState(false)

  const handleToggle = async (enabled: boolean) => {
    setIsToggling(true)
    try {
      await onToggle(enabled)
    } finally {
      setIsToggling(false)
    }
  }

  const getIcon = () => {
    switch (config.type) {
      case 'WHATSAPP':
        return <MessageSquare className="h-5 w-5" />
      case 'EMAIL':
        return <Mail className="h-5 w-5" />
    }
  }

  const getStatusBadge = () => {
    if (!config.isEnabled) {
      return (
        <Badge variant="secondary" className="flex items-center gap-1">
          <XCircle className="h-3 w-3" />
          Disabled
        </Badge>
      )
    }

    switch (config.status) {
      case 'ACTIVE':
        return (
          <Badge className="bg-green-100 text-green-800 hover:bg-green-200 flex items-center gap-1">
            <CheckCircle2 className="h-3 w-3" />
            Active
          </Badge>
        )
      case 'ERROR':
        return (
          <Badge variant="destructive" className="flex items-center gap-1">
            <AlertCircle className="h-3 w-3" />
            Error
          </Badge>
        )
      default:
        return (
          <Badge variant="secondary" className="flex items-center gap-1">
            <XCircle className="h-3 w-3" />
            Inactive
          </Badge>
        )
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <CardTitle className="flex items-center gap-2">
              {getIcon()}
              {config.name}
            </CardTitle>
            <CardDescription>
              Provider: <strong>{config.provider}</strong>
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            {getStatusBadge()}
            <Switch
              checked={config.isEnabled}
              onCheckedChange={handleToggle}
              disabled={isToggling}
            />
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Error Alert */}
        {config.status === 'ERROR' && config.errorMessage && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{config.errorMessage}</AlertDescription>
          </Alert>
        )}

        {/* Configuration Status */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">API Key</span>
            <span className={cn(
              'font-medium',
              config.apiKey ? 'text-green-600' : 'text-red-600'
            )}>
              {config.apiKey ? '✓ Configured' : '✗ Not Configured'}
            </span>
          </div>

          {config.lastUsed && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Last Used</span>
              <span className="font-medium">
                {new Date(config.lastUsed).toLocaleDateString('id-ID', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                })}
              </span>
            </div>
          )}

          {typeof config.totalSent === 'number' && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Total Sent</span>
              <span className="font-medium">{config.totalSent.toLocaleString()}</span>
            </div>
          )}

          {typeof config.successRate === 'number' && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Success Rate</span>
              <Badge
                variant="outline"
                className={cn(
                  config.successRate >= 95 && 'bg-green-50 text-green-700',
                  config.successRate >= 80 && config.successRate < 95 && 'bg-amber-50 text-amber-700',
                  config.successRate < 80 && 'bg-red-50 text-red-700'
                )}
              >
                {config.successRate.toFixed(1)}%
              </Badge>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 pt-2">
          <Button
            variant="outline"
            className="flex-1"
            onClick={onConfigure}
          >
            <Settings className="mr-2 h-4 w-4" />
            Configure
          </Button>
          <Button
            variant="outline"
            onClick={onTest}
            disabled={!config.isEnabled || !config.apiKey}
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Test
          </Button>
        </div>

        {/* Configuration Hint */}
        {!config.apiKey && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-xs">
              Please configure API credentials to enable this provider.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  )
}
