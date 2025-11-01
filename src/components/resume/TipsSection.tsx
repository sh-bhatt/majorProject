export function TipsSection() {
  return (
    <div className="mt-8 grid md:grid-cols-2 gap-6">
      <div className="bg-white shadow-md rounded-2xl p-6 border border-gray-200 hover:shadow-lg transition-all">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
          ✍️ Grammar & Writing Quality Tips
        </h2>
        <ul className="list-disc list-inside text-gray-700 space-y-2 leading-relaxed">
          <li>
            Use strong action verbs like <span className="font-semibold">"engineered," "optimized,"</span> or{" "}
            <span className="font-semibold">"delivered"</span> instead of passive phrases.
          </li>
          <li>
            Maintain consistent verb tense: past tense for completed roles, present for current positions.
          </li>
          <li>
            Keep bullet points concise and action-oriented to capture recruiter attention quickly.
          </li>
        </ul>
      </div>

      <div className="bg-white shadow-md rounded-2xl p-6 border border-gray-200 hover:shadow-lg transition-all">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
          💼 Resume Optimization Tips
        </h2>
        <ul className="list-disc list-inside text-gray-700 space-y-2 leading-relaxed">
          <li>
            Add quantifiable outcomes (e.g., <span className="font-semibold">"Reduced latency by 30%"</span>) to make achievements measurable.
          </li>
          <li>
            Place "Technical Skills" or "Projects" near the top to align with recruiter scanning patterns for tech roles.
          </li>
          <li>
            Ensure consistent formatting and adequate spacing to enhance both readability and ATS compatibility.
          </li>
        </ul>
      </div>
    </div>
  );
}
