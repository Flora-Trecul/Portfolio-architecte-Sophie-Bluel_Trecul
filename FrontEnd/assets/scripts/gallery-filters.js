// Fonction principale pour ajouter chaque objet de l'API works à la galerie
function generateFigure(work, gallery) {
    // On crée un élément HTML figure avec attribut data-id = propriété id de l'objet
    const figureWork = document.createElement("figure")
    figureWork.dataset.img = work.id

    // On crée un élément img avec attribut src = propriété imageUrl de l'objet + attribut alt = propriété title
    const imgWork = document.createElement("img")
	const hostedURL = work.imageUrl.replace("http://localhost:5678", "https://portfolio-architecte-sophie-bluel-trecul.onrender.com")
    imgWork.src = hostedURL
    imgWork.alt = work.title

    figureWork.appendChild(imgWork)

    // Si on génère la galerie de la modale, on ajoute un bouton à chaque image, sinon on ajoute une légende et la catégorie
    if(gallery === document.querySelector(".gallery-modal")) {
        generateDeleteBtn(figureWork)
    } else {
        // On vérifie si l'objet possède une clé category (cas général), sinon on utilise categoryId (cas d'ajout de photos)
        figureWork.dataset.cat = work.category?.id ?? work.categoryId
        generateFigcaption(work, figureWork)
    }

    gallery.appendChild(figureWork)
}

export { generateFigure }

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
    // On active le bouton de suppression, ça permet de l'activer directement lorsqu'on ajoute une nouvelle photo sans devoir réactiver tous les boutons à chaque fois
    deleteWork(btnDelete)
}

// Fonction pour activer le bouton suppression des miniatures dans la galerie modale
function deleteWork(btn) {
    btn.addEventListener("click", () => {
		// On demande confirmation que l'utilisateur veut bien supprimer la photo
		if (confirm("Voulez-vous vraiment supprimer cette photo ?")) {
			// On récupère l'id de la photo associée au bouton cliqué
			const btnID = Number(btn.parentElement.dataset.img)
			// On envoie une requête pour supprimer la photo
			fetch(`https://portfolio-architecte-sophie-bluel-trecul.onrender.com/api/works/${btnID}`, {
				method: "DELETE",
				headers: {
					"Accept": "*/*",
					"Authorization": `Bearer ${window.sessionStorage.getItem("token")}`
				}
			}).then(async function(response) {
				// Si la requête est acceptée, on supprime la photo associée au bouton dans les deux galeries
				if(response.ok) {
					const figuresDelete = document.querySelectorAll(`figure[data-img="${btnID}"]`)
					figuresDelete.forEach(figure => {
						figure.remove()
					})
				}
			})
		}
    })
}


// Fonction générale pour la génération des filtres et l'activation au clic 
function activateFilters(categories, gallery) {
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
                filterWorks(btnFilter)
            }
        })
    })
}

export { activateFilters }

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

// Fonction pour filtrer les photos affichées selon le filtre sélectionné
function filterWorks(btnFilter) {
    const btnCat = Number(btnFilter.dataset.cat)
    const figures = document.querySelectorAll(".gallery figure")

    figures.forEach(figure => {
        // On annule le display "none" des éventuelles photos précédemment masquées
        if (figure.style.display === "none") {
            figure.removeAttribute("style")
        }
        // Si l'utilisateur n'a pas appuyé sur "Tous", on masque les photos ne correspondant pas à la catégorie choisie
        if (btnCat !== 0 && Number(figure.dataset.cat) !== btnCat) {
            figure.style.display = "none"
        }
    })
}
