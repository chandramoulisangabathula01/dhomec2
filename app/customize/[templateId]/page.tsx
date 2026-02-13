import { Button } from "@/components/ui/button";
import { ArrowLeft, Grip, Save } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";

export default async function CustomizePage({ params }: { params: Promise<{ templateId: string }> }) {
  const { templateId } = await params;

  // Ideally, here we would call a Server Action to:
  // 1. Authenticate with Zakeke API using Client ID/Secret
  // 2. Create a generic design session for this Template ID
  // 3. Get a unique URL (e.g. https://portal.zakeke.com/customizer/TOKEN)
  const zakekeUrl = `https://portal.zakeke.com/composers/Configurator/Index?template=${templateId}`; // Placeholder

  return (
    <div className="fixed inset-0 bg-white z-50 flex flex-col">
      {/* Header */}
      <div className="h-16 border-b border-slate-200 flex items-center justify-between px-6 bg-white shrink-0">
         <div className="flex items-center gap-4">
             <Link href="/products">
                <Button variant="ghost" size="icon" className="rounded-full hover:bg-slate-100">
                    <ArrowLeft className="w-5 h-5 text-slate-600" />
                </Button>
             </Link>
             <div>
                <h1 className="text-sm font-black text-slate-900 uppercase tracking-widest">3D Configurator</h1>
                <p className="text-xs text-slate-400 font-medium">Template: {templateId}</p>
             </div>
         </div>
         
         <div className="flex items-center gap-2">
             <Button variant="outline" className="gap-2 font-bold text-xs uppercase tracking-widest hidden md:flex">
                 <Grip className="w-4 h-4" /> Reset
             </Button>
             <Button className="gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs uppercase tracking-widest shadow-lg shadow-indigo-500/20">
                 <Save className="w-4 h-4" /> Save Design
             </Button>
         </div>
      </div>

      {/* Configurator Area */}
      <div className="flex-1 bg-slate-50 relative">
          <iframe 
             src={zakekeUrl}
             className="w-full h-full border-0"
             allowFullScreen
             allow="camera; microphone; vr; xr-spatial-tracking"
          />
          
          {/* Fallback / Note for User */}
          <div className="absolute inset-0 -z-10 flex items-center justify-center text-slate-400">
              <div className="text-center p-8">
                  <p className="mb-2">Loading Zakeke Interface...</p>
                  <p className="text-xs">If this frame remains blank, please verify your Zakeke URL configuration.</p>
              </div>
          </div>
      </div>
    </div>
  );
}
