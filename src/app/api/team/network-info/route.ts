import { NextRequest, NextResponse } from 'next/server';
import os from 'os';

export async function GET(req: NextRequest) {
  try {
    const hostHeader = req.headers.get('host') || 'localhost:3000';
    const proto = req.headers.get('x-forwarded-proto') || 'http';
    const currentOrigin = `${proto}://${hostHeader}`;

    // Descobrir IPs locais ou externos disponíveis no host
    const interfaces = os.networkInterfaces();
    const networkIps: string[] = [];

    for (const name of Object.keys(interfaces)) {
      const netList = interfaces[name];
      if (netList) {
        for (const net of netList) {
          // Pega IPv4 não-interno
          if (net.family === 'IPv4' && !net.internal) {
            networkIps.push(net.address);
          }
        }
      }
    }

    // Porta atual
    const portMatch = hostHeader.match(/:(\d+)$/);
    const port = portMatch ? portMatch[1] : '3000';

    // Primeiro IP encontrado (ex: 54.232.189.113 ou 192.168.1.50)
    const primaryIp = networkIps[0] || 'localhost';
    const networkOrigin = `http://${primaryIp}:${port}`;

    return NextResponse.json({
      success: true,
      currentOrigin,
      networkOrigin,
      isLocalhost: hostHeader.includes('localhost') || hostHeader.includes('127.0.0.1'),
      primaryIp,
      availableIps: networkIps,
    });
  } catch (err: any) {
    return NextResponse.json({
      success: false,
      currentOrigin: 'http://localhost:3000',
      networkOrigin: 'http://localhost:3000',
      isLocalhost: true,
    });
  }
}
