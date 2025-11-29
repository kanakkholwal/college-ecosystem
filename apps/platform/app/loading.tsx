import { ApplicationInfo } from "@/components/logo";
import "./loading.css";

export default function RootLoading() {
  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-background text-foreground">
      
      <div className="absolute inset-0 z-0 bg-[radial-gradient(#80808012_1px,transparent_1px)] [background-size:24px_24px] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,#000_70%,transparent_100%)]" />

      <div className="relative z-10 flex flex-col items-center gap-12">
        
        {/* 2. Logo Section */}
        <div className="fade-in-up relative flex flex-col items-center gap-6" style={{ animationDelay: "0.1s" }}>
          <div className="relative">
            <div className="absolute inset-0 scale-150 bg-primary/20 blur-2xl rounded-full animate-pulse" />
            
            <ApplicationInfo 
              className="relative scale-150" 
              imgClassName="animate-pulse duration-[3000ms]" 
            />
          </div>
        </div>

        {/* 3. Progress Section */}
        <div className="fade-in-up flex flex-col items-center gap-3" style={{ animationDelay: "0.2s" }}>
            
            <div className="relative h-0.5 w-48 overflow-hidden rounded-full bg-muted">
                <div className="absolute inset-y-0 left-0 h-full w-full bg-gradient-to-r from-transparent via-primary to-transparent animate-loader-smooth opacity-80" />
            </div>

            <p className="text-[10px] font-mono font-medium uppercase tracking-[0.2em] text-muted-foreground/60 animate-pulse">
                Initializing Environment
            </p>
        </div>

      </div>

      <div className="absolute bottom-8 text-[10px] text-muted-foreground/40 font-mono">
        v2.0.0
      </div>
    </div>
  );
}