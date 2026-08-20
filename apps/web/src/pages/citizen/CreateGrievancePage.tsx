import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { MapPin, Upload, AlertCircle, Bot, Loader2, CheckCircle } from "lucide-react";
import { grievanceApi } from "../../lib/api";
import { toast } from "sonner";

const CATEGORIES = ["Roads & Infrastructure", "Water Supply", "Electricity", "Sanitation & Waste", "Public Safety", "Healthcare", "Education", "Environment", "Housing", "Corruption", "Other"];

interface AIAnalysis { category: string; department: string; departmentName: string; departmentId: string | null; priority: string; severity: string; sentiment: string; confidence: number; summary: string; explanation: string; }

export default function CreateGrievancePage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<AIAnalysis | null>(null);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [form, setForm] = useState({ title: "", description: "", category: "", address: "" });
  const [files, setFiles] = useState<File[]>([]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (e.target.name === "title" || e.target.name === "description") { setAnalysis(null); setAnalysisError(null); }
  };

  const handleAnalyze = async () => {
    if (!form.title || form.title.length < 5 || !form.description || form.description.length < 10) { toast.error("Please enter a title (min 5 chars) and description (min 10 chars) first"); return; }
    setAnalyzing(true); setAnalysisError(null);
    try {
      const { data } = await grievanceApi.analyze({ title: form.title, description: form.description, category: form.category || undefined });
      setAnalysis(data.classification);
      if (!form.category && data.classification.category) setForm((prev) => ({ ...prev, category: data.classification.category }));
      toast.success("AI analysis complete!");
    } catch { setAnalysisError("AI analysis unavailable. You can still submit manually."); toast.error("AI analysis failed — you can submit anyway"); } finally { setAnalyzing(false); }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.description || !form.category) { toast.error("Please fill in all required fields"); return; }
    setLoading(true);
    try {
      const { data } = await grievanceApi.create({ title: form.title, description: form.description, category: form.category, address: form.address || undefined });
      if (files.length > 0 && data.grievance?.id) { const { attachmentApi } = await import("../../lib/api"); for (const file of files) { try { await attachmentApi.upload(data.grievance.id, file); } catch { /* non-critical */ } } }
      toast.success("Grievance submitted!"); navigate(`/citizen/grievances/${data.grievance.id}`);
    } catch (err: unknown) { const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error || "Failed to create grievance"; toast.error(msg); } finally { setLoading(false); }
  };

  const priorityColor: Record<string, string> = { LOW: "text-green-400", MEDIUM: "text-yellow-400", HIGH: "text-red-400", CRITICAL: "text-red-500" };
  const sentimentEmoji: Record<string, string> = { POSITIVE: "😊", NEUTRAL: "😐", NEGATIVE: "😟", URGENT: "🚨" };

  const inputStyle = { background: "#111", border: "1px solid rgba(255,255,255,0.1)" };

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-white mb-6">Submit a Grievance</h1>
      <form onSubmit={handleSubmit} className="rounded-2xl p-6 space-y-5" style={{ background: "#111", border: "1px solid rgba(255,255,255,0.07)" }}>
        <div>
          <label className="block text-xs font-medium text-gray-400 mb-1.5">Title * <span className="text-gray-600">Min 5 characters</span></label>
          <input type="text" name="title" placeholder="Brief title for your grievance" className="w-full px-4 py-3 rounded-xl text-sm text-white placeholder:text-gray-600 focus:outline-none" style={inputStyle} value={form.title} onChange={handleChange} required minLength={5} maxLength={200} />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-400 mb-1.5">Description * <span className="text-gray-600">Min 10 characters</span></label>
          <textarea name="description" placeholder="Describe your grievance in detail..." className="w-full px-4 py-3 rounded-xl text-sm text-white placeholder:text-gray-600 focus:outline-none h-32 resize-none" style={inputStyle} value={form.description} onChange={handleChange} required minLength={10} />
        </div>
        <div className="flex items-center gap-3">
          <button type="button" className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition ${analysis ? "bg-green-500 text-white" : "bg-white text-black hover:bg-gray-200"} disabled:opacity-50`} disabled={analyzing || form.title.length < 5 || form.description.length < 10} onClick={handleAnalyze}>
            {analyzing ? <><Loader2 className="h-4 w-4 animate-spin" /> Analyzing...</> : analysis ? <><CheckCircle className="h-4 w-4" /> Re-analyze</> : <><Bot className="h-4 w-4" /> Analyze with AI</>}
          </button>
          {form.title.length < 5 || form.description.length < 10 ? <span className="text-xs text-gray-600">Enter title and description first</span> : !analysis && !analyzing ? <span className="text-xs text-gray-400">AI will suggest department, category, and priority</span> : null}
        </div>
        {analysis && (
          <div className="rounded-2xl p-4 space-y-3" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.1)" }}>
            <h3 className="text-sm font-bold text-white flex items-center gap-2"><Bot className="h-4 w-4" /> AI Analysis Result</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {[["Department", analysis.departmentName], ["Category", analysis.category], ["Priority", analysis.priority], ["Sentiment", `${sentimentEmoji[analysis.sentiment] || ""} ${analysis.sentiment}`], ["Severity", analysis.severity], ["Confidence", `${(analysis.confidence * 100).toFixed(0)}%`]].map(([label, value]) => (
                <div key={label} className="p-2 rounded-lg" style={{ background: "rgba(255,255,255,0.03)" }}>
                  <div className="text-[10px] uppercase tracking-wide text-gray-500">{label}</div>
                  <div className={`font-semibold text-sm mt-0.5 ${label === "Priority" ? priorityColor[value as string] || "text-white" : "text-white"}`}>{value}</div>
                </div>
              ))}
            </div>
            {analysis.summary && <div className="text-xs text-gray-400 p-2 rounded-lg" style={{ background: "rgba(255,255,255,0.03)" }}><span className="font-semibold text-white">Summary:</span> {analysis.summary}</div>}
          </div>
        )}
        {analysisError && <div className="flex items-center gap-2 p-3 rounded-xl text-sm text-yellow-400" style={{ background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.2)" }}><AlertCircle className="h-4 w-4" />{analysisError}</div>}
        <div>
          <label className="block text-xs font-medium text-gray-400 mb-1.5">Category * {analysis && <span className="text-green-400">Auto-filled by AI</span>}</label>
          <select name="category" className={`w-full px-4 py-3 rounded-xl text-sm text-white focus:outline-none ${analysis ? "border-green-500/50" : ""}`} style={inputStyle} value={form.category} onChange={handleChange} required>
            <option value="">Select a category</option>
            {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-400 mb-1.5"><MapPin className="inline h-3.5 w-3.5 mr-1" />Location / Address <span className="text-gray-600">Optional</span></label>
          <input type="text" name="address" placeholder="Where is the issue located?" className="w-full px-4 py-3 rounded-xl text-sm text-white placeholder:text-gray-600 focus:outline-none" style={inputStyle} value={form.address} onChange={handleChange} />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-400 mb-1.5"><Upload className="inline h-3.5 w-3.5 mr-1" />Attachments <span className="text-gray-600">Optional</span></label>
          <input type="file" className="w-full px-4 py-3 rounded-xl text-sm text-white file:mr-4 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-sm file:font-bold file:bg-white file:text-black file:cursor-pointer" style={inputStyle} multiple accept=".jpg,.jpeg,.png,.gif,.pdf,.doc,.docx" onChange={(e) => { if (e.target.files) setFiles(Array.from(e.target.files)); }} />
          {files.length > 0 && <span className="text-xs text-gray-500 mt-1 block">{files.length} file(s) selected</span>}
        </div>
        <div className="flex items-center gap-2 p-3 rounded-xl text-sm text-gray-400" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)" }}>
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{analysis ? `AI will route this to the ${analysis.departmentName} department with ${analysis.priority} priority.` : "Your grievance will be analyzed by AI for classification, priority detection, and department routing."}</span>
        </div>
        <div className="flex gap-3 mt-2">
          <button type="button" className="flex-1 px-4 py-3 rounded-xl text-sm font-semibold text-gray-400 hover:text-white transition" style={{ border: "1px solid rgba(255,255,255,0.1)" }} onClick={() => navigate(-1)}>Cancel</button>
          <button type="submit" className="flex-1 px-4 py-3 rounded-xl text-sm font-bold bg-white text-black hover:bg-gray-200 transition disabled:opacity-50" disabled={loading}>{loading ? "Submitting..." : "Submit Grievance"}</button>
        </div>
      </form>
    </div>
  );
}
