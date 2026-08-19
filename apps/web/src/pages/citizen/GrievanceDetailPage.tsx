import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft, MessageSquare, Paperclip, Star, RotateCcw,
  Bot, Send, Download, Clock, MapPin,
} from "lucide-react";
import { grievanceApi, commentApi, attachmentApi, feedbackApi } from "../../lib/api";
import StatusBadge from "../../components/StatusBadge";
import PriorityBadge from "../../components/PriorityBadge";
import LoadingSpinner from "../../components/LoadingSpinner";
import ErrorAlert from "../../components/ErrorAlert";
import { toast } from "sonner";
import type { Grievance, Comment } from "../../types";

type Tab = "info" | "comments" | "attachments" | "ai";

export default function GrievanceDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [grievance, setGrievance] = useState<Grievance | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>("info");
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [commentLoading, setCommentLoading] = useState(false);
  const [attachments, setAttachments] = useState<
    Array<{
      id: string;
      fileName: string;
      fileType: string | null;
      fileSize: number | null;
      createdAt: string;
      uploadedBy?: { name: string };
    }>
  >([]);
  const [uploading, setUploading] = useState(false);
  const [rating, setRating] = useState(0);
  const [feedbackComment, setFeedbackComment] = useState("");
  const [feedbackLoading, setFeedbackLoading] = useState(false);
  const [existingFeedback, setExistingFeedback] = useState(false);
  const [reopenReason, setReopenReason] = useState("");
  const [reopenLoading, setReopenLoading] = useState(false);

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

  const fetchAttachments = useCallback(async () => {
    if (!id) return;
    try {
      const { data } = await attachmentApi.list(id);
      setAttachments(data.attachments);
    } catch {
      /* */
    }
  }, [id]);

  const fetchFeedback = useCallback(async () => {
    if (!id) return;
    try {
      const { data } = await feedbackApi.list(id);
      setExistingFeedback(data.feedback.length > 0);
    } catch {
      /* */
    }
  }, [id]);

  useEffect(() => {
    fetchGrievance();
  }, [fetchGrievance]);

  useEffect(() => {
    if (activeTab === "comments") fetchComments();
    if (activeTab === "attachments") fetchAttachments();
    if (grievance?.status === "RESOLVED") fetchFeedback();
  }, [activeTab, fetchComments, fetchAttachments, fetchFeedback, grievance?.status]);

  const handleAddComment = async () => {
    if (!newComment.trim() || !id) return;
    setCommentLoading(true);
    try {
      await commentApi.create(id, newComment.trim());
      setNewComment("");
      toast.success("Comment added");
      fetchComments();
    } catch {
      toast.error("Failed to add comment");
    } finally {
      setCommentLoading(false);
    }
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !id) return;
    setUploading(true);
    try {
      await attachmentApi.upload(id, file);
      toast.success("File uploaded");
      fetchAttachments();
    } catch {
      toast.error("Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmitFeedback = async () => {
    if (!id || rating === 0) return;
    setFeedbackLoading(true);
    try {
      await feedbackApi.create(id, rating, feedbackComment || undefined);
      toast.success("Feedback submitted");
      setExistingFeedback(true);
    } catch {
      toast.error("Failed to submit feedback");
    } finally {
      setFeedbackLoading(false);
    }
  };

  const handleReopen = async () => {
    if (!id) return;
    setReopenLoading(true);
    try {
      await grievanceApi.reopen(id, reopenReason || undefined);
      toast.success("Grievance reopened");
      fetchGrievance();
    } catch {
      toast.error("Failed to reopen grievance");
    } finally {
      setReopenLoading(false);
    }
  };

  if (loading) return <LoadingSpinner />;
  if (error || !grievance) return <ErrorAlert message={error || "Not found"} />;

  const ai = grievance.aiClassification;

  const aiFields = [
    ["Category", ai?.category],
    ["Priority", ai?.priority],
    ["Sentiment", ai?.sentiment],
    ["Severity", ai?.severity],
    [
      "Confidence",
      ai?.confidence != null ? `${(ai.confidence * 100).toFixed(0)}%` : null,
    ],
    [
      "Duplicate Score",
      ai?.duplicateScore != null
        ? `${(ai.duplicateScore * 100).toFixed(0)}%`
        : null,
    ],
  ];

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

      {/* Tabs */}
      <div className="tabs tabs-bordered mb-6">
        {(
          [
            { key: "info" as Tab, label: "Details" },
            { key: "ai" as Tab, label: "AI Analysis" },
            { key: "comments" as Tab, label: "Comments" },
            { key: "attachments" as Tab, label: "Files" },
          ] as const
        ).map((t) => (
          <button
            key={t.key}
            className={`tab gap-2 ${activeTab === t.key ? "tab-active" : ""}`}
            onClick={() => setActiveTab(t.key)}
          >
            {t.key === "ai" && <Bot className="h-4 w-4" />}
            {t.key === "comments" && <MessageSquare className="h-4 w-4" />}
            {t.key === "attachments" && <Paperclip className="h-4 w-4" />}
            {t.label}
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
              {grievance.resolvedAt && (
                <div>
                  <span className="text-base-content/60">Resolved</span>
                  <div className="font-medium">
                    {new Date(grievance.resolvedAt).toLocaleString()}
                  </div>
                </div>
              )}
            </div>

            {grievance.status === "RESOLVED" && (
              <div className="mt-6">
                <div className="divider" />
                {!existingFeedback && (
                  <div>
                    <h3 className="font-semibold mb-3">Submit Feedback</h3>
                    <div className="flex gap-1 mb-3">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <button
                          key={s}
                          type="button"
                          className="btn btn-ghost btn-sm"
                          onClick={() => setRating(s)}
                        >
                          <Star
                            className={`h-6 w-6 ${
                              s <= rating
                                ? "fill-warning text-warning"
                                : "text-base-content/30"
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                    <textarea
                      className="textarea textarea-bordered w-full mb-3"
                      placeholder="Optional feedback..."
                      value={feedbackComment}
                      onChange={(e) => setFeedbackComment(e.target.value)}
                    />
                    <button
                      className={`btn btn-primary btn-sm ${
                        feedbackLoading ? "loading" : ""
                      }`}
                      disabled={feedbackLoading || rating === 0}
                      onClick={handleSubmitFeedback}
                    >
                      Submit Feedback
                    </button>
                  </div>
                )}
                <div className="mt-4">
                  <button
                    className={`btn btn-warning btn-sm gap-2 ${
                      reopenLoading ? "loading" : ""
                    }`}
                    disabled={reopenLoading}
                    onClick={handleReopen}
                  >
                    <RotateCcw className="h-4 w-4" /> Reopen Grievance
                  </button>
                  <textarea
                    className="textarea textarea-bordered w-full mt-3 mb-2"
                    placeholder="Why are you reopening?"
                    value={reopenReason}
                    onChange={(e) => setReopenReason(e.target.value)}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* AI Analysis Tab */}
      {activeTab === "ai" && (
        <div className="card bg-base-100 shadow-sm border border-base-300">
          <div className="card-body">
            <h2 className="card-title gap-2">
              <Bot className="h-5 w-5 text-primary" /> AI Classification
            </h2>
            {ai ? (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {aiFields.map(([label, value]) => (
                    <div
                      key={label}
                      className="p-3 bg-base-200 rounded-xl"
                    >
                      <div className="text-xs text-base-content/60 uppercase">
                        {label}
                      </div>
                      <div className="font-semibold mt-1">{value || "—"}</div>
                    </div>
                  ))}
                </div>
                {ai.summary && (
                  <div>
                    <h3 className="font-semibold text-sm mb-1">Summary</h3>
                    <p className="text-sm bg-base-200 p-3 rounded-xl">
                      {ai.summary}
                    </p>
                  </div>
                )}
                {ai.explanation && (
                  <div>
                    <h3 className="font-semibold text-sm mb-1">Explanation</h3>
                    <p className="text-sm bg-base-200 p-3 rounded-xl">
                      {ai.explanation}
                    </p>
                  </div>
                )}
                <div className="text-xs text-base-content/40">
                  Model: {ai.modelName} v{ai.modelVersion}
                </div>
              </div>
            ) : (
              <p className="text-base-content/60">
                AI analysis not available.
              </p>
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
          </div>
        </div>
      )}

      {/* Attachments Tab */}
      {activeTab === "attachments" && (
        <div className="card bg-base-100 shadow-sm border border-base-300">
          <div className="card-body">
            <div className="flex items-center justify-between mb-4">
              <h2 className="card-title">Attachments</h2>
              <label
                className={`btn btn-primary btn-sm gap-2 ${
                  uploading ? "loading" : ""
                }`}
              >
                <Paperclip className="h-4 w-4" /> Upload
                <input
                  type="file"
                  className="hidden"
                  accept=".jpg,.jpeg,.png,.gif,.pdf,.doc,.docx"
                  onChange={handleUpload}
                  disabled={uploading}
                />
              </label>
            </div>
            {attachments.length === 0 ? (
              <p className="text-base-content/60 py-4">No attachments.</p>
            ) : (
              <div className="space-y-2">
                {attachments.map((a) => (
                  <div
                    key={a.id}
                    className="flex items-center justify-between p-3 bg-base-200 rounded-xl"
                  >
                    <div>
                      <div className="font-medium text-sm">{a.fileName}</div>
                      <div className="text-xs text-base-content/50">
                        {a.uploadedBy?.name} ·{" "}
                        {new Date(a.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                    <a
                      href={attachmentApi.downloadUrl(grievance.id, a.id)}
                      className="btn btn-ghost btn-sm"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Download className="h-4 w-4" />
                    </a>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
