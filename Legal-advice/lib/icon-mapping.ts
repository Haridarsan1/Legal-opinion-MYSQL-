/**
 * Icon Mapping Reference: Material Symbols → Lucide React
 *
 * This file documents the mapping from Material Symbols (used in Stitch exports)
 * to Lucide React icons (used in our Next.js implementation).
 *
 * Usage:
 * import { Home, User, Bell } from 'lucide-react'
 * <Home className="w-5 h-5" />
 */

// ============================================
// NAVIGATION ICONS
// ============================================
export const navigationIcons = {
  home: 'Home',
  dashboard: 'LayoutDashboard',
  person: 'User',
  people: 'Users',
  group: 'Users',
  settings: 'Settings',
  notifications: 'Bell',
  notifications_active: 'BellRing',
  logout: 'LogOut',
  login: 'LogIn',
  menu: 'Menu',
  close: 'X',
  arrow_back: 'ArrowLeft',
  arrow_forward: 'ArrowRight',
  chevron_left: 'ChevronLeft',
  chevron_right: 'ChevronRight',
  expand_more: 'ChevronDown',
  expand_less: 'ChevronUp',
};

// ============================================
// ACTION ICONS
// ============================================
export const actionIcons = {
  add: 'Plus',
  add_circle: 'PlusCircle',
  edit: 'Pencil',
  delete: 'Trash2',
  remove: 'Minus',
  save: 'Save',
  close: 'X',
  search: 'Search',
  filter: 'Filter',
  filter_list: 'Filter',
  download: 'Download',
  upload: 'Upload',
  cloud_upload: 'CloudUpload',
  refresh: 'RefreshCw',
  sync: 'RefreshCw',
  more_vert: 'MoreVertical',
  more_horiz: 'MoreHorizontal',
  share: 'Share2',
  content_copy: 'Copy',
  content_paste: 'Clipboard',
};

// ============================================
// STATUS & FEEDBACK ICONS
// ============================================
export const statusIcons = {
  check: 'Check',
  check_circle: 'CheckCircle',
  done: 'Check',
  cancel: 'XCircle',
  error: 'AlertCircle',
  error_outline: 'AlertCircle',
  warning: 'AlertTriangle',
  warning_amber: 'AlertTriangle',
  info: 'Info',
  help: 'HelpCircle',
  pending: 'Clock',
  schedule: 'Calendar',
  access_time: 'Clock',
  hourglass_empty: 'Hourglass',
};

// ============================================
// DOCUMENT & FILE ICONS
// ============================================
export const documentIcons = {
  folder: 'Folder',
  folder_open: 'FolderOpen',
  description: 'FileText',
  article: 'FileText',
  attach_file: 'Paperclip',
  attachment: 'Paperclip',
  picture_as_pdf: 'FileType',
  insert_drive_file: 'File',
  note_add: 'FilePlus',
  file_download: 'Download',
  file_upload: 'Upload',
};

// ============================================
// COMMUNICATION ICONS
// ============================================
export const communicationIcons = {
  mail: 'Mail',
  email: 'Mail',
  chat: 'MessageSquare',
  message: 'MessageSquare',
  chat_bubble: 'MessageCircle',
  phone: 'Phone',
  call: 'Phone',
  videocam: 'Video',
  send: 'Send',
};

// ============================================
// BUSINESS & LEGAL ICONS
// ============================================
export const businessIcons = {
  business: 'Building2',
  store: 'Building',
  account_balance: 'Landmark', // Bank/Institution
  gavel: 'Scale', // Legal symbol (or use 'Gavel' if available)
  assignment: 'ClipboardList',
  work: 'Briefcase',
  badge: 'Award',
  verified: 'BadgeCheck',
  payments: 'CreditCard',
  shopping_cart: 'ShoppingCart',
};

// ============================================
// ANALYTICS & CHARTS ICONS
// ============================================
export const analyticsIcons = {
  analytics: 'BarChart3',
  bar_chart: 'BarChart',
  trending_up: 'TrendingUp',
  trending_down: 'TrendingDown',
  trending_flat: 'TrendingUp', // Use TrendingUp with rotate
  pie_chart: 'PieChart',
  show_chart: 'LineChart',
  assessment: 'BarChart3',
};

// ============================================
// TIME & DATE ICONS
// ============================================
export const timeIcons = {
  schedule: 'Calendar',
  event: 'Calendar',
  calendar_today: 'CalendarDays',
  today: 'CalendarDays',
  date_range: 'CalendarRange',
  access_time: 'Clock',
  alarm: 'AlarmClock',
  timer: 'Timer',
  history: 'History',
};

// ============================================
// USER & PROFILE ICONS
// ============================================
export const userIcons = {
  person: 'User',
  account_circle: 'UserCircle',
  people: 'Users',
  group: 'Users',
  supervisor_account: 'UserCog',
  admin_panel_settings: 'ShieldCheck',
  manage_accounts: 'UserCog',
};

// ============================================
// MISC ICONS
// ============================================
export const miscIcons = {
  star: 'Star',
  star_border: 'Star', // Use with fill="none"
  favorite: 'Heart',
  favorite_border: 'Heart', // Use with fill="none"
  visibility: 'Eye',
  visibility_off: 'EyeOff',
  lock: 'Lock',
  lock_open: 'LockOpen',
  security: 'Shield',
  verified_user: 'ShieldCheck',
  lightbulb: 'Lightbulb',
  emoji_events: 'Trophy',
  flag: 'Flag',
  bookmark: 'Bookmark',
  bookmark_border: 'Bookmark', // Use with fill="none"
};

// ============================================
// SIZE GUIDELINES
// ============================================
export const sizeClasses = {
  xs: 'w-3 h-3', // 12px
  sm: 'w-4 h-4', // 16px - badges, inline text
  md: 'w-5 h-5', // 20px - buttons, standard UI
  lg: 'w-6 h-6', // 24px - headers, cards
  xl: 'w-8 h-8', // 32px - large buttons
  '2xl': 'w-12 h-12', // 48px - hero sections
  '3xl': 'w-16 h-16', // 64px - landing pages
};

// ============================================
// USAGE EXAMPLES
// ============================================

/*
// Basic usage
import { Home, User, Bell } from 'lucide-react'

<Home className="w-5 h-5" />
<User className="w-6 h-6 text-blue-600" />
<Bell className="w-4 h-4 text-slate-400" />

// With custom colors
<CheckCircle className="w-5 h-5 text-green-600" />
<AlertTriangle className="w-5 h-5 text-amber-600" />

// Interactive icons
<button className="p-2 hover:bg-slate-100 rounded-lg">
  <Settings className="w-5 h-5 text-slate-600" />
</button>

// Icon with text
<div className="flex items-center gap-2">
  <User className="w-4 h-4" />
  <span>Profile</span>
</div>

// Star rating (outlined vs filled)
<Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
<Star className="w-5 h-5 fill-none text-slate-300" />
*/

// ============================================
// QUICK REFERENCE
// ============================================
export const quickReference = {
  // Most common icons for this project
  home: 'Home',
  dashboard: 'LayoutDashboard',
  user: 'User',
  users: 'Users',
  bell: 'Bell',
  settings: 'Settings',
  logout: 'LogOut',

  // Actions
  plus: 'Plus',
  edit: 'Pencil',
  trash: 'Trash2',
  search: 'Search',
  filter: 'Filter',

  // Files
  file: 'FileText',
  folder: 'Folder',
  upload: 'Upload',
  download: 'Download',

  // Status
  check: 'CheckCircle',
  error: 'AlertCircle',
  warning: 'AlertTriangle',
  info: 'Info',

  // Legal specific
  gavel: 'Scale',
  bank: 'Landmark',
  firm: 'Building2',
  lawyer: 'Briefcase',
  client: 'User',
};
