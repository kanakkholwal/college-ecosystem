import { Circle, Code, Layers, Palette, Square } from "lucide-react";
import "./floating-elements.css";

type FloatingElementsProps = {
  showImages?: boolean;
};

export const FloatingElements = ({ showImages }: FloatingElementsProps) => {
  return (
    <div className="pointer-events-none absolute inset-0 z-20">
      {/* Float 1 - Palette */}
      <div
        className="float float-1 border-primary/30 bg-primary/5 text-primary absolute top-[25%] left-[8%] flex h-16 w-16 items-center justify-center rounded-xl border shadow-sm backdrop-blur-sm"
        style={{ "--delay": "0s", "--duration": "8s" } as React.CSSProperties}
      >
        <Palette className="size-6" />
      </div>

      {/* Float 3 - Code */}
      <div
        className="float float-3 border-muted-foreground/20 bg-background/70 absolute bottom-[30%] left-[12%] flex h-16 w-16 items-center justify-center rounded-full border shadow-sm backdrop-blur-sm"
        style={
          { "--delay": "0.3s", "--duration": "10s" } as React.CSSProperties
        }
      >
        <Code className="text-muted-foreground size-6" />
      </div>

      {/* Float 6 - Layers */}
      <div
        className="float float-6 border-muted-foreground/10 bg-background/70 absolute top-[60%] left-[5%] flex h-24 w-24 items-center justify-center rounded-2xl border shadow-sm backdrop-blur-sm"
        style={
          { "--delay": "0.6s", "--duration": "12s" } as React.CSSProperties
        }
      >
        <Layers className="text-primary/80 size-8" />
      </div>

      {/* Float 2 - Grid */}
      <div
        className="float float-2 border-primary/20 bg-background/80 absolute top-[20%] right-[10%] flex h-20 w-20 items-center justify-center rounded-2xl border shadow-md backdrop-blur-sm"
        style={{ "--delay": "0.9s", "--duration": "8s" } as React.CSSProperties}
      >
        <div className="grid grid-cols-2 gap-1">
          <div className="bg-primary/30 size-4 rounded-sm"></div>
          <div className="bg-primary/20 size-4 rounded-sm"></div>
          <div className="bg-primary/10 size-4 rounded-sm"></div>
          <div className="bg-primary/40 size-4 rounded-sm"></div>
        </div>
      </div>

      {/* Float 4 - Portfolio Image */}
      {showImages && (
        <div
          className="float float-4 absolute right-[7%] bottom-[35%] h-28 w-28 overflow-hidden rounded-xl shadow-lg"
          style={
            { "--delay": "1.2s", "--duration": "10s" } as React.CSSProperties
          }
        >
          <img
            alt="Portfolio preview"
            loading="lazy"
            width="800"
            height="800"
            decoding="async"
            className="h-full w-full object-cover"
            src="https://images.unsplash.com/photo-1563089145-599997674d42?q=80&w=800&auto=format&fit=crop"
            style={{ color: "transparent" }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
        </div>
      )}

      {/* Float 5 - Bars */}
      <div
        className="float float-5 border-muted/30 bg-background/80 absolute top-[65%] right-[15%] flex h-16 w-36 flex-col justify-center rounded-lg border p-3 shadow-sm backdrop-blur-sm"
        style={
          { "--delay": "1.5s", "--duration": "12s" } as React.CSSProperties
        }
      >
        <div className="bg-primary/40 h-2 w-3/4 rounded-full"></div>
        <div className="bg-muted-foreground/30 mt-2 h-2 w-1/2 rounded-full"></div>
      </div>

      {/* Float 7 - Design Image */}
      {showImages && (
        <div
          className="float float-7 absolute top-[15%] left-[22%] h-20 w-20 overflow-hidden rounded-2xl shadow-lg"
          style={
            { "--delay": "1.8s", "--duration": "8s" } as React.CSSProperties
          }
        >
          <img
            alt="Design element"
            loading="lazy"
            width="800"
            height="800"
            decoding="async"
            className="h-full w-full object-cover"
            src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=800&auto=format&fit=crop"
            style={{ color: "transparent" }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>
        </div>
      )}

      {/* Float 8 - Dot */}
      <div
        className="float float-8 border-primary/20 bg-primary/10 absolute right-[25%] bottom-[15%] flex h-14 w-14 items-center justify-center rounded-full border shadow-sm backdrop-blur-sm"
        style={
          { "--delay": "2.1s", "--duration": "10s" } as React.CSSProperties
        }
      >
        <Square className="bg-primary/30 size-6 rounded-sm" />
      </div>

      {/* Float 9 - Square */}
      <div
        className="float float-9 border-muted/20 bg-background/60 absolute top-[40%] right-[2%] flex h-16 w-16 items-center justify-center rounded-lg border shadow-sm backdrop-blur-sm"
        style={
          { "--delay": "2.4s", "--duration": "12s" } as React.CSSProperties
        }
      >
        <Square className="bg-muted-foreground/20 h-8 w-8 rounded-md" />
      </div>

      {/* Float 10 - Small Dot */}
      <div
        className="float float-10 border-primary/30 bg-primary/5 absolute top-[5%] left-[40%] flex h-12 w-12 items-center justify-center rounded-full border shadow-sm backdrop-blur-sm"
        style={{ "--delay": "2.7s", "--duration": "8s" } as React.CSSProperties}
      >
        <Circle className="bg-primary/50 size-4 rounded-full" />
      </div>
    </div>
  );
};
