// On récupère les travaux depuis l'API
const works = await fetch("http://localhost:5678/api/works").then(works => works.json())
// On récupère les catégories depuis l'API
const categories = await fetch("http://localhost:5678/api/categories").then(categories => categories.json())
// On récupère la galerie principale
const gallery = document.querySelector(".gallery")

// On importe la fonction externe qui permet de générer la galerie
import { generateFigure } from "./gallery-filters.js"
works.forEach(work => {generateFigure(work, gallery)})

// On importe la fonction qui permet de générer et activer la barre de filtres
import { activateFilters } from "./gallery-filters.js"
activateFilters(categories, gallery)

// On importe la fonction qui permet d'afficher et gérer la modale
import { activateEditMode } from "./modal.js"
activateEditMode(works, categories, gallery)
