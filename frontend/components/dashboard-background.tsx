export function DashboardBackground() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="1600"
      height="900"
      viewBox="0 0 1600 900"
      fill="none"
      className="pointer-events-none absolute inset-0 h-full w-full"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
    >
      <title>AqarFlow abstract real estate technology background</title>
      <defs>
        <linearGradient id="background" x1="0" y1="0" x2="1600" y2="900">
          <stop offset="0" stopColor="#020910" />
          <stop offset="0.48" stopColor="#04131E" />
          <stop offset="1" stopColor="#071D2A" />
        </linearGradient>

        <radialGradient id="centralGlow" cx="72%" cy="45%" r="52%">
          <stop offset="0" stopColor="#087D9F" stopOpacity="0.28" />
          <stop offset="0.3" stopColor="#07526C" stopOpacity="0.14" />
          <stop offset="1" stopColor="#020910" stopOpacity="0" />
        </radialGradient>

        <linearGradient id="buildingFace" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#0B4961" stopOpacity="0.4" />
          <stop offset="0.42" stopColor="#063143" stopOpacity="0.18" />
          <stop offset="1" stopColor="#020C15" stopOpacity="0.05" />
        </linearGradient>

        <linearGradient id="buildingFaceBright" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#1F91B1" stopOpacity="0.35" />
          <stop offset="0.38" stopColor="#0A5873" stopOpacity="0.2" />
          <stop offset="1" stopColor="#061B29" stopOpacity="0.08" />
        </linearGradient>

        <linearGradient id="cyanLine" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#38D8FF" stopOpacity="0" />
          <stop offset="0.3" stopColor="#27CFF4" stopOpacity="0.7" />
          <stop offset="0.7" stopColor="#60E7FF" stopOpacity="0.95" />
          <stop offset="1" stopColor="#38D8FF" stopOpacity="0" />
        </linearGradient>

        <linearGradient id="verticalLight" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#3EE4FF" stopOpacity="0" />
          <stop offset="0.25" stopColor="#36D6F7" stopOpacity="0.9" />
          <stop offset="0.78" stopColor="#20A8D1" stopOpacity="0.3" />
          <stop offset="1" stopColor="#20A8D1" stopOpacity="0" />
        </linearGradient>

        <linearGradient id="horizonFade" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#071E2A" stopOpacity="0" />
          <stop offset="0.45" stopColor="#0C6B87" stopOpacity="0.5" />
          <stop offset="0.75" stopColor="#1DBADB" stopOpacity="0.35" />
          <stop offset="1" stopColor="#071E2A" stopOpacity="0" />
        </linearGradient>

        <linearGradient id="leftVignette" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#01070D" stopOpacity="0.78" />
          <stop offset="0.38" stopColor="#020A12" stopOpacity="0.56" />
          <stop offset="0.72" stopColor="#020A12" stopOpacity="0.12" />
          <stop offset="1" stopColor="#020A12" stopOpacity="0" />
        </linearGradient>

        <pattern id="microGrid" width="24" height="24" patternUnits="userSpaceOnUse">
          <path d="M24 0H0V24" stroke="#2DA4C5" strokeWidth="0.7" strokeOpacity="0.065" />
        </pattern>

        <pattern id="smallDots" width="34" height="34" patternUnits="userSpaceOnUse">
          <circle cx="3" cy="3" r="0.8" fill="#40D9F7" fillOpacity="0.22" />
        </pattern>

        <filter id="softBlur" x="-80%" y="-80%" width="260%" height="260%">
          <feGaussianBlur stdDeviation="24" />
        </filter>

        <filter id="glow" x="-100%" y="-100%" width="300%" height="300%">
          <feGaussianBlur stdDeviation="5" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>

        <filter id="smallGlow" x="-100%" y="-100%" width="300%" height="300%">
          <feGaussianBlur stdDeviation="2.5" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>

        <clipPath id="rightArchitecture">
          <rect x="660" y="0" width="940" height="900" />
        </clipPath>
      </defs>

      <rect width="1600" height="900" fill="url(#background)" />
      <rect width="1600" height="900" fill="url(#centralGlow)" />
      <rect width="1600" height="900" fill="url(#microGrid)" opacity="0.55" />
      <rect x="720" y="70" width="880" height="730" fill="url(#smallDots)" opacity="0.35" />

      <ellipse cx="1280" cy="430" rx="430" ry="250" fill="#0782A5" fillOpacity="0.08" filter="url(#softBlur)" />
      <ellipse cx="975" cy="250" rx="170" ry="90" fill="#25CBEF" fillOpacity="0.08" filter="url(#softBlur)" />

      <g opacity="0.28" stroke="#13536A" strokeWidth="1">
        <path d="M845 115V630L900 605V82L845 115Z" />
        <path d="M900 82V605L955 580V52L900 82Z" />
        <path d="M1010 120V580L1060 560V92L1010 120Z" />
        <path d="M1060 92V560L1110 540V65L1060 92Z" />
        <path d="M1210 95V620L1260 598V60L1210 95Z" />
        <path d="M1260 60V598L1310 575V28L1260 60Z" />
      </g>

      <g strokeLinecap="round" fill="none" clipPath="url(#rightArchitecture)">
        <path d="M570 470L1590 180" stroke="url(#cyanLine)" strokeWidth="1.5" strokeOpacity="0.72" />
        <path d="M615 535L1590 294" stroke="url(#cyanLine)" strokeWidth="1" strokeOpacity="0.55" />
        <path d="M690 615L1600 445" stroke="url(#cyanLine)" strokeWidth="1" strokeOpacity="0.48" />
        <path d="M750 720L1600 590" stroke="url(#cyanLine)" strokeWidth="1" strokeOpacity="0.4" />
        <path d="M800 815L1600 735" stroke="url(#cyanLine)" strokeWidth="1" strokeOpacity="0.32" />
        <path d="M830 0L830 700" stroke="url(#verticalLight)" strokeWidth="1" strokeOpacity="0.45" />
        <path d="M930 0L930 680" stroke="url(#verticalLight)" strokeWidth="1" strokeOpacity="0.35" />
        <path d="M1050 0L1050 670" stroke="url(#verticalLight)" strokeWidth="1" strokeOpacity="0.5" />
        <path d="M1180 0L1180 640" stroke="url(#verticalLight)" strokeWidth="1" strokeOpacity="0.42" />
        <path d="M1330 0L1330 610" stroke="url(#verticalLight)" strokeWidth="1" strokeOpacity="0.65" />
        <path d="M1490 0L1490 585" stroke="url(#verticalLight)" strokeWidth="1" strokeOpacity="0.45" />
      </g>

      <g fill="#36D9F8" opacity="0.7">
        <rect x="805" y="100" width="92" height="2" rx="1" />
        <rect x="920" y="70" width="44" height="2" rx="1" />
        <rect x="1000" y="132" width="74" height="2" rx="1" />
        <rect x="1104" y="94" width="128" height="2" rx="1" />
        <rect x="1265" y="118" width="62" height="2" rx="1" />
        <rect x="1380" y="72" width="104" height="2" rx="1" />
        <rect x="1495" y="146" width="54" height="2" rx="1" />
        <rect x="735" y="260" width="105" height="2" rx="1" opacity="0.45" />
        <rect x="878" y="290" width="56" height="2" rx="1" opacity="0.5" />
        <rect x="970" y="244" width="110" height="2" rx="1" />
        <rect x="1128" y="272" width="45" height="2" rx="1" />
        <rect x="1250" y="220" width="128" height="2" rx="1" />
        <rect x="1420" y="258" width="70" height="2" rx="1" />
        <rect x="755" y="455" width="74" height="2" rx="1" opacity="0.48" />
        <rect x="870" y="420" width="115" height="2" rx="1" />
        <rect x="1050" y="460" width="55" height="2" rx="1" />
        <rect x="1180" y="402" width="94" height="2" rx="1" />
        <rect x="1320" y="445" width="120" height="2" rx="1" />
        <rect x="1490" y="395" width="52" height="2" rx="1" />
      </g>

      <g fill="#46D9F8" opacity="0.65">
        <rect x="766" y="180" width="7" height="2" />
        <rect x="784" y="180" width="4" height="2" />
        <rect x="797" y="180" width="12" height="2" />
        <rect x="826" y="180" width="5" height="2" />
        <rect x="1150" y="178" width="8" height="2" />
        <rect x="1168" y="178" width="15" height="2" />
        <rect x="1195" y="178" width="5" height="2" />
        <rect x="1210" y="178" width="9" height="2" />
        <rect x="1350" y="320" width="8" height="2" />
        <rect x="1366" y="320" width="20" height="2" />
        <rect x="1395" y="320" width="6" height="2" />
        <rect x="1410" y="320" width="14" height="2" />
      </g>

      {/* Main tall building */}
      <g>
        <path d="M1115 120L1328 190V646L1115 555V120Z" fill="url(#buildingFaceBright)" stroke="#2AD7F6" strokeWidth="1.5" strokeOpacity="0.75" />
        <path d="M1328 190L1448 125V570L1328 646V190Z" fill="url(#buildingFace)" stroke="#1FA6C8" strokeWidth="1.5" strokeOpacity="0.62" />
        <path d="M1115 120L1235 55L1448 125L1328 190L1115 120Z" fill="#0B4057" fillOpacity="0.4" stroke="#3CDDF9" strokeWidth="1.5" strokeOpacity="0.85" />
        <g stroke="#35D8F7" strokeOpacity="0.3" strokeWidth="1">
          <path d="M1160 135V574" /><path d="M1205 150V593" /><path d="M1250 165V611" />
          <path d="M1290 178V628" /><path d="M1368 168V620" /><path d="M1406 148V595" />
        </g>
        <g stroke="#34C9E9" strokeOpacity="0.25" strokeWidth="1">
          <path d="M1115 190L1328 260L1448 195" /><path d="M1115 260L1328 330L1448 265" />
          <path d="M1115 330L1328 400L1448 335" /><path d="M1115 400L1328 470L1448 405" />
          <path d="M1115 470L1328 540L1448 475" /><path d="M1115 540L1328 610L1448 545" />
        </g>
        <path d="M1328 190V646" stroke="#6CEBFF" strokeWidth="2" strokeOpacity="0.95" filter="url(#smallGlow)" />
      </g>

      {/* Medium building */}
      <g>
        <path d="M930 290L1115 350V705L930 636V290Z" fill="url(#buildingFace)" stroke="#1796B8" strokeWidth="1.3" strokeOpacity="0.64" />
        <path d="M1115 350L1214 294V648L1115 705V350Z" fill="#06283A" fillOpacity="0.42" stroke="#1CA4C4" strokeWidth="1.3" strokeOpacity="0.55" />
        <path d="M930 290L1027 235L1214 294L1115 350L930 290Z" fill="#0A4055" fillOpacity="0.35" stroke="#2CC9EA" strokeWidth="1.3" strokeOpacity="0.64" />
        <g stroke="#2ECBEA" strokeOpacity="0.27" strokeWidth="1">
          <path d="M970 303V651" /><path d="M1012 316V667" /><path d="M1055 330V682" />
          <path d="M1090 341V695" /><path d="M1150 330V684" /><path d="M1180 313V665" />
          <path d="M930 365L1115 427L1214 370" /><path d="M930 440L1115 502L1214 445" />
          <path d="M930 515L1115 577L1214 520" /><path d="M930 590L1115 652L1214 595" />
        </g>
        <path d="M1115 350V705" stroke="#57E7FF" strokeWidth="2" strokeOpacity="0.85" filter="url(#smallGlow)" />
      </g>

      {/* Right building */}
      <g>
        <path d="M1328 355L1475 282V638L1328 716V355Z" fill="url(#buildingFace)" stroke="#1CA9CC" strokeWidth="1.4" strokeOpacity="0.62" />
        <path d="M1475 282L1550 321V595L1475 638V282Z" fill="#082D40" fillOpacity="0.38" stroke="#1D8EAD" strokeWidth="1.2" strokeOpacity="0.55" />
        <path d="M1328 355L1403 314L1550 321L1475 282L1328 355Z" fill="#0B4055" fillOpacity="0.28" stroke="#35D8F7" strokeWidth="1.2" strokeOpacity="0.55" />
        <g stroke="#2DC5E6" strokeOpacity="0.26" strokeWidth="1">
          <path d="M1368 335V695" /><path d="M1410 314V673" /><path d="M1450 295V651" /><path d="M1508 305V619" />
          <path d="M1328 430L1475 357L1550 396" /><path d="M1328 505L1475 432L1550 471" />
          <path d="M1328 580L1475 507L1550 546" /><path d="M1328 655L1475 582L1550 621" />
        </g>
      </g>

      {/* Wireframe cubes */}
      <g stroke="#2CCAF0" strokeWidth="1.2" strokeOpacity="0.55">
        <path d="M720 250L778 220L842 242L784 275L720 250Z" />
        <path d="M720 250V316L784 343V275" /><path d="M784 275V343L842 308V242" />
        <path d="M720 250L784 275L842 242" /><path d="M784 275L784 343" />
        <path d="M795 530L852 500L908 518L850 550L795 530Z" />
        <path d="M795 530V595L850 618V550" /><path d="M850 550V618L908 584V518" />
        <path d="M795 530L850 550L908 518" /><path d="M850 550L850 618" />
        <path d="M1390 70L1432 48L1478 64L1436 88L1390 70Z" />
        <path d="M1390 70V120L1436 137V88" /><path d="M1436 88V137L1478 112V64" />
        <path d="M1390 70L1436 88L1478 64" />
      </g>

      <g fill="#0B526B" fillOpacity="0.11">
        <path d="M720 250L778 220L842 242L784 275L720 250Z" />
        <path d="M720 250V316L784 343V275L720 250Z" />
        <path d="M795 530L852 500L908 518L850 550L795 530Z" />
        <path d="M1390 70L1432 48L1478 64L1436 88L1390 70Z" />
      </g>

      <g stroke="#1E9CBC" strokeWidth="1" strokeOpacity="0.36" fill="none">
        <path d="M650 790L1600 520" /><path d="M700 840L1600 600" />
        <path d="M780 890L1600 690" /><path d="M960 900L1600 790" />
        <path d="M725 900L1010 500" /><path d="M900 900L1100 500" />
        <path d="M1090 900L1180 500" /><path d="M1260 900L1260 500" />
        <path d="M1440 900L1350 500" /><path d="M1580 900L1430 500" />
      </g>

      <g stroke="#45DFFF" strokeWidth="1.5" strokeOpacity="0.75" fill="none" filter="url(#smallGlow)">
        <path d="M730 600L930 520L1115 555L1328 500L1510 560" />
        <path d="M800 750L930 636L1115 705L1328 646L1475 638" />
        <path d="M835 360L930 365L1115 350L1328 355L1475 282" />
      </g>

      <g fill="#7CEEFF" filter="url(#smallGlow)">
        <circle cx="930" cy="365" r="4" /><circle cx="1115" cy="350" r="4" />
        <circle cx="1328" cy="355" r="4" /><circle cx="1115" cy="705" r="3.5" />
        <circle cx="1328" cy="646" r="3.5" /><circle cx="730" cy="600" r="3" />
        <circle cx="1510" cy="560" r="3" /><circle cx="835" cy="360" r="3" />
        <circle cx="1475" cy="282" r="3" />
      </g>

      <g fill="#5CE6FF" filter="url(#smallGlow)">
        <rect x="681" y="112" width="5" height="5" rx="1" /><rect x="746" y="166" width="3" height="3" rx="1" />
        <rect x="866" y="96" width="5" height="5" rx="1" /><rect x="986" y="202" width="4" height="4" rx="1" />
        <rect x="1080" y="104" width="3" height="3" rx="1" /><rect x="1198" y="236" width="5" height="5" rx="1" />
        <rect x="1292" y="103" width="3" height="3" rx="1" /><rect x="1374" y="214" width="5" height="5" rx="1" />
        <rect x="1480" y="180" width="3" height="3" rx="1" /><rect x="1532" y="382" width="5" height="5" rx="1" />
        <rect x="814" y="410" width="4" height="4" rx="1" /><rect x="875" y="690" width="3" height="3" rx="1" />
        <rect x="1020" y="760" width="5" height="5" rx="1" /><rect x="1200" y="780" width="3" height="3" rx="1" />
        <rect x="1420" y="742" width="5" height="5" rx="1" />
      </g>

      <rect width="1050" height="900" fill="url(#leftVignette)" />
      <rect y="760" width="1600" height="140" fill="url(#horizonFade)" opacity="0.35" />

      <g stroke="#26BBD9" strokeOpacity="0.3">
        <path d="M0 790H420" /><path d="M520 790H735" /><path d="M1160 790H1600" />
      </g>
    </svg>
  );
}
