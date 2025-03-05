// Fonction pour créer une légende pour chaque image de la galerie principale
function generateFigcaption(work, figure) {
    const figcaptionWork = document.createElement("figcaption")
    figcaptionWork.innerText = work.title
    figure.appendChild(figcaptionWork)
}

// Fonction pour créer un bouton supprimer pour chaque image de la galerie modale
function generateDeleteBtn(figure) {
    const btnDelete = document.createElement("button")
    btnDelete.className = "delete"
    btnDelete.innerHTML = `<i class="fa-solid fa-trash-can"></i>`
    figure.appendChild(btnDelete)
}

// Fonction principale pour ajouter chaque objet de l'API works à la galerie
function generateGallery(work, gallery) {
    // On crée un élément HTML figure avec attribut data-id = propriété id de l'objet
    const figureWork = document.createElement("figure")
    figureWork.dataset.img = work.id

    // On crée un élément img avec attribut src = propriété imageUrl de l'objet + attribut alt = propriété title
    const imgWork = document.createElement("img")
    imgWork.src = work.imageUrl
    imgWork.alt = work.title

    figureWork.appendChild(imgWork)

    // Si on génère la galerie de la modale, on ajoute un bouton à chaque image, sinon on ajoute une légende
    if(gallery === document.querySelector(".gallery-modal")) {
        generateDeleteBtn(figureWork)
    } else {
        generateFigcaption(work, figureWork)
    }

    gallery.appendChild(figureWork)
}

export { generateGallery }


// Fonction pour créer la barre de filtres en HTML
function generateFiltersBar(categories, gallery) {
    // On récupère la div portfolio pour lui insérer un nouvel élément enfant avec un bouton "Tous" par défaut
    const portfolio = document.getElementById("portfolio")
    const filtersBar = document.createElement("div")
    filtersBar.className = "filtersBar"
    filtersBar.innerHTML = "<button class=\"filter selected\" data-cat=\"0\">Tous</button>"

    // On crée un bouton pour chaque catégorie avec attribut data-id = propriété id de l'objet
    categories.forEach(category => {
        const button = document.createElement("button")
        button.className = "filter"
        button.dataset.cat = category.id
        button.innerText = category.name

        filtersBar.appendChild(button)
    })
    portfolio.insertBefore(filtersBar,gallery)
}

// Fonction pour remplacer le contenu de la galerie quand on sélectionne un filtre
function replaceGallery(works, gallery) {
    gallery.innerHTML = ""
    works.forEach(work => {generateGallery(work, gallery)})
}

// Fonction pour filtrer les photos affichées selon le filtre sélectionné
function filterWorks(btnFilter, works, gallery) {
    const btnCat = Number(btnFilter.dataset.cat)
    // On vérifie si l'utilisateur a appuyé sur "Tous", dans ce cas on affiche toutes les photos
    if (btnCat === 0) {
        replaceGallery(works, gallery)
    // Sinon, on affiche uniquement les photos qui ont la même catégorie que le bouton sélectionné
    } else {
        const worksFiltered = works.filter(function (work) {
            return work.category.id === btnCat
        })
        replaceGallery(worksFiltered, gallery)
    }
}

// Fonction générale pour la génération des filtres et l'activation au clic 
function activateFilters(categories, gallery, works) {
    generateFiltersBar(categories, gallery)

    const btnsFilters = document.querySelectorAll(".filter")
    // On crée une variable pour enregistrer le filtre actif et pouvoir le désactiver si l'utilisateur change de filtre
    let selectedFilter = btnsFilters[0]
    // Pour chaque bouton, on réagit au clic en ajoutant la classe "selected" ou en l'enlevant si elle est déjà activée
    btnsFilters.forEach(btnFilter => {
        btnFilter.addEventListener("click", () => {
            // Si le bouton cliqué était déjà sélectionné, il ne se passe rien
            if(btnFilter !== selectedFilter) {
                selectedFilter.classList.remove("selected")
                btnFilter.classList.add("selected")
                selectedFilter = btnFilter
                filterWorks(btnFilter, works, gallery)
            }
        })
    })
}

export { activateFilters }
