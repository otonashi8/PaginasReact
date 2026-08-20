interface HeroBlobProps {
  className: string
}

function HeroBlob({ className }: HeroBlobProps) {
  return <div className={`absolute rounded-full will-change-transform ${className}`} />
}

export default HeroBlob
