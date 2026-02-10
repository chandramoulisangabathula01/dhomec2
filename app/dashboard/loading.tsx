export default function DashboardLoading() {
  return (
    <div className="space-y-8 animate-pulse">
      {/* Header */}
      <div className="space-y-3">
        <div className="h-8 w-48 bg-slate-200 rounded-xl" />
        <div className="h-5 w-72 bg-slate-100 rounded-lg" />
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white rounded-2xl border border-slate-100 p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-slate-100 rounded-2xl" />
              <div className="space-y-2 flex-1">
                <div className="h-4 w-20 bg-slate-100 rounded" />
                <div className="h-7 w-12 bg-slate-200 rounded" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Content */}
      <div className="bg-white rounded-2xl border border-slate-100 p-8">
        <div className="h-6 w-32 bg-slate-200 rounded mb-6" />
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl">
              <div className="w-14 h-14 bg-slate-200 rounded-xl" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-3/4 bg-slate-100 rounded" />
                <div className="h-3 w-1/2 bg-slate-100 rounded" />
              </div>
              <div className="h-8 w-20 bg-slate-100 rounded-lg" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
