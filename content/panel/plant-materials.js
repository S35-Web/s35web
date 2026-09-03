/**
 * Inventario de planta — mínimos aceptables (semilla).
 * Fuente: captura del ERP interno, 2026-09.
 * Nombres en formato oración (Abcd): primera mayúscula, resto minúsculas.
 *
 * `minStock` = umbral de reposición (0 = aún sin umbral definido).
 * `labSlug`  = ficha del Laboratorio LEDE, si existe.
 */
module.exports = [
  { id: "alcohol-polivinilico", name: "Alcohol polivinilico", unit: "", minStock: 0, category: "polymer", labSlug: null },
  { id: "antiespumante", name: "Antiespumante", unit: "", minStock: 0, category: "chemical", labSlug: null },
  { id: "arbocel-celulosa", name: "Arbocel celulosa", unit: "Kg", minStock: 20, category: "cellulose", labSlug: null },
  { id: "arena-cribada-fina", name: "Arena cribada fina", unit: "Kg", minStock: 1000, category: "mineral", labSlug: "arena-silicea-graduada" },
  { id: "arena-cribada-gruesa", name: "Arena cribada gruesa", unit: "Kg", minStock: 2000, category: "mineral", labSlug: "arena-de-rio" },
  { id: "arena-deshidratada", name: "Arena deshidratada", unit: "Kg", minStock: 2000, category: "mineral", labSlug: "arena-silicea-graduada" },
  { id: "calidra", name: "Calidra", unit: "Kg", minStock: 500, category: "aglutinante", labSlug: "cal" },
  { id: "cemento-portland-gris", name: "Cemento portland gris", unit: "Kg", minStock: 1000, category: "aglutinante", labSlug: "cemento-gris" },
  { id: "cemento-portland-blanco", name: "Cemento portland blanco", unit: "Kg", minStock: 250, category: "aglutinante", labSlug: "cemento-blanco" },
  { id: "cubeta-19l", name: "Cubeta 19L", unit: "Pza", minStock: 100, category: "packaging", labSlug: null },
  { id: "estearato", name: "Estearato", unit: "Kg", minStock: 20, category: "chemical", labSlug: null },
  { id: "formol", name: "Formol", unit: "", minStock: 0, category: "chemical", labSlug: null },
  { id: "fibra-de-polipropileno", name: "Fibra de polipropileno", unit: "Kg", minStock: 20, category: "fiber", labSlug: null },
  { id: "kimacell", name: "Kimacell", unit: "Kg", minStock: 60, category: "cellulose", labSlug: "celulosa-hpmc" },
  { id: "marmolina-gruesa", name: "Marmolina gruesa", unit: "Kg", minStock: 1000, category: "mineral", labSlug: "marmolina-fina" },
  { id: "marmolina-talco-100", name: "Marmolina en talco malla 100", unit: "Kg", minStock: 1000, category: "mineral", labSlug: "carbonato-de-calcio" },
  { id: "marmolina-talco-200", name: "Marmolina en talco malla 200", unit: "Kg", minStock: 4000, category: "mineral", labSlug: "carbonato-de-calcio" },
  { id: "marmolina-talco-300", name: "Marmolina en talco malla 300", unit: "Kg", minStock: 2000, category: "mineral", labSlug: "carbonato-de-calcio" },
  { id: "marmolina-fina", name: "Marmolina fina", unit: "Kg", minStock: 1000, category: "mineral", labSlug: "marmolina-fina" },
  { id: "mortero", name: "Mortero", unit: "Kg", minStock: 200, category: "aglutinante", labSlug: null },
  { id: "quimex-95", name: "Quimex 95", unit: "", minStock: 0, category: "chemical", labSlug: null },
  { id: "resina-aprapole-p150", name: "Resina aprapole p150", unit: "", minStock: 0, category: "polymer", labSlug: "polimero-redispersable-vae" },
  { id: "resina-dlp-2001", name: "Resina dlp-2001", unit: "", minStock: 0, category: "polymer", labSlug: "polimero-redispersable-vae" },
  { id: "resina-rdp740h", name: "Resina rdp740h", unit: "Kg", minStock: 125, category: "polymer", labSlug: "polimero-redispersable-vae" },
  { id: "resina-semitski", name: "Resina semitski", unit: "Kg", minStock: 25, category: "polymer", labSlug: "polimero-redispersable-vae" },
  { id: "saco-rafia-waxtard", name: "Saco rafia waxtard impreso", unit: "Pza", minStock: 5000, category: "packaging", labSlug: null },
  { id: "saco-rafia-general", name: "Saco rafia general", unit: "Pza", minStock: 5000, category: "packaging", labSlug: null },
  { id: "yeso-maximo", name: "Yeso maximo", unit: "", minStock: 0, category: "aglutinante", labSlug: "yeso" },
  { id: "yeso-sayro", name: "Yeso sayro", unit: "Kg", minStock: 500, category: "aglutinante", labSlug: "yeso" },
];
