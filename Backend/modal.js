
// Fonction pour changer l'affichage de la page d'accueil en mode édition
function displayEditMode() {
    // On récupère tous les éléments avec une classe commençant par "edit-" et on les affiche (anticipe des futurs ajouts)
    const editElements = document.querySelectorAll("[class^=edit-]")
    editElements.forEach(element => {
        element.style.display = "block"
    })

    // On remplace le login par logout dans le menu et on déconnecte l'utilisateur s'il clique dessus
    const loginLink = document.querySelector("a[href=\"login.html\"]")
    loginLink.children[0].innerText = "logout"
    loginLink.addEventListener("click", () => {
        window.sessionStorage.removeItem("token")
    })
}

// Fonction pour activer la suppression d'une photo au clic sur le bouton supprimer
function deleteWork() {
    const btnDelete = document.querySelectorAll(".delete")
    btnDelete.forEach(btn => {
        btn.addEventListener("click", () => {
            // On récupère l'id de la photo associée au bouton cliqué
            const btnID = Number(btn.parentElement.dataset.img)
            // On envoie une requête pour supprimer la photo
            fetch(`http://localhost:5678/api/works/${btnID}`, {
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
        })
    })
}

// Fonction pour ouvrir la modale et générer la galerie
import { generateGallery } from "./gallery-filters.js"
function openModal(modal, modalGallery, works) {
    // On affiche la modale en cliquant sur "modifier"
    const btnModal = document.querySelector("a[href=\"#modal\"]")
    
    btnModal.addEventListener("click", () => {
        modal.style.display = "block"
        // À l'ouverture de la modale, on génère la galerie de miniatures si elle est vide
        if(modalGallery.childElementCount === 0) {
            works.forEach(work => {generateGallery(work, modalGallery)})
        }
        // Une fois la galerie générée, on active la suppression des travaux
        deleteWork()
    })
}

// Fonction pour cacher la modale et réinitialiser l'affichage par défaut de la fenêtre galerie
function resetModal(modal, modalAdd, modalDelete, back) {
    if(modalAdd.style.display === "flex") {
        modalAdd.style.display = "none"
        modalDelete.style.display = "flex"
    }
    if(back === false) {
        modal.style.display = "none"
    }
}

// Fonction pour fermer la modale au clic sur la croix ou sur l'overlay
function closeModal(modal, modalAdd, modalDelete) {
    let back = false
    // On retourne à l'affichage par défaut de la galerie en cliquant sur le bouton retour de la fenêtre "ajout"
    const btnBack = document.querySelector(".back")
    btnBack.addEventListener("click", () => {
        back = true
        resetModal(modal, modalAdd, modalDelete, back)
        back = false
    })

    // On ferme la modale en cliquant sur le bouton close
    const btnClose = document.querySelector(".close")
    btnClose.addEventListener("click", () => {
        resetModal(modal, modalAdd, modalDelete, back)
    })

    // On ferme la modale en cliquant sur l'overlay
    window.addEventListener("click", e => {
        if (e.target === modal) {
            resetModal(modal, modalAdd, modalDelete, back)
        }
    })
}

// Fonction pour générer les catégories comme éléments option dans l'élément select du formulaire
function generateCategories(categories) {
    const selectCategory = document.querySelector("select")
    // On vérifie que la liste déroulante contient uniquement le champ vide par défaut défini dans le HTML
    if(selectCategory.childElementCount === 1) {
        categories.forEach(category => {
            const optionCategory = document.createElement("option")
            optionCategory.innerText = category.name
            // On ajoute deux attributs data-cat = id de la catégorie + value = nom de la catégorie en minuscules
            optionCategory.dataset.cat = category.id
            optionCategory.value = category.name.toLowerCase()

            selectCategory.appendChild(optionCategory)
        })
    }
}

// Fonction pour afficher le formulaire d'ajout de photo en cliquant sur le bouton "Ajouter une photo"
function displayformModal(modalAdd, modalDelete, categories) {
    const btnAddModal = document.querySelector(".btn-modal-add")
    // Au clic sur le bouton, on cache la fenêtre de suppression et on affiche celle d'ajout
    btnAddModal.addEventListener("click", () => {
        modalDelete.style.display = "none"
        modalAdd.style.display = "flex"

        generateCategories(categories)

        // Lorsque l'utilisateur charge une image on affiche cette image dans la div upload-photo
        const btnUpload = document.getElementById("photo-input")
        btnUpload.addEventListener("change", () => {
            const uploadedImg = btnUpload.files[0]
            
            const divForm = document.querySelector(".upload-form")
            divForm.style.display = "none"

            const divUpload = document.querySelector(".upload-photo")
            const newImg = document.createElement("img")
            newImg.classList.add("preview")
            newImg.file = uploadedImg
            divUpload.innerHTML = ""
            divUpload.appendChild(newImg)

            const reader = new FileReader()
            reader.onload = (e) => {
                newImg.src = e.target.result
            }
            reader.readAsDataURL(uploadedImg)
        })
    })
}

// Fonction générale pour afficher le mode édition et gérer la modale si un token est enregistré dans le sessionStorage
function activateEditMode(modalGallery, works, modal, categories) {
    if(window.sessionStorage.getItem("token") !== null) {
        displayEditMode()
        
        openModal(modal, modalGallery, works)

        // Pour les fonctions liées à la fenêtre "ajout" de la modale, on récupère les deux fenêtres
        const modalDelete = document.getElementById("modal-delete")
        const modalAdd = document.getElementById("modal-add")

        closeModal(modal, modalAdd, modalDelete)
        displayformModal(modalAdd, modalDelete, categories)
    }
}

export { activateEditMode }


// Ce qu'il reste à faire : activer l'ajout de travaux
// - reset l'image chargée et le display du champ upload à la fermeture de la modale (ou au retour sur la fenêtre suppression)
// - activer le bouton "Valider" quand tous les champs du formulaire sont remplis
// - envoyer la requête POST à l'API en validant le formulaire (ne pas oublier ID et userID)
// - afficher la nouvelle photo dans la galerie en rechargeant la page
// - afficher la nouvelle photo instantanément dans la galerie principale et la galerie miniature