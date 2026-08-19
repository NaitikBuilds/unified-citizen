import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  MessageSquare,
  Bot,
  Send,
  Clock,
  MapPin,
  UserPlus,
} from "lucide-react";
import { grievanceApi, commentApi, userApi } from "../../lib/api";
import StatusBadge from "../../components/StatusBadge";
import PriorityBadge from "../../components/PriorityBadge";
import LoadingSpinner from "../../components/LoadingSpinner";
import ErrorAlert from "../../components/ErrorAlert";
import { toast } from "sonner";
import type { Grievance, Comment, User } from "../../types";

type Tab = "info" | "comments" | "ai";

export default function GrievanceDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [grievance, setGrievance] = useState<Grievance | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>("info");

  const [officers, setOfficers] = useState<User[]>([]);
  const [selectedOfficer, setSelectedOfficer] = useState("");
  const [assignLoading, setAssignLoading] = useState(false);

  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [isInternal, setIsInternal] = useState(false);
  const [commentLoading, setCommentLoading] = useState(false);

  const fetchGrievance = useCallback(async () => {
    if (!id) return;
    try {
      const { data } = await grievanceApi.getById(id);
      setGrievance(data.grievance);
    } catch {
      setError("Grievance not found");
    } finally {
      setLoading(false);
    }
  }, [id]);

  const fetchOfficers = useCallback(async () => {
    try {
      const { data } = await userApi.list(1, 100);
      const deptOfficers = data.users.filter((u) => u.role === "OFFICER");
      setOfficers(deptOfficers);
    } catch {
      /* */
    }
  }, []);

  const fetchComments = useCallback(async () => {
    if (!id) return;
    try {
      const { data } = await commentApi.list(id);
      setComments(data.comments);
    } catch {
      /* */
    }
  }, [id]);

  useEffect(() => {
    fetchGrievance();
    fetchOfficers();
  }, [fetchGrievance, fetchOfficers]);

  useEffect(() => {
    if (activeTab === "comments") fetchComments();
  }, [activeTab, fetchComments]);

  const handleAssign = async () => {
    if (!id || !selectedOfficer) return;
    setAssignLoading(true);
    try {
      await grievanceApi.assign(id, selectedOfficer);
      toast.success("Grievance assigned successfully");
      setSelectedOfficer("");
      fetchGrievance();
    } catch {
      toast.error("Failed to assign grievance");
    } finally {
      setAssignLoading(false);
    }
  };

  const handleStatusUpdate = async (status: string) => {
    if (!id) return;
    try {
      await grievanceApi.updateStatus(id, status);
      toast.success(`Status updated to ${status.replace(/_/g, " ")}`);
      fetchGrievance();
    } catch {
      toast.error("Failed to update status");
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim() || !id) return;
    setCommentLoading(true);
    try {
      await commentApi.create(id, newComment.trim(), isInternal);
      setNewComment("");
      toast.success("Comment added");
      fetchComments();
    } catch {
      toast.error("Failed to add comment");
    } finally {
      setCommentLoading(false);
    }
  };

  if (loading) return <LoadingSpinner />;
  if (error || !grievance) return <ErrorAlert message={error || "Not found"} />;

  const ai = grievance.aiClassification;

  const deptTransitions: Record<string, string[]> = {
    SUBMITTED: ["IN_PROGRESS"],
    AI_CLASSIFIED: ["IN_PROGRESS"],
    IN_PROGRESS: ["RESOLVED", "REJECTED"],
    ESCALATED: ["IN_PROGRESS", "RESOLVED"],
    REOPENED: ["IN_PROGRESS"],
  };
  const transitions = deptTransitions[grievance.status] || [];

  return (
    <div className="max-w-4xl mx-auto">
      <button
        className="btn btn-ghost btn-sm mb-4"
        onClick={() => navigate(-1)}
      >
        <ArrowLeft className="h-4 w-4" /> Back
      </button>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <span className="font-mono text-sm text-base-content/60">
              {grievance.ticketId}
            </span>
            <StatusBadge status={grievance.status} />
            <PriorityBadge priority={grievance.priority} />
          </div>
          <h1 className="text-2xl font-bold">{grievance.title}</h1>
        </div>
      </div>

      {/* Assignment Section */}
      <div className="card bg-base-100 shadow-sm border border-base-300 mb-6">
        <div className="card-body p-4">
          <h3 className="card-title text-sm gap-2">
            <UserPlus className="h-4 w-4" /> Assign Officer
          </h3>
          <div className="flex gap-3">
            <select
              className="select select-bordered flex-1"
              value={selectedOfficer}
              onChange={(e) => setSelectedOfficer(e.target.value)}
            >
              <option value="">Select an officer...</option>
              {officers.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.name} ({o.email})
                </option>
              ))}
            </select>
            <button
              className={`btn btn-primary btn-sm ${assignLoading ? "loading" : ""}`}
              disabled={assignLoading || !selectedOfficer}
              onClick={handleAssign}
            >
              Assign
            </button>
          </div>
        </div>
      </div>

      {/* Status Transitions */}
      {transitions.length > 0 && (
        <div className="alert alert-info mb-6">
          <div className="flex items-center gap-2 flex-wrap">
            <span>Update status:</span>
            {transitions.map((s) => (
              <button
                key={s}
                className={`btn btn-sm ${
                  s === "RESOLVED" || s === "REJECTED" ? "btn-success" : "btn-primary"
                }`}
                onClick={() => handleStatusUpdate(s)}
              >
                {s.replace(/_/g, " ")}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="tabs tabs-bordered mb-6">
        {(["info", "ai", "comments"] as Tab[]).map((t) => (
          <button
            key={t}
            className={`tab gap-2 ${activeTab === t ? "tab-active" : ""}`}
            onClick={() => setActiveTab(t)}
          >
            {t === "ai" && <Bot className="h-4 w-4" />}
            {t === "comments" && <MessageSquare className="h-4 w-4" />}
            {t === "info" ? "Details" : t === "ai" ? "AI Analysis" : "Comments"}
          </button>
        ))}
      </div>

      {activeTab === "info" && (
        <div className="card bg-base-100 shadow-sm border border-base-300">
          <div className="card-body">
            <h2 className="card-title">Description</h2>
            <p className="whitespace-pre-wrap">{grievance.description}</p>
            <div className="divider" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-base-content/60">Category</span>
                <div className="font-medium">{grievance.category || "—"}</div>
              </div>
              <div>
                <span className="text-base-content/60">Citizen</span>
                <div className="font-medium">
                  {grievance.citizen?.name || "—"}
                </div>
              </div>
              <div>
                <span className="text-base-content/60">Created</span>
                <div className="font-medium flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {new Date(grievance.createdAt).toLocaleString()}
                </div>
              </div>
              {grievance.address && (
                <div>
                  <span className="text-base-content/60">Location</span>
                  <div className="font-medium flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {grievance.address}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab === "ai" && (
        <div className="card bg-base-100 shadow-sm border border-base-300">
          <div className="card-body">
            <h2 className="card-title gap-2">
              <Bot className="h-5 w-5 text-primary" /> AI Classification
            </h2>
            {ai ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  ["Category", ai.category],
                  ["Priority", ai.priority],
                  ["Sentiment", ai.sentiment],
                  ["Severity", ai.severity],
                  [
                    "Confidence",
                    ai.confidence != null
                      ? `${(ai.confidence * 100).toFixed(0)}%`
                      : "—",
                  ],
                ].map(([label, value]) => (
                  <div key={label} className="p-3 bg-base-200 rounded-xl">
                    <div className="text-xs text-base-content/60 uppercase">
                      {label}
                    </div>
                    <div className="font-semibold mt-1">{value || "—"}</div>
                  </div>
                ))}
                {ai.summary && (
                  <div className="sm:col-span-2">
                    <h3 className="font-semibold text-sm mb-1">Summary</h3>
                    <p className="text-sm bg-base-200 p-3 rounded-xl">
                      {ai.summary}
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-base-content/60">No AI analysis.</p>
            )}
          </div>
        </div>
      )}

      {activeTab === "comments" && (
        <div className="card bg-base-100 shadow-sm border border-base-300">
          <div className="card-body">
            <h2 className="card-title">Comments</h2>
            {comments.length === 0 ? (
              <p className="text-base-content/60 py-4">No comments yet.</p>
            ) : (
              <div className="space-y-3 mb-6">
                {comments.map((c) => (
                  <div
                    key={c.id}
                    className={`p-3 rounded-xl ${
                      c.isInternal
                        ? "bg-warning/10 border border-warning/30"
                        : "bg-base-200"
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-sm">
                        {c.user?.name || "Unknown"}
                      </span>
                      <span className="badge badge-xs badge-outline">
                        {c.user?.role}
                      </span>
                      {c.isInternal && (
                        <span className="badge badge-xs badge-warning">
                          Internal
                        </span>
                      )}
                      <span className="text-xs text-base-content/40 ml-auto">
                        {new Date(c.createdAt).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-sm">{c.message}</p>
                  </div>
                ))}
              </div>
            )}
            <div className="flex flex-col gap-2">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Add a comment..."
                  className="input input-bordered flex-1"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleAddComment()}
                />
                <button
                  className={`btn btn-primary ${commentLoading ? "loading" : ""}`}
                  disabled={commentLoading || !newComment.trim()}
                  onClick={handleAddComment}
                >
                  <Send className="h-4 w-4" />
                </button>
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  className="checkbox checkbox-sm checkbox-warning"
                  checked={isInternal}
                  onChange={(e) => setIsInternal(e.target.checked)}
                />
                <span className="text-sm">
                  Internal note (not visible to citizen)
                </span>
              </label>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
