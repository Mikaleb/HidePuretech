import { HP_CLASS, HP_SPINNER_ID, HP_HIDE_CLASS, HP_PLACEHOLDER_CLASS, HP_REHIDE_BTN_CLASS, HP_STYLE_ID } from "./constants";

export function injectStyle(hideCompletely: boolean) {
  if (document.getElementById(HP_STYLE_ID)) {
    const existingStyle = document.getElementById(HP_STYLE_ID);
    if (existingStyle) existingStyle.remove();
  }
  const style = document.createElement("style");
  style.id = HP_STYLE_ID;
  
  // Grey-out style should ALWAYS be available if disabled
  style.textContent = `
    .${HP_CLASS}, [data-hp-disabled="true"] {
      opacity: 0.35 !important;
      filter: grayscale(100%) !important;
      pointer-events: none !important;
    }
    .${HP_CLASS} *, [data-hp-disabled="true"] * {
      text-decoration: line-through !important;
    }
  `;

  if (hideCompletely) {
    style.textContent += `
      .${HP_HIDE_CLASS}:not([data-hp-user-show="true"]) {
        display: none !important;
      }
    `;
  }
  style.textContent += `
    .${HP_PLACEHOLDER_CLASS} {
      display: flex !important;
      align-items: center !important;
      height: 28px !important;
      padding: 0 12px !important;
      margin: 8px 0 !important;
      background: rgba(242, 69, 53, 0.03) !important;
      border: 1px dashed rgba(242, 69, 53, 0.3) !important;
      border-radius: 6px !important;
      cursor: pointer !important;
      transition: all 0.2s ease !important;
      color: #666 !important;
      font-size: 11px !important;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif !important;
      user-select: none !important;
      width: 100% !important;
      box-sizing: border-box !important;
    }
    .${HP_PLACEHOLDER_CLASS}:hover {
      background: rgba(242, 69, 53, 0.08) !important;
      border-color: rgba(242, 69, 53, 0.5) !important;
    }
    .${HP_PLACEHOLDER_CLASS} img {
      width: 14px !important;
      height: 14px !important;
      margin-right: 8px !important;
      opacity: 0.7 !important;
    }
    .hp-placeholder-line {
      flex-grow: 1 !important;
      height: 1px !important;
      background: linear-gradient(90deg, rgba(242, 69, 53, 0.2) 0%, rgba(242, 69, 53, 0) 100%) !important;
      margin: 0 12px !important;
    }
    .hp-placeholder-btn {
      color: #f24535 !important;
      font-weight: 600 !important;
      text-transform: uppercase !important;
      letter-spacing: 0.5px !important;
      font-size: 10px !important;
      padding: 2px 6px !important;
      border-radius: 4px !important;
    }
    .hp-placeholder-btn:hover {
      background: rgba(242, 69, 53, 0.1) !important;
    }
    .${HP_REHIDE_BTN_CLASS} {
      position: absolute !important;
      top: 8px !important;
      right: 8px !important;
      z-index: 9999 !important;
      background: #f24535 !important;
      color: white !important;
      padding: 4px 12px !important;
      border-radius: 6px !important;
      font-size: 11px !important;
      font-weight: 700 !important;
      cursor: pointer !important;
      border: none !important;
      box-shadow: 0 4px 12px rgba(242, 69, 53, 0.3) !important;
      transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1) !important;
      opacity: 0 !important;
      pointer-events: none !important;
      text-transform: uppercase !important;
      letter-spacing: 0.5px !important;
    }
    /* Revealed state aesthetic */
    [data-hp-user-show="true"] {
      position: relative !important;
      opacity: 0.8 !important;
      filter: grayscale(30%) !important;
      background: rgba(242, 69, 53, 0.04) !important;
      border: 2px dashed rgba(242, 69, 53, 0.3) !important;
      border-radius: 12px !important;
      pointer-events: auto !important;
      transition: all 0.3s ease !important;
    }
    [data-hp-user-show="true"] * {
      text-decoration: none !important;
    }
    [data-hp-user-show="true"] .${HP_REHIDE_BTN_CLASS} {
      opacity: 0.7 !important;
      pointer-events: auto !important;
    }
    [data-hp-user-show="true"]:hover .${HP_REHIDE_BTN_CLASS} {
      opacity: 1 !important;
    }
    .${HP_REHIDE_BTN_CLASS}:hover {
      background: #d43224 !important;
      transform: translateY(-1px) !important;
      box-shadow: 0 6px 16px rgba(242, 69, 53, 0.4) !important;
    }
    #${HP_SPINNER_ID} {
      position: fixed;
      bottom: 20px;
      right: 20px;
      width: 24px;
      height: 24px;
      border: 3px solid rgba(0,0,0,0.1);
      border-radius: 50%;
      border-top-color: #3498db;
      animation: hp-spin 0.8s linear infinite;
      z-index: 999999;
      pointer-events: none;
      background: white;
      box-shadow: 0 2px 10px rgba(0,0,0,0.2);
      display: none;
    }
    @keyframes hp-spin {
      to { transform: rotate(360deg); }
    }
  `;
  document.head.appendChild(style);

  if (!document.getElementById(HP_SPINNER_ID)) {
    const spinner = document.createElement("div");
    spinner.id = HP_SPINNER_ID;
    document.body.appendChild(spinner);
  }
}

export function showSpinner() {
  const spinner = document.getElementById(HP_SPINNER_ID);
  if (spinner) spinner.style.display = "block";
}

export function hideSpinner() {
  const spinner = document.getElementById(HP_SPINNER_ID);
  if (spinner) spinner.style.display = "none";
}
