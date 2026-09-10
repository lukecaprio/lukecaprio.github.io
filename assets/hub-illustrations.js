/* Hand-drawn waterfront vignettes. Shared outlines, cel shadows, and sunset edges.
   The Bizzy sign displays the original supplied mark through an SVG viewport. */
(() => {
  let serial = 0;
  const defs = `<defs>
    <linearGradient id="stucco" x2=".8" y2="1"><stop stop-color="#ecd0b2"/><stop offset="1" stop-color="#bd9190"/></linearGradient>
    <linearGradient id="timber" x2=".3" y2="1"><stop stop-color="#c09a80"/><stop offset="1" stop-color="#816a6b"/></linearGradient>
    <linearGradient id="lit" x2="0" y2="1"><stop stop-color="#fbe5a5"/><stop offset="1" stop-color="#e7a269"/></linearGradient>
    <linearGradient id="pc" x2="1" y2="1"><stop stop-color="#253f56"/><stop offset=".65" stop-color="#669eae"/><stop offset="1" stop-color="#dea6ad"/></linearGradient>
    <radialGradient id="warm"><stop stop-color="#ffd191" stop-opacity=".42"/><stop offset="1" stop-color="#ffd191" stop-opacity="0"/></radialGradient>
    <radialGradient id="green"><stop stop-color="#b0ee97" stop-opacity=".28"/><stop offset="1" stop-color="#b0ee97" stop-opacity="0"/></radialGradient>
  </defs>`;
  const plants = (x,y,s=1) => `<g transform="translate(${x} ${y}) scale(${s})"><path d="M-8 0L-5 15H7L10 0Z" fill="#b07f6a"/><path d="M1 2Q-21-9-11-18Q2-17 1 2Q-3-24 9-27Q18-17 1 2Q10-17 19-12Q20-4 1 2" fill="#507873"/><path d="M2 1Q2-12 9-22M1 0Q-5-6-10-13" stroke="#9ba483" stroke-width="1"/></g>`;
  const art = {
    computer: `<ellipse cx="161" cy="244" rx="130" ry="9" fill="#29394b" opacity=".2"/>
      <path d="M67 141L249 151L296 226L24 216Z" fill="#9c8581" stroke="#5d626d" stroke-width="1.5"/>
      <path d="M24 216L296 226V237L24 227Z" fill="#71656d"/><path d="M42 223V247M276 233V253" stroke="#625e68" stroke-width="8"/>
      ${[0,1,2,3,4,5,6].map(i=>`<path d="M${67-i*6} ${144+i*11}L${251+i*6} ${154+i*11}" stroke="#e0bba0" stroke-opacity=".55" stroke-width="1.2"/>`).join('')}
      <path d="M87 147L56 218M139 150L126 221M193 152L207 224M236 155L268 226" stroke="#6e636b" stroke-width="1"/>
      <path d="M42 127V188M273 137V201" stroke="#736876" stroke-width="6"/><path d="M41 126L274 136" stroke="#dac1aa" stroke-width="4"/><path d="M43 130Q110 159 157 135Q219 165 273 140" stroke="#8e8690" stroke-width="1.5"/>
      <path d="M89 127L222 134L232 153L75 147Z" fill="#c39f82" stroke="#71646a" stroke-width="1.3"/><path d="M75 147L232 153V159L75 153Z" fill="#8d7067"/>
      <path d="M87 154L83 210M220 158L226 215M93 185L220 191" stroke="#645761" stroke-width="4"/>
      <path d="M114 65L179 66Q190 66 190 76L190 122L108 119L108 75Q108 65 114 65Z" fill="#d9d0bc" stroke="#65717a" stroke-width="1.3"/>
      <path d="M180 67L201 76V124L190 130V76" fill="#afa5a1"/><path d="M109 120L190 122V131L109 128Z" fill="#b8b3aa"/>
      <rect x="115" y="73" width="66" height="43" rx="5" fill="url(#pc)" stroke="#526573" stroke-width="2"/>
      <path d="M117 102Q144 85 178 101L177 112L118 110Z" fill="#97cac1" opacity=".5"/><circle cx="165" cy="87" r="8" fill="#f3d7b1"/>
      <path d="M124 79L166 79M121 81V101" stroke="#e9e1cd" opacity=".45" stroke-width="1"/><circle class="screen-pilot" cx="180" cy="124" r="1.4" fill="#c5f1b9"/>
      <path d="M143 130V137L164 138V130M130 139L176 141" stroke="#bfb6ab" stroke-width="3"/>
      <path d="M106 140L158 142L165 148L100 146Z" fill="#e1d5bd" stroke="#998a83" stroke-width=".8"/><path d="M108 142L156 144M119 141L117 146M133 142L132 147M145 143V147" stroke="#b3a498" stroke-width=".7"/>
      <ellipse cx="183" cy="145" rx="6" ry="3" fill="#d1c4b3"/><path d="M182 142Q194 132 198 118" stroke="#525b6b" stroke-width="1"/>
      <path d="M137 182Q118 171 115 188L120 205H151L157 184Z" fill="#688184" stroke="#475968" stroke-width="1.4"/><path d="M125 202L118 222M148 204L154 225" stroke="#514f5d" stroke-width="3"/>
      <path d="M201 130V143Q208 148 215 143V130Z" fill="#e7c6a2"/><path d="M215 131Q227 131 216 140" stroke="#dfb995" stroke-width="2"/><path class="tea-steam" d="M207 124Q201 117 207 110Q211 105 207 101" stroke="#fce8d1" stroke-width="1.5" opacity=".55"/>
      <path d="M88 140L98 135L111 137L101 142Z" fill="#e8c8bb"/>
      ${plants(247,196,.85)}<path d="M50 190Q66 186 72 196" stroke="#ccab91" stroke-width="1"/>
      <path d="M251 164L253 176" stroke="#d8b79d"/><circle cx="254" cy="156" r="2" fill="#f4d4a0"/>`,
    about: `<ellipse cx="158" cy="245" rx="119" ry="9" fill="#29394b" opacity=".22"/>
      <path d="M78 41L208 35L246 61V225L80 236Z" fill="#a88487" stroke="#665f70" stroke-width="1.3"/>
      <path d="M78 41L208 35V220L78 231Z" fill="url(#stucco)"/>
      <path d="M71 44L210 37L249 63V69L209 46L71 53Z" fill="#e4c5b0" stroke="#8d7f86" stroke-width="1"/>
      <path d="M82 28L198 24L209 36L78 42Z" fill="#bea5a0"/><path d="M82 28L198 24" stroke="#f0d6b8" stroke-width="2"/>
      <path d="M209 47L209 217M81 55V229" stroke="#f7daba" stroke-opacity=".6" stroke-width="2"/>
      <path d="M94 65L132 63V111L94 113Z" fill="#566678" stroke="#9c807d" stroke-width="2"/><path d="M99 68L129 66V107L99 108Z" fill="url(#lit)" class="window-light"/>
      <path d="M146 62L184 60V108L146 110Z" fill="#566678" stroke="#9c807d" stroke-width="2"/><path d="M150 65L180 63V104L150 106Z" fill="url(#lit)" class="window-light"/>
      <g class="apartment-curtain"><path d="M99 68L109 68Q108 89 103 108H99Z M129 66L120 67Q122 89 125 107H129Z M150 65L159 64Q157 89 154 105H150Z" fill="#f9e1be" opacity=".83"/></g>
      <path d="M114 66V109M98 88L128 87M166 64V106M150 86L180 85" stroke="#aa8976" stroke-width="1.7"/>
      <path d="M89 115L192 109L218 121L103 129Z" fill="#a6a0a0"/><path d="M103 129L218 121V127L103 136Z" fill="#6e6978"/>
      <path d="M103 101V129M217 95V121M114 102V128M127 101V127M141 100V126M155 99V125M169 98V124M183 97V123M197 96V122M209 95V121" stroke="#666a78" stroke-width="1.4"/><path d="M102 101L217 94" stroke="#efd2b3" stroke-width="2"/>
      <path d="M82 137L207 130V135L82 144Z" fill="#e8c7ad"/>
      <path d="M96 163Q96 143 116 143Q134 143 134 161V228L96 231Z" fill="#646777"/><path d="M101 165Q101 149 116 149Q130 149 130 164Z" fill="url(#lit)"/>
      <path d="M105 177H126V220H105Z" fill="#536270"/><circle cx="125" cy="190" r="1.5" fill="#f1ce98"/>
      <path d="M150 156L184 154V204L150 206Z" fill="url(#lit)" class="window-light"/><path d="M166 155V204M149 181L185 179" stroke="#8a7975" stroke-width="2"/>
      <path d="M143 150L186 146L197 157L141 161Z" fill="#8aaca2"/><path d="M142 160L194 156V162L142 167Z" fill="#587f7e"/>
      <path d="M218 81L235 89V118L218 111Z M218 149L235 158V187L218 179Z" fill="#4e5d70"/><path d="M221 85L232 91V113L221 109Z" fill="#ceab8c"/>
      <path d="M88 229L140 225L150 242L73 247Z" fill="#c5aea0"/><path d="M83 236L145 232M77 242L149 239" stroke="#8a7d7f" stroke-width="1.5"/>
      <circle cx="151" cy="224" r="12" stroke="#536371" stroke-width="1.7"/><circle cx="186" cy="221" r="12" stroke="#536371" stroke-width="1.7"/><path d="M151 224L160 209L175 224L151 224L169 210L186 221L178 204M174 204H183M156 207H165" stroke="#c39188" stroke-width="1.6"/>
      <path d="M82 93Q65 109 79 128Q64 142 77 159Q66 175 80 188" stroke="#567b71" stroke-width="2"/>
      ${[95,111,135,150,172].map((y,i)=>`<ellipse cx="${i%2?74:79}" cy="${y}" rx="8" ry="3" transform="rotate(-30 76 ${y})" fill="#718c74"/>`).join('')}
      ${plants(196,116,.65)}${plants(226,217,.95)}${plants(63,228,.7)}
      <ellipse cx="91" cy="176" rx="18" ry="24" fill="url(#warm)"/><path d="M88 164H94V174H88Z" fill="#ffdfab"/><path d="M86 163H96" stroke="#68616b" stroke-width="2"/>
      <path d="M90 69L91 105M82 195L86 194M191 180L203 179M87 213L90 213" stroke="#ffe7c8" stroke-width=".8" opacity=".6"/>`,
    bizzy: `<ellipse cx="158" cy="241" rx="130" ry="10" fill="#283e44" opacity=".23"/>
      <path d="M57 94Q57 64 84 64L221 61L259 83V222L57 233Z" fill="#3f6661" stroke="#536472" stroke-width="1.3"/>
      <path d="M57 94Q57 65 84 65L221 62V220L57 230Z" fill="#81a597"/>
      <path d="M66 91Q66 75 83 75L211 72V218L66 226Z" fill="#2b514d"/>
      <path d="M52 99Q52 59 84 58L221 55L264 79M52 106Q52 66 84 65L221 62L264 86" stroke="#c6dbaf" stroke-width="3"/>
      <path d="M221 62V221" stroke="#c1dab0" stroke-width="2"/>
      <rect x="100" y="54" width="113" height="59" rx="4" fill="#10211f" stroke="#8ad784" stroke-width="1.4"/>
      <ellipse class="sign-breathe" cx="156" cy="85" rx="81" ry="49" fill="url(#green)"/>
      <svg class="bizzy-mark" x="104" y="58" width="105" height="52.5" viewBox="130 1040 1080 540" preserveAspectRatio="xMidYMid meet"><image href="assets/bizzy-logo-source.png" width="1290" height="2796" preserveAspectRatio="xMidYMid meet"/></svg>
      <path class="sign-breathe" d="M103 57H209M101 109H210" stroke="#a2ed93" stroke-width="1.6"/>
      <path d="M59 120L219 110L242 132L63 145Z" fill="#5e8e7c" stroke="#a8bea0" stroke-width="1"/>
      <path d="M65 145L240 132V141L65 154Z" fill="#2b5750"/>
      ${[0,1,2,3,4,5,6].map(i=>`<path d="M${73+i*23} ${120-i*1.4}L${81+i*23} ${141-i*1.6}" stroke="#c1c8a5" stroke-width="9" opacity=".7"/>`).join('')}
      <path d="M77 158L111 156V204L77 207Z" fill="#152c32" stroke="#a1af8e" stroke-width="1.3"/><path d="M80 160L89 160V203L80 204Z" fill="#6ea283" opacity=".5"/>
      <path d="M169 151L204 149V198L169 202Z" fill="#152c32" stroke="#a1af8e" stroke-width="1.3"/><path d="M171 156L201 154M172 179L201 177" stroke="#527565"/>
      <path d="M121 224V159Q122 138 139 138Q157 137 157 157V220Z" fill="#b7cd97"/><path d="M128 222V161Q128 147 140 147Q151 147 151 160V221Z" fill="#314e49"/>
      <path d="M130 164L149 162V213L130 215Z" fill="#a3ba82" opacity=".32"/><path d="M132 165L132 206M146 172V188" stroke="#e1e3a9" stroke-width="1"/><circle cx="146" cy="192" r="1.5" fill="#ead6a8"/>
      <path d="M52 231L224 219L266 231L57 247L39 239Z" fill="#9a9b85"/><path d="M44 239L263 232" stroke="#d5c8a0" stroke-width="1.3"/>
      <path d="M225 144L245 154V192L225 184Z" fill="#254841"/><path d="M235 151V187" stroke="#78ab86"/>
      <path d="M179 212L199 210L205 238L175 240Z" fill="#384f4b" stroke="#acb796" stroke-width="1"/><path d="M181 218L195 217M181 223L198 221M184 228L196 227" stroke="#c1c9a1" stroke-width="1.2"/>
      ${plants(77,223,.8)}${plants(243,217,1)}
      <path d="M74 99Q80 105 88 103M70 95Q74 94 76 97" stroke="#96bea1" stroke-width="1"/>
      <path d="M41 194L59 193M46 195L43 222M54 194L59 222" stroke="#6e7570" stroke-width="2"/>
      <ellipse cx="51" cy="190" rx="17" ry="4" fill="#c2af8e"/>
      <path d="M89 141Q147 152 213 133" stroke="#536d62" stroke-width=".7"/>${[88,119,150,182,211].map((x,i)=>`<circle class="sign-breathe" cx="${x}" cy="${145-(i>2?(i-2)*4:0)}" r="1.8" fill="#ffdda0"/>`).join('')}`,
    writing: `<ellipse cx="158" cy="243" rx="106" ry="9" fill="#29394b" opacity=".2"/>
      <path d="M83 103L198 89L231 108V232L83 242Z" fill="#705b60" stroke="#616071" stroke-width="1.2"/>
      <path d="M83 104L198 90V231L83 241Z" fill="url(#timber)"/>
      <path d="M92 111L188 100V220L92 229Z" fill="#3d414d"/>
      <path d="M76 99L195 82L239 103L203 111L77 121Z" fill="#829f96" stroke="#627d7b" stroke-width="1.3"/>
      <path d="M77 116L204 105L239 101V107L204 113L77 125Z" fill="#537d7b"/><path d="M80 101L193 85L229 102" stroke="#e0d3b3" stroke-width="1.5"/>
      <path d="M88 169L194 158M88 225L194 214" stroke="#c9aa8c" stroke-width="5"/>
      ${[0,1,2,3,4,5,6,7].map((n)=>`<g transform="translate(${99+n*11} ${121-n*1.2}) rotate(${n===4?-12:0})"><path d="M0 0H8V41H0Z" fill="${['#b88f83','#95b5b0','#caac7e','#92a4ba'][n%4]}"/><path d="M2 5H6M2 32H6M2 35H6" stroke="#efe0bb" stroke-width=".7"/></g>`).join('')}
      <path d="M99 199L132 196V204L99 207Z" fill="#d5be9d"/><path d="M97 209L137 205V213L97 217Z" fill="#ab8690"/><path d="M102 187L128 185V195L102 197Z" fill="#86a5a0"/>
      <path d="M150 182L159 181V214L150 215Z M164 177L174 176V211L164 212Z M178 183L186 182V208L178 210Z" fill="#b29d93"/>
      <path d="M198 118L222 131V220L198 231Z" fill="#84706b"/><path d="M207 142L217 147M207 157L217 162M207 172L217 177" stroke="#b4a18d" stroke-width="1.2"/>
      <path d="M90 240V253M188 231V244M228 228V239" stroke="#65616b" stroke-width="4"/>
      <path d="M50 214L79 211L94 226L59 231Z" fill="#c2a383"/><path d="M58 229L56 250M83 224L92 246" stroke="#716571" stroke-width="3"/>
      <path d="M56 214L69 205L82 213L70 219Z" fill="#f0d4ad"/><path d="M69 205L70 219" stroke="#b69a89"/>
      <path d="M91 125L190 114" stroke="#f4d5aa" stroke-width="1" opacity=".7"/>
      ${plants(227,227,.8)}${plants(158,95,.55)}
      <path d="M192 94L207 65H223" stroke="#68747c" stroke-width="2"/><path d="M216 64L231 66L237 74L210 73Z" fill="#bdab91"/><ellipse class="window-light" cx="223" cy="88" rx="22" ry="27" fill="url(#warm)"/><path d="M214 74H232" stroke="#ffe0a1" stroke-width="2"/>`,
    contact: `<ellipse cx="163" cy="243" rx="82" ry="9" fill="#29394b" opacity=".2"/>
      <path d="M102 235Q154 215 213 235L230 245L95 249Z" fill="#b5a592"/><path d="M112 237L142 229M161 233L179 240M198 233L210 240" stroke="#d9c4a4" stroke-width="1"/>
      <path d="M150 150L154 236L165 236L163 149Z" fill="#9e8b82" stroke="#776d77" stroke-width="1.2"/><path d="M154 157L157 230" stroke="#d0b99b" stroke-width="1"/>
      <path d="M113 147V108Q113 84 137 84L187 79Q209 78 212 104V142Z" fill="#a4beb5" stroke="#5c7580" stroke-width="1.3"/>
      <path d="M113 108Q113 84 137 84Q157 84 159 109V146L113 150Z" fill="#718f99"/>
      <path d="M119 111Q119 91 136 90Q151 90 153 111V141L119 144Z" fill="#536a7b"/>
      <path d="M121 131L142 109L151 136Z" fill="#f5d8b3"/><path d="M121 131L143 129L142 109" stroke="#c19d91" stroke-width=".9"/>
      <path d="M114 146L163 142L176 150L126 156Z" fill="#a4b9b3" stroke="#627580" stroke-width="1"/>
      <path d="M168 90L193 88M167 95L204 92" stroke="#d4d8bb" stroke-width="1.3"/>
      <path d="M188 123V63L210 61L211 76L192 78" fill="#d7a09a" stroke="#a27e84" stroke-width="1.2"/><circle cx="188" cy="124" r="2.5" fill="#cad4b8"/>
      <path d="M175 132L201 130" stroke="#627a83" stroke-width="1"/>
      <path d="M181 218Q172 191 183 177Q197 190 188 222Q197 184 208 188Q222 203 192 224" fill="#719080"/>
      <path d="M188 225L197 198" stroke="#b3b398" stroke-width="1"/>
      <path d="M96 218Q110 210 126 216L127 226L98 229Z" fill="#a6a38a"/><path d="M109 219L105 197M112 217L121 203" stroke="#6e8e77" stroke-width="1.7"/>
      <circle cx="105" cy="196" r="4" fill="#e6adad"/><circle cx="121" cy="202" r="3.5" fill="#e8c795"/>
      <path d="M144 63Q150 53 154 63Q147 61 144 63Z" fill="#c5ccc0"/><path class="mail-ribbon" d="M127 150Q109 151 103 161" stroke="#eabdaf" stroke-width="1.5"/>
      <path d="M220 226L224 224M134 242L137 241M200 244L207 243" stroke="#eee0bc" stroke-width="1.3"/>`,
  };
  window.HubIllustrations = (name) => {
    const id = ++serial;
    const dock = name === "computer" ? "" : `<g class="landing"><path d="M49 231L230 220L279 242L57 261L29 247Z" fill="#a58e80" stroke="#676f79" stroke-width="1.2"/><path d="M29 247L57 261L279 242V248L57 267L29 253Z" fill="#635e68"/><path d="M51 242L255 232M40 248L269 239M75 258L270 243" stroke="#d1ac92" stroke-width="1"/><path d="M56 263V283M251 251V274M89 237V258" stroke="#635c65" stroke-width="6"/><path d="M55 265V279M250 254V270" stroke="#c0a18c" stroke-width="1.4"/></g>`;
    const water = `<g class="landing-reflection" stroke-width="1.5"><path d="M47 283H72M240 275H268M88 289H157M178 281H212" stroke="#b5d8ce" opacity=".45"/><path d="M95 269L199 263M112 276L174 271M130 284L187 280" stroke="${name === "bizzy" ? "#87d69f" : "#edc197"}" opacity=".25"/><path d="M30 298Q81 292 109 298M194 294Q242 288 288 293" stroke="#97c1c1" opacity=".25"/></g>`;
    const legs = name === "computer" ? `<path d="M42 240V281M276 246V278" stroke="#615e69" stroke-width="7"/><path d="M40 242V271M274 249V269" stroke="#d0a992" stroke-width="1.3"/>` : "";
    const keepsakes = name === "computer"
      ? `<g class="window-light"><circle cx="66" cy="143" r="2" fill="#ffe1a9"/><circle cx="103" cy="147" r="2" fill="#ffe1a9"/><circle cx="221" cy="151" r="2" fill="#ffe1a9"/><circle cx="253" cy="148" r="2" fill="#ffe1a9"/></g><path d="M251 218Q262 214 269 219L265 224L252 225Z" fill="#ddae96"/><path d="M251 220L264 220" stroke="#fae0b8" stroke-width=".7"/>`
      : name === "about"
        ? `<path d="M111 116L126 116L128 135L113 136Z" fill="#b891a0"/><path d="M114 120L124 120M114 126L125 126M116 133H125" stroke="#eac9b3" stroke-width="1.2"/><path d="M108 115H130" stroke="#675d6b" stroke-width="1"/>`
        : "";
    return `<svg class="hub-vignette" viewBox="0 0 320 310" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" stroke-linecap="round" stroke-linejoin="round">${defs}${dock}${art[name]}${keepsakes}${legs}${water}</svg>`.replace(/(stucco|timber|lit|pc|warm|green)(?=["\)])/g, n=>`hub-${n}-${id}`);
  };
})();
