import { ArrowRight, CirclePlus, Search, Trash2 } from "lucide-react";
import { useMemo } from "react";
import type {
  HealthState,
  RunUpdate,
} from "../../../../../packages/isaac-data/src/types";
import { useOracleStore } from "../app-shell/use-oracle-store";

export function LiveScreen() {
  const {
    run,
    items,
    startRun,
    endRun,
    removeItemFromRun,
    updateRun,
    setScreen,
  } = useOracleStore();
  const runItems = useMemo(
    () =>
      run?.collectibles
        .map((id) => items.find((item) => item.id === id))
        .filter((item) => item !== undefined) ?? [],
    [items, run],
  );

  if (!run) {
    return (
      <div className="flex min-h-full flex-1 items-center justify-center py-10">
        <div className="flex max-w-2xl flex-col items-center text-center">
          <img
            src="/assets/isaac-crying-grande.png"
            alt="Logo"
            className="h-24 w-24 object-contain"
          />
          <div className="mt-7 font-display text-[10px] uppercase tracking-wide text-oracle-blood-light">
            Registro manual · salvo localmente
          </div>
          <h1 className="mt-3 font-display text-2xl uppercase leading-relaxed tracking-wide text-oracle-ink">
            Uma nova run começa aqui
          </h1>
          <p className="mt-3 max-w-lg text-[15px] leading-7 text-oracle-muted">
            Acompanhe o andar, os recursos e os itens coletados. Atualize os
            dados enquanto joga e consulte cada item na busca.
          </p>
          <div className="mt-7 flex flex-wrap justify-center gap-3">
            <button
              type="button"
              onClick={() => void startRun()}
              className="flex items-center gap-2 rounded-[4px_15px_6px_12px] bg-oracle-blood px-5 py-3 font-display text-[10px] uppercase tracking-wide text-[#fff0dc] shadow-[0_3px_0_var(--oracle-shadow)] transition-colors hover:bg-oracle-blood-light"
            >
              <CirclePlus size={15} /> Nova run
            </button>
            <button
              type="button"
              onClick={() => setScreen("finder")}
              className="flex items-center gap-2 rounded-full px-5 py-3 font-display text-[10px] uppercase tracking-wide text-oracle-paper hover:bg-white/[0.05]"
            >
              <Search size={14} /> Buscar item
            </button>
          </div>
        </div>
      </div>
    );
  }

  const activeItem = items.find((item) => item.id === run.activeItem);

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="font-display text-[10px] uppercase tracking-wide text-oracle-blood-light">
            Registro manual · salvo localmente
          </div>
          <h1 className="mt-2 font-display text-[24px] uppercase leading-tight tracking-wide text-oracle-ink">
            Run em curso
          </h1>
        </div>
        <button
          type="button"
          onClick={() => void endRun()}
          className="rounded-full px-3 py-2 font-display text-[9px] uppercase tracking-wide text-oracle-muted transition-colors hover:bg-white/[0.05] hover:text-oracle-danger"
        >
          Encerrar run
        </button>
      </div>

      <div className="mb-6 flex flex-wrap items-center gap-x-6 gap-y-4 rounded-[5px_20px_8px_15px] bg-oracle-surface px-5 py-4">
        <RunTextField
          label="Personagem"
          value={run.character}
          onSave={(character) => void updateRun({ character })}
        />
        <RunTextField
          label="Andar"
          value={run.floor}
          onSave={(floor) => void updateRun({ floor })}
        />
        <RunNumberField
          label="Vermelhos"
          value={run.health?.redHearts}
          accent="text-oracle-blood-light"
          onSave={(value) =>
            updateHealth(updateRun, run.health, "redHearts", value)
          }
        />
        <RunNumberField
          label="Almas"
          value={run.health?.soulHearts}
          accent="text-oracle-soul"
          onSave={(value) =>
            updateHealth(updateRun, run.health, "soulHearts", value)
          }
        />
        <RunNumberField
          label="Pretos"
          value={run.health?.blackHearts}
          accent="text-oracle-paper"
          onSave={(value) =>
            updateHealth(updateRun, run.health, "blackHearts", value)
          }
        />
        <RunNumberField
          label="Moedas"
          value={run.coins}
          accent="text-oracle-special"
          onSave={(coins) => void updateRun({ coins })}
        />
        <RunNumberField
          label="Bombas"
          value={run.bombs}
          accent="text-oracle-muted"
          onSave={(bombs) => void updateRun({ bombs })}
        />
        <RunNumberField
          label="Chaves"
          value={run.keys}
          accent="text-oracle-special"
          onSave={(keys) => void updateRun({ keys })}
        />
        <div className="ml-auto flex min-w-[135px] items-center gap-2">
          {activeItem?.spritePath && (
            <img
              src={activeItem.spritePath}
              alt=""
              className="h-9 w-9 object-contain [image-rendering:pixelated]"
            />
          )}
          <div>
            <div className="font-display text-[9px] uppercase tracking-wide text-oracle-quiet">
              Itens na run · {runItems.length}
            </div>
            <div className="mt-1 max-w-32 truncate text-[12px] font-bold uppercase text-oracle-ink">
              {activeItem?.localizedName ?? activeItem?.name ?? "Não equipado"}
            </div>
          </div>
        </div>
      </div>

      <section className="flex min-h-0 flex-1 flex-col">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="font-display text-[11px] font-bold uppercase tracking-wide text-oracle-paper">
              Itens coletados
            </h2>
            <p className="mt-1 text-[13px] text-oracle-quiet">
              Sua pilha de cartas desta run
            </p>
          </div>
          <button
            type="button"
            onClick={() => setScreen("finder")}
            className="flex items-center gap-1 rounded-full px-3 py-2 font-display text-[9px] uppercase tracking-wide text-oracle-blood-light transition-colors hover:bg-white/[0.05]"
          >
            Buscar itens <ArrowRight size={12} />
          </button>
        </div>
        {runItems.length ? (
          <div className="grid grid-cols-1 gap-4 overflow-y-auto pb-3 md:grid-cols-2 2xl:grid-cols-3">
            {runItems.map((item) => (
              <article
                key={item.id}
                className="group flex min-w-0 items-center gap-3 overflow-hidden rounded-[4px_17px_7px_12px] bg-oracle-paper bg-[url('/assets/isaac-paper.png')] bg-cover p-3 text-oracle-paper-ink shadow-[0_4px_0_var(--oracle-shadow),0_8px_16px_#0004]"
              >
                <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-[3px_13px_5px_8px] bg-oracle-paper-shadow/70">
                  {item.spritePath ? (
                    <img
                      src={item.spritePath}
                      alt=""
                      className="h-full w-full object-contain [image-rendering:pixelated]"
                    />
                  ) : (
                    <span className="font-display text-[7px] uppercase text-oracle-paper-muted">
                      #{item.id}
                    </span>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="font-display text-[9px] uppercase tracking-wide text-oracle-paper-muted">
                    #{item.id} ·{" "}
                    {item.type === "active"
                      ? "Ativo"
                      : item.type === "familiar"
                        ? "Familiar"
                        : "Passivo"}
                  </div>
                  <div className="mt-1 truncate text-[14px] font-black uppercase">
                    {item.localizedName || item.name}
                  </div>
                  <div className="mt-1 line-clamp-2 text-[13px] leading-[1.4] text-oracle-paper-muted">
                    {item.localizedShortDescription ||
                      item.shortDescription ||
                      item.localizedDescription ||
                      item.description}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => void removeItemFromRun(item.id)}
                  aria-label={`Remover ${item.name}`}
                  className="ml-auto self-start rounded-full p-2 text-oracle-paper-muted transition-colors hover:bg-[#a13d34]/10 hover:text-oracle-blood"
                >
                  <Trash2 size={13} />
                </button>
              </article>
            ))}
          </div>
        ) : (
          <div className="flex flex-1 flex-col items-center justify-center p-8 text-center">
            <div className="font-display text-3xl text-oracle-quiet">✦</div>
            <p className="mt-3 font-display text-[10px] uppercase tracking-wide text-oracle-muted">
              Ainda não há itens nesta run
            </p>
            <button
              type="button"
              onClick={() => setScreen("finder")}
              className="mt-3 rounded-full px-4 py-2 font-display text-[9px] uppercase tracking-wide text-oracle-blood-light transition-colors hover:bg-white/[0.05]"
            >
              Buscar um item
            </button>
          </div>
        )}
      </section>
    </div>
  );
}

interface RunTextFieldProps {
  label: string;
  value?: string;
  onSave: (value: string | undefined) => void;
}

function RunTextField({ label, value, onSave }: RunTextFieldProps) {
  return (
    <label className="w-[118px] shrink-0">
      <span className="block font-display text-[8px] uppercase tracking-wide text-oracle-muted">
        {label}
      </span>
      <input
        key={`${label}-${value ?? ""}`}
        defaultValue={value ?? ""}
        onBlur={(event) => onSave(event.target.value.trim() || undefined)}
        placeholder="Preencher"
        className="mt-1 w-full border-b border-white/15 bg-transparent pb-1 text-[13px] font-bold text-oracle-ink outline-none placeholder:font-normal placeholder:text-oracle-quiet focus:border-oracle-blood-light"
      />
    </label>
  );
}

interface RunNumberFieldProps {
  label: string;
  value?: number;
  accent: string;
  onSave: (value: number | undefined) => void;
}

function RunNumberField({ label, value, accent, onSave }: RunNumberFieldProps) {
  return (
    <label className="min-w-[56px]">
      <span className="block whitespace-nowrap font-display text-[8px] uppercase tracking-wide text-oracle-muted">
        {label}
      </span>
      <input
        key={`${label}-${value ?? ""}`}
        type="number"
        min="0"
        step="1"
        defaultValue={value ?? ""}
        onBlur={(event) => {
          const parsed =
            event.target.value === "" ? undefined : Number(event.target.value);
          if (parsed === undefined || (Number.isInteger(parsed) && parsed >= 0))
            onSave(parsed);
        }}
        placeholder="—"
        className={`mt-1 w-full border-b border-white/15 bg-transparent pb-1 font-display text-[12px] outline-none placeholder:text-oracle-quiet focus:border-oracle-blood-light ${accent}`}
      />
    </label>
  );
}

function updateHealth(
  updateRun: (update: RunUpdate) => Promise<void>,
  health: HealthState | undefined,
  field: "redHearts" | "soulHearts" | "blackHearts",
  value: number | undefined,
) {
  void updateRun({
    health: {
      redHearts:
        field === "redHearts" ? (value ?? 0) : (health?.redHearts ?? 0),
      soulHearts:
        field === "soulHearts" ? (value ?? 0) : (health?.soulHearts ?? 0),
      blackHearts:
        field === "blackHearts" ? (value ?? 0) : (health?.blackHearts ?? 0),
    },
  });
}
