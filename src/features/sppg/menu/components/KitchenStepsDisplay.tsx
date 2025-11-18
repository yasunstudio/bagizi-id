/**
 * @fileoverview KitchenStepsDisplay - Kitchen staff view for recipe steps
 * @version Next.js 15.5.4 / shadcn/ui / Optimized for tablet/kitchen display
 * @author Bagizi-ID Development Team
 * @see {@link /docs/copilot-instructions.md} Development Guidelines
 * 
 * Features:
 * - Large text optimized for kitchen environment
 * - Step-by-step progress tracking
 * - Timer integration for timed steps
 * - Full-screen mode support
 * - Touch-friendly navigation
 * - Equipment checklist
 * - Quality control reminders
 */

'use client'

import React, { useState, useEffect } from 'react'
import Image from 'next/image'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  ChevronLeft,
  ChevronRight,
  Play,
  Pause,
  RotateCcw,
  CheckCircle2,
  Clock,
  Thermometer,
  Wrench,
  AlertCircle,
  Maximize,
  Minimize,
  Info,
  ChefHat,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useRecipeSteps } from '../hooks/useRecipeSteps'

// ================================ TYPES ================================

interface KitchenStepsDisplayProps {
  menuId: string
  menuName?: string
  onComplete?: () => void
}

interface StepProgress {
  stepId: string
  completed: boolean
  startedAt?: Date
  completedAt?: Date
  timerSeconds?: number
}

// ================================ TIMER HOOK ================================

function useStepTimer(duration?: number | null) {
  const [seconds, setSeconds] = useState(0)
  const [isRunning, setIsRunning] = useState(false)
  const [isPaused, setIsPaused] = useState(false)

  const targetSeconds = duration ? duration * 60 : 0

  useEffect(() => {
    if (!isRunning || isPaused) return

    const interval = setInterval(() => {
      setSeconds((prev) => {
        if (targetSeconds && prev >= targetSeconds) {
          setIsRunning(false)
          return targetSeconds
        }
        return prev + 1
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [isRunning, isPaused, targetSeconds])

  const start = () => {
    setIsRunning(true)
    setIsPaused(false)
  }

  const pause = () => {
    setIsPaused(true)
  }

  const resume = () => {
    setIsPaused(false)
  }

  const reset = () => {
    setSeconds(0)
    setIsRunning(false)
    setIsPaused(false)
  }

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60)
    const remainingSecs = secs % 60
    return `${mins.toString().padStart(2, '0')}:${remainingSecs.toString().padStart(2, '0')}`
  }

  return {
    seconds,
    isRunning,
    isPaused,
    start,
    pause,
    resume,
    reset,
    formatTime,
    progress: targetSeconds ? (seconds / targetSeconds) * 100 : 0,
    isComplete: targetSeconds ? seconds >= targetSeconds : false,
  }
}

// ================================ MAIN COMPONENT ================================

export function KitchenStepsDisplay({
  menuId,
  menuName,
  onComplete,
}: KitchenStepsDisplayProps) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0)
  const [isFullScreen, setIsFullScreen] = useState(false)
  const [stepProgress, setStepProgress] = useState<Record<string, StepProgress>>({})

  const { data: steps, isLoading, error } = useRecipeSteps(menuId)

  const currentStep = steps?.[currentStepIndex]
  const timer = useStepTimer(currentStep?.duration)

  // ================================ PROGRESS TRACKING ================================

  const markStepComplete = (stepId: string) => {
    setStepProgress((prev) => ({
      ...prev,
      [stepId]: {
        ...prev[stepId],
        stepId,
        completed: true,
        completedAt: new Date(),
      },
    }))
  }

  const startStep = (stepId: string) => {
    setStepProgress((prev) => ({
      ...prev,
      [stepId]: {
        ...prev[stepId],
        stepId,
        completed: false,
        startedAt: new Date(),
      },
    }))

    // Auto-start timer if step has duration
    if (currentStep?.duration) {
      timer.start()
    }
  }

  // ================================ NAVIGATION ================================

  const goToPreviousStep = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(currentStepIndex - 1)
      timer.reset()
    }
  }

  const goToNextStep = () => {
    if (steps && currentStepIndex < steps.length - 1) {
      // Mark current step as complete
      if (currentStep) {
        markStepComplete(currentStep.id)
      }
      
      setCurrentStepIndex(currentStepIndex + 1)
      timer.reset()
      
      // Start next step
      if (steps[currentStepIndex + 1]) {
        startStep(steps[currentStepIndex + 1].id)
      }
    } else if (steps && currentStepIndex === steps.length - 1) {
      // Last step completed
      if (currentStep) {
        markStepComplete(currentStep.id)
      }
      onComplete?.()
    }
  }

  // ================================ FULL SCREEN ================================

  const toggleFullScreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen()
      setIsFullScreen(true)
    } else {
      document.exitFullscreen()
      setIsFullScreen(false)
    }
  }

  useEffect(() => {
    const handleFullScreenChange = () => {
      setIsFullScreen(!!document.fullscreenElement)
    }

    document.addEventListener('fullscreenchange', handleFullScreenChange)
    return () => document.removeEventListener('fullscreenchange', handleFullScreenChange)
  }, [])

  // ================================ INITIAL STEP START ================================

  useEffect(() => {
    if (currentStep && !stepProgress[currentStep.id]?.startedAt) {
      startStep(currentStep.id)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentStep])

  // ================================ LOADING & ERROR STATES ================================

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-8 w-[300px]" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-[400px] w-full" />
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Gagal memuat langkah resep: {error.message}
        </AlertDescription>
      </Alert>
    )
  }

  if (!steps || steps.length === 0) {
    return (
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          Belum ada langkah resep untuk menu ini. Tambahkan langkah resep terlebih dahulu.
        </AlertDescription>
      </Alert>
    )
  }

  const totalSteps = steps.length
  const completedSteps = Object.values(stepProgress).filter((p) => p.completed).length
  const progressPercentage = (completedSteps / totalSteps) * 100

  // ================================ RENDER ================================

  return (
    <div className={cn(
      'space-y-4',
      isFullScreen && 'h-screen flex flex-col p-6 bg-background'
    )}>
      {/* Header */}
      <Card className={cn(isFullScreen && 'flex-none')}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <CardTitle className="flex items-center gap-2 text-2xl">
                <ChefHat className="h-6 w-6 text-primary" />
                {menuName || 'Resep Masakan'}
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Langkah {currentStepIndex + 1} dari {totalSteps}
              </p>
            </div>
            <Button
              variant="outline"
              size="icon"
              onClick={toggleFullScreen}
            >
              {isFullScreen ? (
                <Minimize className="h-5 w-5" />
              ) : (
                <Maximize className="h-5 w-5" />
              )}
            </Button>
          </div>

          {/* Overall Progress */}
          <div className="space-y-2 pt-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Progress Total</span>
              <span className="font-semibold">{completedSteps}/{totalSteps} Langkah</span>
            </div>
            <Progress value={progressPercentage} className="h-2" />
          </div>
        </CardHeader>
      </Card>

      {/* Current Step Display */}
      {currentStep && (
        <Card className={cn(
          'flex-1',
          isFullScreen && 'overflow-auto'
        )}>
          <CardContent className="p-8 space-y-6">
            {/* Step Number & Title */}
            <div className="space-y-2">
              <Badge className="text-lg px-4 py-2">
                Langkah {currentStep.stepNumber}
              </Badge>
              {currentStep.title && (
                <h2 className="text-4xl font-bold leading-tight">
                  {currentStep.title}
                </h2>
              )}
            </div>

            {/* Media Preview */}
            {currentStep.imageUrl && (
              <div className="relative aspect-video rounded-lg overflow-hidden bg-muted">
                <Image
                  src={currentStep.imageUrl}
                  alt={currentStep.title || `Step ${currentStep.stepNumber}`}
                  fill
                  className="object-cover"
                />
              </div>
            )}

            {/* Instruction */}
            <div className="p-6 bg-muted/30 rounded-lg">
              <p className="text-2xl leading-relaxed whitespace-pre-wrap">
                {currentStep.instruction}
              </p>
            </div>

            {/* Timer (if step has duration) */}
            {currentStep.duration && (
              <div className="p-6 bg-primary/5 rounded-lg space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Clock className="h-6 w-6 text-primary" />
                    <span className="text-lg font-semibold">Timer</span>
                  </div>
                  <Badge variant={timer.isComplete ? 'default' : 'secondary'} className="text-lg px-4 py-2">
                    {timer.formatTime(timer.seconds)}
                  </Badge>
                </div>

                <Progress value={timer.progress} className="h-3" />

                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    Target: {currentStep.duration} menit
                  </span>
                  <div className="flex gap-2">
                    {!timer.isRunning ? (
                      <Button onClick={timer.start} size="sm">
                        <Play className="h-4 w-4 mr-2" />
                        Mulai
                      </Button>
                    ) : timer.isPaused ? (
                      <Button onClick={timer.resume} size="sm">
                        <Play className="h-4 w-4 mr-2" />
                        Lanjut
                      </Button>
                    ) : (
                      <Button onClick={timer.pause} size="sm" variant="outline">
                        <Pause className="h-4 w-4 mr-2" />
                        Pause
                      </Button>
                    )}
                    <Button onClick={timer.reset} size="sm" variant="outline">
                      <RotateCcw className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {timer.isComplete && (
                  <Alert>
                    <CheckCircle2 className="h-4 w-4" />
                    <AlertDescription>
                      Timer selesai! Lanjut ke langkah berikutnya.
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            )}

            {/* Temperature */}
            {currentStep.temperature && (
              <div className="flex items-center gap-3 p-4 bg-background rounded-lg border">
                <Thermometer className="h-6 w-6 text-orange-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Suhu</p>
                  <p className="text-2xl font-semibold">{currentStep.temperature}°C</p>
                </div>
              </div>
            )}

            {/* Equipment */}
            {currentStep.equipment && currentStep.equipment.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Wrench className="h-5 w-5 text-muted-foreground" />
                  <h3 className="text-lg font-semibold">Alat yang Dibutuhkan</h3>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {currentStep.equipment.map((item, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-2 p-3 bg-background rounded-lg border"
                    >
                      <CheckCircle2 className="h-5 w-5 text-muted-foreground" />
                      <span className="text-lg">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Quality Check */}
            {currentStep.qualityCheck && (
              <Alert>
                <CheckCircle2 className="h-5 w-5" />
                <AlertDescription className="text-lg">
                  <strong>Quality Check:</strong> {currentStep.qualityCheck}
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      )}

      {/* Navigation Controls */}
      <Card className={cn(isFullScreen && 'flex-none')}>
        <CardContent className="p-6">
          <div className="flex items-center justify-between gap-4">
            <Button
              onClick={goToPreviousStep}
              disabled={currentStepIndex === 0}
              size="lg"
              variant="outline"
              className="flex-1"
            >
              <ChevronLeft className="h-5 w-5 mr-2" />
              Sebelumnya
            </Button>

            {/* Step Indicators */}
            <div className="flex gap-2">
              {steps?.map((step, index) => (
                <button
                  key={step.id}
                  onClick={() => {
                    setCurrentStepIndex(index)
                    timer.reset()
                  }}
                  className={cn(
                    'w-3 h-3 rounded-full transition-colors',
                    index === currentStepIndex && 'bg-primary scale-125',
                    index < currentStepIndex && 'bg-green-500',
                    index > currentStepIndex && 'bg-muted'
                  )}
                  aria-label={`Go to step ${index + 1}`}
                />
              ))}
            </div>

            <Button
              onClick={goToNextStep}
              size="lg"
              className="flex-1"
            >
              {currentStepIndex === totalSteps - 1 ? (
                <>
                  <CheckCircle2 className="h-5 w-5 mr-2" />
                  Selesai
                </>
              ) : (
                <>
                  Selanjutnya
                  <ChevronRight className="h-5 w-5 ml-2" />
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
