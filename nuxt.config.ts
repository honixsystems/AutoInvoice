export default defineNuxtConfig({
	modules: [
		"@vueuse/nuxt",
		"@nuxt/ui",
		"nuxt-svgo",
		"reka-ui/nuxt",
		"@nuxt/eslint"
	],
	app: {
		head: {
			title: "AutoInvoice - Gestion de la facturation",
			charset: "utf-8",
			viewport: "width=device-width, initial-scale=1",
			meta: [
				{ name: "format-detection", content: "no" }
			]
		},
		pageTransition: {
			name: "page",
			mode: "out-in"
		},
		layoutTransition: {
			name: "layout",
			mode: "out-in"
		}
	},
	css: [
		"@/assets/css/main.css"
	],
	plugins: [
		"~/plugins/setup.client.ts"
	],
	icon: {
		customCollections: [
			{
				prefix: "local",
				dir: "./app/assets/icons"
			}
		],
		// Les icônes sont embarquées dans le build pour que l'application fonctionne
		// hors-ligne (sinon elles sont téléchargées depuis api.iconify.design).
		clientBundle: {
			scan: {
				globInclude: ["app/**/*.{vue,ts}", "plugins/**/*.ts"]
			},
			// Icônes utilisées en interne par les composants Nuxt UI
			icons: [
				"lucide:arrow-left",
				"lucide:arrow-right",
				"lucide:arrow-up-right",
				"lucide:check",
				"lucide:chevron-down",
				"lucide:chevron-left",
				"lucide:chevron-right",
				"lucide:chevron-up",
				"lucide:chevrons-left",
				"lucide:chevrons-right",
				"lucide:ellipsis",
				"lucide:folder",
				"lucide:folder-open",
				"lucide:minus",
				"lucide:plus",
				"lucide:refresh-cw",
				"lucide:search",
				"lucide:x"
			],
			includeCustomCollections: true
		}
	},
	svgo: {
		autoImportPath: "@/assets/"
	},
	ssr: false,
	dir: {
		modules: "app/modules"
	},
	imports: {
		presets: [
			{
				from: "zod",
				imports: [
					"z",
					{
						name: "infer",
						as: "zInfer",
						type: true
					}
				]
			}
		]
	},
	vite: {
		clearScreen: false,
		envPrefix: ["VITE_", "TAURI_"],
		server: {
			strictPort: true,
			hmr: {
				protocol: "ws",
				host: "0.0.0.0",
				port: 3001
			},
			watch: {
				ignored: ["**/src-tauri/**"]
			}
		}
	},
	devServer: {
		host: "0.0.0.0"
	},
	router: {
		options: {
			scrollBehaviorType: "smooth"
		}
	},
	eslint: {
		config: {
			standalone: false
		}
	},
	experimental: {
		typedPages: true
	},
	future: {
		compatibilityVersion: 4
	},
	devtools: {
		enabled: false
	},
	compatibilityDate: "2025-03-01"
});
