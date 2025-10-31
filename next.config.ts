/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true, // Você pode ter outras configs aqui

  // --- ADICIONE ESTE BLOCO ---
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'via.placeholder.com',
      },
      { // --- ADICIONE ESTE BLOCO NOVO ---
        protocol: 'https',
        hostname: 'placehold.co',
      },
    ],
  },
  // --- FIM DO BLOCO ---
};

module.exports = nextConfig;