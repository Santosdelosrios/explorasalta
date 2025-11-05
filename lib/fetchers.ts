import pois from '@/data/pois.json';
import regiones from '@/data/regiones.json';
import experiencias from '@/data/experiencias.json';
import eventos from '@/data/eventos.json';

export async function getPOIs() { return pois; }
export async function getRegiones() { return regiones; }
export async function getExperiencias() { return experiencias; }
export async function getEventos() { return eventos; }
