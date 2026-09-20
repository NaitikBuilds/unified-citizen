import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, MessageSquare, Bot, Send, Clock, MapPin, AlertTriangle } from "lucide-react";
import { grievanceApi, commentApi } from "../../lib/api";
import StatusBadge from "../../components/StatusBadge";
import PriorityBadge from "../../components/PriorityBadge";
import LoadingSpinner from "../../components/LoadingSpinner";
import ErrorAlert from "../../components/ErrorAlert";
import { toast } from "sonner";
import type { Grievance, Comment } from "../../types";

type Tab = "info" | "comments" | "ai";
const S = { bg: "#111", border: "1px solid rgba(255,255,255,0.07)" };
const inputStyle = { background: "#111", border: "1px solid rgba(255,255,255,0.1)" };

export default function GrievanceDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [grievance, setGrievance] = useState<Grievance | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>("info");
  const [statusLoading, setStatusLoading] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [isInternal, setIsInternal] = useState(false);
  const [commentLoading, setCommentLoading] = useState(false);
  const [escalateLevel, setEscalateLevel] = useState("LEVEL_1");
  const [escalateReason, setEscalateReason] = useState("");
  const [escalateLoading, setEscalateLoading] = useState(false);

  const fetchGrievance = useCallback(async () => { if (!id) return; try { const { data } = await grievanceApi.getById(id); setGrievance(data.grievance); } catch { setError("Grievance not found"); } finally { setLoading(false); } }, [id]);
  const fetchComments = useCallback(async () => { if (!id) return; try { const { data } = await commentApi.list(id); setComments(data.comments); } catch { /* */ } }, [id]);

  useEffect(() => { fetchGrievance(); }, [fetchGrievance]);
  useEffect(() => { if (activeTab === "comments") fetchComments(); }, [activeTab, fetchComments]);

  const handleStatusUpdate = async (newStatus: string) => { if (!id) return; setStatusLoading(true); try { await grievanceApi.updateStatus(id, newStatus); toast.success(`Status updated to ${newStatus.replace(/_/g, " ")}`); fetchGrievance(); } catch { toast.error("Failed to update status"); } finally { setStatusLoading(false); } };
  const handleAddComment = async () => { if (!newComment.trim() || !id) return; setCommentLoading(true); try { await commentApi.create(id, newComment.trim(), isInternal); setNewComment(""); toast.success("Comment added"); fetchComments(); } catch { toast.error("Failed to add comment"); } finally { setCommentLoading(false); } };
  const handleEscalate = async () => { if (!id || !escalateReason.trim()) return; setEscalateLoading(true); try { await grievanceApi.escalate(id, escalateLevel, escalateReason); toast.success("Grievance escalated"); fetchGrievance(); } catch { toast.error("Failed to escalate"); } finally { setEscalateLoading(false); } };

  if (loading) return <LoadingSpinner />;
  if (error || !grievance) return <ErrorAlert message={error || "Not found"} />;
  const ai = grievance.aiClassification;
  const officerTransitions: Record<string, string[]> = { SUBMITTED: ["IN_PROGRESS"], AI_CLASSIFIED: ["IN_PROGRESS"], ASSIGNED: ["IN_PROGRESS"], IN_PROGRESS: ["RESOLVED"], REOPENED: ["IN_PROGRESS"] };
  const transitions = officerTransitions[grievance.status] || [];

  const tabs = [{ key: "info" as Tab, label: "Details" }, { key: "ai" as Tab, label: "AI Analysis" }, { key: "comments" as Tab, label: "Comments" }];

  return (
    <div className="max-w-4xl mx-auto">
      <button className="flex items-center gap-1 text-sm text-gray-400 hover:text-white transition mb-4" onClick={() => navigate(-1)}><ArrowLeft className="h-4 w-4" /> Back</button>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-3 mb-1"><span className="font-mono text-sm text-gray-500">{grievance.ticketId}</span><StatusBadge status={grievance.status} /><PriorityBadge priority={grievance.priority} /></div>
          <h1 className="text-2xl font-bold text-white">{grievance.title}</h1>
        </div>
      </div>

      {transitions.length > 0 && (
        <div className="flex items-center gap-3 p-4 rounded-2xl mb-6" style={{ background: "rgba(56,189,248,0.05)", border: "1px solid rgba(56,189,248,0.15)" }}>
          <AlertTriangle className="h-5 w-5 text-blue-400 shrink-0" />
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm text-gray-300">Update status:</span>
            {transitions.map((s) => <button key={s} className={`px-3 py-1.5 rounded-xl text-sm font-bold transition ${s === "RESOLVED" ? "bg-green-500 text-white hover:bg-green-600" : "bg-white text-black hover:bg-gray-200"} disabled:opacity-50`} disabled={statusLoading} onClick={() => handleStatusUpdate(s)}>{s.replace(/_/g, " ")}</button>)}
          </div>
        </div>
      )}

      <div className="flex gap-1 mb-6 p-1 rounded-xl" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
        {tabs.map((t) => <button key={t.key} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition ${activeTab === t.key ? "bg-white text-black" : "text-gray-400 hover:text-white"}`} onClick={() => setActiveTab(t.key)}>{t.key === "ai" && <Bot className="h-4 w-4" />}{t.key === "comments" && <MessageSquare className="h-4 w-4" />}{t.label}</button>)}
      </div>

      {activeTab === "info" && (
        <div className="rounded-2xl p-6" style={S}>
          <h2 className="text-lg font-bold text-white mb-3">Description</h2>
          <p className="text-gray-300 whitespace-pre-wrap text-sm leading-relaxed">{grievance.description}</p>
          <div className="my-5" style={{ borderTop: "1px solid rgba(255,255,255,0.07)" }} />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            {([ ["Category", grievance.category || "—"], ["Department", grievance.department?.name || "—"], ["Citizen", grievance.citizen?.name || "—"], ["Created", new Date(grievance.createdAt).toLocaleString()], grievance.address ? ["Location", grievance.address] : null ].filter(Boolean) as [string, string][]).map(([label, value]) => (
              <div key={label}><span className="text-gray-500 text-xs">{label}</span><div className="font-medium text-white mt-0.5 flex items-center gap-1">{label === "Created" && <Clock className="h-3 w-3" />}{label === "Location" && <MapPin className="h-3 w-3" />}{value}</div></div>
            ))}
          </div>
          <div className="my-5" style={{ borderTop: "1px solid rgba(255,255,255,0.07)" }} />
          <h3 className="font-semibold text-white mb-3">Escalate</h3>
          <div className="flex flex-col sm:flex-row gap-3">
            <select className="px-3 py-2 rounded-xl text-sm text-white focus:outline-none" style={inputStyle} value={escalateLevel} onChange={(e) => setEscalateLevel(e.target.value)}>
              <option value="LEVEL_1">Level 1</option><option value="LEVEL_2">Level 2</option><option value="LEVEL_3">Level 3</option><option value="ADMIN">Admin</option>
            </select>
            <input type="text" placeholder="Reason for escalation" className="flex-1 px-4 py-2 rounded-xl text-sm text-white placeholder:text-gray-600 focus:outline-none" style={inputStyle} value={escalateReason} onChange={(e) => setEscalateReason(e.target.value)} />
            <button className="px-4 py-2 rounded-xl text-sm font-bold text-yellow-400 transition disabled:opacity-50" style={{ background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.2)" }} disabled={escalateLoading || !escalateReason.trim()} onClick={handleEscalate}>Escalate</button>
          </div>
        </div>
      )}

      {activeTab === "ai" && (
        <div className="rounded-2xl p-6" style={S}>
          <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2"><Bot className="h-5 w-5" /> AI Classification</h2>
          {ai ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[["Category", ai.category], ["Priority", ai.priority], ["Sentiment", ai.sentiment], ["Severity", ai.severity], ["Confidence", ai.confidence != null ? `${(ai.confidence * 100).toFixed(0)}%` : "—"]].map(([label, value]) => (
                <div key={label} className="p-3 rounded-xl" style={{ background: "rgba(255,255,255,0.03)" }}>
                  <div className="text-[10px] uppercase tracking-wide text-gray-500">{label}</div>
                  <div className="font-semibold text-sm text-white mt-1">{value || "—"}</div>
                </div>
              ))}
              {ai.summary && <div className="sm:col-span-2"><h3 className="font-semibold text-sm text-white mb-1">Summary</h3><p className="text-sm text-gray-400 p-3 rounded-xl" style={{ background: "rgba(255,255,255,0.03)" }}>{ai.summary}</p></div>}
            </div>
          ) : <p className="text-gray-500">No AI analysis available.</p>}
        </div>
      )}

      {activeTab === "comments" && (
        <div className="rounded-2xl p-6" style={S}>
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
          <div className="flex flex-col gap-2">
            <div className="flex gap-2">
              <input type="text" placeholder="Add a comment..." className="flex-1 px-4 py-2.5 rounded-xl text-sm text-white placeholder:text-gray-600 focus:outline-none" style={inputStyle} value={newComment} onChange={(e) => setNewComment(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleAddComment()} />
              <button className="p-2.5 rounded-xl bg-white text-black hover:bg-gray-200 transition disabled:opacity-50" disabled={commentLoading || !newComment.trim()} onClick={handleAddComment}><Send className="h-4 w-4" /></button>
            </div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" className="w-4 h-4 rounded accent-yellow-400" checked={isInternal} onChange={(e) => setIsInternal(e.target.checked)} />
              <span className="text-sm text-gray-400">Internal note (not visible to citizen)</span>
            </label>
          </div>
        </div>
      )}
    </div>
  );
}
