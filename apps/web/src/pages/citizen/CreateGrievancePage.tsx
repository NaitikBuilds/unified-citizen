import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { MapPin, Upload, AlertCircle, Bot, Loader2, CheckCircle } from "lucide-react";
import { grievanceApi } from "../../lib/api";
import { toast } from "sonner";

const CATEGORIES = [
  "Roads & Infrastructure",
  "Water Supply",
  "Electricity",
  "Sanitation & Waste",
  "Public Safety",
  "Healthcare",
  "Education",
  "Environment",
  "Housing",
  "Corruption",
  "Other",
];

interface AIAnalysis {
  category: string;
  department: string;
  departmentName: string;
  departmentId: string | null;
  priority: string;
  severity: string;
  sentiment: string;
  confidence: number;
  summary: string;
  explanation: string;
}

export default function CreateGrievancePage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<AIAnalysis | null>(null);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "",
    address: "",
  });
  const [files, setFiles] = useState<File[]>([]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    // Clear analysis when user changes title or description
    if (e.target.name === "title" || e.target.name === "description") {
      setAnalysis(null);
      setAnalysisError(null);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files));
    }
  };

  const handleAnalyze = async () => {
    if (!form.title || form.title.length < 5 || !form.description || form.description.length < 10) {
      toast.error("Please enter a title (min 5 chars) and description (min 10 chars) first");
      return;
    }

    setAnalyzing(true);
    setAnalysisError(null);
    try {
      const { data } = await grievanceApi.analyze({
        title: form.title,
        description: form.description,
        category: form.category || undefined,
      });
      setAnalysis(data.classification);

      // Auto-fill category from AI if not already set
      if (!form.category && data.classification.category) {
        setForm((prev) => ({ ...prev, category: data.classification.category }));
      }

      toast.success("AI analysis complete!");
    } catch {
      setAnalysisError("AI analysis unavailable. You can still submit manually.");
      toast.error("AI analysis failed — you can submit anyway");
    } finally {
      setAnalyzing(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.description || !form.category) {
      toast.error("Please fill in all required fields");
      return;
    }
    setLoading(true);
    try {
      const { data } = await grievanceApi.create({
        title: form.title,
        description: form.description,
        category: form.category,
        address: form.address || undefined,
      });

      // Upload attachments if any
      if (files.length > 0 && data.grievance?.id) {
        const { attachmentApi } = await import("../../lib/api");
        for (const file of files) {
          try {
            await attachmentApi.upload(data.grievance.id, file);
          } catch {
            // Attachment upload failure is non-critical
          }
        }
      }

      toast.success("Grievance submitted! AI is analyzing your submission.");
      navigate(`/citizen/grievances/${data.grievance.id}`);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error || "Failed to create grievance";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const priorityColor: Record<string, string> = {
    LOW: "badge-success",
    MEDIUM: "badge-warning",
    HIGH: "badge-error",
    CRITICAL: "badge-error badge-outline",
  };

  const sentimentEmoji: Record<string, string> = {
    POSITIVE: "😊",
    NEUTRAL: "😐",
    NEGATIVE: "😟",
    URGENT: "🚨",
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Submit a Grievance</h1>

      <form onSubmit={handleSubmit} className="card bg-base-100 shadow-md border border-base-300">
        <div className="card-body gap-5">
          {/* Title */}
          <div className="form-control">
            <label className="label">
              <span className="label-text font-semibold">Title *</span>
              <span className="label-text-alt text-base-content/50">Min 5 characters</span>
            </label>
            <input
              type="text"
              name="title"
              placeholder="Brief title for your grievance"
              className="input input-bordered w-full"
              value={form.title}
              onChange={handleChange}
              required
              minLength={5}
              maxLength={200}
            />
          </div>

          {/* Description */}
          <div className="form-control">
            <label className="label">
              <span className="label-text font-semibold">Description *</span>
              <span className="label-text-alt text-base-content/50">Min 10 characters</span>
            </label>
            <textarea
              name="description"
              placeholder="Describe your grievance in detail. Include what happened, when, where, and any relevant information."
              className="textarea textarea-bordered h-32 w-full"
              value={form.description}
              onChange={handleChange}
              required
              minLength={10}
            />
          </div>

          {/* AI Analyze Button */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              className={`btn gap-2 ${analysis ? "btn-success" : "btn-primary"} ${analyzing ? "loading" : ""}`}
              disabled={analyzing || form.title.length < 5 || form.description.length < 10}
              onClick={handleAnalyze}
            >
              {analyzing ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Analyzing with AI...
                </>
              ) : analysis ? (
                <>
                  <CheckCircle className="h-4 w-4" />
                  Re-analyze
                </>
              ) : (
                <>
                  <Bot className="h-4 w-4" />
                  Analyze with AI
                </>
              )}
            </button>
            {form.title.length < 5 || form.description.length < 10 ? (
              <span className="text-xs text-base-content/50">
                Enter title and description first
              </span>
            ) : !analysis && !analyzing ? (
              <span className="text-xs text-primary">
                AI will suggest department, category, and priority
              </span>
            ) : null}
          </div>

          {/* AI Analysis Results */}
          {analysis && (
            <div className="card bg-primary/5 border border-primary/20 shadow-sm">
              <div className="card-body p-4 gap-3">
                <h3 className="card-title text-sm gap-2">
                  <Bot className="h-4 w-4 text-primary" />
                  AI Analysis Result
                </h3>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {/* Department */}
                  <div className="p-2 bg-base-100 rounded-lg">
                    <div className="text-[10px] uppercase tracking-wide text-base-content/50">Department</div>
                    <div className="font-semibold text-sm mt-0.5">{analysis.departmentName}</div>
                  </div>

                  {/* Category */}
                  <div className="p-2 bg-base-100 rounded-lg">
                    <div className="text-[10px] uppercase tracking-wide text-base-content/50">Category</div>
                    <div className="font-semibold text-sm mt-0.5">{analysis.category}</div>
                  </div>

                  {/* Priority */}
                  <div className="p-2 bg-base-100 rounded-lg">
                    <div className="text-[10px] uppercase tracking-wide text-base-content/50">Priority</div>
                    <div className="mt-0.5">
                      <span className={`badge badge-sm ${priorityColor[analysis.priority] || "badge-ghost"}`}>
                        {analysis.priority}
                      </span>
                    </div>
                  </div>

                  {/* Sentiment */}
                  <div className="p-2 bg-base-100 rounded-lg">
                    <div className="text-[10px] uppercase tracking-wide text-base-content/50">Sentiment</div>
                    <div className="font-semibold text-sm mt-0.5">
                      {sentimentEmoji[analysis.sentiment] || ""} {analysis.sentiment}
                    </div>
                  </div>

                  {/* Severity */}
                  <div className="p-2 bg-base-100 rounded-lg">
                    <div className="text-[10px] uppercase tracking-wide text-base-content/50">Severity</div>
                    <div className="font-semibold text-sm mt-0.5">{analysis.severity}</div>
                  </div>

                  {/* Confidence */}
                  <div className="p-2 bg-base-100 rounded-lg">
                    <div className="text-[10px] uppercase tracking-wide text-base-content/50">Confidence</div>
                    <div className="font-semibold text-sm mt-0.5">
                      {(analysis.confidence * 100).toFixed(0)}%
                    </div>
                  </div>
                </div>

                {/* Summary */}
                {analysis.summary && (
                  <div className="text-xs text-base-content/70 bg-base-100 p-2 rounded-lg">
                    <span className="font-semibold">Summary:</span> {analysis.summary}
                  </div>
                )}
              </div>
            </div>
          )}

          {analysisError && (
            <div className="alert alert-warning text-sm">
              <AlertCircle className="h-4 w-4" />
              <span>{analysisError}</span>
            </div>
          )}

          {/* Category */}
          <div className="form-control">
            <label className="label">
              <span className="label-text font-semibold">Category *</span>
              {analysis && (
                <span className="label-text-alt text-success text-xs">
                  Auto-filled by AI
                </span>
              )}
            </label>
            <select
              name="category"
              className={`select select-bordered w-full ${analysis ? "border-success/50" : ""}`}
              value={form.category}
              onChange={handleChange}
              required
            >
              <option value="">Select a category</option>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* Location */}
          <div className="form-control">
            <label className="label">
              <span className="label-text font-semibold">
                <MapPin className="inline h-4 w-4 mr-1" />
                Location / Address
              </span>
              <span className="label-text-alt text-base-content/50">Optional</span>
            </label>
            <input
              type="text"
              name="address"
              placeholder="Where is the issue located?"
              className="input input-bordered w-full"
              value={form.address}
              onChange={handleChange}
            />
          </div>

          {/* File Upload */}
          <div className="form-control">
            <label className="label">
              <span className="label-text font-semibold">
                <Upload className="inline h-4 w-4 mr-1" />
                Attachments
              </span>
              <span className="label-text-alt text-base-content/50">Optional</span>
            </label>
            <input
              type="file"
              className="file-input file-input-bordered w-full"
              multiple
              accept=".jpg,.jpeg,.png,.gif,.pdf,.doc,.docx"
              onChange={handleFileChange}
            />
            {files.length > 0 && (
              <label className="label">
                <span className="label-text-alt text-info">
                  {files.length} file(s) selected
                </span>
              </label>
            )}
          </div>

          {/* Notice */}
          <div className="alert alert-info">
            <AlertCircle className="h-5 w-5" />
            <span>
              {analysis
                ? `AI will route this to the ${analysis.departmentName} department with ${analysis.priority} priority.`
                : "Your grievance will be analyzed by AI for classification, priority detection, and department routing."}
            </span>
          </div>

          {/* Submit */}
          <div className="flex gap-3 mt-2">
            <button
              type="button"
              className="btn btn-outline flex-1"
              onClick={() => navigate(-1)}
            >
              Cancel
            </button>
            <button
              type="submit"
              className={`btn btn-primary flex-1 ${loading ? "loading" : ""}`}
              disabled={loading}
            >
              {loading ? "Submitting..." : "Submit Grievance"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
