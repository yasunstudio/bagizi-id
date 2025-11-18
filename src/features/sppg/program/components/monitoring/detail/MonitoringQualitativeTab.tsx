/**
 * @fileoverview Monitoring Qualitative Tab Component
 * @description Displays challenges, achievements, recommendations, and feedback
 * @version Next.js 15.5.4
 */

'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  AlertTriangle,
  Award,
  Lightbulb,
  MessageSquare,
  Target,
} from 'lucide-react'

interface MonitoringQualitativeTabProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  challenges: any
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  achievements: any
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  recommendations: any
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  feedback: any
  stockoutDays?: number
}

export function MonitoringQualitativeTab({
  challenges,
  achievements,
  recommendations,
  feedback,
  stockoutDays,
}: MonitoringQualitativeTabProps) {
  return (
    <div className="space-y-6">
      {/* Challenges Section */}
      {challenges && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              Tantangan & Kendala
            </CardTitle>
            <CardDescription>
              Masalah yang dihadapi selama periode monitoring
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {challenges.major && challenges.major.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-semibold text-sm flex items-center gap-2">
                  <Badge variant="destructive">Major</Badge>
                  Tantangan Utama
                </h4>
                <ul className="space-y-2 pl-4">
                  {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                  {challenges.major.map((challenge: any, idx: number) => (
                    <li key={idx} className="text-sm list-disc">
                      <div className="font-medium">{challenge.category}</div>
                      <div className="text-muted-foreground">{challenge.description}</div>
                      {challenge.impact && (
                        <div className="text-xs text-amber-600 mt-1">
                          Dampak: {challenge.impact}
                        </div>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {challenges.minor && challenges.minor.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-semibold text-sm flex items-center gap-2">
                  <Badge variant="secondary">Minor</Badge>
                  Masalah Kecil
                </h4>
                <ul className="space-y-1 pl-4">
                  {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                  {challenges.minor.map((issue: any, idx: number) => (
                    <li key={idx} className="text-sm list-disc text-muted-foreground">
                      {issue.description}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {stockoutDays && stockoutDays > 0 && (
              <div className="p-3 bg-amber-50 dark:bg-amber-950 rounded-lg border border-amber-200 dark:border-amber-800">
                <div className="flex items-center gap-2 text-amber-800 dark:text-amber-200">
                  <AlertTriangle className="h-4 w-4" />
                  <span className="font-medium text-sm">
                    Kehabisan Stok: {stockoutDays} hari
                  </span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Achievements Section */}
      {achievements && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5 text-primary" />
              Pencapaian & Prestasi
            </CardTitle>
            <CardDescription>
              Hal-hal positif yang dicapai selama periode ini
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {achievements.milestones && achievements.milestones.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-semibold text-sm">Milestone Tercapai</h4>
                <ul className="space-y-2 pl-4">
                  {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                  {achievements.milestones.map((milestone: any, idx: number) => (
                    <li key={idx} className="text-sm list-disc">
                      <div className="font-medium text-green-600 dark:text-green-400">
                        {milestone.title}
                      </div>
                      <div className="text-muted-foreground text-xs">
                        {milestone.description}
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {achievements.bestPractices && achievements.bestPractices.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-semibold text-sm">Best Practices</h4>
                <ul className="space-y-1 pl-4">
                  {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                  {achievements.bestPractices.map((practice: any, idx: number) => (
                    <li key={idx} className="text-sm list-disc text-muted-foreground">
                      {practice}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {achievements.innovations && achievements.innovations.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-semibold text-sm">Inovasi</h4>
                <ul className="space-y-2 pl-4">
                  {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                  {achievements.innovations.map((innovation: any, idx: number) => (
                    <li key={idx} className="text-sm list-disc">
                      <div className="font-medium">{innovation.title}</div>
                      <div className="text-muted-foreground text-xs">
                        {innovation.description}
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Recommendations Section */}
      {recommendations && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5 text-primary" />
              Rekomendasi & Rencana Tindak Lanjut
            </CardTitle>
            <CardDescription>
              Saran perbaikan untuk periode mendatang
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {recommendations.actions && recommendations.actions.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-semibold text-sm flex items-center gap-2">
                  <Target className="h-4 w-4" />
                  Rencana Aksi
                </h4>
                <ul className="space-y-2 pl-4">
                  {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                  {recommendations.actions.map((action: any, idx: number) => (
                    <li key={idx} className="text-sm list-disc">
                      <div className="font-medium">{action.description}</div>
                      {action.priority && (
                        <Badge 
                          variant={
                            action.priority === 'high' ? 'destructive' :
                            action.priority === 'medium' ? 'default' : 'secondary'
                          }
                          className="mt-1"
                        >
                          {action.priority.toUpperCase()}
                        </Badge>
                      )}
                      {action.timeline && (
                        <div className="text-xs text-muted-foreground mt-1">
                          Timeline: {action.timeline}
                        </div>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {recommendations.resourceNeeds && recommendations.resourceNeeds.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-semibold text-sm">Kebutuhan Sumber Daya</h4>
                <ul className="space-y-2 pl-4">
                  {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                  {recommendations.resourceNeeds.map((need: any, idx: number) => (
                    <li key={idx} className="text-sm list-disc">
                      <div className="font-medium">{need.type.toUpperCase()}</div>
                      <div className="text-muted-foreground text-xs">
                        {need.description}
                      </div>
                      <Badge variant="outline" className="mt-1">
                        {need.urgency}
                      </Badge>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {recommendations.improvementPlans && recommendations.improvementPlans.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-semibold text-sm">Rencana Perbaikan</h4>
                <ul className="space-y-2 pl-4">
                  {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                  {recommendations.improvementPlans.map((plan: any, idx: number) => (
                    <li key={idx} className="text-sm list-disc">
                      <div className="font-medium">{plan.area}</div>
                      <div className="text-muted-foreground text-xs">
                        Target: {plan.targetState}
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Feedback Section */}
      {feedback && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-primary" />
              Feedback Stakeholder
            </CardTitle>
            <CardDescription>
              Masukan dari berbagai pihak terkait
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              {feedback.parents && Object.keys(feedback.parents).length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-semibold text-sm">Orang Tua</h4>
                  {feedback.parents.positive && feedback.parents.positive.length > 0 && (
                    <div className="space-y-1 pl-4">
                      <div className="text-xs font-medium text-green-600">Positif:</div>
                      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                      {feedback.parents.positive.map((comment: any, idx: number) => (
                        <div key={idx} className="text-sm text-muted-foreground">• {comment}</div>
                      ))}
                    </div>
                  )}
                  {feedback.parents.suggestions && feedback.parents.suggestions.length > 0 && (
                    <div className="space-y-1 pl-4">
                      <div className="text-xs font-medium">Saran:</div>
                      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                      {feedback.parents.suggestions.map((comment: any, idx: number) => (
                        <div key={idx} className="text-sm text-muted-foreground">• {comment}</div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {feedback.teachers && Object.keys(feedback.teachers).length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-semibold text-sm">Guru/Pendidik</h4>
                  {feedback.teachers.positive && feedback.teachers.positive.length > 0 && (
                    <div className="space-y-1 pl-4">
                      <div className="text-xs font-medium text-green-600">Positif:</div>
                      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                      {feedback.teachers.positive.map((comment: any, idx: number) => (
                        <div key={idx} className="text-sm text-muted-foreground">• {comment}</div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {feedback.community && Object.keys(feedback.community).length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-semibold text-sm">Komunitas</h4>
                  {feedback.community.positive && feedback.community.positive.length > 0 && (
                    <div className="space-y-1 pl-4">
                      <div className="text-xs font-medium text-green-600">Positif:</div>
                      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                      {feedback.community.positive.map((comment: any, idx: number) => (
                        <div key={idx} className="text-sm text-muted-foreground">• {comment}</div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {feedback.government && Object.keys(feedback.government).length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-semibold text-sm">Pemerintah/Dinas</h4>
                  {feedback.government.complianceNotes && feedback.government.complianceNotes.length > 0 && (
                    <div className="space-y-1 pl-4">
                      <div className="text-xs font-medium">Catatan Compliance:</div>
                      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                      {feedback.government.complianceNotes.map((comment: any, idx: number) => (
                        <div key={idx} className="text-sm text-muted-foreground">• {comment}</div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
