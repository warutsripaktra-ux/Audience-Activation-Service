"use client";

import { useEffect, useState } from "react";
import axios from "axios";

export default function AudienceList() {
  const [audiences, setAudiences] = useState<any[]>([]);
  const [selectedAudience, setSelectedAudience] = useState<any | null>(null);
  const [customers, setCustomers] = useState<any[]>([]);
  const [messageContent, setMessageContent] = useState("");
  const [messages, setMessages] = useState<any[]>([]);
  const [selectedMessageId, setSelectedMessageId] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchAudiences = async () => {
    try {
      const res = await axios.get("http://localhost:3001/api/audiences");
      setAudiences(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAudiences();
  }, []);

  const handleSelectAudience = async (audience: any) => {
    setSelectedAudience(audience);
    try {
      const [custRes, msgRes] = await Promise.all([
        axios.get(`http://localhost:3001/api/audiences/${audience.id}/customers`),
        axios.get(`http://localhost:3001/api/audiences/${audience.id}/messages`),
      ]);
      setCustomers(custRes.data);
      setMessages(msgRes.data);
    } catch (e) {
      console.error(e);
    }
  };

  const handleCreateMessage = async () => {
    if (!messageContent) return;
    try {
      const res = await axios.post(`http://localhost:3001/api/audiences/${selectedAudience.id}/messages`, { content: messageContent });
      setMessages([...messages, res.data]);
      setMessageContent("");
    } catch (e) {
      console.error(e);
    }
  };

  const handleActivate = async () => {
    if (!selectedMessageId) return alert("Please select a message");
    try {
      await axios.post(`http://localhost:3001/api/audiences/${selectedAudience.id}/activate`, { messageId: selectedMessageId });
      alert("Activation Triggered!");
      // Refresh customers to show new activation statuses
      handleSelectAudience(selectedAudience);
    } catch (e) {
      console.error(e);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      {/* Sidebar for Audiences */}
      <div className="lg:col-span-4 space-y-6">
        <div className="bg-white/80 backdrop-blur-sm p-6 shadow-sm rounded-2xl border border-slate-200/60 transition-all duration-300">
          <h2 className="text-xl font-semibold mb-5 text-slate-800 flex items-center gap-2">
            <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
            Audiences
          </h2>
          <ul className="space-y-3">
            {audiences.map((aud) => (
              <li
                key={aud.id}
                className={`p-4 rounded-xl border cursor-pointer transition-all duration-200 group ${
                  selectedAudience?.id === aud.id 
                  ? 'bg-blue-50/50 border-blue-200 shadow-sm ring-1 ring-blue-500/20' 
                  : 'bg-white border-slate-100 hover:border-slate-200 hover:shadow-sm hover:-translate-y-0.5'
                }`}
                onClick={() => handleSelectAudience(aud)}
              >
                <div className={`font-medium transition-colors ${selectedAudience?.id === aud.id ? 'text-blue-700' : 'text-slate-700 group-hover:text-blue-600'}`}>
                  {aud.name}
                </div>
                <div className="text-sm text-slate-500 mt-1 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-300"></span>
                  {aud._count.customers} Customers
                </div>
              </li>
            ))}
            {audiences.length === 0 && (
              <div className="text-slate-500 text-sm text-center py-8">No audiences found.</div>
            )}
          </ul>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="lg:col-span-8 space-y-6">
        {selectedAudience ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Create Message Card */}
              <div className="bg-white/80 backdrop-blur-sm p-6 shadow-sm rounded-2xl border border-slate-200/60">
                <h2 className="text-lg font-semibold mb-4 text-slate-800">Create SMS Template</h2>
                <div className="flex flex-col gap-3">
                  <textarea
                    value={messageContent}
                    onChange={(e) => setMessageContent(e.target.value)}
                    className="w-full border border-slate-200 p-3 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all resize-none h-24 text-sm"
                    placeholder="Enter message content..."
                  />
                  <button 
                    onClick={handleCreateMessage} 
                    disabled={!messageContent}
                    className="self-end bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-5 py-2.5 rounded-xl font-medium shadow-sm hover:shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Save Template
                  </button>
                </div>
              </div>

              {/* Activate Card */}
              <div className="bg-white/80 backdrop-blur-sm p-6 shadow-sm rounded-2xl border border-slate-200/60 flex flex-col">
                <h2 className="text-lg font-semibold mb-4 text-slate-800">Activate Audience</h2>
                <div className="flex flex-col gap-4 flex-grow justify-center">
                  <select 
                    className="w-full border border-slate-200 p-3 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all bg-white text-sm"
                    value={selectedMessageId}
                    onChange={(e) => setSelectedMessageId(e.target.value)}
                  >
                    <option value="">-- Select a message template --</option>
                    {messages.map(m => (
                      <option key={m.id} value={m.id}>{m.content}</option>
                    ))}
                  </select>
                  <button 
                    onClick={handleActivate} 
                    disabled={!selectedMessageId}
                    className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white px-5 py-3 rounded-xl font-semibold shadow-sm hover:shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                    Trigger Activation
                  </button>
                </div>
              </div>
            </div>

            {/* Customers Table */}
            <div className="bg-white/80 backdrop-blur-sm shadow-sm rounded-2xl border border-slate-200/60 overflow-hidden">
              <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-white/50">
                <h2 className="text-lg font-semibold text-slate-800">Customers ({customers.length})</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead className="bg-slate-50/50">
                    <tr>
                      <th className="text-left py-3 px-6 font-medium text-slate-500 tracking-wider">Name</th>
                      <th className="text-left py-3 px-6 font-medium text-slate-500 tracking-wider">Phone</th>
                      <th className="text-left py-3 px-6 font-medium text-slate-500 tracking-wider">Segment ID</th>
                      <th className="text-left py-3 px-6 font-medium text-slate-500 tracking-wider">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {customers.map(c => (
                      <tr key={c.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="py-3 px-6 whitespace-nowrap font-medium text-slate-700">{c.name || 'N/A'}</td>
                        <td className="py-3 px-6 whitespace-nowrap text-slate-600">{c.phone}</td>
                        <td className="py-3 px-6 text-xs text-slate-400 font-mono">{c.segmentId}</td>
                        <td className="py-3 px-6">
                          {c.activations && c.activations.length > 0 ? (
                            <div className="flex flex-wrap gap-2">
                              {c.activations.map((act: any) => (
                                <span key={act.id} className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${
                                  act.status === 'SUCCESS' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                                  act.status === 'FAILED' ? 'bg-red-50 text-red-700 border-red-200' :
                                  'bg-amber-50 text-amber-700 border-amber-200'
                                }`}>
                                  {act.status === 'SUCCESS' && <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path></svg>}
                                  {act.status === 'FAILED' && <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"></path></svg>}
                                  {act.status}
                                </span>
                              ))}
                            </div>
                          ) : (
                            <span className="text-slate-400 text-xs italic">No activations</span>
                          )}
                        </td>
                      </tr>
                    ))}
                    {customers.length === 0 && (
                      <tr>
                        <td colSpan={4} className="py-8 text-center text-slate-500">
                          No customers in this audience.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        ) : (
          <div className="h-full flex flex-col items-center justify-center bg-white/50 backdrop-blur-sm rounded-2xl border border-slate-200/60 border-dashed p-12 text-slate-400">
            <svg className="w-16 h-16 mb-4 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122"></path></svg>
            <p className="text-lg font-medium">Select an audience to view details</p>
            <p className="text-sm mt-2">You can manage templates and trigger activations for the selected audience.</p>
          </div>
        )}
      </div>
    </div>
  );
}
