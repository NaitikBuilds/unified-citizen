import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  MessageSquare,
  Bot,
  Send,
  Clock,
  MapPin,
  AlertTriangle,
} from "lucide-react";
import {
  grievanceApi,
  commentApi,
} from "../../lib/api";
import StatusBadge from "../../components/StatusBadge";
import PriorityBadge from "../../components/PriorityBadge";
import LoadingSpinner from "../../components/LoadingSpinner";
import ErrorAlert from "../../components/ErrorAlert";
import { toast } from "sonner";
import type { Grievance, Comment } from "../../types";

type Tab = "info" | "comments" | "ai";

export default function GrievanceDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [grievance, setGrievance] = useState<Grievance | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>("info");

  // Status update
  const [statusLoading, setStatusLoading] = useState(false);

  // Comments
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [isInternal, setIsInternal] = useState(false);
  const [commentLoading, setCommentLoading] = useState(false);

  // Escalation
  const [escalateLevel, setEscalateLevel] = useState("LEVEL_1");
  const [escalateReason, setEscalateReason] = useState("");
  const [escalateLoading, setEscalateLoading] = useState(false);

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
  }, [fetchGrievance]);
  useEffect(() => {
    if (activeTab === "comments") fetchComments();
  }, [activeTab, fetchComments]);

  const handleStatusUpdate = async (newStatus: string) => {
    if (!id) return;
    setStatusLoading(true);
    try {
      await grievanceApi.updateStatus(id, newStatus);
      toast.success(`Status updated to ${newStatus.replace(/_/g, " ")}`);
      fetchGrievance();
    } catch {
      toast.error("Failed to update status");
    } finally {
      setStatusLoading(false);
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

  const handleEscalate = async () => {
    if (!id || !escalateReason.trim()) return;
    setEscalateLoading(true);
    try {
      await grievanceApi.escalate(id, escalateLevel, escalateReason);
      toast.success("Grievance escalated");
      fetchGrievance();
    } catch {
      toast.error("Failed to escalate");
    } finally {
      setEscalateLoading(false);
    }
  };

  if (loading) return <LoadingSpinner />;
  if (error || !grievance) return <ErrorAlert message={error || "Not found"} />;

  const ai = grievance.aiClassification;

  // Valid status transitions for officers
  const officerTransitions: Record<string, string[]> = {
    SUBMITTED: ["IN_PROGRESS"],
    AI_CLASSIFIED: ["IN_PROGRESS"],
    ASSIGNED: ["IN_PROGRESS"],
    IN_PROGRESS: ["RESOLVED"],
    REOPENED: ["IN_PROGRESS"],
  };
  const transitions = officerTransitions[grievance.status] || [];

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

      {/* Status Actions */}
      {transitions.length > 0 && (
        <div className="alert alert-info mb-6">
          <AlertTriangle className="h-5 w-5" />
          <div className="flex items-center gap-2 flex-wrap">
            <span>Update status:</span>
            {transitions.map((s) => (
              <button
                key={s}
                className={`btn btn-sm ${
                  s === "RESOLVED" ? "btn-success" : "btn-primary"
                } ${statusLoading ? "loading" : ""}`}
                disabled={statusLoading}
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

      {/* Details Tab */}
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
                <span className="text-base-content/60">Department</span>
                <div className="font-medium">
                  {grievance.department?.name || "—"}
                </div>
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

            {/* Escalation */}
            <div className="divider" />
            <h3 className="font-semibold mb-3">Escalate</h3>
            <div className="flex flex-col sm:flex-row gap-3">
              <select
                className="select select-bordered w-full sm:w-40"
                value={escalateLevel}
                onChange={(e) => setEscalateLevel(e.target.value)}
              >
                <option value="LEVEL_1">Level 1</option>
                <option value="LEVEL_2">Level 2</option>
                <option value="LEVEL_3">Level 3</option>
                <option value="ADMIN">Admin</option>
              </select>
              <input
                type="text"
                placeholder="Reason for escalation"
                className="input input-bordered flex-1"
                value={escalateReason}
                onChange={(e) => setEscalateReason(e.target.value)}
              />
              <button
                className={`btn btn-warning btn-sm ${escalateLoading ? "loading" : ""}`}
                disabled={escalateLoading || !escalateReason.trim()}
                onClick={handleEscalate}
              >
                Escalate
              </button>
            </div>
          </div>
        </div>
      )}

      {/* AI Tab */}
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
              <p className="text-base-content/60">No AI analysis available.</p>
            )}
          </div>
        </div>
      )}

      {/* Comments Tab */}
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
              <div className="flex gap-2 items-center">
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
                <span className="text-sm">Internal note (not visible to citizen)</span>
              </label>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
