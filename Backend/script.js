// On récupère les travaux depuis l'API
const works = await fetch("http://localhost:5678/api/works").then(works => works.json())
// On récupère les catégories depuis l'API
const categories = await fetch("http://localhost:5678/api/categories").then(categories => categories.json())
// On récupère les div gallery du HTML qui serviront pour plusieurs fonctions
const gallery = document.querySelector(".gallery")
const modalGallery = document.querySelector(".gallery-modal")
// On récupère la div modale pour les fonctions qui gèrent son affichage et son contenu
const modal = document.getElementById("modal-container")

// On importe la fonction externe qui permet de générer toutes les galeries (principale, modale et filtrée)
import { generateGallery } from "./gallery-filters.js"
works.forEach(work => {generateGallery(work, gallery)})

// On importe la fonction qui permet de générer et activer la barre de filtres
import { activateFilters } from "./gallery-filters.js"
activateFilters(categories, gallery, works)

// On importe la fonction qui permet d'afficher et gérer la modale
import { activateEditMode } from "./modal.js"
activateEditMode(modalGallery, works, modal, categories, gallery, modalGallery)
