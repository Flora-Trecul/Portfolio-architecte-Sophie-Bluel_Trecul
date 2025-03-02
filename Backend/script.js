// On récupère les travaux depuis l'API
const works = await fetch("http://localhost:5678/api/works").then(works => works.json())
// On récupère les catégories depuis l'API
const categories = await fetch("http://localhost:5678/api/categories").then(categories => categories.json())
// On récupère la div gallery du HTML (en dehors des fonctions car on en aura besoin pour plusieurs fonctions)
const gallery = document.querySelector(".gallery")

// Fonction pour ajouter chaque objet de l'API works à la galerie
function generateGallery(work) {
    // On crée un élément HTML figure avec attribut data-id = propriété id de l'objet
    const figureWork = document.createElement("figure")
    figureWork.dataset.img = work.id

    // On crée un élément img avec attribut src = propriété imageUrl de l'objet + attribut alt = propriété title
    const imgWork = document.createElement("img")
    imgWork.src = work.imageUrl
    imgWork.alt = work.title

    // On crée un élément figcaption contenant la propriété title de l'objet
    const figcaptionWork = document.createElement("figcaption")
    figcaptionWork.innerText = work.title

    // On utilise appendChild pour définir img et figcaption comme enfants de figure
    figureWork.appendChild(imgWork)
    figureWork.appendChild(figcaptionWork)

    // On utilise appendChild pour définir figure comme enfant de gallery
    gallery.appendChild(figureWork)
}

// Fonction pour créer la barre de filtres
function createFiltersBar() {
    // On récupère la div portfolio pour lui insérer un nouvel élément enfant
    const portfolio = document.getElementById("portfolio")
    // On crée une div pour la barre de filtres, on lui attribue la classe filters
    const filtersBar = document.createElement("div")
    filtersBar.className = "filtersBar"
    // On ajoute le premier bouton "Tous" avec le data-id 0
    filtersBar.innerHTML = "<button class=\"filter\" data-cat=\"0\">Tous</button>"

    // On crée un bouton pour chaque catégorie
    categories.forEach(category => {
        // On crée un élement bouton avec l'attribut data-id = propriété id de l'objet + contient le nom de la catégorie
        const button = document.createElement("button")
        button.className = "filter"
        button.dataset.cat = category.id
        button.innerText = category.name

        // On ajoute le bouton comme enfant de la div filters + la barre de filtres avant la galerie dans la div portfolio
        filtersBar.appendChild(button)
        portfolio.insertBefore(filtersBar,gallery)
    })
}

// Fonction pour remplacer le contenu de la galerie
function replaceGallery(works) {
    // Si l'utilisateur clique sur un bouton sélectionné, la page ne change pas
    if (gallery.childElementCount !== works.length) {
        gallery.innerHTML = ""
        works.forEach(generateGallery)
    }
}

// Fonction pour filtrer les photos affichées selon le filtre sélectionné
function filterWorks(btnFilter) {
    const btnCat = Number(btnFilter.dataset.cat)
    // On vérifie si l'utilisateur a appuyé sur "Tous", dans ce cas on affiche toutes les photos
    if (btnCat === 0) {
        replaceGallery(works)
    // Sinon, on affiche uniquement les photos qui ont la même catégorie que le bouton sélectionné
    } else {
        const worksFiltered = works.filter(function (work) {
            return work.category.id === btnCat
        })
        replaceGallery(worksFiltered)
    }
}

//Fonction pour réagir au clic sur les filtres
function activateFilters() {
    // On récupère tous les boutons pour activer la fonctionnalité de filtrage
    const btnsFilters = document.querySelectorAll("button")
    // Pour chaque bouton, on réagit au clic en ajoutant la classe "selected" ou en l'enlevant si elle est déjà activée
    btnsFilters.forEach(btnFilter => {
        btnFilter.addEventListener("click", () => {
            // On vérifie si l'un des filtres est déjà sélectionné, si oui on lui enlève la class selected
            btnsFilters.forEach(btnFilter => {
                if(btnFilter.classList.contains("selected")) {
                    btnFilter.classList.remove("selected")
                }
            })
            // Puis on ajoute la class selected au bouton sur lequel l'utilisateur a cliqué
            btnFilter.classList.add("selected")

            filterWorks(btnFilter)
        })
    })
}

// Fonction pour afficher le mode édition si un token est enregistré dans le localStorage
function displayEditMode() {
    // On vérifie s'il existe une clé token
    if(window.localStorage.getItem("token") !== null) {
        // Si oui, on récupère tous les éléments avec une classe commençant par "edit-" et on ajoute la classe générique "edit"
        // (permet d'anticiper des ajouts sur le mode édition)
        const editElements = document.querySelectorAll("[class^=edit-]")
        editElements.forEach(element => {
            element.classList.add("edit")
        })
    }
}


// Appel aux fonctions pour ajouter tous les travaux à la galerie + créer la barre de filtres + activer les filtres
works.forEach(generateGallery)
createFiltersBar()
activateFilters()
displayEditMode()
