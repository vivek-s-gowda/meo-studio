export interface PlatformInfo {
  os: 'macos-arm64' | 'macos-x64' | 'windows' | 'linux' | 'unknown';
  osName: string;
  recommendedFileName: string;
  recommendedLabel: string;
  iconType: 'apple' | 'windows' | 'linux' | 'monitor';
  architecture: string;
}

export function detectUserPlatform(): PlatformInfo {
  if (typeof window === 'undefined') {
    return {
      os: 'macos-arm64',
      osName: 'macOS',
      recommendedFileName: 'Meo Studio-0.1.0-alpha-arm64.dmg',
      recommendedLabel: 'Download for Mac (Apple Silicon)',
      iconType: 'apple',
      architecture: 'Apple Silicon (arm64)',
    };
  }

  const userAgent = navigator.userAgent.toLowerCase();
  const platform = (navigator.platform || '').toLowerCase();

  // 1. Detect macOS
  if (platform.includes('mac') || userAgent.includes('macintosh') || userAgent.includes('mac os x')) {
    // Check for Apple Silicon vs Intel
    let isAppleSilicon = true; // Modern Mac default

    try {
      // Check WebGL unmasked renderer for Apple M-series GPU
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      if (gl) {
        const debugInfo = (gl as any).getExtension('WEBGL_debug_renderer_info');
        if (debugInfo) {
          const renderer = (gl as any).getParameter(debugInfo.UNMASKED_RENDERER_WEBGL).toLowerCase();
          if (renderer.includes('intel')) {
            isAppleSilicon = false;
          } else if (renderer.includes('apple') || renderer.includes('m1') || renderer.includes('m2') || renderer.includes('m3') || renderer.includes('m4')) {
            isAppleSilicon = true;
          }
        }
      }
    } catch (e) {
      // Fallback
    }

    if (isAppleSilicon) {
      return {
        os: 'macos-arm64',
        osName: 'macOS (Apple Silicon)',
        recommendedFileName: 'Meo Studio-0.1.0-alpha-arm64.dmg',
        recommendedLabel: 'Download for macOS (Apple Silicon M1-M4)',
        iconType: 'apple',
        architecture: 'Apple Silicon (arm64)',
      };
    } else {
      return {
        os: 'macos-x64',
        osName: 'macOS (Intel)',
        recommendedFileName: 'Meo Studio-0.1.0-alpha-x64.dmg',
        recommendedLabel: 'Download for macOS (Intel x64)',
        iconType: 'apple',
        architecture: 'Intel (x64)',
      };
    }
  }

  // 2. Detect Windows
  if (platform.includes('win') || userAgent.includes('windows')) {
    return {
      os: 'windows',
      osName: 'Windows',
      recommendedFileName: 'Meo Studio Setup 0.1.0-alpha.exe',
      recommendedLabel: 'Download for Windows 10/11 (.exe)',
      iconType: 'windows',
      architecture: 'x64 (64-bit)',
    };
  }

  // 3. Detect Linux
  if (platform.includes('linux') || userAgent.includes('linux') || userAgent.includes('x11')) {
    return {
      os: 'linux',
      osName: 'Linux',
      recommendedFileName: 'Meo Studio-0.1.0-alpha.AppImage',
      recommendedLabel: 'Download for Linux (.AppImage)',
      iconType: 'linux',
      architecture: 'x64 / amd64',
    };
  }

  // Default fallback
  return {
    os: 'macos-arm64',
    osName: 'macOS',
    recommendedFileName: 'Meo Studio-0.1.0-alpha-arm64.dmg',
    recommendedLabel: 'Download for macOS',
    iconType: 'apple',
    architecture: 'Apple Silicon / Intel',
  };
}

export const ALL_DOWNLOADS = [
  {
    id: 'mac-arm64',
    platform: 'macOS Apple Silicon',
    badge: 'M1 / M2 / M3 / M4',
    fileName: 'Meo Studio-0.1.0-alpha-arm64.dmg',
    format: 'Apple Disk Image (.dmg)',
    icon: 'apple',
    size: '~108 MB',
    command: 'xattr -cr "/Applications/Meo Studio.app"',
  },
  {
    id: 'mac-universal',
    platform: 'macOS Universal',
    badge: 'All Macs',
    fileName: 'Meo Studio-0.1.0-alpha-universal.dmg',
    format: 'Universal DMG (.dmg)',
    icon: 'apple',
    size: '~185 MB',
    command: 'open "Meo Studio-0.1.0-alpha-universal.dmg"',
  },
  {
    id: 'mac-x64',
    platform: 'macOS Intel',
    badge: 'Intel x64',
    fileName: 'Meo Studio-0.1.0-alpha-x64.dmg',
    format: 'Apple Disk Image (.dmg)',
    icon: 'apple',
    size: '~112 MB',
    command: 'open "Meo Studio-0.1.0-alpha-x64.dmg"',
  },
  {
    id: 'windows-nsis',
    platform: 'Windows 10 / 11',
    badge: 'NSIS Installer',
    fileName: 'Meo Studio Setup 0.1.0-alpha.exe',
    format: 'Standard Installer (.exe)',
    icon: 'windows',
    size: '~96 MB',
    command: 'Start-Process "Meo Studio Setup 0.1.0-alpha.exe"',
  },
  {
    id: 'linux-appimage',
    platform: 'Linux Standalone',
    badge: 'Portable AppImage',
    fileName: 'Meo Studio-0.1.0-alpha.AppImage',
    format: 'Executable (.AppImage)',
    icon: 'linux',
    size: '~115 MB',
    command: 'chmod +x "Meo Studio-0.1.0-alpha.AppImage" && ./"Meo Studio-0.1.0-alpha.AppImage"',
  },
  {
    id: 'linux-deb',
    platform: 'Ubuntu / Debian',
    badge: 'Debian Package',
    fileName: 'meo_0.1.0-alpha_amd64.deb',
    format: 'Debian (.deb)',
    icon: 'linux',
    size: '~98 MB',
    command: 'sudo dpkg -i meo_0.1.0-alpha_amd64.deb',
  },
];
