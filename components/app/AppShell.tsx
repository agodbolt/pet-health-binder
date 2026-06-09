"use client";

import { ReactNode, useEffect, useRef, useState } from "react";
import { useConvexAuth, useQuery, useMutation } from "convex/react";
import { useAuthActions } from "@convex-dev/auth/react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { PetProvider, type PetDoc } from "./PetContext";
import { SidebarNav, BottomNav } from "./Nav";
import { PetSwitcher } from "./PetSwitcher";
import { BackupButtons } from "./BackupButtons";
import { UnlockButton } from "./UnlockButton";
import { AddPetForm } from "./AddPetForm";
import { LockGate } from "./LockOverlay";
import { TABS } from "./tabs";
import { Modal } from "../Modal";
import { Paw } from "../PawMotif";
import { CARE_TASK_SEEDS } from "@/lib/defaults";

function FullScreenMessage({ children }: { children: ReactNode }) {
  return (
    <div
      style={{ minHeight: "100vh", display: "grid", placeItems: "center", padding: 24 }}
    >
      <div className="center">
        <Paw size={40} color="var(--terracotta)" />
        <p className="muted" style={{ marginTop: 12 }}>
          {children}
        </p>
      </div>
    </div>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const { isLoading, isAuthenticated } = useConvexAuth();
  const router = useRouter();
  const search = useSearchParams();
  const pathname = usePathname();
  const { signOut } = useAuthActions();

  const user = useQuery(api.users.current, isAuthenticated ? {} : "skip");
  const pets = useQuery(api.pets.listMine, isAuthenticated ? {} : "skip") as
    | PetDoc[]
    | undefined;

  const ensureProfile = useMutation(api.users.ensureProfile);
  const loadSamplePet = useMutation(api.seed.loadSamplePet);
  const seedCareTasks = useMutation(api.careTasks.seedMany);

  const [showAdd, setShowAdd] = useState(false);
  const bootstrapped = useRef(false);
  const demoTried = useRef(false);

  // redirect unauthenticated visitors to login
  useEffect(() => {
    if (!isLoading && !isAuthenticated) router.replace("/login");
  }, [isLoading, isAuthenticated, router]);

  // create profile row on first authenticated load
  useEffect(() => {
    if (isAuthenticated && !bootstrapped.current) {
      bootstrapped.current = true;
      ensureProfile().catch(() => {});
    }
  }, [isAuthenticated, ensureProfile]);

  // ?demo=1 loads a sample pet once
  useEffect(() => {
    if (
      isAuthenticated &&
      search.get("demo") === "1" &&
      pets !== undefined &&
      !demoTried.current
    ) {
      demoTried.current = true;
      loadSamplePet().catch(() => {});
    }
  }, [isAuthenticated, search, pets, loadSamplePet]);

  if (isLoading || (isAuthenticated && (user === undefined || pets === undefined))) {
    return <FullScreenMessage>Opening your binder…</FullScreenMessage>;
  }
  if (!isAuthenticated) {
    return <FullScreenMessage>Taking you to the login page…</FullScreenMessage>;
  }

  const petList = pets ?? [];
  const activeId = (user?.activePetId as Id<"pets"> | null) ?? petList[0]?._id ?? null;
  const activePet = petList.find((p) => p._id === activeId) ?? petList[0] ?? null;
  const hasPaid = user?.hasPaid ?? false;

  async function handleAdded(petId: Id<"pets">) {
    setShowAdd(false);
    // seed default care tasks for the new pet's species
    const created = petList.find((p) => p._id === petId);
    const species = created?.species ?? "dog";
    try {
      await seedCareTasks({
        petId,
        tasks: CARE_TASK_SEEDS[species] ?? CARE_TASK_SEEDS.other,
      });
    } catch {
      /* seeding is best-effort */
    }
  }

  // ---- onboarding: no pets yet ----
  if (petList.length === 0) {
    return (
      <div style={{ minHeight: "100vh", display: "grid", placeItems: "center", padding: 24 }}>
        <div style={{ width: "100%", maxWidth: 480 }}>
          <div className="center" style={{ marginBottom: 18 }}>
            <Paw size={34} color="var(--terracotta)" />
            <h1 style={{ fontSize: "1.8rem", marginTop: 8 }}>
              Let&apos;s set up your first pet
            </h1>
            <p className="muted">
              Just a name and species to start — you can add photos, vaccines and
              everything else next.
            </p>
          </div>
          <div className="card card-pad-lg fadeup">
            <OnboardAddPet onDone={handleAdded} />
          </div>
          <p className="center faint" style={{ marginTop: 16, fontSize: "0.85rem" }}>
            Signed in as {user?.email}.{" "}
            <button className="linklike" onClick={() => signOut()}>
              Sign out
            </button>
          </p>
        </div>
      </div>
    );
  }

  return (
    <PetProvider
      value={{
        pet: activePet,
        pets: petList,
        weightUnit: (user?.weightUnit ?? "lb") as "lb" | "kg",
        currency: user?.currency ?? "$",
        hasPaid,
      }}
    >
      <div style={{ display: "flex", minHeight: "100vh" }}>
        <SidebarNav />
        <div className="grow" style={{ minWidth: 0 }}>
          {/* topbar */}
          <div
            className="app-topbar"
            data-noprint
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: 12,
              alignItems: "center",
              justifyContent: "space-between",
              padding: "14px 24px",
              borderBottom: "1px solid var(--line)",
              background: "rgba(255,253,249,0.85)",
              backdropFilter: "blur(6px)",
              position: "sticky",
              top: 0,
              zIndex: 30,
            }}
          >
            <PetSwitcher pets={petList} activeId={activeId} onAdd={() => setShowAdd(true)} />
            <div className="row gap-2 wrap">
              <BackupButtons pets={petList} />
              <button className="linklike faint" onClick={() => signOut()}>
                Sign out
              </button>
            </div>
          </div>

          {!hasPaid && (
            <div
              data-noprint
              className="row gap-2 wrap"
              style={{
                justifyContent: "space-between",
                background: "var(--terracotta-soft)",
                borderBottom: "1px solid var(--line)",
                padding: "10px 24px",
              }}
            >
              <span style={{ fontWeight: 500, color: "var(--terracotta-deep)" }}>
                You&apos;re trying the binder. Unlock every tab and unlimited pets
                for a one-time $19.
              </span>
              <UnlockButton />
            </div>
          )}

          <main className="app-main" style={{ padding: "24px", maxWidth: 1000 }}>
            {(() => {
              const tab = TABS.find((t) =>
                t.href === "/app" ? pathname === "/app" : pathname.startsWith(t.href)
              );
              // Dashboard (free) is always open; other tabs need purchase.
              if (tab && !tab.free) {
                return <LockGate title={tab.label}>{children}</LockGate>;
              }
              return children;
            })()}
          </main>
        </div>
      </div>
      <BottomNav />

      {showAdd && (
        <Modal title="Add a pet" onClose={() => setShowAdd(false)}>
          {!hasPaid && petList.length >= 1 ? (
            <div className="center">
              <p className="muted">
                Adding more than one pet is part of the full binder.
              </p>
              <UnlockButton block />
            </div>
          ) : (
            <AddPetForm onDone={handleAdded} />
          )}
        </Modal>
      )}
    </PetProvider>
  );
}

// Small wrapper so onboarding can seed care tasks too.
function OnboardAddPet({ onDone }: { onDone: (id: Id<"pets">) => void }) {
  return <AddPetForm onDone={onDone} submitLabel="Create my binder" />;
}
