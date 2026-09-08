import { NextRequest, NextResponse } from 'next/server';
import os from 'os';

function isLanIp(ip: string): boolean {
  if (ip.startsWith('192.168.')) return true;
  if (ip.startsWith('10.')) return true;
  if (/^172\.(1[6-9]|2[0-9]|3[0-1])\./.test(ip)) return true;
  return false;
}

function isVirtualOrDummy(name: string, ip: string): boolean {
  const lower = name.toLowerCase();
  if (
    lower.includes('topaz') ||
    lower.includes('loopback') ||
    lower.includes('vethernet') ||
    lower.includes('virtual') ||
    lower.includes('vmware') ||
    lower.includes('box') ||
    lower.includes('wsl') ||
    lower.includes('bluetooth') ||
    lower.includes('tap')
  ) {
    return true;
  }
  if (ip.startsWith('54.232.')) return true; // Topaz Warsaw virtual IP
  if (ip.startsWith('169.254.')) return true; // Link-local
  if (ip.startsWith('127.')) return true; // Loopback
  return false;
}

export async function GET(req: NextRequest) {
  try {
    const hostHeader = req.headers.get('host') || 'localhost:3000';
    const proto = req.headers.get('x-forwarded-proto') || 'http';
    const currentOrigin = `${proto}://${hostHeader}`;

    const interfaces = os.networkInterfaces();
    const candidateIps: { ip: string; name: string; isLan: boolean; isVirtual: boolean }[] = [];

    for (const name of Object.keys(interfaces)) {
      const netList = interfaces[name];
      if (netList) {
        for (const net of netList) {
          if (net.family === 'IPv4' && !net.internal) {
            candidateIps.push({
              ip: net.address,
              name,
              isLan: isLanIp(net.address),
              isVirtual: isVirtualOrDummy(name, net.address),
            });
          }
        }
      }
    }

    // Ordena priorizando:
    // 1º: IPs de rede local (LAN: 192.168.x.x, 10.x.x.x, etc.) em adaptadores reais
    // 2º: Outros IPs em adaptadores não virtuais
    // 3º: O restante
    candidateIps.sort((a, b) => {
      if (a.isLan && !a.isVirtual && (!b.isLan || b.isVirtual)) return -1;
      if (b.isLan && !b.isVirtual && (!a.isLan || a.isVirtual)) return 1;
      if (!a.isVirtual && b.isVirtual) return -1;
      if (a.isVirtual && !b.isVirtual) return 1;
      return 0;
    });

    // Porta atual
    const portMatch = hostHeader.match(/:(\d+)$/);
    const port = portMatch ? portMatch[1] : '3000';

    // Primeiro IP classificado
    const bestCandidate = candidateIps.find((c) => !c.isVirtual) || candidateIps[0];
    const primaryIp = bestCandidate ? bestCandidate.ip : 'localhost';
    const networkOrigin = `http://${primaryIp}:${port}`;

    const cleanAvailableIps = candidateIps.map((c) => c.ip);

    return NextResponse.json({
      success: true,
      currentOrigin,
      networkOrigin,
      isLocalhost: hostHeader.includes('localhost') || hostHeader.includes('127.0.0.1'),
      primaryIp,
      availableIps: cleanAvailableIps,
      adapterName: bestCandidate?.name || 'Local',
    });
  } catch (err: any) {
    return NextResponse.json({
      success: false,
      currentOrigin: 'http://localhost:3000',
      networkOrigin: 'http://localhost:3000',
      isLocalhost: true,
      primaryIp: 'localhost',
      availableIps: [],
    });
  }
}
