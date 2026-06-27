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

/** Prints a chrome-styled credit to the browser console, once per load. */
export function ConsoleSignature() {
  useEffect(() => {
    if (printed) return;
    printed = true;
    console.log(
      `%c${ART}`,
      "color:#dcdce4; font-family:monospace; font-size:11px; line-height:1.15;"
    );
    console.log(
      "%cmade by %c3rdfloorhotel",
      "color:#8a8a92; font-size:12px;",
      "color:#dcdce4; font-size:12px; font-weight:bold; letter-spacing:0.08em;"
    );
  }, []);

  return null;
}
