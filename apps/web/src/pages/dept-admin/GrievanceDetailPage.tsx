import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, MessageSquare, Bot, Send, Clock, MapPin, UserPlus } from "lucide-react";
import { grievanceApi, commentApi, userApi } from "../../lib/api";
import StatusBadge from "../../components/StatusBadge";
import PriorityBadge from "../../components/PriorityBadge";
import LoadingSpinner from "../../components/LoadingSpinner";
import ErrorAlert from "../../components/ErrorAlert";
import { toast } from "sonner";
import type { Grievance, Comment, User } from "../../types";

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
  const [officers, setOfficers] = useState<User[]>([]);
  const [selectedOfficer, setSelectedOfficer] = useState("");
  const [assignLoading, setAssignLoading] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [isInternal, setIsInternal] = useState(false);
  const [commentLoading, setCommentLoading] = useState(false);

  const fetchGrievance = useCallback(async () => { if (!id) return; try { const { data } = await grievanceApi.getById(id); setGrievance(data.grievance); } catch { setError("Grievance not found"); } finally { setLoading(false); } }, [id]);
  const fetchOfficers = useCallback(async () => { try { const { data } = await userApi.list(1, 100); setOfficers(data.users.filter((u) => u.role === "OFFICER")); } catch { /* */ } }, []);
  const fetchComments = useCallback(async () => { if (!id) return; try { const { data } = await commentApi.list(id); setComments(data.comments); } catch { /* */ } }, [id]);

  useEffect(() => { fetchGrievance(); fetchOfficers(); }, [fetchGrievance, fetchOfficers]);
  useEffect(() => { if (activeTab === "comments") fetchComments(); }, [activeTab, fetchComments]);

  const handleAssign = async () => { if (!id || !selectedOfficer) return; setAssignLoading(true); try { await grievanceApi.assign(id, selectedOfficer); toast.success("Grievance assigned successfully"); setSelectedOfficer(""); fetchGrievance(); } catch { toast.error("Failed to assign grievance"); } finally { setAssignLoading(false); } };
  const handleStatusUpdate = async (status: string) => { if (!id) return; try { await grievanceApi.updateStatus(id, status); toast.success(`Status updated to ${status.replace(/_/g, " ")}`); fetchGrievance(); } catch { toast.error("Failed to update status"); } };
  const handleAddComment = async () => { if (!newComment.trim() || !id) return; setCommentLoading(true); try { await commentApi.create(id, newComment.trim(), isInternal); setNewComment(""); toast.success("Comment added"); fetchComments(); } catch { toast.error("Failed to add comment"); } finally { setCommentLoading(false); } };

  if (loading) return <LoadingSpinner />;
  if (error || !grievance) return <ErrorAlert message={error || "Not found"} />;
  const ai = grievance.aiClassification;
  const deptTransitions: Record<string, string[]> = { SUBMITTED: ["IN_PROGRESS"], AI_CLASSIFIED: ["IN_PROGRESS"], IN_PROGRESS: ["RESOLVED", "REJECTED"], ESCALATED: ["IN_PROGRESS", "RESOLVED"], REOPENED: ["IN_PROGRESS"] };
  const transitions = deptTransitions[grievance.status] || [];
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

      {/* Assignment */}
      <div className="rounded-2xl p-4 mb-6" style={S}>
        <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2"><UserPlus className="h-4 w-4" /> Assign Officer</h3>
        <div className="flex gap-3">
          <select className="flex-1 px-4 py-2.5 rounded-xl text-sm text-white focus:outline-none" style={inputStyle} value={selectedOfficer} onChange={(e) => setSelectedOfficer(e.target.value)}>
            <option value="">Select an officer...</option>
            {officers.map((o) => <option key={o.id} value={o.id}>{o.name} ({o.email})</option>)}
          </select>
          <button className="px-4 py-2 rounded-xl text-sm font-bold bg-white text-black hover:bg-gray-200 transition disabled:opacity-50" disabled={assignLoading || !selectedOfficer} onClick={handleAssign}>Assign</button>
        </div>
      </div>

      {transitions.length > 0 && (
        <div className="flex items-center gap-3 p-4 rounded-2xl mb-6" style={{ background: "rgba(56,189,248,0.05)", border: "1px solid rgba(56,189,248,0.15)" }}>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm text-gray-300">Update status:</span>
            {transitions.map((s) => <button key={s} className={`px-3 py-1.5 rounded-xl text-sm font-bold transition ${s === "RESOLVED" || s === "REJECTED" ? "bg-green-500 text-white hover:bg-green-600" : "bg-white text-black hover:bg-gray-200"}`} onClick={() => handleStatusUpdate(s)}>{s.replace(/_/g, " ")}</button>)}
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
            {([ ["Category", grievance.category || "—"], ["Citizen", grievance.citizen?.name || "—"], ["Created", new Date(grievance.createdAt).toLocaleString()], grievance.address ? ["Location", grievance.address] : null ].filter(Boolean) as [string, string][]).map(([label, value]) => (
              <div key={label}><span className="text-gray-500 text-xs">{label}</span><div className="font-medium text-white mt-0.5 flex items-center gap-1">{label === "Created" && <Clock className="h-3 w-3" />}{label === "Location" && <MapPin className="h-3 w-3" />}{value}</div></div>
            ))}
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
          ) : <p className="text-gray-500">No AI analysis.</p>}
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
