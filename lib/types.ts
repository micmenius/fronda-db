export type UserRole = 'member' | 'curator' | 'admin'
export type UserStatus = 'active' | 'reserve' | 'blocked' | 'left'
export type Workload = 'free' | 'has_time' | 'busy' | 'not_taking'
export type ReleaseStatus = 'planning' | 'recruiting' | 'in_progress' | 'completed' | 'frozen'

export interface Profile {
  id: string
  nickname: string
  discord_username: string | null
  telegram: string | null
  avatar_url: string | null
  bio: string
  voice_sample_url: string | null
  roles: string[]
  status: UserStatus
  workload: Workload
  max_parallel_releases: number
  future_wishes: string
  user_role: UserRole
  join_date: string
  last_activity: string
}

export interface Release {
  id: string
  title: string
  type: string
  cover_url: string | null
  status: ReleaseStatus
  curator_id: string | null
  department: string | null
  description: string
  episode_count: number
  current_episode: number
  deadline: string | null
  created_at: string
  curator?: Profile
}

export interface ReleaseMember {
  id: string
  release_id: string
  user_id: string
  role_in_release: string
  status: string
  assigned_date: string
  curator_comment: string | null
  release?: Release
  user?: Profile
}

export interface PrivateNote {
  id: string
  about_user_id: string
  author_id: string
  tags: string[]
  content: string
  created_at: string
  author?: Profile
}

export interface Application {
  id: string
  user_id: string
  release_id: string
  desired_role: string
  message: string | null
  status: string
  created_at: string
  user?: Profile
  release?: Release
}

export const STATUS_LABELS: Record<UserStatus, string> = {
  active: 'Активный',
  reserve: 'Резерв',
  blocked: 'Заблокирован',
  left: 'Ушёл',
}

export const STATUS_COLORS: Record<UserStatus, string> = {
  active: 'bg-green-500',
  reserve: 'bg-gray-500',
  blocked: 'bg-red-500',
  left: 'bg-zinc-600',
}

export const WORKLOAD_LABELS: Record<Workload, string> = {
  free: 'Свободен',
  has_time: 'Есть время',
  busy: 'Загружен',
  not_taking: 'Не берёт',
}

export const WORKLOAD_COLORS: Record<Workload, string> = {
  free: 'text-green-400',
  has_time: 'text-blue-400',
  busy: 'text-yellow-400',
  not_taking: 'text-red-400',
}

export const RELEASE_STATUS_LABELS: Record<ReleaseStatus, string> = {
  planning: 'Планируется',
  recruiting: 'Набор',
  in_progress: 'В работе',
  completed: 'Завершён',
  frozen: 'Заморожен',
}

export const RELEASE_STATUS_COLORS: Record<ReleaseStatus, string> = {
  planning: 'bg-gray-500',
  recruiting: 'bg-blue-500',
  in_progress: 'bg-green-500',
  completed: 'bg-emerald-600',
  frozen: 'bg-cyan-700',
}

export const ALL_ROLES = [
  'Даббер',
  'Каверист',
  'Переводчик',
  'Художник',
  'Тайминг',
  'Редактор',
  'Звукорежиссёр',
  'Фиксер',
] as const

export const NOTE_TAGS = [
  'тянет релизы',
  'ненадёжный',
  'берёт много',
  'пропадает',
  'зелёный',
  'конфликтный',
  'рекомендовать',
  'присмотреться',
] as const
