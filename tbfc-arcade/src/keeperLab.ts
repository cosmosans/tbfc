import css from "./keeperLab.css?inline";

export function keeperControls(parent: HTMLElement, retry: () => void, exit: () => void) {
  const style = document.createElement("style");
  style.textContent = css;
  document.head.append(style);
  const panel = document.createElement("aside");
  panel.id = "keeper-lab";
  panel.innerHTML = `<strong role="status"></strong>
    <details><summary>Keeper test settings</summary>
    <label>Attack <select><option>Dribbling run</option><option>Low shot</option></select></label>
    <label>Box depth <input type="range" min="4" max="9" step=".1" value="5.4"><output>5.4</output></label>
    <label>Box half-width <input type="range" min="3" max="8" step=".1" value="4.6"><output>4.6</output></label>
    <button data-reset>Retry</button> <button data-exit>Back to Debug</button></details>`;
  parent.append(panel);
  const scenario = panel.querySelector("select")!;
  const [depth, width] = panel.querySelectorAll("input");
  const status = panel.querySelector("strong")!;
  for (const slider of [depth, width]) slider.oninput = () => {
    slider.nextElementSibling!.textContent = slider.value;
  };
  scenario.onchange = retry;
  panel.querySelector<HTMLButtonElement>("[data-reset]")!.onclick = retry;
  panel.querySelector<HTMLButtonElement>("[data-exit]")!.onclick = exit;
  return {
    get shot() { return scenario.selectedIndex === 1; },
    get depth() { return depth.valueAsNumber; },
    get width() { return width.valueAsNumber; },
    toggle() { scenario.selectedIndex = 1 - scenario.selectedIndex; retry(); },
    say(text: string) { status.textContent = text; },
  };
}
