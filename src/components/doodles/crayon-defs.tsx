/**
 * Filtros SVG compartilhados que dão o aspecto de desenho à mão (giz de cera / pincel).
 * Renderizado uma vez no layout raiz; os doodles referenciam por `url(#crayon)` etc.
 * Não usar `display: none` aqui: o Chrome ignora filtros dentro de SVG oculto assim.
 */
export function CrayonDefs() {
  return (
    <svg aria-hidden width="0" height="0" style={{ position: "absolute", width: 0, height: 0, overflow: "hidden" }}>
      <defs>
        {/* Contorno irregular + granulado de giz de cera */}
        <filter id="crayon" x="-15%" y="-15%" width="130%" height="130%">
          <feTurbulence type="fractalNoise" baseFrequency="0.035" numOctaves="2" seed="4" result="warp" />
          <feDisplacementMap in="SourceGraphic" in2="warp" scale="3" xChannelSelector="R" yChannelSelector="G" result="wobbly" />
          <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="1" seed="9" result="grain" />
          <feColorMatrix in="grain" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  -1.6 0 0 0 1.55" result="grainAlpha" />
          <feComposite in="wobbly" in2="grainAlpha" operator="in" />
        </filter>
        {/* Tinta/pincel: contorno irregular, granulado leve (traços cheios, como o olho) */}
        <filter id="ink" x="-15%" y="-15%" width="130%" height="130%">
          <feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="2" seed="2" result="warp" />
          <feDisplacementMap in="SourceGraphic" in2="warp" scale="2.5" xChannelSelector="R" yChannelSelector="G" result="wobbly" />
          <feTurbulence type="fractalNoise" baseFrequency="1.2" numOctaves="1" seed="5" result="grain" />
          <feColorMatrix in="grain" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  -0.7 0 0 0 1.25" result="grainAlpha" />
          <feComposite in="wobbly" in2="grainAlpha" operator="in" />
        </filter>
        {/* Caneta: só o tremido do traço, sem granulado (linhas finas como o fio enrolado) */}
        <filter id="pen" x="-10%" y="-10%" width="120%" height="120%">
          <feTurbulence type="fractalNoise" baseFrequency="0.05" numOctaves="1" seed="7" result="warp" />
          <feDisplacementMap in="SourceGraphic" in2="warp" scale="1.6" xChannelSelector="R" yChannelSelector="G" />
        </filter>
      </defs>
    </svg>
  )
}
