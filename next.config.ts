/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // --- SUBSTITUA SEU BLOCO 'images' POR ESTE ---
  images: {
    remotePatterns: [
      {
        // Permite qualquer imagem de qualquer site HTTP
        protocol: 'http',
        hostname: '**', // O '**' é um wildcard para "qualquer hostname"
      },
      {
        // Permite qualquer imagem de qualquer site HTTPS
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  // --- FIM DA SUBSTITUIÇÃO ---
};

module.exports = nextConfig;