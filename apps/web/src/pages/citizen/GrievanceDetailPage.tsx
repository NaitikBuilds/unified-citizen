import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, MessageSquare, Paperclip, Star, RotateCcw, Bot, Send, Download, Clock, MapPin } from "lucide-react";
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
  const [attachments, setAttachments] = useState<Array<{ id: string; fileName: string; fileType: string | null; fileSize: number | null; createdAt: string; uploadedBy?: { name: string } }>>([]);
  const [uploading, setUploading] = useState(false);
  const [rating, setRating] = useState(0);
  const [feedbackComment, setFeedbackComment] = useState("");
  const [feedbackLoading, setFeedbackLoading] = useState(false);
  const [existingFeedback, setExistingFeedback] = useState(false);
  const [reopenReason, setReopenReason] = useState("");
  const [reopenLoading, setReopenLoading] = useState(false);

  const fetchGrievance = useCallback(async () => { if (!id) return; try { const { data } = await grievanceApi.getById(id); setGrievance(data.grievance); } catch { setError("Grievance not found"); } finally { setLoading(false); } }, [id]);
  const fetchComments = useCallback(async () => { if (!id) return; try { const { data } = await commentApi.list(id); setComments(data.comments); } catch { /* */ } }, [id]);
  const fetchAttachments = useCallback(async () => { if (!id) return; try { const { data } = await attachmentApi.list(id); setAttachments(data.attachments); } catch { /* */ } }, [id]);
  const fetchFeedback = useCallback(async () => { if (!id) return; try { const { data } = await feedbackApi.list(id); setExistingFeedback(data.feedback.length > 0); } catch { /* */ } }, [id]);

  useEffect(() => { fetchGrievance(); }, [fetchGrievance]);
  useEffect(() => { if (activeTab === "comments") fetchComments(); if (activeTab === "attachments") fetchAttachments(); if (grievance?.status === "RESOLVED") fetchFeedback(); }, [activeTab, fetchComments, fetchAttachments, fetchFeedback, grievance?.status]);

  const handleAddComment = async () => { if (!newComment.trim() || !id) return; setCommentLoading(true); try { await commentApi.create(id, newComment.trim()); setNewComment(""); toast.success("Comment added"); fetchComments(); } catch { toast.error("Failed to add comment"); } finally { setCommentLoading(false); } };
  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => { const file = e.target.files?.[0]; if (!file || !id) return; setUploading(true); try { await attachmentApi.upload(id, file); toast.success("File uploaded"); fetchAttachments(); } catch { toast.error("Upload failed"); } finally { setUploading(false); } };
  const handleSubmitFeedback = async () => { if (!id || rating === 0) return; setFeedbackLoading(true); try { await feedbackApi.create(id, rating, feedbackComment || undefined); toast.success("Feedback submitted"); setExistingFeedback(true); } catch { toast.error("Failed to submit feedback"); } finally { setFeedbackLoading(false); } };
  const handleReopen = async () => { if (!id) return; setReopenLoading(true); try { await grievanceApi.reopen(id, reopenReason || undefined); toast.success("Grievance reopened"); fetchGrievance(); } catch { toast.error("Failed to reopen grievance"); } finally { setReopenLoading(false); } };

  if (loading) return <LoadingSpinner />;
  if (error || !grievance) return <ErrorAlert message={error || "Not found"} />;
  const ai = grievance.aiClassification;
  const aiFields = [["Category", ai?.category], ["Priority", ai?.priority], ["Sentiment", ai?.sentiment], ["Severity", ai?.severity], ["Confidence", ai?.confidence != null ? `${(ai.confidence * 100).toFixed(0)}%` : null], ["Duplicate Score", ai?.duplicateScore != null ? `${(ai.duplicateScore * 100).toFixed(0)}%` : null]];

  const tabs = [{ key: "info" as Tab, label: "Details" }, { key: "ai" as Tab, label: "AI Analysis" }, { key: "comments" as Tab, label: "Comments" }, { key: "attachments" as Tab, label: "Files" }];
  const cardStyle = { background: "#111", border: "1px solid rgba(255,255,255,0.07)" };
  const inputStyle = { background: "#111", border: "1px solid rgba(255,255,255,0.1)" };

  return (
    <div className="max-w-4xl mx-auto">
      <button className="flex items-center gap-1 text-sm text-gray-400 hover:text-white transition mb-4" onClick={() => navigate(-1)}><ArrowLeft className="h-4 w-4" /> Back</button>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <span className="font-mono text-sm text-gray-500">{grievance.ticketId}</span>
            <StatusBadge status={grievance.status} />
            <PriorityBadge priority={grievance.priority} />
          </div>
          <h1 className="text-2xl font-bold text-white">{grievance.title}</h1>
        </div>
      </div>

      <div className="flex gap-1 mb-6 p-1 rounded-xl" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
        {tabs.map((t) => (
          <button key={t.key} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition ${activeTab === t.key ? "bg-white text-black" : "text-gray-400 hover:text-white"}`} onClick={() => setActiveTab(t.key)}>
            {t.key === "ai" && <Bot className="h-4 w-4" />}{t.key === "comments" && <MessageSquare className="h-4 w-4" />}{t.key === "attachments" && <Paperclip className="h-4 w-4" />}{t.label}
          </button>
        ))}
      </div>

      {activeTab === "info" && (
        <div className="rounded-2xl p-6" style={cardStyle}>
          <h2 className="text-lg font-bold text-white mb-3">Description</h2>
          <p className="text-gray-300 whitespace-pre-wrap text-sm leading-relaxed">{grievance.description}</p>
          <div className="my-5" style={{ borderTop: "1px solid rgba(255,255,255,0.07)" }} />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            {([ ["Category", grievance.category || "—"], ["Department", grievance.department?.name || "—"], ["Created", grievance.createdAt], grievance.address ? ["Location", grievance.address] : null, grievance.resolvedAt ? ["Resolved", grievance.resolvedAt] : null ].filter(Boolean) as [string, string][]).map(([label, value]) => (
              <div key={label}><span className="text-gray-500 text-xs">{label}</span><div className="font-medium text-white mt-0.5 flex items-center gap-1">{label === "Created" && <Clock className="h-3 w-3" />}{label === "Location" && <MapPin className="h-3 w-3" />}{typeof value === "string" && (label === "Created" || label === "Resolved") ? new Date(value).toLocaleString() : value}</div></div>
            ))}
          </div>
          {grievance.status === "RESOLVED" && (
            <div className="mt-6" style={{ borderTop: "1px solid rgba(255,255,255,0.07)", paddingTop: "1.5rem" }}>
              {!existingFeedback && (
                <div>
                  <h3 className="font-semibold text-white mb-3">Submit Feedback</h3>
                  <div className="flex gap-1 mb-3">{[1, 2, 3, 4, 5].map((s) => <button key={s} type="button" onClick={() => setRating(s)}><Star className={`h-6 w-6 ${s <= rating ? "fill-yellow-400 text-yellow-400" : "text-gray-600"}`} /></button>)}</div>
                  <textarea className="w-full px-4 py-3 rounded-xl text-sm text-white placeholder:text-gray-600 focus:outline-none resize-none mb-3" style={inputStyle} placeholder="Optional feedback..." value={feedbackComment} onChange={(e) => setFeedbackComment(e.target.value)} />
                  <button className="px-4 py-2 rounded-xl text-sm font-bold bg-white text-black hover:bg-gray-200 transition disabled:opacity-50" disabled={feedbackLoading || rating === 0} onClick={handleSubmitFeedback}>Submit Feedback</button>
                </div>
              )}
              <div className="mt-4">
                <button className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-yellow-400 transition disabled:opacity-50" style={{ background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.2)" }} disabled={reopenLoading} onClick={handleReopen}><RotateCcw className="h-4 w-4" /> Reopen Grievance</button>
                <textarea className="w-full px-4 py-3 rounded-xl text-sm text-white placeholder:text-gray-600 focus:outline-none resize-none mt-3" style={inputStyle} placeholder="Why are you reopening?" value={reopenReason} onChange={(e) => setReopenReason(e.target.value)} />
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === "ai" && (
        <div className="rounded-2xl p-6" style={cardStyle}>
          <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2"><Bot className="h-5 w-5" /> AI Classification</h2>
          {ai ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {aiFields.map(([label, value]) => (
                  <div key={label} className="p-3 rounded-xl" style={{ background: "rgba(255,255,255,0.03)" }}>
                    <div className="text-[10px] uppercase tracking-wide text-gray-500">{label}</div>
                    <div className="font-semibold text-sm text-white mt-1">{value || "—"}</div>
                  </div>
                ))}
              </div>
              {ai.summary && <div><h3 className="font-semibold text-sm text-white mb-1">Summary</h3><p className="text-sm text-gray-400 p-3 rounded-xl" style={{ background: "rgba(255,255,255,0.03)" }}>{ai.summary}</p></div>}
              {ai.explanation && <div><h3 className="font-semibold text-sm text-white mb-1">Explanation</h3><p className="text-sm text-gray-400 p-3 rounded-xl" style={{ background: "rgba(255,255,255,0.03)" }}>{ai.explanation}</p></div>}
              <div className="text-xs text-gray-600">Model: {ai.modelName} v{ai.modelVersion}</div>
            </div>
          ) : <p className="text-gray-500">AI analysis not available.</p>}
        </div>
      )}

      {activeTab === "comments" && (
        <div className="rounded-2xl p-6" style={cardStyle}>
          <h2 className="text-lg font-bold text-white mb-4">Comments</h2>
          {comments.length === 0 ? <p className="text-gray-500 py-4">No comments yet.</p> : (
            <div className="space-y-3 mb-6">
              {comments.map((c) => (
                <div key={c.id} className={`p-3 rounded-xl ${c.isInternal ? "border border-yellow-500/20" : ""}`} style={{ background: c.isInternal ? "rgba(245,158,11,0.05)" : "rgba(255,255,255,0.03)" }}>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-sm text-white">{c.user?.name || "Unknown"}</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded text-gray-400" style={{ background: "rgba(255,255,255,0.05)" }}>{c.user?.role}</span>
                    {c.isInternal && <span className="text-[10px] px-1.5 py-0.5 rounded text-yellow-400" style={{ background: "rgba(245,158,11,0.1)" }}>Internal</span>}
                    <span className="text-xs text-gray-600 ml-auto">{new Date(c.createdAt).toLocaleString()}</span>
                  </div>
                  <p className="text-sm text-gray-300">{c.message}</p>
                </div>
              ))}
            </div>
          )}
          <div className="flex gap-2">
            <input type="text" placeholder="Add a comment..." className="flex-1 px-4 py-2.5 rounded-xl text-sm text-white placeholder:text-gray-600 focus:outline-none" style={inputStyle} value={newComment} onChange={(e) => setNewComment(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleAddComment()} />
            <button className="p-2.5 rounded-xl bg-white text-black hover:bg-gray-200 transition disabled:opacity-50" disabled={commentLoading || !newComment.trim()} onClick={handleAddComment}><Send className="h-4 w-4" /></button>
          </div>
        </div>
      )}

      {activeTab === "attachments" && (
        <div className="rounded-2xl p-6" style={cardStyle}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-white">Attachments</h2>
            <label className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-sm font-bold bg-white text-black hover:bg-gray-200 transition cursor-pointer ${uploading ? "opacity-50" : ""}`}><Paperclip className="h-4 w-4" /> Upload<input type="file" className="hidden" accept=".jpg,.jpeg,.png,.gif,.pdf,.doc,.docx" onChange={handleUpload} disabled={uploading} /></label>
          </div>
          {attachments.length === 0 ? <p className="text-gray-500 py-4">No attachments.</p> : (
            <div className="space-y-2">
              {attachments.map((a) => (
                <div key={a.id} className="flex items-center justify-between p-3 rounded-xl" style={{ background: "rgba(255,255,255,0.03)" }}>
                  <div><div className="font-medium text-sm text-white">{a.fileName}</div><div className="text-xs text-gray-500">{a.uploadedBy?.name} · {new Date(a.createdAt).toLocaleDateString()}</div></div>
                  <a href={attachmentApi.downloadUrl(grievance.id, a.id)} className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 transition" target="_blank" rel="noopener noreferrer"><Download className="h-4 w-4" /></a>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
