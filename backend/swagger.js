const CEDALO_MC_PROXY_PORT = process.env.CEDALO_MC_PROXY_PORT || 8088;
const CEDALO_MC_PROXY_HOST = process.env.CEDALO_MC_PROXY_HOST || 'localhost';

module.exports = {
  "openapi": "3.0.3",
  // "swagger": "2.0",
  "info": {
    "title": "Management Center REST API",
    "description": "API description for the Management Center.",
    "version": "2.0.0"
  },
  "host": `${CEDALO_MC_PROXY_HOST}:${CEDALO_MC_PROXY_PORT}`,
  "basePath": "/",
  "schemes": [
    "http",
    "https"
  ],
  "paths": {
  },
  "components": {
    "schemas": {
    },
    "errors": {
    }
  }
}
