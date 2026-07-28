import { test, expect } from '@playwright/test';
import { TOTAL_RESULTS } from '../support/expected.js';

/**
 * The Augmented Search GraphQL API the module sits on.
 *
 * Kept separate from the UI specs so that a broken index and a broken UI produce different failures.
 * It also pins the permission model the module depends on: the connector is constructed with
 * `apiToken: 'none'` and rides the browser's own session, so LIVE is readable by guests while EDIT is
 * not — which is why the same component shows different results to an editor.
 *
 * Every request needs an `Origin` header matching the Jahia origin. Browsers add it automatically on
 * POST; Playwright's request context does not, and without it Jahia treats the call as
 * unauthenticated and answers "Permission denied" — an error that looks like a permissions problem
 * rather than a missing header.
 */

const SEARCH = (workspace: 'LIVE' | 'EDIT', term = '') => `
  query {
    search(q: "${term}", workspace: ${workspace}) {
      results(size: 5) {
        totalHits
        hits { displayableName link nodeType }
      }
    }
  }`;

test.describe('Augmented Search API', () => {
  test('answers a guest LIVE search', async ({ request, baseURL }) => {
    const response = await request.post('/modules/graphql', {
      headers: { 'Content-Type': 'application/json', Origin: baseURL! },
      data: { query: SEARCH('LIVE') },
    });

    expect(response.ok()).toBeTruthy();
    const body = await response.json();
    expect(body.errors, `unexpected errors: ${JSON.stringify(body.errors)}`).toBeUndefined();
    expect(body.data.search.results.totalHits).toBe(TOTAL_RESULTS);

    const [hit] = body.data.search.results.hits;
    expect(hit.displayableName).toBeTruthy();
    expect(hit.link).toMatch(/\.html$/);
    expect(hit.nodeType).toMatch(/^[a-z]+nt?:/i);
  });

  test('scores and orders hits for a term', async ({ request, baseURL }) => {
    const response = await request.post('/modules/graphql', {
      headers: { 'Content-Type': 'application/json', Origin: baseURL! },
      data: {
        query: `query {
          search(q: "digitall", workspace: LIVE) {
            results(size: 5) { totalHits hits { displayableName score } }
          }
        }`,
      },
    });

    const body = await response.json();
    expect(body.errors).toBeUndefined();
    const hits = body.data.search.results.hits as Array<{ score: number }>;
    expect(hits.length).toBeGreaterThan(1);
    // Relevance ordering: scores must be non-increasing.
    const scores = hits.map((h) => h.score);
    expect([...scores].sort((a, b) => b - a)).toEqual(scores);
  });

  test('returns nothing to a guest for the EDIT workspace', async ({ request, baseURL }) => {
    // Unauthenticated callers get an empty result set rather than an error — the same behaviour the
    // module relies on when rendered on a published page.
    const response = await request.post('/modules/graphql', {
      headers: { 'Content-Type': 'application/json', Origin: baseURL! },
      data: { query: SEARCH('EDIT') },
    });

    const body = await response.json();
    expect(body.data.search.results.hits).toEqual([]);
  });

  test('returns EDIT results to an authenticated editor', async ({ playwright, baseURL }) => {
    // Send Authorization EXPLICITLY rather than via Playwright's `httpCredentials`. Those are only
    // sent in response to a 401 challenge, and Jahia's GraphQL endpoint never challenges — it answers
    // 200 with an empty result set — so the credentials would never leave the client.
    const authorization =
      'Basic ' +
      Buffer.from(`root:${process.env.SUPER_USER_PASSWORD ?? 'root1234'}`).toString('base64');

    // A separate context so the guest tests above stay unauthenticated.
    const context = await playwright.request.newContext({ baseURL });
    const response = await context.post('/modules/graphql', {
      headers: { 'Content-Type': 'application/json', Origin: baseURL!, authorization },
      data: { query: SEARCH('EDIT') },
    });

    const body = await response.json();
    expect(body.errors, `unexpected errors: ${JSON.stringify(body.errors)}`).toBeUndefined();
    // EDIT sees at least everything LIVE does, plus anything unpublished.
    expect(body.data.search.results.totalHits).toBeGreaterThanOrEqual(TOTAL_RESULTS);
    expect(body.data.search.results.hits.length).toBeGreaterThan(0);

    await context.dispose();
  });

  test('rejects a request with no Origin header', async ({ playwright, baseURL }) => {
    // Pinned deliberately: this is the single most confusing failure mode when writing fixtures
    // against Jahia's GraphQL endpoint, and the error text points nowhere near the cause.
    const context = await playwright.request.newContext({ baseURL });
    const response = await context.post('/modules/graphql', {
      headers: { 'Content-Type': 'application/json' },
      data: { query: SEARCH('LIVE') },
    });

    const body = await response.json();
    expect(body.errors?.[0]?.message).toBe('Permission denied');
    expect(body.errors?.[0]?.extensions?.classification).toBe('GqlAccessDeniedException');

    await context.dispose();
  });
});
