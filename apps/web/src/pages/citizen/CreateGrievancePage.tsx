import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { MapPin, Upload, AlertCircle } from "lucide-react";
import { grievanceApi, attachmentApi } from "../../lib/api";
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

export default function CreateGrievancePage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
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
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files));
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
        
        for (const file of files) {
          try {
            await attachmentApi.upload(data.grievance.id, file);
          } catch {
            // Attachment upload failure is non-critical
          }
        }
      }

      toast.success("Grievance submitted successfully! AI is analyzing your submission.");
      navigate(`/citizen/grievances/${data.grievance.id}`);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error || "Failed to create grievance";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
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

          {/* Category */}
          <div className="form-control">
            <label className="label">
              <span className="label-text font-semibold">Category *</span>
            </label>
            <select
              name="category"
              className="select select-bordered w-full"
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

          {/* AI Notice */}
          <div className="alert alert-info">
            <AlertCircle className="h-5 w-5" />
            <span>
              Your grievance will be analyzed by AI for classification, priority detection,
              and department routing. This usually takes a few seconds.
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
              {loading ? "Analyzing with AI..." : "Submit Grievance"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
