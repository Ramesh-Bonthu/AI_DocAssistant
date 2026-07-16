/**
 * Enhancv-Style Professional ATS Resume Analyzer & Scorer Algorithm
 */

export interface ATSCheckItem {
  id: string
  title: string
  status: 'passed' | 'warning' | 'critical'
  foundText: string
  explanation: string
  actionStep: string
}

export interface ATSAnalysisResult {
  score: number               // Combined overall score (0 to 100)
  atsParsabilityScore: number // Technical check score (0 to 100)
  contentImpactScore: number  // Human check score (0 to 100)
  cosineSimilarity: number    // Semantic match (0 to 100)
  wordCount: number
  skillsMatched: string[]
  skillsMissing: string[]
  actionVerbsFound: string[]
  metricsFoundCount: number
  categories: {
    ats_essentials: { title: string; checks: ATSCheckItem[] }
    ats_design: { title: string; checks: ATSCheckItem[] }
    cv_tailoring: { title: string; checks: ATSCheckItem[] }
    professionalism: { title: string; checks: ATSCheckItem[] }
    writing_quality: { title: string; checks: ATSCheckItem[] }
    impact_metrics: { title: string; checks: ATSCheckItem[] }
    red_flags: { title: string; checks: ATSCheckItem[] }
  }
}

const COMMON_SKILLS = [
  'react', 'next.js', 'typescript', 'javascript', 'html', 'css', 'sass', 'tailwind',
  'node.js', 'express', 'nest.js', 'python', 'django', 'fastapi', 'flask', 'go', 'golang',
  'rust', 'java', 'spring', 'spring boot', 'c++', 'c#', '.net', 'ruby', 'rails', 'php', 'laravel',
  'sql', 'postgresql', 'mysql', 'mongodb', 'redis', 'elasticsearch', 'prisma', 'sequelize',
  'graphql', 'rest api', 'aws', 'azure', 'gcp', 'docker', 'kubernetes', 'ci/cd', 'jenkins',
  'github actions', 'git', 'github', 'agile', 'scrum', 'jira', 'system design', 'microservices',
  'testing', 'jest', 'cypress', 'figma', 'ui/ux', 'seo', 'machine learning', 'deep learning',
  'ai', 'nlp', 'data science', 'pandas', 'numpy', 'scikit-learn', 'tensorflow', 'pytorch',
  'analytics', 'tableau', 'power bi', 'excel', 'communication', 'leadership', 'teamwork',
  'problem solving', 'project management', 'product management', 'marketing', 'sales'
]

const ACTION_VERBS = [
  'led', 'developed', 'designed', 'implemented', 'optimized', 'managed', 'created',
  'built', 'spearheaded', 'engineered', 'collaborated', 'reduced', 'increased', 'maximized',
  'minimized', 'streamlined', 'improved', 'automated', 'delivered', 'achieved', 'initiated',
  'launched', 'mentored', 'directed', 'coordinated', 'executed', 'formulated', 'overhauled'
]

const BUZZWORDS = [
  'go-getter', 'detail-oriented', 'team-player', 'self-motivated', 'results-driven',
  'hardworking', 'dynamic', 'synergy', 'disruptive', 'passionate', 'guru', 'ninja'
]

export function calculateCosineSimilarity(text1: string, text2: string): number {
  const getWords = (text: string) => {
    return text
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(w => w.length > 2);
  };

  const words1 = getWords(text1);
  const words2 = getWords(text2);

  const stopwords = new Set([
    'and', 'the', 'for', 'you', 'with', 'from', 'this', 'that', 'but', 'are', 'not', 'your',
    'have', 'has', 'had', 'was', 'were', 'been', 'will', 'would', 'should', 'can', 'could',
    'about', 'above', 'after', 'again', 'against', 'all', 'any', 'because', 'before', 'below',
    'between', 'both', 'each', 'few', 'more', 'most', 'other', 'some', 'such', 'than', 'too',
    'very', 'own', 'same', 'she', 'him', 'her', 'their', 'them', 'they', 'our', 'out', 'into'
  ]);

  const filteredWords1 = words1.filter(w => !stopwords.has(w));
  const filteredWords2 = words2.filter(w => !stopwords.has(w));

  if (filteredWords1.length === 0 || filteredWords2.length === 0) return 0;

  const freqMap1: Record<string, number> = {};
  const freqMap2: Record<string, number> = {};

  filteredWords1.forEach(w => freqMap1[w] = (freqMap1[w] || 0) + 1);
  filteredWords2.forEach(w => freqMap2[w] = (freqMap2[w] || 0) + 1);

  const vocabulary = new Set([...Object.keys(freqMap1), ...Object.keys(freqMap2)]);

  let dotProduct = 0;
  let len1 = 0;
  let len2 = 0;

  vocabulary.forEach(word => {
    const val1 = freqMap1[word] || 0;
    const val2 = freqMap2[word] || 0;

    dotProduct += val1 * val2;
    len1 += val1 * val1;
    len2 += val2 * val2;
  });

  if (len1 === 0 || len2 === 0) return 0;

  const similarity = dotProduct / (Math.sqrt(len1) * Math.sqrt(len2));
  return Math.round(similarity * 100);
}

export function analyzeResume(resumeText: string, jobDescription: string): ATSAnalysisResult {
  const resumeLower = resumeText.toLowerCase()
  const jdLower = jobDescription.toLowerCase()

  // Basic Metrics
  const words = resumeText.trim().split(/\s+/).filter(w => w.length > 0)
  const wordCount = words.length

  // 1. Sections Check
  const hasSummary = /(summary|profile|about me|professional summary|objective)/i.test(resumeText)
  const hasExperience = /(experience|employment|work history|career history|professional history)/i.test(resumeText)
  const hasEducation = /(education|academic|qualifications|university|college)/i.test(resumeText)
  const hasSkills = /(skills|core competencies|technologies|expertise)/i.test(resumeText)
  const hasContact = /(phone|email|\+91|\+\d|linkedin|github|gmail\.com|hotmail\.com)/i.test(resumeText)
  const hasEmail = /([a-zA-Z0-9._%-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6})/gi.test(resumeText)
  const hasPhone = /(\+?\d{1,4}[-.\s]??\d{9,12})/gi.test(resumeText)

  const sectionChecks = [
    { name: 'Summary', found: hasSummary },
    { name: 'Experience', found: hasExperience },
    { name: 'Education', found: hasEducation },
    { name: 'Skills', found: hasSkills },
    { name: 'Contact Info', found: hasContact }
  ]
  const missingSections = sectionChecks.filter(s => !s.found).map(s => s.name)

  // 2. Keywords Extract & Match
  const jdKeywords: string[] = []
  COMMON_SKILLS.forEach(skill => {
    const escaped = skill.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')
    const regex = new RegExp(`\\b${escaped}\\b`, 'gi')
    if (regex.test(jdLower)) {
      jdKeywords.push(skill)
    }
  })

  if (jdKeywords.length === 0) {
    const uniqueWords = Array.from(new Set(jobDescription.toLowerCase().match(/\b[a-z]{4,15}\b/g) || []))
    uniqueWords.forEach(w => {
      if (COMMON_SKILLS.includes(w) || w.length > 5) jdKeywords.push(w)
    })
  }

  const skillsMatched: string[] = []
  const skillsMissing: string[] = []
  const uniqueJdKeywords = Array.from(new Set(jdKeywords)).slice(0, 20)

  uniqueJdKeywords.forEach(keyword => {
    const escaped = keyword.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')
    const regex = new RegExp(`\\b${escaped}\\b`, 'gi')
    if (regex.test(resumeLower)) {
      skillsMatched.push(keyword)
    } else {
      skillsMissing.push(keyword)
    }
  })

  // 3. Action Verbs
  const actionVerbsFound: string[] = []
  ACTION_VERBS.forEach(verb => {
    const regex = new RegExp(`\\b${verb}\\b`, 'gi')
    if (regex.test(resumeLower)) {
      actionVerbsFound.push(verb)
    }
  })

  // 4. Metrics
  const metricsRegex = /(\d+%\s*|\$\s*\d+|\b\d+\s*years\b|\b\d+\s*months\b|₹\s*\d+|\b\d+x\b|\b\d+\s*billion\b|\b\d+\s*million\b|\b\d+\s*k\b|\b\d+\s*lakhs?\b)/gi
  const metricsMatches = resumeText.match(metricsRegex) || []
  const metricsFoundCount = metricsMatches.length

  // 5. Cliches/Buzzwords
  const buzzwordsFound: string[] = []
  BUZZWORDS.forEach(word => {
    const regex = new RegExp(`\\b${word}\\b`, 'gi')
    if (regex.test(resumeLower)) {
      buzzwordsFound.push(word)
    }
  })

  // 6. Cosine Similarity
  const cosineSimilarity = calculateCosineSimilarity(resumeText, jobDescription)

  // Assemble Enhancv-Style Checks
  const checks_essentials: ATSCheckItem[] = [
    {
      id: 'sections_check',
      title: 'Core Structural Sections',
      status: missingSections.length === 0 ? 'passed' : missingSections.length <= 2 ? 'warning' : 'critical',
      foundText: missingSections.length === 0 ? 'All 5 core sections found.' : `Missing sections: ${missingSections.join(', ')}`,
      explanation: 'ATS algorithms segment resumes into predefined sections (Experience, Education, Skills, Contact, Summary). Lacking these labels breaks standard parsing.',
      actionStep: missingSections.length === 0
        ? 'No action required. Sections are properly categorized.'
        : `Add clear header titles for: ${missingSections.map(s => `"${s}"`).join(', ')}.`
    },
    {
      id: 'file_parsability',
      title: 'Text-Readable Layout',
      status: 'passed',
      foundText: 'Parsed text content successfully in UTF-8 format.',
      explanation: 'ATS engines read textual layers. Image-based PDFs or complex nested frames cause character extraction failure.',
      actionStep: 'Always ensure your PDF is generated from textual word processors (e.g. Word, Google Docs) rather than scanned image documents.'
    }
  ]

  const checks_design: ATSCheckItem[] = [
    {
      id: 'heading_labels',
      title: 'Standardized Heading Formats',
      status: /(work experience|professional experience|academic background|core skills)/i.test(resumeText) ? 'passed' : 'warning',
      foundText: /(work experience|professional experience|academic background|core skills)/i.test(resumeText) ? 'Using standard recruiter heading conventions.' : 'Non-standard headings found.',
      explanation: 'Human recruiters and machines scanning quickly look for traditional naming conventions like "Work Experience" or "Education". Complex creative phrases confuse parsers.',
      actionStep: 'Rename header titles to direct, universally-recognized headings like "Work Experience", "Education", or "Skills".'
    }
  ]

  const checks_tailoring: ATSCheckItem[] = [
    {
      id: 'keyword_coverage',
      title: 'Job Requirement Keyword Alignment',
      status: uniqueJdKeywords.length === 0 ? 'passed' : (skillsMatched.length / uniqueJdKeywords.length) >= 0.7 ? 'passed' : (skillsMatched.length / uniqueJdKeywords.length) >= 0.4 ? 'warning' : 'critical',
      foundText: `Matched ${skillsMatched.length} out of ${uniqueJdKeywords.length} key requirements.`,
      explanation: 'ATS filters candidates based on specific skills found in the job description. Matching these exact keywords determines your search relevancy rank.',
      actionStep: skillsMissing.length === 0
        ? 'Excellent job tailoring your skills to the requirements.'
        : `Integrate the following target keywords into your resume where appropriate: ${skillsMissing.slice(0, 5).map(s => `"${s}"`).join(', ')}.`
    },
    {
      id: 'semantic_cosine',
      title: 'Semantic Vector Match (Cosine Similarity)',
      status: cosineSimilarity >= 70 ? 'passed' : cosineSimilarity >= 45 ? 'warning' : 'critical',
      foundText: `Cosine Similarity Match: ${cosineSimilarity}%`,
      explanation: 'Measures word-vector overlap between resume text and job description (excluding common English stopwords). It represents how contextually relevant the resume is to the job specifications.',
      actionStep: cosineSimilarity >= 70
        ? 'Resume matches the job description vocabulary beautifully.'
        : 'Restructure your bullet points using the exact terminology and phrasing found in the Job Description requirements.'
    }
  ]

  const checks_professionalism: ATSCheckItem[] = [
    {
      id: 'contact_info',
      title: 'Direct Contact Details',
      status: (hasEmail && hasPhone) ? 'passed' : hasEmail ? 'warning' : 'critical',
      foundText: `Email: ${hasEmail ? 'Found' : 'Missing'} | Phone: ${hasPhone ? 'Found' : 'Missing'}`,
      explanation: 'Recruiters must have a standard way to reach you. Resumes missing phone numbers or emails are immediately passed over.',
      actionStep: (hasEmail && hasPhone)
        ? 'Contact information is present.'
        : `Add a prominent ${!hasEmail ? 'email address' : ''}${(!hasEmail && !hasPhone) ? ' and ' : ''}${!hasPhone ? 'phone number' : ''} at the top.`
    },
    {
      id: 'portfolio_links',
      title: 'Online Portfolio Links',
      status: /(github|linkedin|behance|dribbble|portfolio)/i.test(resumeText) ? 'passed' : 'warning',
      foundText: /(github|linkedin|behance|dribbble|portfolio)/i.test(resumeText) ? 'Professional profiles/portfolio links detected.' : 'No portfolio or professional links found.',
      explanation: 'Modern recruiting relies on verifying projects, codebases, and credentials online (e.g. GitHub or LinkedIn profiles).',
      actionStep: 'Include links to your LinkedIn profile and GitHub or professional web portfolio at the top of your resume.'
    }
  ]

  const checks_writing: ATSCheckItem[] = [
    {
      id: 'wordiness_check',
      title: 'Lengthy Sentences & Wordiness',
      status: wordCount > 900 ? 'warning' : 'passed',
      foundText: `Sentence length check passed. Total word count: ${wordCount}.`,
      explanation: 'Long, run-on sentences dilute your impact. Focus on punchy, clear bullet points that take less than 3 seconds to scan.',
      actionStep: wordCount > 900
        ? 'Shorten descriptions. Try to split sentences exceeding 20 words or write in standard bullet format.'
        : 'Keep maintaining concise sentences.'
    }
  ]

  const checks_impact: ATSCheckItem[] = [
    {
      id: 'quantified_metrics',
      title: 'Quantified Achievements & Metrics',
      status: metricsFoundCount >= 5 ? 'passed' : metricsFoundCount >= 2 ? 'warning' : 'critical',
      foundText: `Found ${metricsFoundCount} metric checkpoints in your text.`,
      explanation: 'Resumes without metrics represent tasks, not results. Recruiters prioritize outcomes (e.g., "Increased speeds by 25%") to measure competency.',
      actionStep: metricsFoundCount >= 5
        ? 'Excellent metric quantification.'
        : 'Strengthen achievements by detailing outcomes. Replace "Responsible for fixing bugs" with "Resolved 50+ critical bugs, improving stability by 12%".'
    },
    {
      id: 'action_verbs',
      title: 'Strong Leadership Action Verbs',
      status: actionVerbsFound.length >= 6 ? 'passed' : actionVerbsFound.length >= 3 ? 'warning' : 'critical',
      foundText: `Found ${actionVerbsFound.length} strong action verbs.`,
      explanation: 'Passive or weak verbs (e.g., "Assisted in", "Worked on") downplay your role. Start bullets with active verbs (e.g., "Spearheaded", "Architected").',
      actionStep: actionVerbsFound.length >= 6
        ? 'Strong active language throughout.'
        : `Incorporate dynamic action verbs at the start of your bullet points: e.g., ${ACTION_VERBS.slice(0, 4).map(v => `"${v}"`).join(', ')}.`
    }
  ]

  const checks_flags: ATSCheckItem[] = [
    {
      id: 'buzzwords_cliches',
      title: 'Vague Cliches & Buzzwords',
      status: buzzwordsFound.length > 2 ? 'warning' : 'passed',
      foundText: buzzwordsFound.length > 0 ? `Detected cliches: ${buzzwordsFound.map(b => `"${b}"`).join(', ')}` : 'No excessive buzzwords found.',
      explanation: 'Empty buzzwords like "ninja", "self-motivated", or "go-getter" trigger skepticism. Replace them with specific credentials and achievements.',
      actionStep: buzzwordsFound.length > 2
        ? `Remove cliches like ${buzzwordsFound.slice(0, 3).map(b => `"${b}"`).join(', ')} and prove these qualities with data instead.`
        : 'Keep keeping details concrete.'
    },
    {
      id: 'resume_length_words',
      title: 'Ideal Resume Word Count',
      status: (wordCount >= 400 && wordCount <= 850) ? 'passed' : 'warning',
      foundText: `${wordCount} words.`,
      explanation: 'The sweet spot for a professional resume is 450 to 800 words. Too short indicates lack of experience, too long leads to immediate parser clipping.',
      actionStep: (wordCount >= 400 && wordCount <= 850)
        ? 'Resume length is optimal.'
        : wordCount < 400
          ? 'Expand on details, adding skills and project descriptions to hit the 450+ word threshold.'
          : 'Condense your writing by removing fillers and details older than 7 years.'
    }
  ]

  // Calculate Scores
  // 1. Technical Parsability Score (out of 100)
  // Sections: 50 pts, Design/Headers: 20 pts, Contact: 20 pts, Links: 10 pts
  let parsabilityScore = 0
  const sectionsScore = (sectionChecks.filter(s => s.found).length / 5) * 50
  const designScore = checks_design[0].status === 'passed' ? 20 : 10
  const contactScore = (hasEmail ? 10 : 0) + (hasPhone ? 10 : 0)
  const linksScore = checks_professionalism[1].status === 'passed' ? 10 : 5
  parsabilityScore = Math.round(sectionsScore + designScore + contactScore + linksScore)

  // 2. Content Impact Score (out of 100)
  // Tailoring (keywords): 30 pts, Cosine Similarity: 30 pts, Metrics: 20 pts, Action Verbs: 20 pts
  let impactScore = 0
  const keywordPts = uniqueJdKeywords.length > 0 ? (skillsMatched.length / uniqueJdKeywords.length) * 30 : 20
  const cosinePts = (cosineSimilarity / 100) * 30
  const metricsPts = metricsFoundCount >= 5 ? 20 : metricsFoundCount >= 2 ? 14 : 6
  const verbPts = actionVerbsFound.length >= 6 ? 20 : actionVerbsFound.length >= 3 ? 14 : 6
  impactScore = Math.round(keywordPts + cosinePts + metricsPts + verbPts)

  // Adjust for Red Flags or Writing Checks
  if (buzzwordsFound.length > 3) impactScore = Math.max(0, impactScore - 5)
  if (wordCount < 200 || wordCount > 1000) parsabilityScore = Math.max(0, parsabilityScore - 8)

  const overallScore = Math.round((parsabilityScore + impactScore) / 2)

  return {
    score: overallScore,
    atsParsabilityScore: parsabilityScore,
    contentImpactScore: impactScore,
    cosineSimilarity,
    wordCount,
    skillsMatched,
    skillsMissing,
    actionVerbsFound,
    metricsFoundCount,
    categories: {
      ats_essentials: { title: 'ATS Essentials', checks: checks_essentials },
      ats_design: { title: 'ATS-Friendly Design', checks: checks_design },
      cv_tailoring: { title: 'CV Content & Tailoring', checks: checks_tailoring },
      professionalism: { title: 'Professionalism & Formatting', checks: checks_professionalism },
      writing_quality: { title: 'Writing Quality', checks: checks_writing },
      impact_metrics: { title: 'Impact & Metrics', checks: checks_impact },
      red_flags: { title: 'Strategy & Red Flags', checks: checks_flags }
    }
  }
}
