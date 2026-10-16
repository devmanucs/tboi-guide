import { BookOpen, Heart, Search } from "lucide-react";
import { useEffect } from "react";
import { CollectionScreen } from "../collection/collection-screen";
import { FinderScreen } from "../finder/finder-screen";
import { LiveScreen } from "../live/live-screen";
import { useOracleStore } from "./use-oracle-store";

const navigation = [
  { id: "live", label: "Live", detail: "Run atual", icon: Heart },
  { id: "finder", label: "Finder", detail: "Identificar item", icon: Search },
  { id: "collection", label: "Collection", detail: "Catálogo", icon: BookOpen },
] as const;

export function AppShell() {
  const { screen, setScreen, load, error, run } = useOracleStore();

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <div className="flex h-screen min-h-[620px] overflow-hidden bg-[#171a19] text-[#e9e9dc]">
      <aside className="flex w-[202px] shrink-0 flex-col bg-[#1c201e]">
        <div className="px-5 pb-5 pt-6">
          <div className="flex items-center gap-3">
            <img src="/assets/isaac-crying.png" alt="Logo" className="h-8 w-8 object-contain [image-rendering:pixelated]" />
            <div className="font-display text-[11px] leading-[1.55] text-[#f0eddf]">
              <div>The guide of</div>
              <div className="text-[#d86d5e]">Isaac</div>
            </div>
          </div>
        </div>

        <nav className="space-y-1 px-3 py-4" aria-label="Navegação principal">
          {navigation.map(({ id, label, detail, icon: Icon }, index) => (
            <button
              key={id}
              type="button"
              onClick={() => setScreen(id)}
              aria-current={screen === id ? "page" : undefined}
              className={`flex w-full items-center gap-3 rounded-[4px_18px_7px_15px] px-3 py-3 text-left transition-[background-color,color,transform] ${screen === id ? "bg-[#e9d7ad] text-[#20201b] shadow-[0_3px_0_#101211]" : "text-[#a5ada4] hover:translate-x-0.5 hover:bg-white/[0.035] hover:text-[#f0eddf]"}`}
            >
              <span
                className={`font-display text-[7px] ${screen === id ? "text-[#a64339]" : "text-[#66736c]"}`}
              >
                0{index + 1}
              </span>
              <Icon
                size={16}
                strokeWidth={1.8}
                className={screen === id ? "text-[#a64339]" : "text-[#929a91]"}
              />
              <span>
                <span className="block font-display text-[8px] uppercase tracking-wide">
                  {label}
                </span>
                <span
                  className={`mt-1 block text-[10px] ${screen === id ? "text-[#665c48]" : "text-[#7e8980]"}`}
                >
                  {detail}
                </span>
              </span>
            </button>
          ))}
        </nav>

        <div className="mt-auto px-5 py-4 text-[#87938b]">
          <div className="flex items-center gap-2 font-display text-[7px] uppercase tracking-wide">
            <span className="h-1.5 w-1.5 rounded-full bg-[#96b273]" /> Dados
            locais
          </div>
          <div className="mt-2 text-[10px] text-[#68736c]">
            {run ? "Run salva neste computador" : "Pronto para uma nova run"}
          </div>
        </div>
      </aside>

      <main className="oracle-paper-floor flex min-w-0 flex-1 flex-col overflow-hidden">
        <header className="flex h-12 shrink-0 items-center justify-between px-6 text-[#919c92]">
          <div className="font-display text-[9px] tracking-[0.12em]">
            THE BINDING OF ISAAC <span className="px-1 text-[#525b54]">/</span>{" "}
            REBIRTH + AFTERBIRTH+
          </div>
          <div className="flex items-center gap-2 font-display text-[9px] tracking-wide">
            <span className="h-1.5 w-1.5 rounded-full bg-[#96b273]" /> Guia
            offline
          </div>
        </header>
        <section className="flex min-h-0 flex-1 flex-col overflow-y-auto px-6 pb-6 pt-4 xl:px-8">
          {error && (
            <div
              role="alert"
              className="mb-4 flex items-center gap-2 rounded-[3px_12px_5px_9px] bg-[#482a27] px-4 py-2.5 text-[14px] text-[#ffc5b3] shadow-[0_2px_0_#0d0f0e]"
            >
              <span className="font-display text-[10px] text-[#ff8b76]">!</span>
              {error}
            </div>
          )}
          {screen === "finder" && <FinderScreen />}
          {screen === "collection" && <CollectionScreen />}
          {screen === "live" && <LiveScreen />}
        </section>
      </main>
    </div>
  );
}
