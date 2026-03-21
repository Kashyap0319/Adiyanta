// Template data structure matching API response format
export const templates = [
  {
    id: 1,
    template_id: 'tpl_1',
    title: 'BioScience Report',
    topic: 'Science',
    frames: 12,
    downloads: 1200,
    license: 'FREE',
    is_favourite: false,
    gradient: 'from-cyan-400 to-blue-400',
    preview: 'SCIENCE LESSON',
    description: 'Bring science to life with this playful and visually engaging presentation template. Designed specifically for teachers and students (elementary to middle school), this 12-page document features a unique, hand-sketched aesthetic with core science symbols like rockets, atomic models, and lab glassware.',
    s3_file_url: 'https://s3.amazonaws.com/bucket/template1.pptx',
    created_at: '2026-01-01T10:00:00Z'
  },
  {
    id: 2,
    template_id: 'tpl_2',
    title: 'Chem Insights',
    topic: 'Science',
    frames: 8,
    downloads: 80,
    license: 'FREE',
    is_favourite: false,
    gradient: 'from-sky-300 to-cyan-400',
    preview: 'SCIENCE PROJECT',
    description: 'A comprehensive chemistry-focused template perfect for explaining chemical reactions, elements, and laboratory experiments.',
    s3_file_url: 'https://s3.amazonaws.com/bucket/template2.pptx',
    created_at: '2026-01-02T10:00:00Z'
  },
  {
    id: 3,
    template_id: 'tpl_3',
    title: 'Physic Study',
    topic: 'Science',
    frames: 7,
    downloads: 551,
    license: 'PAID',
    is_favourite: false,
    gradient: 'from-yellow-100 to-yellow-200',
    preview: 'SCIENCE PROJECT',
    description: 'Explore physics concepts with this detailed template featuring mechanics, thermodynamics, and wave theory illustrations.',
    s3_file_url: 'https://s3.amazonaws.com/bucket/template3.pptx',
    created_at: '2026-01-03T10:00:00Z'
  },
  {
    id: 4,
    template_id: 'tpl_4',
    title: 'The Ecology',
    topic: 'Science',
    frames: 4,
    downloads: 15,
    license: 'FREE',
    is_favourite: false,
    gradient: 'from-blue-200 to-sky-300',
    preview: 'SCIENCE TEMPLATE',
    description: 'An ecology-focused template for teaching about ecosystems, biodiversity, and environmental science.',
    s3_file_url: 'https://s3.amazonaws.com/bucket/template4.pptx',
    created_at: '2026-01-04T10:00:00Z'
  },
  {
    id: 5,
    template_id: 'tpl_5',
    title: 'Math Model',
    topic: 'Math',
    frames: 10,
    downloads: 2500,
    license: 'FREE',
    is_favourite: false,
    gradient: 'from-teal-300 to-cyan-400',
    preview: 'MATH CONCEPTS',
    description: 'Mathematical modeling template with graphs, equations, and problem-solving frameworks.',
    s3_file_url: 'https://s3.amazonaws.com/bucket/template5.pptx',
    created_at: '2026-01-05T10:00:00Z'
  },
  {
    id: 6,
    template_id: 'tpl_6',
    title: 'Scientific Design',
    topic: 'Science',
    frames: 19,
    downloads: 2100,
    license: 'FREE',
    is_favourite: false,
    gradient: 'from-green-200 to-green-300',
    preview: 'Scientific',
    description: 'A versatile scientific design template suitable for any science subject presentation.',
    s3_file_url: 'https://s3.amazonaws.com/bucket/template6.pptx',
    created_at: '2026-01-06T10:00:00Z'
  },
  {
    id: 7,
    template_id: 'tpl_7',
    title: 'Rocket and Report',
    topic: 'Science',
    frames: 6,
    downloads: 890,
    license: 'FREE',
    is_favourite: false,
    gradient: 'from-cyan-400 to-blue-500',
    preview: 'SCIENCE',
    description: 'Space and astronomy themed template featuring rockets, planets, and cosmic illustrations.',
    s3_file_url: 'https://s3.amazonaws.com/bucket/template7.pptx',
    created_at: '2026-01-07T10:00:00Z'
  },
  {
    id: 8,
    template_id: 'tpl_8',
    title: 'Biology Basics',
    topic: 'Science',
    frames: 15,
    downloads: 1200,
    license: 'PAID',
    is_favourite: false,
    gradient: 'from-emerald-300 to-teal-400',
    preview: 'BIOLOGY',
    description: 'Comprehensive biology template covering cells, genetics, and human anatomy.',
    s3_file_url: 'https://s3.amazonaws.com/bucket/template8.pptx',
    created_at: '2026-01-08T10:00:00Z'
  },
  {
    id: 9,
    template_id: 'tpl_9',
    title: 'World History',
    topic: 'History',
    frames: 14,
    downloads: 780,
    license: 'FREE',
    is_favourite: false,
    gradient: 'from-amber-200 to-orange-300',
    preview: 'HISTORY',
    description: 'Journey through time with this history-focused template featuring timelines and historical imagery.',
    s3_file_url: 'https://s3.amazonaws.com/bucket/template9.pptx',
    created_at: '2026-01-09T10:00:00Z'
  },
  {
    id: 10,
    template_id: 'tpl_10',
    title: 'Geography Explorer',
    topic: 'Geography',
    frames: 11,
    downloads: 650,
    license: 'PAID',
    is_favourite: false,
    gradient: 'from-green-300 to-emerald-400',
    preview: 'GEOGRAPHY',
    description: 'Explore the world with maps, continents, and geographical features in this engaging template.',
    s3_file_url: 'https://s3.amazonaws.com/bucket/template10.pptx',
    created_at: '2026-01-10T10:00:00Z'
  },
  {
    id: 11,
    template_id: 'tpl_11',
    title: 'Art Masterclass',
    topic: 'Art',
    frames: 9,
    downloads: 420,
    license: 'FREE',
    is_favourite: false,
    gradient: 'from-pink-200 to-rose-300',
    preview: 'ART CLASS',
    description: 'Creative template for art lessons featuring color theory, famous artists, and artistic techniques.',
    s3_file_url: 'https://s3.amazonaws.com/bucket/template11.pptx',
    created_at: '2026-01-11T10:00:00Z'
  },
  {
    id: 12,
    template_id: 'tpl_12',
    title: 'Music Theory',
    topic: 'Music',
    frames: 8,
    downloads: 350,
    license: 'FREE',
    is_favourite: false,
    gradient: 'from-violet-200 to-purple-300',
    preview: 'MUSIC',
    description: 'Learn music theory with notes, scales, and instruments in this melodious template.',
    s3_file_url: 'https://s3.amazonaws.com/bucket/template12.pptx',
    created_at: '2026-01-12T10:00:00Z'
  }
]

export const topics = ['All', 'Science', 'Math', 'History', 'Geography', 'Art', 'Music']
export const licenses = ['All', 'FREE', 'PAID']
export const sortOptions = ['New to Old', 'Old to New', 'Most Popular', 'Alphabetical']

// Helper function to format download count
export const formatDownloads = (count) => {
  if (typeof count === 'string') return count
  if (count >= 1000) {
    return (count / 1000).toFixed(1).replace(/\.0$/, '') + 'k'
  }
  return count.toString()
}

// Helper to get license display text
export const getLicenseDisplay = (license) => {
  return license === 'PAID' ? 'Premium' : 'Free'
}
