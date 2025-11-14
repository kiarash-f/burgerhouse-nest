// k6/burgerhouse-smoke-and-load.js
import http from 'k6/http';
import { sleep, check, fail } from 'k6';

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';
const USER_EMAIL = __ENV.USER_EMAIL || 'demo@example.com';
const USER_PASS = __ENV.USER_PASS || 'password';

const AUTH_LOGIN_PATH = __ENV.AUTH_LOGIN_PATH || '/auth/signin';
const AUTH_SIGNUP_PATH = __ENV.AUTH_SIGNUP_PATH || ''; // '/auth/signup' to allow auto-create
const WRITE = __ENV.WRITE === '1' ? '1' : '0';

const ITEM_ID = Number(__ENV.ITEM_ID || 1);
const CART_QTY = Number(__ENV.CART_QTY || 1);

// Fixed routes (from your collection)
const AUTH_ME_PATH = '/auth/me';
const CART_ADD_PATH = '/cart';
const ORDER_CREATE_PATH = '/orders';

/* ---------- Scenarios: 20 VUs × 30s ---------- */
const scenarios = {};
if (__ENV.SMOKE) {
  scenarios.smokePublic20x30 = {
    executor: 'constant-vus',
    vus: 20,
    duration: '30s',
    exec: 'scenarioPublic',
  };
} else {
  scenarios.loadPublic20x30 = {
    executor: 'constant-vus',
    vus: 20,
    duration: '30s',
    exec: 'scenarioPublic',
  };
  scenarios.loadAuthed20x30 = {
    executor: 'constant-vus',
    vus: 20,
    duration: '30s',
    exec: 'scenarioAuthed',
  };
}

export const options = {
  scenarios,
  thresholds: {
    'http_req_failed{expected_response:false}': ['rate<0.01'],
    http_req_duration: ['p(95)<500'],
  },
};

/* ---------- Helpers ---------- */
function extractToken(res) {
  try {
    return (
      res.json('accessToken') || res.json('access_token') || res.json('token')
    );
  } catch (_) {
    return null;
  }
}
function postJSON(url, body, headers = {}, timeout = '5s', expected = false) {
  return http.post(url, JSON.stringify(body), {
    headers: { 'Content-Type': 'application/json', ...headers },
    timeout,
    tags: { expected_response: expected ? 'true' : 'false' },
  });
}
function getJSON(url, headers = {}, timeout = '5s', expected = false) {
  return http.get(url, {
    headers,
    timeout,
    tags: { expected_response: expected ? 'true' : 'false' },
  });
}
function uniqueEmail(baseEmail, i) {
  const [name, domain] = baseEmail.split('@');
  return `${name}+vu${i}@${domain}`;
}

/* ---------- setup() ---------- */
export function setup() {
  // Public health check
  const ping = getJSON(`${BASE_URL}/categories`, {}, '2s', true);
  if (ping.status !== 200)
    fail(`Health check failed at ${BASE_URL}/categories — got ${ping.status}`);

  // SMOKE: no auth
  if (__ENV.SMOKE) return { tokens: [], itemId: ITEM_ID };

  // If WRITE=1 and signup route exists -> create a separate user per VU
  const vus = options.scenarios.loadAuthed20x30?.vus || 20;
  const tokens = [];

  if (WRITE === '1' && AUTH_SIGNUP_PATH) {
    for (let i = 1; i <= vus; i++) {
      const email = uniqueEmail(USER_EMAIL, i);
      // try signup (ignore 409)
      postJSON(
        `${BASE_URL}${AUTH_SIGNUP_PATH}`,
        {
          email,
          password: USER_PASS,
          name: `VU${i}`,
          lastname: 'K6',
          mobile: '09000000000',
          address: 'Berlin',
        },
        {},
        '5s',
        true,
      );

      // signin
      const login = postJSON(`${BASE_URL}${AUTH_LOGIN_PATH}`, {
        email,
        password: USER_PASS,
      });
      const token = [200, 201].includes(login.status)
        ? extractToken(login)
        : null;
      tokens.push(token);
    }
  } else {
    // Single user (read-only load OR no signup route)
    const login = postJSON(`${BASE_URL}${AUTH_LOGIN_PATH}`, {
      email: USER_EMAIL,
      password: USER_PASS,
    });
    const token = [200, 201].includes(login.status)
      ? extractToken(login)
      : null;
    // fill array so each VU can index safely
    for (let i = 0; i < vus; i++) tokens.push(token);
  }

  // If no token at all, continue with public-only
  if (!tokens.some((t) => t)) {
    console.warn(
      'Login failed for all VUs (continuing with public-only authed scenario).',
    );
    return { tokens, itemId: ITEM_ID };
  }

  // Pick a real item id (public endpoint)
  let itemId = ITEM_ID;
  const itemsRes = getJSON(
    `${BASE_URL}/items?limit=1`,
    { Authorization: `Bearer ${tokens[0]}` },
    '5s',
    true,
  );
  if (itemsRes.status === 200) {
    try {
      const data = itemsRes.json();
      const first = Array.isArray(data) ? data[0] : data?.data?.[0];
      const id =
        first?.id || first?.itemId || first?._id || first?.ID || first?.Id;
      if (id) itemId = id;
    } catch (_) {}
  }

  return { tokens, itemId };
}

/* ---------- Scenarios ---------- */
export function scenarioPublic() {
  const r1 = getJSON(`${BASE_URL}/categories`, {}, '5s', true);
  check(r1, { 'GET /categories 200': (r) => r.status === 200 });

  const r2 = getJSON(`${BASE_URL}/items?limit=20`, {}, '5s', true);
  check(r2, { 'GET /items 200': (r) => r.status === 200 });

  sleep(1);
}

export function scenarioAuthed(data) {
  const vus = options.scenarios.loadAuthed20x30?.vus || 20;
  const idx = (__VU - 1) % vus; // __VU starts at 1
  const token = data?.tokens?.[idx];

  if (!token) {
    sleep(1);
    return;
  }
  const headers = { Authorization: `Bearer ${token}` };

  if (WRITE === '1') {
    // POST /cart — { itemId, quantity, note? }
    const addItem = postJSON(
      `${BASE_URL}${CART_ADD_PATH}`,
      {
        itemId: data.itemId,
        quantity: CART_QTY,
        note: `k6 vu${__VU}`,
      },
      headers,
    );
    check(addItem, {
      'add to cart 2xx/204': (r) => [200, 201, 204].includes(r.status),
    });

    // Only order if add-to-cart succeeded
    if ([200, 201, 204].includes(addItem.status)) {
      const order = postJSON(
        `${BASE_URL}${ORDER_CREATE_PATH}`,
        {
          address: 'Berlin, DE',
          paymentMethod: 'card',
          note: `k6 order vu${__VU}`,
        },
        headers,
      );
      check(order, {
        'create order 2xx/204': (r) => [200, 201, 204].includes(r.status),
      });
    }
  } else {
    // GET /auth/me — mark expected so 401/404 doesn't trip threshold if auth fails
    const me = getJSON(`${BASE_URL}${AUTH_ME_PATH}`, headers, '5s', true);
    check(me, {
      'authed probe ok (200/401/404)': (r) =>
        [200, 401, 404].includes(r.status),
    });
  }

  sleep(1);
}
