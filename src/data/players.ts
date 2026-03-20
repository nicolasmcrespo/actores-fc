export interface Player {
  name: string;
  nickname?: string;
  number?: number;
  position?: string;
  role?: string;
  instagram?: string;
  igFollowers: string;
  tiktok?: string;
  tkFollowers?: string;
  type: "actor" | "actriz";
  photo?: string;
}

export const actores: Player[] = [
  { name: "Agustín Bernasconi", number: 10, position: "Mediocampista", instagram: "agustinbernasconi", igFollowers: "9.1M", tiktok: "agustinbernasconi", tkFollowers: "495K", type: "actor" },
  { name: "Lauty Gram", number: 7, position: "Delantero", instagram: "lautygramm", igFollowers: "1.9M", tiktok: "lautygramm", tkFollowers: "8.1M", type: "actor" },
  { name: "Yeyito De Gregorio", number: 9, position: "Delantero", instagram: "yeyitodegregorio", igFollowers: "985K", tiktok: "yeyitodegregorio", tkFollowers: "38K", type: "actor" },
  { name: "Tyago Griffo", number: 4, position: "Defensor", instagram: "tyagogriffo", igFollowers: "738K", tiktok: "tyagogriffo", tkFollowers: "128K", type: "actor" },
  { name: "Gonza Gravano", number: 5, position: "Mediocampista", instagram: "gonzagravano", igFollowers: "785K", type: "actor" },
  { name: "Cofla", number: 11, position: "Delantero", instagram: "cofla", igFollowers: "398K", tiktok: "cofla", tkFollowers: "312K", type: "actor" },
  { name: "Rodrigo Noya", number: 6, position: "Mediocampista", instagram: "rodrigonoya", igFollowers: "393K", tiktok: "rodrigonoya", tkFollowers: "144K", type: "actor" },
  { name: "Juani Delca", number: 8, position: "Mediocampista", instagram: "juanidelca", igFollowers: "378K", tiktok: "juanidelca", tkFollowers: "1.1M", type: "actor" },
  { name: "Pichi Erbes", number: 3, position: "Defensor", instagram: "pichierbes", igFollowers: "248K", type: "actor" },
  { name: "Fausti Bo", number: 14, position: "Delantero", instagram: "faustibo", igFollowers: "230K", tiktok: "faustibo", tkFollowers: "404K", type: "actor" },
  { name: "Nico Pe", number: 2, position: "Defensor", instagram: "nicope", igFollowers: "205K", type: "actor" },
  { name: "Kito Shelby", number: 19, position: "Mediocampista", instagram: "kitoshelby", igFollowers: "194K", tiktok: "kitoshelby", tkFollowers: "294K", type: "actor" },
  { name: "Falke", number: 13, position: "Arquero", instagram: "falke", igFollowers: "169K", type: "actor" },
  { name: "Ema García", number: 15, position: "Delantero", instagram: "emagarcia", igFollowers: "146K", tiktok: "emagarcia", tkFollowers: "735K", type: "actor" },
  { name: "El Wandi", number: 70, position: "Mediocampista", instagram: "elwandi", igFollowers: "132K", tiktok: "elwandi", tkFollowers: "593K", type: "actor" },
  { name: "Fran Pizarro", number: 12, position: "Delantero", instagram: "franpizarro", igFollowers: "125K", tiktok: "franpizarro", tkFollowers: "276K", type: "actor" },
  { name: "Eze Antonini", number: 17, position: "Mediocampista", instagram: "ezeantonini", igFollowers: "125K", type: "actor" },
  { name: "Nico Maccari", number: 25, position: "Defensor", instagram: "nicomaccari", igFollowers: "118K", type: "actor" },
  { name: "Martin Pepa", number: 21, position: "Defensor", instagram: "martinpepa", igFollowers: "92K", type: "actor" },
  { name: "Giuli Montepaone", number: 99, position: "Arquero", instagram: "giulimontepaone", igFollowers: "75K", tiktok: "giulimontepaone", tkFollowers: "3K", type: "actor" },
];

export interface Staff {
  name: string;
  role: string;
  instagram: string;
  igFollowers: string;
  type: "actor" | "actriz";
}

export const staff: Staff[] = [
  { name: "Rolfi Montenegro", role: "Director Técnico", instagram: "rolfimontenegro", igFollowers: "86K", type: "actor" },
  { name: "Eze Antonini", role: "Manager", instagram: "ezeeantonini", igFollowers: "125K", type: "actor" },
  { name: "Agus Home", role: "Director de Marketing", instagram: "agustinhome", igFollowers: "", type: "actor" },
];

export const dt = staff[0];

export const actrices: Player[] = [
  { name: "Cele Pamio", instagram: "celepamio", igFollowers: "2.8M", tiktok: "celepamio", tkFollowers: "3.5M", type: "actriz" },
  { name: "More Andrade", instagram: "moreeandrade1", igFollowers: "1.3M", tiktok: "moreeandrade1", tkFollowers: "10.1M", type: "actriz" },
  { name: "Cane Devoto", instagram: "canedevoto", igFollowers: "799K", tiktok: "canedevoto", tkFollowers: "2.5M", type: "actriz" },
  { name: "Chiari Mancuso", instagram: "chiarimancuso", igFollowers: "724K", tiktok: "chiarimancuso", tkFollowers: "9.5M", type: "actriz" },
  { name: "Brisaa", nickname: "Yosoybrisaa", instagram: "yosoybrisaa", igFollowers: "720K", tiktok: "yosoybrisaa", tkFollowers: "20.5M", type: "actriz" },
  { name: "Cati Gorostidi", instagram: "catigorostidi", igFollowers: "622K", tiktok: "catigorostidi", tkFollowers: "154K", type: "actriz" },
  { name: "Camii Lattanzio", instagram: "camii_lattanzio", igFollowers: "616K", tiktok: "camii_lattanzio", tkFollowers: "436K", type: "actriz" },
  { name: "Bian Di Pasquale", instagram: "biandipasquale", igFollowers: "600K", tiktok: "biandipasquale", tkFollowers: "16.5K", type: "actriz" },
  { name: "Sofi B.", instagram: "sofib.oficial", igFollowers: "489K", tiktok: "sofib.oficial", tkFollowers: "932K", type: "actriz" },
  { name: "July Peña", instagram: "julypenaa", igFollowers: "350K", tiktok: "julypenaa", tkFollowers: "1.7M", type: "actriz" },
  { name: "Gabriela Gianatasio", instagram: "gabrielagianatassio", igFollowers: "333K", tiktok: "gabrielagianatassio", tkFollowers: "2.2M", type: "actriz" },
  { name: "Sofi Fernández", instagram: "sofifernandez", igFollowers: "310K", type: "actriz" },
  { name: "Renata Blasevich", instagram: "renatablasevich", igFollowers: "303K", tiktok: "renatablasevich", tkFollowers: "2.3M", type: "actriz" },
  { name: "Mili Mansilla", instagram: "milimansiilla", igFollowers: "293K", tiktok: "milimansiilla", tkFollowers: "260K", type: "actriz" },
  { name: "Danu Guerrero", instagram: "danuguerrero", igFollowers: "", tiktok: "danuguerrero", tkFollowers: "258K", type: "actriz" },
  { name: "Ariadna Leyes", instagram: "ariadna_leyes", igFollowers: "210K", tiktok: "ariadna_leyes", tkFollowers: "2M", type: "actriz" },
  { name: "Cande Jáuregui", instagram: "candejauregui_", igFollowers: "190K", tiktok: "candejauregui_", tkFollowers: "836K", type: "actriz" },
  { name: "Kita Real", instagram: "kitarealig", igFollowers: "189K", tiktok: "kitarealig", tkFollowers: "174K", type: "actriz" },
  { name: "Camilita Ferrer", instagram: "camilitaferrr", igFollowers: "167K", tiktok: "camilitaferrr", tkFollowers: "235K", type: "actriz" },
  { name: "Dana Cabrera", instagram: "danacabreraa", igFollowers: "125K", tiktok: "danacabreraa", tkFollowers: "160K", type: "actriz" },
];
