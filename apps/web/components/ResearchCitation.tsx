interface Citation {
  title: string
  authors: string
  year: number
  key_finding: string
}

interface ResearchCitationProps {
  citation: Citation
}

export function ResearchCitation({ citation }: ResearchCitationProps) {
  return (
    <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
      <p className="text-xs font-semibold text-blue-700 uppercase tracking-wider mb-1">Science behind this workout</p>
      <p className="text-sm text-gray-700 mb-2">{citation.key_finding}</p>
      <p className="text-xs text-gray-500">
        {citation.authors} ({citation.year}). <em>{citation.title}</em>
      </p>
    </div>
  )
}
