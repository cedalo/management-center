const esbuild = require('esbuild');
const fs = require('fs');
const path = require('path');

const indexHTML = fs.readFileSync(path.join(__dirname, 'public/index.html')).toString();

const ENTRYPOINT = path.relative('', path.join(__dirname, '../frontend/src/index.js'));

const plugins = [
	{
		name: 'my-plugin',
		setup(build) {
			build.onEnd((result) => {
				// console.log(Object.entries(result.metafile.outputs));
				if (result.metafile && result.metafile.outputs) {
					const [mainBundle, { cssBundle }] = Object.entries(result.metafile.outputs).find(
						([k, v]) => v.entryPoint === ENTRYPOINT.split(path.sep).join(path.posix.sep)
					);
					// fs.writeFileSync('metafile.json', JSON.stringify(result.metafile));

					if (result.errors.length === 0) {
						const updatedIndexHtml = indexHTML
							.replace(
								/<script defer="defer" src="\/static\/js\/main[^>]*>/,
								`<script defer="defer" src="${mainBundle.replace(
									/.*public\/static\//,
									'/static/'
								)}"></script>`
							)
							.replace(
								/<link href="\/static\/css\/main[^>]*>/,
								`<link href="${cssBundle.replace(
									/.*public\/static\//,
									'/static/'
								)}" rel="stylesheet" />`
							);
						fs.writeFile(path.join(__dirname, 'public/index.html'), updatedIndexHtml, () => {});
					}
				}
			});
		}
	}
];

const define = {
	'process.env.PUBLIC_URL': process.env.PUBLIC_URL || '""',
	'process.env.CEDALO_MC_BROKER_CONNECTION_HOST_MAPPING': `"${process.env.CEDALO_MC_BROKER_CONNECTION_HOST_MAPPING}"` || '""',
	'process.env.CEDALO_MC_BROKER_CONNECTION_MQTT_EXISTS_MAPPING': `"${process.env.CEDALO_MC_BROKER_CONNECTION_MQTT_EXISTS_MAPPING}"` || '""',
	'process.env.CEDALO_MC_BROKER_CONNECTION_MQTTS_EXISTS_MAPPING': `"${process.env.CEDALO_MC_BROKER_CONNECTION_MQTTS_EXISTS_MAPPING}"` || '""',
	'process.env.CEDALO_MC_BROKER_CONNECTION_WS_EXISTS_MAPPING': `"${process.env.CEDALO_MC_BROKER_CONNECTION_WS_EXISTS_MAPPING}"` || '""',
	'process.env.MOSQUITTO_PROXY_URL': process.env.MOSQUITTO_PROXY_URL || '""'
};

const run = async () => {
	const context = await esbuild.context({
		entryPoints: [ENTRYPOINT],
		sourcemap: true,
		outdir: path.join(__dirname, 'public'),
		bundle: true,
		minify: true,
		entryNames: 'static/[ext]/main',
		assetNames: 'static/media/[name]',
		chunkNames: 'static/[ext]/[name]',
		target: ['chrome96', 'firefox96'],
		plugins,
		loader: {
			'.svg': 'file',
			'.js': 'jsx'
		},
		define,
		metafile: true
		// keepNames: true,
	});
	context.watch();
};

run();
