/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as auth from "../auth.js";
import type * as careTasks from "../careTasks.js";
import type * as expenses from "../expenses.js";
import type * as files from "../files.js";
import type * as helpers from "../helpers.js";
import type * as http from "../http.js";
import type * as medications from "../medications.js";
import type * as payments from "../payments.js";
import type * as pets from "../pets.js";
import type * as restore from "../restore.js";
import type * as seed from "../seed.js";
import type * as stripeNode from "../stripeNode.js";
import type * as users from "../users.js";
import type * as vaccines from "../vaccines.js";
import type * as vetVisits from "../vetVisits.js";
import type * as weights from "../weights.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  auth: typeof auth;
  careTasks: typeof careTasks;
  expenses: typeof expenses;
  files: typeof files;
  helpers: typeof helpers;
  http: typeof http;
  medications: typeof medications;
  payments: typeof payments;
  pets: typeof pets;
  restore: typeof restore;
  seed: typeof seed;
  stripeNode: typeof stripeNode;
  users: typeof users;
  vaccines: typeof vaccines;
  vetVisits: typeof vetVisits;
  weights: typeof weights;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
