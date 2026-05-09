import { db } from "@/lib/db";
import { MessageSquare } from "lucide-react";

export const metadata = { title: "Inquiries" };

export default async function AdminInquiriesPage() {
  const inquiries = await db.inquiry.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="p-8 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-2xl font-serif font-bold text-brown-dark">Inquiries</h1>
        <p className="text-sm text-gray-400 mt-1">{inquiries.length} total</p>
      </div>

      {inquiries.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-2xl p-12 flex flex-col items-center justify-center text-center">
          <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center text-gray-400 mb-4">
            <MessageSquare size={24} />
          </div>
          <h2 className="font-semibold text-brown-dark mb-2">No inquiries yet</h2>
          <p className="text-sm text-gray-400 max-w-sm">
            When customers submit the contact form, their messages will appear here.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {inquiries.map((inq) => (
            <div
              key={inq.id}
              className={`bg-white border rounded-2xl p-5 ${
                inq.isRead ? "border-gray-200" : "border-rose-gold/30 bg-rose-gold/5"
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-brown-dark">{inq.name}</span>
                    {!inq.isRead && (
                      <span className="text-[10px] font-bold uppercase tracking-wider text-rose-gold bg-rose-gold/10 px-2 py-0.5 rounded-full">
                        New
                      </span>
                    )}
                  </div>
                  <a
                    href={`tel:${inq.phone}`}
                    className="text-sm text-gray-500 hover:text-rose-gold transition-colors"
                  >
                    {inq.phone}
                  </a>
                  {inq.email && (
                    <span className="text-sm text-gray-400 ml-3">{inq.email}</span>
                  )}
                </div>
                <time className="text-xs text-gray-400 shrink-0">
                  {new Date(inq.createdAt).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </time>
              </div>
              <p className="mt-3 text-sm text-gray-600 whitespace-pre-wrap">{inq.message}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
