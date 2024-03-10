import { defineConfig } from "vite";

import path from 'path'
import fs from 'fs'

function loadEnvOrDefault(name, defaultValue) {
    const envValue = process.env[name] || defaultValue;
    console.log(`[Env] ${name}: ${envValue}`);

    return envValue;
}

export default defineConfig(({ mode }) => {
    const BASE_URL = loadEnvOrDefault("BASE_URL", "http://localhost:3000")
    const MANAGE_API_URL = loadEnvOrDefault('MANAGE_API_URL', 'https://manage.dm.unipi.it/api/v0')

    return {
        define: {
            "process.env.NODE_ENV": JSON.stringify(mode),
            "process.env.BASE_URL": JSON.stringify(BASE_URL),
            "process.env.MANAGE_API_URL": JSON.stringify(MANAGE_API_URL),
        },
        server: {
            port: 3000,
        },
        build: {
            minify: mode === 'production' ? 'terser' : false,
            rollupOptions: {
                input: ['index.html', 'mappa.html', 'mappa2.html'],
            },
        },
        plugins: [gzipDevFix()],
    };
});

// vite automatically adds "Content-Encoding: gzip" to .gz files so the client
// automatically decompresses the file. GitHub pages instead just sends the
// file without that header so an actually compressed file arrives to the
// client.
// The following "gzipDevFix" vite plugin manually sends .gz files without that
// header to correctly use this during development.

/** @type {(baseUrl: string) => import('vite').Plugin} */
function gzipDevFix() {
    return {
        configureServer(server) {
            server.middlewares.use(async (req, res, next) => {
                if (req.method === "GET" && req.url.endsWith(".gz")) {
                    const gzFilePath = path.join(__dirname, "public", req.url);
                    if (fs.existsSync(gzFilePath)) {
                        const fileStream = fs.createReadStream(gzFilePath);
                        res.writeHead(200, { "Content-Type": "application/gzip" });

                        fileStream.pipe(res);
                    } else {
                        res.writeHead(404);
                        res.end("File not found");
                    }
                } else {
                    next();
                }
            });
        },
    };
}
