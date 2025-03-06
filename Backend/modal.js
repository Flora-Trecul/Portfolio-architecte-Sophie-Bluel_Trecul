const works = await fetch("http://localhost:5678/api/works").then(works => works.json())



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
        window.sessionStorage.removeItem("userID")
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
        // On vérifie si la galerie est vide, si non on la vide avant de la remplir
        if(modalGallery.childElementCount > 0) {
            modalGallery.innerHTML = ""
        }
        works.forEach(work => {generateGallery(work, modalGallery)})
        // Une fois la galerie générée, on active la suppression des travaux
        deleteWork()
    })
}

// Fonction pour cacher la modale et réinitialiser l'affichage par défaut de la fenêtre galerie
function resetModal(modal, modalAdd, modalDelete, back) {
    resetForm()
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

// Fonction pour créer un message d'erreur
function addErrorMsg(errorText) {
    const divForm = document.querySelector(".form-inputs")
    const error = document.createElement("p")
    error.classList.add("error-modal")
    error.innerText = errorText
    divForm.appendChild(error)
}

// Fonction pour enlever tous les messages d'erreur du formulaire
function removeErrorMsg() {
    const msgError = document.querySelector(".error-modal")
    if (msgError !== null) {
        msgError.remove()
    }
}

// Fonction pour traiter la réponse de l'API à la demande d'ajout d'une nouvelle photo
async function processAPIresponse(response) {
    if(response.ok) {
        response = await response.json()
        // On ajoute une nouvelle figure dans la galerie principale + dans la galerie modale avec l'URL de l'image et son titre
        // On récupère la galerie principale
        const gallery = document.querySelector(".gallery")
        // On crée une figure avec data-img = idphoto
        const newFigure = document.createElement("figure")
        newFigure.dataset.img = response.id
        // On crée une img src = URL & alt = Title
        const newImg = document.createElement("img")
        newImg.src = response.imageUrl
        newImg.alt = response.title
        // On crée une figcaption = Title
        const newCaption = document.createElement("figcaption")
        newCaption.innerText = response.title
        newFigure.appendChild(newImg)
        newFigure.appendChild(newCaption)
        gallery.appendChild(newFigure)
        resetForm()
    } else {
        addErrorMsg("La demande d'ajout de photo n'a pas abouti.")
        // Pas de reset car l'utilisateur doit voir le message d'erreur, il pourra reset en fermant la fenêtre
    }
}

// Fonction pour reset le formulaire
function resetForm() {
    document.getElementById("modal-form").reset()
    const preview = document.querySelector(".preview")
    if(preview !== null) {
        preview.remove()
        document.querySelector(".upload-form").style.display = "flex"
    }
    const input = document.getElementById("photo-input")
    if(input.files !== null) {
        input.value = ""
    }
    removeErrorMsg()
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
        let imgUploaded = false
        // On utilise onchange au lieu d'un eventListener pour que les instructions ne se dédoublent pas à chaque changement
        btnUpload.onchange = () => {
            const divUpload = document.querySelector(".upload-photo")
            removeErrorMsg()
            
            // On vérifie qu'un fichier a bien été uploadé + qu'il respecte la taille et le format demandés
            const uploadedImg = btnUpload.files[0]
            if(!uploadedImg) {
                addErrorMsg("Aucun fichier n'a été sélectionné")
                return
            } else if(uploadedImg.type !== "image/png" && uploadedImg.type !== "image/jpeg") {
                addErrorMsg("Le fichier sélectionné n'est pas au format .png ou .jpg")
                return
            } else if(uploadedImg.size > 4*1024*1024) {
                addErrorMsg("Le fichier dépasse la taille maximale de 4 Mo")
                return
            } else {
                // Si l'image remplit les critères, on affiche un preview dans la zone d'upload
                const divForm = document.querySelector(".upload-form")
                divForm.style.display = "none"

                const previewImg = document.createElement("img")
                previewImg.classList.add("preview")

                const reader = new FileReader() // FileReader permet de lire le fichier uploadé
                reader.readAsDataURL(uploadedImg) // On lit le fichier uploadé sous forme d'une URL de données, permettant au navigateur d'afficher l'image
                reader.onload = (e) => {
                    previewImg.src = e.target.result //e.target.result assigne le lien du fichier lu comme src de l'élément img
                }

                divUpload.appendChild(previewImg)
                imgUploaded = true
            }
        }


        // Validation du formulaire
        const formModal = document.getElementById("modal-form")
        formModal.addEventListener("submit", (event) => {
            event.preventDefault()

            const inputTitle = document.getElementById("title")
            const inputCat = document.getElementById("category")

            // On vérifie que les champs image, titre et catégorie sont remplis avant de valider le formulaire
            if(inputTitle.value && inputCat.value && imgUploaded === true) {
                removeErrorMsg()
                // On envoie la requête à l'API pour ajouter la photo à la galerie
                const inputCatID = inputCat.options[inputCat.selectedIndex].dataset.cat
                const infosImg = new FormData()
                infosImg.append("image", btnUpload.files[0])
                infosImg.append("title", inputTitle.value)
                infosImg.append("category", inputCatID)

                fetch("http://localhost:5678/api/works", {
                    method: "POST",
                    headers: {"Authorization": `Bearer ${window.sessionStorage.getItem("token")}`},
                    body: infosImg
                }).then(response => {processAPIresponse(response)})
            } else {
                removeErrorMsg()
                addErrorMsg("Tous les champs du formulaire doivent être remplis")
            }
            
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
// - activer la couleur verte du bouton "Valider" quand tous les champs du formulaire sont remplis
// - afficher la nouvelle photo instantanément dans la galerie principale et la galerie miniature
// => actualiser la galerie en appuyant sur le bouton back
// => si je ferme la modale puis que je l'ouvre, mes figure principale et figure modale n'ont pas le même ID, ce qui empêche la suppression
// - optimiser tout le code