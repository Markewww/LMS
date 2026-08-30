export interface PostBg {
  id: string;
  name: string;
  className: string; // Tailwind styling configuration classes
  textClass: string;
}

export const postBackgrounds: PostBg[] = [
  { id: "none", name: "Default", className: "bg-white text-gray-700 border border-gray-200", textClass: "text-gray-700" },
  { id: "emerald", name: "Emerald Glow", className: "bg-gradient-to-br from-emerald-500 to-teal-700 text-white font-medium", textClass: "text-white" },
  { id: "sunset", name: "Sunset", className: "bg-gradient-to-r from-orange-500 to-rose-500 text-white font-medium", textClass: "text-white" },
  { id: "ocean", name: "Deep Ocean", className: "bg-gradient-to-tr from-blue-600 to-indigo-900 text-white font-medium", textClass: "text-white" },
  { id: "neon", name: "Neon Purple", className: "bg-gradient-to-r from-fuchsia-600 to-purple-600 text-white font-medium", textClass: "text-white" }
];
