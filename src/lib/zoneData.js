/* Forex Signal Zone — UI metadata only.
   All trader/signal/member data is served from the backend (see zoneApi.js). */

import {
  TrendUpIcon,
  TerminalIcon,
  CompassIcon,
  GraduationIcon,
} from "../components/icons";

export const zoneCatalogLabels = {
  chart: {
    label: "Trade Chart",
    Icon: TrendUpIcon,
    desc: "Live entries, SL & TP levels",
    count: "Updated daily",
    bg: "linear-gradient(140deg,#12203f 0%,#1a3a7a 60%,#3264ff 130%)",
  },
  terminal: {
    label: "Terminal",
    Icon: TerminalIcon,
    desc: "Order flow & execution view",
    count: "12 tools",
    bg: "linear-gradient(140deg,#0b1220 0%,#16294f 60%,#23408f 130%)",
  },
  analysis: {
    label: "Market Analysis",
    Icon: CompassIcon,
    desc: "Daily & weekly outlooks",
    count: "5 this week",
    bg: "linear-gradient(140deg,#23124a 0%,#4a2187 60%,#7a3cff 130%)",
  },
  course: {
    label: "Trading Course",
    Icon: GraduationIcon,
    desc: "Step-by-step lessons",
    count: "18 lessons",
    bg: "linear-gradient(140deg,#3a2c07 0%,#7a5c14 60%,#c99a2e 130%)",
  },
};
