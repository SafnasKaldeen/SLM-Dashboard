export function getPingIconHtml(svg: string, color: string, pingColor: string): string {
  return `
    <div class="relative flex items-center justify-center w-6 h-6">
      <span class="absolute inline-flex h-full w-full rounded-full ${pingColor} opacity-75 animate-ping"></span>
      <span class="relative z-10 ${color}">
        ${svg}
      </span>
    </div>
  `;
}
