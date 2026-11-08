import { useLayoutEffect, useRef } from "react";

const compactHeight = 52;
const compactCrest = 32;
const scoreScale = 0.72;

export function useMatchBannerCollapse(detail: boolean, matchId: string, status?: string) {
  const ref = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    const banner = ref.current;
    const header = document.getElementById("club-header");
    if (!detail || !banner || !header) return;
    const mobile = window.matchMedia("(max-width: 599.95px)");
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const movers = Array.from(banner.querySelectorAll<HTMLElement>("[data-banner-move]"));
    const score = movers.find(node => node.dataset.bannerMove === "score");
    if (!score) return;
    let headerHeight = 0;
    let travel = 0;
    let frame = 0;

    function draw() {
      frame = 0;
      if (!mobile.matches || !banner || !travel) return;
      const progress = Math.max(0, Math.min(1, (headerHeight - banner.getBoundingClientRect().top) / travel));
      banner.style.setProperty("--collapse", String(reducedMotion.matches ? Number(progress >= 0.5) : progress));
      banner.dataset.detailsHidden = String(progress >= (reducedMotion.matches ? 0.5 : 0.75));
    }

    function schedule() {
      if (!frame) frame = requestAnimationFrame(draw);
    }

    function measure() {
      if (!mobile.matches || !banner || !header || !score) return;
      headerHeight = header.offsetHeight;
      travel = Math.max(1, banner.offsetHeight - compactHeight);
      banner.style.setProperty("--sticky-top", (headerHeight - travel) + "px");
      const center = banner.clientWidth / 2;
      const crestDistance = score.offsetWidth * scoreScale / 2 + 8 + compactCrest / 2;
      for (const node of movers) {
        const side = node.dataset.bannerMove;
        const targetX = center + (side === "left" ? -crestDistance : side === "right" ? crestDistance : 0);
        node.style.setProperty("--move-x", (targetX - node.offsetLeft - node.offsetWidth / 2) + "px");
        node.style.setProperty("--move-y", (banner.offsetHeight - compactHeight / 2 - node.offsetTop - node.offsetHeight / 2) + "px");
      }
      draw();
    }

    const observer = new ResizeObserver(measure);
    for (const node of [banner, header, ...movers]) observer.observe(node);
    measure();
    mobile.addEventListener("change", measure);
    reducedMotion.addEventListener("change", schedule);
    window.addEventListener("scroll", schedule, { passive: true });
    return () => {
      observer.disconnect();
      mobile.removeEventListener("change", measure);
      reducedMotion.removeEventListener("change", schedule);
      window.removeEventListener("scroll", schedule);
      cancelAnimationFrame(frame);
    };
  }, [detail, matchId, status]);
  return ref;
}
