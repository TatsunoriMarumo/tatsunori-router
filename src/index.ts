/**
 * src/index.ts
 * Cloudflare Worker — path-based reverse proxy
 */

interface Env {} // 環境変数を使う場合はここに追記

// 各オリジンのホスト名（プロトコルは後で統一して https に）
const BACKEND_API = 'spam-checker-erfw.onrender.com';
const SPAM_FRONTEND = 'spam-checker-frontend.netlify.app';
const PORTFOLIO_FRONT = 'your-portfolio.vercel.app';

export default {
	async fetch(request: Request, _env: Env, _ctx: ExecutionContext): Promise<Response> {
		// 受信 URL をコピーしてホスト名だけ後で差し替える
               const target = new URL(request.url);
               const path = target.pathname; // `/spam-checker/...` など

               // React Router SSR assets are requested from the root (e.g. `/__manifest`)
               if (path.startsWith('/__')) {
                       target.hostname = SPAM_FRONTEND;
                       target.protocol = 'https:';
                       target.port = '';

                       const spaReq = new Request(target.toString(), request);
                       return fetch(spaReq);
               }
		// ❶ FastAPI backend ---------------------------------------------------
		if (path.startsWith('/spam-checker/api')) {
			target.hostname = BACKEND_API;
			target.protocol = 'https:';
			target.port = '';

			// ← URL を差し替えた Request を新規に作る
			const backendReq = new Request(target.toString(), request);
			return fetch(backendReq);
		}

		// ❷ Spam-checker SPA --------------------------------------------------
		if (path.startsWith('/spam-checker')) {
			target.pathname = path.replace(/^\/spam-checker/, '') || '/';
			target.hostname = SPAM_FRONTEND;
			target.protocol = 'https:';
			target.port = '';

			const spaReq = new Request(target.toString(), request);
			return fetch(spaReq);
		}

		// ❸ Portfolio SPA ------------------------------------------------------
		if (path.startsWith('/portfolio')) {
			target.hostname = PORTFOLIO_FRONT;
			target.protocol = 'https:';
			target.port = '';
			return fetch(target.toString(), request);
		}

		// ❹ Fallback -----------------------------------------------------------
		return new Response('Not Found', { status: 404 });
	},
} satisfies ExportedHandler<Env>;
