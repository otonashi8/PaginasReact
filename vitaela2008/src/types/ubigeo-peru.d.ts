declare module 'ubigeo-peru' {
  interface UbigeoEntry {
    departamento: string
    provincia: string
    distrito: string
    nombre: string
  }

  interface UbigeoPeru {
    reniec: UbigeoEntry[]
    inei: UbigeoEntry[]
  }

  const ubigeoPeru: UbigeoPeru
  export default ubigeoPeru
}
