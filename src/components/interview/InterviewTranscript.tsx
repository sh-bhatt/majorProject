interface InterviewTranscriptProps {
  transcript: string;
  label: string;
}

export function InterviewTranscript({ transcript, label }: InterviewTranscriptProps) {
  return (
    <div className="bg-gray-50 rounded-lg p-6 border-2 border-gray-200 min-h-[120px]">
      <h3 className="text-sm font-semibold text-gray-600 mb-3">{label}</h3>
      {transcript ? (
        <p className="text-gray-800 leading-relaxed">{transcript}</p>
      ) : (
        <p className="text-gray-400 italic">Waiting for response...</p>
      )}
    </div>
  );
}
