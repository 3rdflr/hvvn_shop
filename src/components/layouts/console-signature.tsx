"use client";

import { useEffect } from "react";

let printed = false;

const ART = String.raw`
██╗  ██╗██╗   ██╗██╗   ██╗███╗   ██╗
██║  ██║██║   ██║██║   ██║████╗  ██║
███████║██║   ██║██║   ██║██╔██╗ ██║
██╔══██║╚██╗ ██╔╝╚██╗ ██╔╝██║╚██╗██║
██║  ██║ ╚████╔╝  ╚████╔╝ ██║ ╚████║
╚═╝  ╚═╝  ╚═══╝    ╚═══╝  ╚═╝  ╚═══╝
`;

/** Prints a chrome-styled credit to the browser console, once per load.
 *  Delayed so it lands AFTER third-party (YouTube player) console warnings. */
export function ConsoleSignature() {
  useEffect(() => {
    if (printed) return;
    printed = true;

    const print = () => {
      console.log(
        `%c${ART}`,
        "color:#dcdce4; font-family:monospace; font-size:11px; line-height:1.15;"
      );
      console.log(
        "%cmade by %c3rdfloorhotel",
        "color:#8a8a92; font-size:12px;",
        "color:#dcdce4; font-size:12px; font-weight:bold; letter-spacing:0.08em;"
      );
    };

    // Wait for the page (and the YouTube background player) to settle, so the
    // signature prints below the player's warnings.
    const timer = setTimeout(print, 4000);
    return () => clearTimeout(timer);
  }, []);

  return null;
}
