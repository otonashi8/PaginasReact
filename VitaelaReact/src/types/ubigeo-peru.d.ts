declare module 'ubigeo-peru' {
  type UbigeoEntry = {
    departamento: string
    provincia: string
    distrito: string
    nombre: string
  }

  const ubigeoPeru: {
    reniec: UbigeoEntry[]
    inei: UbigeoEntry[]
  }

  export default ubigeoPeru
}
