/**
 * tatsu-router/src/index.ts
 * Cloudflare Worker (TypeScript) – パスベース振り分け
 */

interface Env {} // 今回は環境変数を使わない

// 転送先ホスト（プロトコル込みで書くと楽）
const BACKEND_API = 'https://spam-checker-erfw.onrender.com';
const SPAM_FRONTEND = 'https://spam-checker-frontend.netlify.app';
const PORTFOLIO_FRONT = 'https://YOUR-PORTFOLIO.vercel.app';

export default {
	async fetch(request: Request, _env: Env, _ctx: ExecutionContext): Promise<Response> {
		const url = new URL(request.url);
		const path = url.pathname + url.search; 

		/* ──────────────────────────────────────────────────────────── */
		/* 1. FastAPI バックエンド                                      */
		/*    /spam-checker/api/...  → Render                           */
		/* ──────────────────────────────────────────────────────────── */
		if (path.startsWith('/spam-checker/api')) {
			// Backend 側は /api から始まる想定なので /spam-checker を剥がす
			return fetch(`${BACKEND_API}${path}`, request);
		}

		/* ──────────────────────────────────────────────────────────── */
		/* 2. スパムチェッカー SPA                                     */
		/*    /spam-checker/...       → Netlify 等                     */
		/* ──────────────────────────────────────────────────────────── */
		if (path.startsWith('/spam-checker')) {
			return fetch(`${SPAM_FRONTEND}${path}`, request);
		}

		/* ──────────────────────────────────────────────────────────── */
		/* 3. ポートフォリオ SPA                                       */
		/*    /portfolio/...          → Vercel 等                      */
		/* ──────────────────────────────────────────────────────────── */
		if (path.startsWith('/portfolio')) {
			return fetch(`${PORTFOLIO_FRONT}${path}`, request);
		}

		/* ──────────────────────────────────────────────────────────── */
		/* 4. それ以外 = 404                                           */
		/* ──────────────────────────────────────────────────────────── */
		return new Response('Not Found', { status: 404 });
	},
} satisfies ExportedHandler<Env>;
