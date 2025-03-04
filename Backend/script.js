// On récupère les travaux depuis l'API
const works = await fetch("http://localhost:5678/api/works").then(works => works.json())
// On récupère les catégories depuis l'API
const categories = await fetch("http://localhost:5678/api/categories").then(categories => categories.json())
// On récupère les div gallery du HTML (en dehors des fonctions car on en aura besoin pour plusieurs fonctions)
const gallery = document.querySelector(".gallery")
const modalGallery = document.querySelector(".gallery-modal")

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
function generateFiltersBar() {
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

// Fonction pour vider le contenu de la galerie quand on sélectionne un filtre
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

// Fonction pour activer les filtres au clic
function activateFilters() {
    // On récupère tous les boutons de la barre de filtres pour activer la fonctionnalité de filtrage
    const btnsFilters = document.querySelectorAll("button[class=\"filter\"]")
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

// FONCTION GLOBALE GESTION GALERIE & FILTRES
function manageGallery() {
    // On crée la galerie de travaux
    works.forEach(generateGallery)
    // On crée la barre de filtres
    generateFiltersBar()
    // On active les filtres
    activateFilters()
}

// Fonction pour déconnecter l'utilisateur lorsqu'il clique sur "logout" dans le menu de navigation
function logout(link) {
    link.addEventListener("click", () => {
        // On déconnecte l'utilisateur = on enlève le token du sessionStorage
        window.sessionStorage.removeItem("token")
    })
}

// Fonction pour générer la galerie miniature de la fenêtre modale
function generateGalleryModal(work) {
    // On crée un élément HTML figure avec attribut data-id = propriété id de l'objet
    const figureWork = document.createElement("figure")
    figureWork.dataset.img = work.id

    // On crée un élément img avec attribut src = propriété imageUrl de l'objet + attribut alt = propriété title
    const imgWork = document.createElement("img")
    imgWork.src = work.imageUrl
    imgWork.alt = work.title

    // On crée le bouton qui permettra de supprimer des projets
    const btnDelete = document.createElement("button")
    btnDelete.className = "delete"
    btnDelete.innerHTML = `<i class="fa-solid fa-trash-can"></i>`

    // On utilise appendChild pour définir img et button comme enfants de figure
    figureWork.appendChild(imgWork)
    figureWork.appendChild(btnDelete)

    // On utilise appendChild pour définir figure comme enfant de gallery
    modalGallery.appendChild(figureWork)
}

// Fonction pour ouvrir la fenêtre modale au clic sur "modifier" puis la ferme au clic sur la croix ou en dehors de la modale
function toggleModal() {
    // On modifie le display de la modale en cliquant sur "modifier"
    const btnModal = document.querySelector("a[href=\"#modal\"]")
    const modal = document.getElementById("modal-container")
    btnModal.addEventListener("click", () => {
        modal.style.display = "block"
        // À l'ouverture de la modale, on génère la galerie de miniatures si elle est vide
        if(modalGallery.childElementCount === 0) {
            works.forEach(generateGalleryModal)
        }
    })
    // On ferme la modale en cliquant sur le bouton close
    const btnClose = document.querySelector(".close")
    btnClose.addEventListener("click", () => {
        modal.style.display = "none"
    })
    // On ferme la modale en cliquant sur l'overlay
    window.addEventListener("click", e => {
        if (e.target === modal) {
            modal.style.display = "none"
        }
    })
    // On affiche le formulaire d'ajout de photo en cliquant sur le bouton "Ajouter une photo"
    const btnAddModal = document.querySelector(".btn-modal-add")
    btnAddModal.addEventListener("click", () => {
        // On récupère les deux fenêtres de la modale pour cacher la fenêtre de suppression et afficher celle d'ajout de photos
        const modalDelete = document.getElementById("modal-delete")
        const modalAdd = document.getElementById("modal-add")
        modalDelete.style.display = "none"
        modalAdd.style.display = "flex"

        // On génère les catégories dans l'élément select du formulaire
        const selectCategory = document.querySelector("select")
        // On vérifie que la liste déroulante contient uniquement le champ vide par défaut défini dans le HTML
        if(selectCategory.childElementCount === 1) {
            categories.forEach(category => {
                // Pour chaque catégorie, on crée un élément option contenant le nom de la catégorie
                const optionCategory = document.createElement("option")
                optionCategory.innerText = category.name
                // On ajoute deux attributs data-cat = id de la catégorie + value = nom de la catégorie en minuscules
                optionCategory.dataset.cat = category.id
                optionCategory.value = category.name.toLowerCase()
                // On ajoute ce nouvel élément option à l'élément select du formulaire
                selectCategory.appendChild(optionCategory)
            })
        }
        

        // On inverse à nouveau le display à la fermeture de la fenêtre en cliquant sur le bouton close
        btnClose.addEventListener("click", () => {
            modalAdd.style.display = "none"
            modalDelete.style.display = "flex"
            modal.style.display = "none"
        })
        // Idem en cliquant sur l'overlay
        window.addEventListener("click", e => {
            if (e.target === modal) {
                modalAdd.style.display = "none"
                modalDelete.style.display = "flex"
                modal.style.display = "none"
            }
        })
    })
}

// FONCTION GLOBALE GESTION MODE EDITION
function displayEditMode() {
    // On vérifie si un token est enregistré dans le sessçonStorage
    if(window.sessionStorage.getItem("token") !== null) {
        // Si oui, on récupère tous les éléments avec une classe commençant par "edit-" et on ajoute la classe générique "edit"
        // (permet d'anticiper des ajouts sur le mode édition)
        const editElements = document.querySelectorAll("[class^=edit-]")
        editElements.forEach(element => {
            element.classList.add("edit")
        })
        // On modifie aussi le "login" du menu de navigation
        const loginLink = document.querySelector("a[href=\"login.html\"]")
        loginLink.children[0].innerText = "logout"
        // On appelle la fonction de déconnexion si on clique sur "logout"
        logout(loginLink)
        // On appelle la fonction qui ouvre/ferme la modale
        toggleModal()
    }
}


// APPEL FONCTIONS GLOBALES
// On génère la galerie et les filtres
manageGallery()
// On gère le mode édition et l'affichage de la modale
displayEditMode()
