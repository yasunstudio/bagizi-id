/**
 * ✅ SIMPLIFIED (Nov 11, 2025): Program Validation Helpers - Unified Multi-Target Approach
 * 
 * Provides validation and utility functions for unified program architecture.
 * All programs use allowedTargetGroups array (min 1, max 6).
 * 
 * Architecture:
 * - Single-target: allowedTargetGroups.length === 1
 * - Multi-target: allowedTargetGroups.length > 1
 * 
 * @see /docs/PROGRAM_MULTI_TARGET_IMPLEMENTATION_ROADMAP.md
 */

import type { NutritionProgram, TargetGroup } from '@prisma/client'

/**
 * Validation result interface
 */
export interface ValidationResult {
  valid: boolean
  error?: string
}

/**
 * ✅ SIMPLIFIED: Validate whether a target group is allowed for enrollment
 * 
 * Business Rules:
 * - Program ALWAYS has allowedTargetGroups array (min 1)
 * - Enrollment only allowed if target group is in allowedTargetGroups
 * - No special cases - simple array membership check
 * 
 * @param program - The nutrition program to validate against
 * @param enrollmentTargetGroup - The target group attempting to enroll
 * @returns ValidationResult with valid flag and optional error message
 * 
 * @example
 * \`\`\`typescript
 * const result = validateEnrollmentTargetGroup(program, 'PREGNANT_WOMAN')
 * if (!result.valid) {
 *   return Response.json({ error: result.error }, { status: 400 })
 * }
 * \`\`\`
 */
export function validateEnrollmentTargetGroup(
  program: Pick<NutritionProgram, 'allowedTargetGroups'>,
  enrollmentTargetGroup: TargetGroup
): ValidationResult {
  
  // Validate program has allowed target groups
  if (!program.allowedTargetGroups || program.allowedTargetGroups.length === 0) {
    return { 
      valid: false, 
      error: 'Program harus memiliki minimal 1 kelompok sasaran'
    }
  }
  
  // Check if enrollment target group is allowed
  if (program.allowedTargetGroups.includes(enrollmentTargetGroup)) {
    return { valid: true }
  }
  
  // Not allowed - return error with allowed groups
  const allowedLabels = program.allowedTargetGroups
    .map(tg => getTargetGroupLabel(tg))
    .join(', ')
  
  return { 
    valid: false, 
    error: `Target group ${getTargetGroupLabel(enrollmentTargetGroup)} tidak diizinkan. Program ini hanya untuk: ${allowedLabels}`
  }
}

/**
 * Get human-readable label for target group
 * 
 * @param targetGroup - The target group enum value
 * @returns Indonesian label for the target group
 * 
 * @example
 * \`\`\`typescript
 * getTargetGroupLabel('SCHOOL_CHILDREN') // "Anak Sekolah"
 * getTargetGroupLabel('PREGNANT_WOMAN') // "Ibu Hamil"
 * \`\`\`
 */
export function getTargetGroupLabel(targetGroup: TargetGroup): string {
  const labels: Record<TargetGroup, string> = {
    SCHOOL_CHILDREN: 'Anak Sekolah',
    PREGNANT_WOMAN: 'Ibu Hamil',
    BREASTFEEDING_MOTHER: 'Ibu Menyusui',
    TODDLER: 'Balita',
    TEENAGE_GIRL: 'Remaja Putri',
    ELDERLY: 'Lansia',
  }
  return labels[targetGroup] || targetGroup
}

/**
 * Get all available target groups with labels
 * 
 * @returns Array of target group options with value and label
 * 
 * @example
 * \`\`\`typescript
 * const options = getTargetGroupOptions()
 * // [{ value: 'SCHOOL_CHILDREN', label: 'Anak Sekolah' }, ...]
 * \`\`\`
 */
export function getTargetGroupOptions(): Array<{ value: TargetGroup; label: string }> {
  const targetGroups: TargetGroup[] = [
    'SCHOOL_CHILDREN',
    'PREGNANT_WOMAN',
    'BREASTFEEDING_MOTHER',
    'TODDLER',
    'TEENAGE_GIRL',
    'ELDERLY',
  ]
  
  return targetGroups.map(tg => ({
    value: tg,
    label: getTargetGroupLabel(tg)
  }))
}

/**
 * ✅ SIMPLIFIED: Get display text for program type configuration
 * 
 * @param program - The nutrition program
 * @returns Display text describing the program's target group configuration
 * 
 * @example
 * \`\`\`typescript
 * // Single-target (1 group)
 * getProgramTypeDisplay({ allowedTargetGroups: ['SCHOOL_CHILDREN'] })
 * // "Single-Target: Anak Sekolah"
 * 
 * // Multi-target (multiple groups)
 * getProgramTypeDisplay({ 
 *   allowedTargetGroups: ['PREGNANT_WOMAN', 'TODDLER'] 
 * })
 * // "Multi-Target (2 kelompok)"
 * \`\`\`
 */
export function getProgramTypeDisplay(
  program: Pick<NutritionProgram, 'allowedTargetGroups'>
): string {
  if (!program.allowedTargetGroups || program.allowedTargetGroups.length === 0) {
    return 'Program (Tidak Terkonfigurasi)'
  }
  
  // Single-target: 1 group
  if (program.allowedTargetGroups.length === 1) {
    return `Single-Target: ${getTargetGroupLabel(program.allowedTargetGroups[0])}`
  }
  
  // Multi-target: 2+ groups
  return `Multi-Target (${program.allowedTargetGroups.length} kelompok)`
}

/**
 * ✅ SIMPLIFIED: Get detailed target group configuration text
 * 
 * @param program - The nutrition program
 * @returns Detailed description of allowed target groups
 * 
 * @example
 * \`\`\`typescript
 * getTargetGroupConfiguration({ 
 *   allowedTargetGroups: ['PREGNANT_WOMAN', 'BREASTFEEDING_MOTHER'] 
 * })
 * // "Ibu Hamil, Ibu Menyusui"
 * \`\`\`
 */
export function getTargetGroupConfiguration(
  program: Pick<NutritionProgram, 'allowedTargetGroups'>
): string {
  if (!program.allowedTargetGroups || program.allowedTargetGroups.length === 0) {
    return 'Tidak ada konfigurasi'
  }
  
  return program.allowedTargetGroups
    .map(tg => getTargetGroupLabel(tg))
    .join(', ')
}

/**
 * ✅ SIMPLIFIED: Check if program allows a specific target group
 * 
 * @param program - The nutrition program
 * @param targetGroup - The target group to check
 * @returns true if the target group is allowed, false otherwise
 * 
 * @example
 * \`\`\`typescript
 * if (isProgramAllowingTargetGroup(program, 'PREGNANT_WOMAN')) {
 *   // Show enrollment form
 * }
 * \`\`\`
 */
export function isProgramAllowingTargetGroup(
  program: Pick<NutritionProgram, 'allowedTargetGroups'>,
  targetGroup: TargetGroup
): boolean {
  const result = validateEnrollmentTargetGroup(program, targetGroup)
  return result.valid
}

/**
 * ✅ SIMPLIFIED: Get list of allowed target groups for a program
 * 
 * @param program - The nutrition program
 * @returns Array of allowed target groups
 * 
 * @example
 * \`\`\`typescript
 * const allowed = getAllowedTargetGroups(program)
 * // ['SCHOOL_CHILDREN', 'PREGNANT_WOMAN', 'TODDLER']
 * \`\`\`
 */
export function getAllowedTargetGroups(
  program: Pick<NutritionProgram, 'allowedTargetGroups'>
): TargetGroup[] {
  if (!program.allowedTargetGroups || program.allowedTargetGroups.length === 0) {
    return []
  }
  
  return program.allowedTargetGroups
}

/**
 * ✅ SIMPLIFIED: Validate program configuration
 * 
 * Ensures allowedTargetGroups array is valid:
 * - Min 1 target group required
 * - Max 6 target groups allowed
 * - No duplicate target groups
 * 
 * @param program - The nutrition program to validate
 * @returns ValidationResult with valid flag and optional error message
 * 
 * @example
 * \`\`\`typescript
 * const result = validateProgramConfiguration(programData)
 * if (!result.valid) {
 *   return Response.json({ error: result.error }, { status: 400 })
 * }
 * \`\`\`
 */
export function validateProgramConfiguration(
  program: Pick<NutritionProgram, 'allowedTargetGroups'>
): ValidationResult {
  // Check minimum 1 target group
  if (!program.allowedTargetGroups || program.allowedTargetGroups.length === 0) {
    return {
      valid: false,
      error: 'Minimal 1 target group harus dipilih'
    }
  }
  
  // Check for duplicate target groups
  const uniqueGroups = new Set(program.allowedTargetGroups)
  if (uniqueGroups.size !== program.allowedTargetGroups.length) {
    return {
      valid: false,
      error: 'Tidak boleh ada target group duplikat'
    }
  }
  
  // Check max 6 target groups
  if (program.allowedTargetGroups.length > 6) {
    return {
      valid: false,
      error: 'Maksimal 6 target groups'
    }
  }
  
  return { valid: true }
}