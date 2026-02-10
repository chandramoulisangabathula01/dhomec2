export default function ProductsLoading() {
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="pt-24 pb-6 bg-white border-b border-slate-100">
        <div className="container-width animate-pulse">
          <div className="h-4 w-32 bg-slate-100 rounded mb-4" />
          <div className="h-9 w-48 bg-slate-200 rounded-xl mb-2" />
          <div className="h-5 w-80 bg-slate-100 rounded-lg" />
        </div>
      </div>
      <div className="container-width py-12 animate-pulse">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div key={i} className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
              <div className="h-52 bg-slate-100" />
              <div className="p-5 space-y-3">
                <div className="h-3 w-16 bg-slate-100 rounded" />
                <div className="h-5 w-3/4 bg-slate-200 rounded" />
                <div className="h-3 w-full bg-slate-50 rounded" />
                <div className="flex justify-between items-center pt-2">
                  <div className="h-6 w-20 bg-slate-200 rounded" />
                  <div className="h-9 w-24 bg-slate-100 rounded-xl" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
