import { mutation } from "./_generated/server";
import { requireUser } from "./helpers";
import type { Id } from "./_generated/dataModel";

function iso(d: Date): string {
  return d.toISOString().slice(0, 10);
}
function offsetDays(days: number): string {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() + days);
  return iso(d);
}
function offsetMonths(months: number, day = 15): string {
  const d = new Date();
  d.setUTCMonth(d.getUTCMonth() + months, day);
  return iso(d);
}

/**
 * Load a fully-populated sample pet (Cooper) for the signed-in user so the
 * app can be explored / screenshotted. Idempotent: won't create duplicates.
 */
export const loadSamplePet = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await requireUser(ctx);
    const existing = await ctx.db
      .query("pets")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();
    if (existing.some((p) => p.isDemo)) {
      return existing.find((p) => p.isDemo)!._id;
    }

    const birthday = offsetMonths(-38, 4); // ~3 years, 2 months old
    const petId: Id<"pets"> = await ctx.db.insert("pets", {
      userId,
      name: "Cooper",
      species: "dog",
      breed: "Golden Retriever",
      birthday,
      microchip: "985112000123456",
      sitterSheet: {
        foodBrand: "Purina Pro Plan Salmon",
        foodAmount: "1.5 cups",
        feedingTimes: "7:30am and 6:00pm",
        walkRoutine:
          "Two walks a day — short one in the morning, a long 30-min one after dinner. He pulls toward squirrels.",
        litterRoutine: "",
        quirks:
          "Hides under the bed during thunderstorms. Will only eat if you sit nearby. Knows 'sit', 'paw', and 'leave it'.",
        vetName: "Maple Street Animal Hospital",
        vetPhone: "(555) 204-1180",
        emergencyVet: "Riverside 24hr Emergency Vet — (555) 911-0000",
        ownerName: "You",
        ownerPhone: "(555) 333-2121",
      },
      isDemo: true,
      createdAt: Date.now(),
    });

    // Vaccines — one overdue, one due soon, one current.
    await ctx.db.insert("vaccines", {
      petId,
      name: "Rabies",
      dateGiven: offsetMonths(-11),
      dueDate: offsetDays(-12),
      clinic: "Maple Street Animal Hospital",
      lot: "RB-22417",
      notes: "3-year vaccine.",
    });
    await ctx.db.insert("vaccines", {
      petId,
      name: "DHPP (Distemper/Hepatitis/Parvo/Parainfluenza)",
      dateGiven: offsetMonths(-12),
      dueDate: offsetDays(21),
      clinic: "Maple Street Animal Hospital",
      lot: "DH-90183",
    });
    await ctx.db.insert("vaccines", {
      petId,
      name: "Bordetella (Kennel Cough)",
      dateGiven: offsetMonths(-2),
      dueDate: offsetMonths(10),
      clinic: "Maple Street Animal Hospital",
      notes: "Required by boarding facility.",
    });

    // Medications
    const today = iso(new Date());
    const y1 = offsetDays(-1);
    const y2 = offsetDays(-2);
    await ctx.db.insert("medications", {
      petId,
      name: "Apoquel",
      dose: "16 mg",
      frequency: "twice daily",
      startDate: offsetMonths(-1),
      ongoing: true,
      refillBy: offsetDays(9),
      vet: "Dr. Patel",
      notes: "For seasonal allergies / itching.",
      instructions: "One tablet with breakfast and one with dinner.",
      archived: false,
      doseLog: {
        [y2]: [true, true],
        [y1]: [true, true],
        [today]: [true, false],
      },
    });
    await ctx.db.insert("medications", {
      petId,
      name: "Heartgard Plus",
      dose: "1 chew",
      frequency: "monthly",
      startDate: offsetMonths(-6),
      ongoing: true,
      refillBy: offsetDays(40),
      vet: "Dr. Patel",
      instructions: "Give one chew on the 1st of each month.",
      archived: false,
      doseLog: {},
    });
    await ctx.db.insert("medications", {
      petId,
      name: "Carprofen",
      dose: "75 mg",
      frequency: "twice daily",
      startDate: offsetMonths(-4),
      endDate: offsetMonths(-3),
      ongoing: false,
      vet: "Dr. Patel",
      notes: "Post-surgery pain relief. Course finished.",
      archived: true,
      doseLog: {},
    });

    // Vet visits
    await ctx.db.insert("vetVisits", {
      petId,
      date: offsetMonths(-1),
      clinic: "Maple Street Animal Hospital",
      reason: "Itching and ear discomfort",
      diagnosis: "Seasonal allergies",
      treatment: "Started Apoquel, cleaned ears",
      cost: 184.5,
      followUpDate: offsetDays(18),
      notes: "Recheck in 3 weeks to see if itching improves.",
    });
    await ctx.db.insert("vetVisits", {
      petId,
      date: offsetMonths(-4),
      clinic: "Maple Street Animal Hospital",
      reason: "Annual wellness exam",
      diagnosis: "Healthy",
      treatment: "Updated DHPP, bloodwork normal",
      cost: 312.0,
    });

    // Weights (trend)
    const weights: Array<[number, number, string?]> = [
      [-10, 64.2],
      [-8, 65.0],
      [-6, 66.1, "Switched to new food"],
      [-4, 65.4, "Post-surgery"],
      [-2, 66.8],
      [0, 67.3],
    ];
    for (const [m, w, note] of weights) {
      await ctx.db.insert("weights", {
        petId,
        date: offsetMonths(m),
        weight: w,
        note,
      });
    }

    // Care tasks
    await ctx.db.insert("careTasks", {
      petId,
      name: "Nail trim",
      intervalDays: 21,
      lastDone: offsetDays(-25),
    });
    await ctx.db.insert("careTasks", {
      petId,
      name: "Bath",
      intervalDays: 30,
      lastDone: offsetDays(-12),
    });
    await ctx.db.insert("careTasks", {
      petId,
      name: "Flea & tick treatment",
      intervalDays: 30,
      lastDone: offsetDays(-28),
    });
    await ctx.db.insert("careTasks", {
      petId,
      name: "Heartworm prevention",
      intervalDays: 30,
      lastDone: offsetDays(-2),
    });
    await ctx.db.insert("careTasks", {
      petId,
      name: "Teeth brushing",
      intervalDays: 2,
      lastDone: offsetDays(-3),
    });

    // Expenses across categories + months
    const expenses: Array<[number, string, number, string?]> = [
      [0, "Food", 62.99, "Monthly food bag"],
      [-1, "Vet", 184.5, "Allergy visit"],
      [-1, "Food", 62.99],
      [-1, "Grooming", 75.0, "Full groom"],
      [-2, "Food", 62.99],
      [-2, "Toys", 24.5, "New chew toys"],
      [-3, "Insurance", 45.0, "Monthly premium"],
      [-3, "Food", 58.99],
      [-4, "Vet", 312.0, "Annual exam"],
      [-4, "Food", 58.99],
      [-5, "Boarding", 220.0, "Weekend boarding"],
      [-6, "Food", 58.99],
    ];
    for (const [m, category, amount, note] of expenses) {
      await ctx.db.insert("expenses", {
        petId,
        date: offsetMonths(m),
        category,
        amount,
        note,
      });
    }

    // Make Cooper the active pet.
    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .unique();
    if (profile) await ctx.db.patch(profile._id, { activePetId: petId });

    return petId;
  },
});
