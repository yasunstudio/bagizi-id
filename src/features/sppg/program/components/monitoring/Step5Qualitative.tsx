/**
 * Step 5: Qualitative Data
 * Professional form with dynamic fields for challenges, achievements, recommendations, and feedback
 * 
 * REFACTORED: Changed from JSON textarea to user-friendly dynamic forms
 * - Add/remove challenge items with structured fields
 * - Add/remove achievement items with structured fields
 * - Add/remove recommendation items with structured fields
 * - Add/remove feedback items with structured fields
 */

'use client'

import { useState } from 'react'
import { Control } from 'react-hook-form'
import {
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { CreateMonitoringInput } from '@/features/sppg/program/schemas/monitoringSchema'
import { AlertTriangle, Trophy, Lightbulb, MessageSquare, Plus, Trash2 } from 'lucide-react'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Card } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'

interface Step5QualitativeProps {
  control: Control<CreateMonitoringInput>
}

// Type definitions for dynamic fields
interface ChallengeItem {
  category: string
  description: string
  impact: 'Low' | 'Medium' | 'High'
  status: 'Ongoing' | 'Resolved' | 'Pending'
}

interface AchievementItem {
  category: string
  description: string
  impact: 'Low' | 'Medium' | 'High'
  date: string
}

interface RecommendationItem {
  category: string
  recommendation: string
  priority: 'Low' | 'Medium' | 'High'
  timeline: string
  estimatedCost?: number
}

interface FeedbackItem {
  source: string
  type: 'Positive' | 'Negative' | 'Suggestion' | 'Complaint'
  message: string
  date: string
  followUp?: string
}

export function Step5Qualitative({ control }: Step5QualitativeProps) {
  // State for managing dynamic lists (we'll use arrays and convert to JSON on submit)
  const [challenges, setChallenges] = useState<ChallengeItem[]>([
    { category: '', description: '', impact: 'Medium', status: 'Ongoing' }
  ])
  const [achievements, setAchievements] = useState<AchievementItem[]>([
    { category: '', description: '', impact: 'Medium', date: new Date().toISOString().split('T')[0] }
  ])
  const [recommendations, setRecommendations] = useState<RecommendationItem[]>([
    { category: '', recommendation: '', priority: 'Medium', timeline: '' }
  ])
  const [feedback, setFeedback] = useState<FeedbackItem[]>([
    { source: '', type: 'Positive', message: '', date: new Date().toISOString().split('T')[0] }
  ])

  // Helper function to update field value as JSON
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const updateFieldAsJSON = (fieldOnChange: (value: any) => void, data: any[]) => {
    const filtered = data.filter(item => {
      // Filter out empty items (where all string fields are empty)
      const stringValues = Object.values(item).filter(v => typeof v === 'string')
      return stringValues.some(v => v.trim() !== '')
    })
    fieldOnChange(filtered.length > 0 ? filtered : undefined)
  }

  return (
    <div className="space-y-6">
      <Alert>
        <MessageSquare className="h-4 w-4" />
        <AlertDescription>
          <strong>Analisis Kualitatif</strong> - Dokumentasikan tantangan, pencapaian, rekomendasi, dan feedback.
          Semua field bersifat opsional. Anda dapat menambah atau menghapus item sesuai kebutuhan.
        </AlertDescription>
      </Alert>

      <Accordion type="single" collapsible defaultValue="challenges" className="w-full">
        {/* ========== CHALLENGES SECTION ========== */}
        <AccordionItem value="challenges">
          <AccordionTrigger>
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              <span className="text-lg font-semibold">Tantangan & Hambatan</span>
              <Badge variant="outline" className="ml-2">{challenges.length} items</Badge>
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <FormField
              control={control}
              name="challenges"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tantangan yang Dihadapi</FormLabel>
                  <FormDescription>
                    Dokumentasikan tantangan dan hambatan yang dihadapi selama periode monitoring
                  </FormDescription>

                  <div className="space-y-4 mt-4">
                    {challenges.map((challenge, index) => (
                      <Card key={index} className="p-4">
                        <div className="space-y-4">
                          <div className="flex items-start justify-between">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium">Tantangan #{index + 1}</span>
                            </div>
                            {challenges.length > 1 && (
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  const updated = challenges.filter((_, i) => i !== index)
                                  setChallenges(updated)
                                  updateFieldAsJSON(field.onChange, updated)
                                }}
                              >
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            )}
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Category */}
                            <div className="space-y-2">
                              <label className="text-sm font-medium">Kategori</label>
                              <Select
                                value={challenge.category}
                                onValueChange={(value) => {
                                  const updated = [...challenges]
                                  updated[index].category = value
                                  setChallenges(updated)
                                  updateFieldAsJSON(field.onChange, updated)
                                }}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Pilih kategori" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="Operasional">Operasional</SelectItem>
                                  <SelectItem value="Sumber Daya">Sumber Daya</SelectItem>
                                  <SelectItem value="Logistik">Logistik</SelectItem>
                                  <SelectItem value="Kualitas">Kualitas</SelectItem>
                                  <SelectItem value="Distribusi">Distribusi</SelectItem>
                                  <SelectItem value="Administrasi">Administrasi</SelectItem>
                                  <SelectItem value="Lainnya">Lainnya</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>

                            {/* Impact */}
                            <div className="space-y-2">
                              <label className="text-sm font-medium">Dampak</label>
                              <Select
                                value={challenge.impact}
                                onValueChange={(value: 'Low' | 'Medium' | 'High') => {
                                  const updated = [...challenges]
                                  updated[index].impact = value
                                  setChallenges(updated)
                                  updateFieldAsJSON(field.onChange, updated)
                                }}
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="Low">Low (Rendah)</SelectItem>
                                  <SelectItem value="Medium">Medium (Sedang)</SelectItem>
                                  <SelectItem value="High">High (Tinggi)</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>

                            {/* Status */}
                            <div className="space-y-2">
                              <label className="text-sm font-medium">Status</label>
                              <Select
                                value={challenge.status}
                                onValueChange={(value: 'Ongoing' | 'Resolved' | 'Pending') => {
                                  const updated = [...challenges]
                                  updated[index].status = value
                                  setChallenges(updated)
                                  updateFieldAsJSON(field.onChange, updated)
                                }}
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="Ongoing">Ongoing (Berlangsung)</SelectItem>
                                  <SelectItem value="Resolved">Resolved (Selesai)</SelectItem>
                                  <SelectItem value="Pending">Pending (Menunggu)</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>

                          {/* Description */}
                          <div className="space-y-2">
                            <label className="text-sm font-medium">Deskripsi Tantangan</label>
                            <Textarea
                              placeholder="Jelaskan tantangan yang dihadapi secara detail..."
                              value={challenge.description}
                              onChange={(e) => {
                                const updated = [...challenges]
                                updated[index].description = e.target.value
                                setChallenges(updated)
                                updateFieldAsJSON(field.onChange, updated)
                              }}
                              rows={3}
                            />
                          </div>
                        </div>
                      </Card>
                    ))}

                    {/* Add Challenge Button */}
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full"
                      onClick={() => {
                        const newItem: ChallengeItem = {
                          category: '',
                          description: '',
                          impact: 'Medium',
                          status: 'Ongoing'
                        }
                        const updated = [...challenges, newItem]
                        setChallenges(updated)
                        updateFieldAsJSON(field.onChange, updated)
                      }}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Tambah Tantangan
                    </Button>
                  </div>

                  <FormMessage />
                </FormItem>
              )}
            />
          </AccordionContent>
        </AccordionItem>

        {/* ========== ACHIEVEMENTS SECTION ========== */}
        <AccordionItem value="achievements">
          <AccordionTrigger>
            <div className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-green-600" />
              <span className="text-lg font-semibold">Pencapaian & Keberhasilan</span>
              <Badge variant="outline" className="ml-2">{achievements.length} items</Badge>
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <FormField
              control={control}
              name="achievements"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Pencapaian Periode Ini</FormLabel>
                  <FormDescription>
                    Dokumentasikan pencapaian dan keberhasilan program selama periode monitoring
                  </FormDescription>

                  <div className="space-y-4 mt-4">
                    {achievements.map((achievement, index) => (
                      <Card key={index} className="p-4">
                        <div className="space-y-4">
                          <div className="flex items-start justify-between">
                            <div className="flex items-center gap-2">
                              
                              <span className="text-sm font-medium">Item #{index + 1}</span>
                            </div>
                            {achievements.length > 1 && (
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  const updated = achievements.filter((_, i) => i !== index)
                                  setAchievements(updated)
                                  updateFieldAsJSON(field.onChange, updated)
                                }}
                              >
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            )}
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Category */}
                            <div className="space-y-2">
                              <label className="text-sm font-medium">Kategori</label>
                              <Select
                                value={achievement.category}
                                onValueChange={(value) => {
                                  const updated = [...achievements]
                                  updated[index].category = value
                                  setAchievements(updated)
                                  updateFieldAsJSON(field.onChange, updated)
                                }}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Pilih kategori" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="Nutrisi">Nutrisi</SelectItem>
                                  <SelectItem value="Operasional">Operasional</SelectItem>
                                  <SelectItem value="Kualitas">Kualitas</SelectItem>
                                  <SelectItem value="Efisiensi">Efisiensi</SelectItem>
                                  <SelectItem value="Kepuasan">Kepuasan</SelectItem>
                                  <SelectItem value="Inovasi">Inovasi</SelectItem>
                                  <SelectItem value="Lainnya">Lainnya</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>

                            {/* Impact */}
                            <div className="space-y-2">
                              <label className="text-sm font-medium">Dampak</label>
                              <Select
                                value={achievement.impact}
                                onValueChange={(value: 'Low' | 'Medium' | 'High') => {
                                  const updated = [...achievements]
                                  updated[index].impact = value
                                  setAchievements(updated)
                                  updateFieldAsJSON(field.onChange, updated)
                                }}
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="Low">Low (Rendah)</SelectItem>
                                  <SelectItem value="Medium">Medium (Sedang)</SelectItem>
                                  <SelectItem value="High">High (Tinggi)</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>

                            {/* Date */}
                            <div className="space-y-2">
                              <label className="text-sm font-medium">Tanggal Pencapaian</label>
                              <Input
                                type="date"
                                value={achievement.date}
                                onChange={(e) => {
                                  const updated = [...achievements]
                                  updated[index].date = e.target.value
                                  setAchievements(updated)
                                  updateFieldAsJSON(field.onChange, updated)
                                }}
                              />
                            </div>
                          </div>

                          {/* Description */}
                          <div className="space-y-2">
                            <label className="text-sm font-medium">Deskripsi Pencapaian</label>
                            <Textarea
                              placeholder="Jelaskan pencapaian yang diraih secara detail..."
                              value={achievement.description}
                              onChange={(e) => {
                                const updated = [...achievements]
                                updated[index].description = e.target.value
                                setAchievements(updated)
                                updateFieldAsJSON(field.onChange, updated)
                              }}
                              rows={3}
                            />
                          </div>
                        </div>
                      </Card>
                    ))}

                    {/* Add Achievement Button */}
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full"
                      onClick={() => {
                        const newItem: AchievementItem = {
                          category: '',
                          description: '',
                          impact: 'Medium',
                          date: new Date().toISOString().split('T')[0]
                        }
                        const updated = [...achievements, newItem]
                        setAchievements(updated)
                        updateFieldAsJSON(field.onChange, updated)
                      }}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Tambah Pencapaian
                    </Button>
                  </div>

                  <FormMessage />
                </FormItem>
              )}
            />
          </AccordionContent>
        </AccordionItem>

        {/* ========== RECOMMENDATIONS SECTION ========== */}
        <AccordionItem value="recommendations">
          <AccordionTrigger>
            <div className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5 text-primary" />
              <span className="text-lg font-semibold">Rekomendasi & Perbaikan</span>
              <Badge variant="outline" className="ml-2">{recommendations.length} items</Badge>
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <FormField
              control={control}
              name="recommendations"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Rekomendasi untuk Periode Berikutnya</FormLabel>
                  <FormDescription>
                    Berikan rekomendasi untuk perbaikan dan pengembangan program
                  </FormDescription>

                  <div className="space-y-4 mt-4">
                    {recommendations.map((recommendation, index) => (
                      <Card key={index} className="p-4">
                        <div className="space-y-4">
                          <div className="flex items-start justify-between">
                            <div className="flex items-center gap-2">
                              
                              <span className="text-sm font-medium">Item #{index + 1}</span>
                            </div>
                            {recommendations.length > 1 && (
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  const updated = recommendations.filter((_, i) => i !== index)
                                  setRecommendations(updated)
                                  updateFieldAsJSON(field.onChange, updated)
                                }}
                              >
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            )}
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {/* Category */}
                            <div className="space-y-2">
                              <label className="text-sm font-medium">Kategori</label>
                              <Select
                                value={recommendation.category}
                                onValueChange={(value) => {
                                  const updated = [...recommendations]
                                  updated[index].category = value
                                  setRecommendations(updated)
                                  updateFieldAsJSON(field.onChange, updated)
                                }}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Pilih kategori" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="Operasional">Operasional</SelectItem>
                                  <SelectItem value="Pelatihan">Pelatihan</SelectItem>
                                  <SelectItem value="Infrastruktur">Infrastruktur</SelectItem>
                                  <SelectItem value="Proses">Proses</SelectItem>
                                  <SelectItem value="Teknologi">Teknologi</SelectItem>
                                  <SelectItem value="SDM">Sumber Daya Manusia</SelectItem>
                                  <SelectItem value="Lainnya">Lainnya</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>

                            {/* Priority */}
                            <div className="space-y-2">
                              <label className="text-sm font-medium">Prioritas</label>
                              <Select
                                value={recommendation.priority}
                                onValueChange={(value: 'Low' | 'Medium' | 'High') => {
                                  const updated = [...recommendations]
                                  updated[index].priority = value
                                  setRecommendations(updated)
                                  updateFieldAsJSON(field.onChange, updated)
                                }}
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="Low">Low (Rendah)</SelectItem>
                                  <SelectItem value="Medium">Medium (Sedang)</SelectItem>
                                  <SelectItem value="High">High (Tinggi)</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>

                            {/* Timeline */}
                            <div className="space-y-2">
                              <label className="text-sm font-medium">Timeline</label>
                              <Input
                                placeholder="contoh: 1 bulan, 2 minggu"
                                value={recommendation.timeline}
                                onChange={(e) => {
                                  const updated = [...recommendations]
                                  updated[index].timeline = e.target.value
                                  setRecommendations(updated)
                                  updateFieldAsJSON(field.onChange, updated)
                                }}
                              />
                            </div>
                          </div>

                          {/* Recommendation Text */}
                          <div className="space-y-2">
                            <label className="text-sm font-medium">Rekomendasi</label>
                            <Textarea
                              placeholder="Jelaskan rekomendasi secara detail..."
                              value={recommendation.recommendation}
                              onChange={(e) => {
                                const updated = [...recommendations]
                                updated[index].recommendation = e.target.value
                                setRecommendations(updated)
                                updateFieldAsJSON(field.onChange, updated)
                              }}
                              rows={3}
                            />
                          </div>

                          {/* Estimated Cost (Optional) */}
                          <div className="space-y-2">
                            <label className="text-sm font-medium">Estimasi Biaya (Opsional)</label>
                            <Input
                              type="number"
                              placeholder="Rp 0"
                              value={recommendation.estimatedCost || ''}
                              onChange={(e) => {
                                const updated = [...recommendations]
                                updated[index].estimatedCost = e.target.value ? Number(e.target.value) : undefined
                                setRecommendations(updated)
                                updateFieldAsJSON(field.onChange, updated)
                              }}
                            />
                          </div>
                        </div>
                      </Card>
                    ))}

                    {/* Add Recommendation Button */}
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full"
                      onClick={() => {
                        const newItem: RecommendationItem = {
                          category: '',
                          recommendation: '',
                          priority: 'Medium',
                          timeline: ''
                        }
                        const updated = [...recommendations, newItem]
                        setRecommendations(updated)
                        updateFieldAsJSON(field.onChange, updated)
                      }}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Tambah Rekomendasi
                    </Button>
                  </div>

                  <FormMessage />
                </FormItem>
              )}
            />
          </AccordionContent>
        </AccordionItem>

        {/* ========== FEEDBACK SECTION ========== */}
        <AccordionItem value="feedback">
          <AccordionTrigger>
            <div className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-primary" />
              <span className="text-lg font-semibold">Feedback & Masukan</span>
              <Badge variant="outline" className="ml-2">{feedback.length} items</Badge>
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <FormField
              control={control}
              name="feedback"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Feedback dari Stakeholder</FormLabel>
                  <FormDescription>
                    Kumpulkan feedback dari berbagai stakeholder (sekolah, orang tua, penerima, dll)
                  </FormDescription>

                  <div className="space-y-4 mt-4">
                    {feedback.map((item, index) => (
                      <Card key={index} className="p-4">
                        <div className="space-y-4">
                          <div className="flex items-start justify-between">
                            <div className="flex items-center gap-2">
                              
                              <span className="text-sm font-medium">Item #{index + 1}</span>
                            </div>
                            {feedback.length > 1 && (
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  const updated = feedback.filter((_, i) => i !== index)
                                  setFeedback(updated)
                                  updateFieldAsJSON(field.onChange, updated)
                                }}
                              >
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            )}
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {/* Source */}
                            <div className="space-y-2">
                              <label className="text-sm font-medium">Sumber</label>
                              <Select
                                value={item.source}
                                onValueChange={(value) => {
                                  const updated = [...feedback]
                                  updated[index].source = value
                                  setFeedback(updated)
                                  updateFieldAsJSON(field.onChange, updated)
                                }}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Pilih sumber" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="Kepala Sekolah">Kepala Sekolah</SelectItem>
                                  <SelectItem value="Guru">Guru</SelectItem>
                                  <SelectItem value="Orang Tua">Orang Tua</SelectItem>
                                  <SelectItem value="Penerima">Penerima</SelectItem>
                                  <SelectItem value="Komite Sekolah">Komite Sekolah</SelectItem>
                                  <SelectItem value="Pemerintah">Pemerintah</SelectItem>
                                  <SelectItem value="Lainnya">Lainnya</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>

                            {/* Type */}
                            <div className="space-y-2">
                              <label className="text-sm font-medium">Jenis</label>
                              <Select
                                value={item.type}
                                onValueChange={(value: 'Positive' | 'Negative' | 'Suggestion' | 'Complaint') => {
                                  const updated = [...feedback]
                                  updated[index].type = value
                                  setFeedback(updated)
                                  updateFieldAsJSON(field.onChange, updated)
                                }}
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="Positive">Positive (Positif)</SelectItem>
                                  <SelectItem value="Negative">Negative (Negatif)</SelectItem>
                                  <SelectItem value="Suggestion">Suggestion (Saran)</SelectItem>
                                  <SelectItem value="Complaint">Complaint (Keluhan)</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>

                            {/* Date */}
                            <div className="space-y-2">
                              <label className="text-sm font-medium">Tanggal</label>
                              <Input
                                type="date"
                                value={item.date}
                                onChange={(e) => {
                                  const updated = [...feedback]
                                  updated[index].date = e.target.value
                                  setFeedback(updated)
                                  updateFieldAsJSON(field.onChange, updated)
                                }}
                              />
                            </div>
                          </div>

                          {/* Message */}
                          <div className="space-y-2">
                            <label className="text-sm font-medium">Pesan Feedback</label>
                            <Textarea
                              placeholder="Tulis feedback yang diterima..."
                              value={item.message}
                              onChange={(e) => {
                                const updated = [...feedback]
                                updated[index].message = e.target.value
                                setFeedback(updated)
                                updateFieldAsJSON(field.onChange, updated)
                              }}
                              rows={3}
                            />
                          </div>

                          {/* Follow Up (Optional) */}
                          <div className="space-y-2">
                            <label className="text-sm font-medium">Tindak Lanjut (Opsional)</label>
                            <Input
                              placeholder="contoh: Review menu planning, Tingkatkan kualitas"
                              value={item.followUp || ''}
                              onChange={(e) => {
                                const updated = [...feedback]
                                updated[index].followUp = e.target.value || undefined
                                setFeedback(updated)
                                updateFieldAsJSON(field.onChange, updated)
                              }}
                            />
                          </div>
                        </div>
                      </Card>
                    ))}

                    {/* Add Feedback Button */}
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full"
                      onClick={() => {
                        const newItem: FeedbackItem = {
                          source: '',
                          type: 'Positive',
                          message: '',
                          date: new Date().toISOString().split('T')[0]
                        }
                        const updated = [...feedback, newItem]
                        setFeedback(updated)
                        updateFieldAsJSON(field.onChange, updated)
                      }}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Tambah Feedback
                    </Button>
                  </div>

                  <FormMessage />
                </FormItem>
              )}
            />
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      <Separator className="my-6" />

      <div className="bg-muted/50 p-4 rounded-lg space-y-2">
        <p className="text-sm font-medium">💡 Tips Pengisian Analisis Kualitatif:</p>
        <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1">
          <li>
            <strong>Spesifik & Detail:</strong> Semakin detail informasi, semakin baik untuk analisis
          </li>
          <li>
            <strong>Prioritas:</strong> Fokus pada tantangan dan rekomendasi yang berdampak tinggi
          </li>
          <li>
            <strong>Tindak Lanjut:</strong> Pastikan setiap feedback memiliki rencana tindak lanjut
          </li>
          <li>
            <strong>Opsional:</strong> Semua field bersifat opsional, isi sesuai kebutuhan
          </li>
        </ul>
      </div>
    </div>
  )
}
