// lib/templates/index.js — registro central de plantillas de invitación
//
// Cómo agregar una nueva plantilla:
//   1. Crea el componente en app/templates/plantilla_<slug>/Plantilla<Nombre>.jsx
//      con el contrato: ({ event, guest, rsvp }) => JSX
//   2. Agrega aquí una entrada al objeto TEMPLATES con:
//      - slug:        identificador único (no cambiar después de usarlo)
//      - name:        nombre visible al usuario
//      - description: una línea sobre el estilo
//      - component:   import del componente
//      - gallerySize: cuántas fotos de galería soporta (default 3)
//      - supports:    qué bloques opcionales soporta (los demás se ignoran)
//
// El campo `template` de la tabla `events` guarda el slug. Si está vacío o
// no existe, cae al DEFAULT_TEMPLATE.

import Plantilla from "@/app/templates/plantilla_v1/Plantilla";
import PlantillaDusk from "@/app/templates/plantilla_dusk/PlantillaDusk";
import PlantillaOlivos from "@/app/templates/plantilla_olivos/PlantillaOlivos";

export const DEFAULT_GALLERY_SIZE = 3;

export const TEMPLATES = {
  plantilla_v1: {
    slug: "plantilla_v1",
    name: "Clásica",
    description: "Diseño romántico estilo carta con mesas de regalos.",
    component: Plantilla,
    gallerySize: 3,
    supports: {
      dressCode: true,
      kidsPolicy: true,
      gifts: true,
      bank: true,
      countdown: true,
    },
  },
  plantilla_dusk: {
    slug: "plantilla_dusk",
    name: "Dusk",
    description: "Otoñal, sobrio, tipografía editorial.",
    component: PlantillaDusk,
    gallerySize: 3,
    supports: {
      dressCode: true,
      kidsPolicy: true,
      gifts: true,
      bank: true,
      countdown: true,
    },
  },
  plantilla_olivos: {
    slug: "plantilla_olivos",
    name: "Olivos",
    description: "Botánica salvia y azul polvo, collage de fotos y paleta de vestimenta.",
    component: PlantillaOlivos,
    gallerySize: 6,
    supports: {
      dressCode: true,
      kidsPolicy: true,
      gifts: true,
      bank: true,
      countdown: true,
    },
  },
};

export const DEFAULT_TEMPLATE = "plantilla_v1";

export function getTemplate(slug) {
  return TEMPLATES[slug] || TEMPLATES[DEFAULT_TEMPLATE];
}

export function getGallerySize(slug) {
  return getTemplate(slug).gallerySize || DEFAULT_GALLERY_SIZE;
}

export function listTemplates() {
  return Object.values(TEMPLATES);
}
