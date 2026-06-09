# Internal build patterns (for tab pages)

All tab pages live at `app/app/<tab>/page.tsx`, are `"use client"`, and follow
the Dashboard (`app/app/page.tsx`) for structure, tone, and styling. **Read the
Dashboard before writing a tab.** Match its voice (warm, plain, never clinical).

## Getting the active pet + settings
```tsx
import { usePet } from "@/components/app/PetContext";
const { pet, weightUnit, currency } = usePet();
const petId = pet?._id;
const skip = petId ? { petId } : "skip";
if (!pet) return null;
```

## Data (reactive) + mutations
```tsx
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
const rows = useQuery(api.vaccines.list, skip) ?? [];
const add = useMutation(api.vaccines.add);
const update = useMutation(api.vaccines.update);
const remove = useMutation(api.vaccines.remove);
```

### Convex function signatures (args)
- `api.vaccines.list({petId})` · `.add({petId,name,dateGiven?,dueDate?,clinic?,lot?,notes?})` · `.update({id,...sameOptional})` · `.remove({id})`
- `api.vetVisits.list({petId})` (already reverse-chron) · `.add({petId,date,clinic?,reason?,diagnosis?,treatment?,cost?,followUpDate?,notes?})` · `.update({id,...})` · `.remove({id})`  — cost auto-creates an Expense row server-side; do NOT also add an expense.
- `api.weights.list({petId})` (chronological) · `.add({petId,date,weight,note?})` · `.update({id,date?,weight?,note?})` · `.remove({id})`
- `api.careTasks.list({petId})` · `.add({petId,name,intervalDays,lastDone?,notes?})` · `.update({id,name?,intervalDays?,lastDone?,notes?})` · `.markDone({id,date})` · `.remove({id})`
- `api.expenses.list({petId})` (reverse-chron) · `.add({petId,date,category,amount,note?})` · `.update({id,...})` · `.remove({id})`

IDs are typed `Id<"vaccines">` etc. from `@/convex/_generated/dataModel`. Row docs
also have `_id` and `_creationTime`.

## Pure helpers
- `@/lib/dates`: `today()`, `dueStatus(dueDate, today(), soonDays) -> {level,days}`, `daysUntil`, `addDays(date,n)`, `ageFromBirthday`.
- `@/lib/format`: `formatDate(d)`, `formatMoney(n,currency)`, `formatWeight(n,unit)`, `duePhrase(days)`.
- `@/lib/defaults`: `COMMON_VACCINES[species]` (string[]), `EXPENSE_CATEGORIES`, `CARE_TASK_SEEDS[species]`, `MED_FREQUENCIES`, `SPECIES_EMOJI`.

## UI components
- `import { Modal } from "@/components/Modal"` — `<Modal title onClose footer? wide?>`. Use for add/edit forms.
- `import { EmptyState } from "@/components/EmptyState"` — `<EmptyState emoji title>guidance text + maybe a button</EmptyState>`.
- `import { StatusChip } from "@/components/StatusChip"` — `<StatusChip level={DueLevel} days={number} />`.
- CSS classes (in globals.css): `.card`, `.card-pad-lg`, `.section-title`, `.btn`, `.btn-accent`, `.btn-ghost`, `.btn-sm`, `.btn-block`, `.chip`+`.chip-ok|amber|red|neutral`, `.table`, `.field`, `.field-row`, `.input`, `.select`, `.textarea`, `.muted`, `.faint`, `.row`, `.stack`, `.gap-1|2|3`, `.wrap`, `.grow`, `.empty`, `.fadeup`, `.eyebrow`, `.pill-toggle`.
- Colors via CSS vars: `--forest`, `--terracotta`, `--cream`, `--paper`, `--line`, `--red`, `--amber`, `--green-ok`, etc.

## Auto-open add modal from dashboard quick-add
Dashboard links to `/app/<tab>?add=1`. Each tab should open its add modal when
that param is present:
```tsx
import { useSearchParams } from "next/navigation";
const search = useSearchParams();
const [showAdd, setShowAdd] = useState(search.get("add") === "1");
```

## Page shell convention
```tsx
return (
  <div className="stack gap-3 fadeup">
    <div className="row" style={{ justifyContent: "space-between" }}>
      <div><span className="eyebrow">…</span><h1 style={{fontSize:"1.9rem"}}>Title</h1></div>
      <button className="btn btn-accent" onClick={() => setShowAdd(true)}>+ Add …</button>
    </div>
    {/* card with table or empty state */}
  </div>
);
```

## Rules
- Plain calendar dates are "YYYY-MM-DD" strings. Use `<input type="date">`.
- Money inputs: `<input type="number" step="0.01">`, store as number.
- Every list has a designed empty state with one line of guidance + the add button.
- No `next/image` for anything; use `<img>` if needed (with the eslint-disable line).
- No `alert()`/`confirm()` for primary flows — but a `confirm()` is acceptable for delete.
- Keep copy warm and plain. No "Lorem ipsum". No clinical jargon.
- Match Dashboard's spacing, radii, and chip usage exactly.
