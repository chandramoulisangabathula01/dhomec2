export default function AdminLoading() {
  return (
    <div className="space-y-8 animate-pulse">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-7 w-44 bg-slate-200 rounded-xl" />
          <div className="h-4 w-64 bg-slate-100 rounded-lg" />
        </div>
        <div className="h-10 w-32 bg-slate-200 rounded-xl" />
      </div>
      <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
        <div className="p-6 border-b border-slate-50">
          <div className="flex gap-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-9 w-24 bg-slate-100 rounded-xl" />
            ))}
          </div>
        </div>
        <div className="divide-y divide-slate-50">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex items-center gap-4 p-5">
              <div className="w-12 h-12 bg-slate-100 rounded-xl" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-40 bg-slate-100 rounded" />
                <div className="h-3 w-24 bg-slate-50 rounded" />
              </div>
              <div className="h-6 w-16 bg-slate-100 rounded-full" />
              <div className="h-8 w-20 bg-slate-100 rounded-lg" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
