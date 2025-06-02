// Fonction principale pour afficher le mode édition et gérer la modale si un token est enregistré dans le sessionStorage
function activateEditMode(works, categories, gallery) {
    if(window.sessionStorage.getItem("token") !== null) {
        displayEditMode()
        
        // On récupère la modale, les deux fenêtres de la modale et la galerie modale
        const modalGallery = document.querySelector(".gallery-modal")
        const modal = document.getElementById("modal-container")
        const modalDelete = document.getElementById("modal-delete")
        const modalAdd = document.getElementById("modal-add")
    
        openModal(modal, modalGallery, works)
        closeModal(modal, modalAdd, modalDelete)
        displayModalForm(modalAdd, modalDelete, categories, gallery, modalGallery)
    }
}

export { activateEditMode }


// FONCTIONS POUR LA FENETRE MODALE

// Fonction pour changer l'affichage de la page d'accueil en mode édition
function displayEditMode() {
    // On récupère tous les éléments avec une classe commençant par "edit-" et on les affiche (anticipe des futurs ajouts)
    const editElements = document.querySelectorAll("[class^=edit-]")
    editElements.forEach(element => {
        element.style.display = "block"
    })

    // On remplace le login par logout dans le menu et on déconnecte l'utilisateur s'il clique dessus
    const loginLink = document.querySelector("a[href=\"login.html\"]")
    loginLink.innerText = "logout"
    loginLink.addEventListener("click", (event) => {
        // On empêche l'activation du lien vers la page login et on actualise la page actuelle
        event.preventDefault()
        window.sessionStorage.removeItem("token")
        window.location.reload()
    })
}

// Fonction générale pour ouvrir la modale, générer la galerie modale et activer la suppression de photos
import { generateFigure } from "./gallery-filters.js"
function openModal(modal, modalGallery, works) {
    // On affiche la modale en cliquant sur "modifier"
    const btnModal = document.querySelector("a[href=\"#modal\"]")
    
    btnModal.addEventListener("click", () => {
        modal.style.display = "block"
        // À l'ouverture de la modale, on génère la galerie de miniatures si elle est vide
        // Si elle n'est pas vide on ne fait rien car les ajouts/suppressions sont gérés en temps réel
        if(modalGallery.childElementCount === 0) {
            works.forEach(work => {generateFigure(work, modalGallery)})
        }
    })
}

// Fonction générale pour gérer la fermeture de la modale
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


// FONCTIONS POUR LE FORMULAIRE

// Fonction générale pour gérer la fenêtre modale d'ajout de photo
function displayModalForm(modalAdd, modalDelete, categories, gallery, modalGallery) {
    const btnAddModal = document.querySelector(".btn-modal-add")
    // Au clic sur le bouton "Ajouter une photo", on cache la fenêtre de suppression et on affiche celle d'ajout
    btnAddModal.addEventListener("click", () => {
        modalDelete.style.display = "none"
        modalAdd.style.display = "flex"

        handleForm(categories, gallery, modalGallery)
    })
}

// Fonction générale pour la gestion du formulaire
function handleForm(categories, gallery, modalGallery) {
    const inputTitle = document.getElementById("title")
    const inputCat = document.querySelector("select")
    generateCategories(categories, inputCat)

    // Variable qui permettra de valider le formulaire s'il y a bien une image valide uploadée par l'utilisateur
    let imgUploaded = false

    // Quand un fichier est uploadé, on vérifie qu'il est valide et on affiche un preview le cas échéant
    const btnUpload = document.getElementById("photo-input")
    // On utilise onchange au lieu d'un eventListener pour que les instructions ne se dédoublent pas à chaque upload
    btnUpload.onchange = () => {
        removeErrorMsg()
        imgUploaded = checkUploadedImg(btnUpload)
        activateSubmitBtn(inputTitle, inputCat)
    }

    // On change la couleur du bouton Valider quand tous les champs sont remplis
    inputCat.onchange = () => {
        activateSubmitBtn(inputTitle, inputCat)
    }

    inputTitle.addEventListener("input", () => {
        activateSubmitBtn(inputTitle, inputCat)
    })


    // Quand le formulaire est validé, on vérifie que tous les champs sont remplis et on envoie la requête le cas échéant
    const modalForm = document.getElementById("modal-form")
    modalForm.onsubmit = (event) => {
        validateModalForm(event, imgUploaded, btnUpload, inputTitle, inputCat, gallery, modalGallery)
    }
}

// Fonction pour générer les catégories comme éléments option dans l'élément select du formulaire
function generateCategories(categories, inputCat) {
    // On vérifie que la liste déroulante contient uniquement le champ vide par défaut pour ne pas créer de doublon
    if(inputCat.childElementCount === 1) {
        categories.forEach(category => {
            const optionCategory = document.createElement("option")
            optionCategory.innerText = category.name
            // On ajoute deux attributs data-cat = id de la catégorie + value = nom de la catégorie en minuscules
            optionCategory.dataset.cat = category.id
            optionCategory.value = category.name.toLowerCase()

            inputCat.appendChild(optionCategory)
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

// Fonction pour vérifier la validité de l'image uploadée par l'utilisateur
function checkUploadedImg(btnUpload) {
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
        displayPreview(uploadedImg)
        return true
    }
}

// Fonction pour afficher un preview de l'image uploadée par l'utilisateur
function displayPreview(uploadedImg) {
    const divUpload = document.querySelector(".upload-photo")
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
}

// Fonction pour changer la couleur du bouton Valider si le formulaire est prêt à être envoyé
function activateSubmitBtn(inputTitle, inputCat) {
    const imgFilled = document.querySelector(".preview")
    const titleFilled = inputTitle.value.trim()
    const catFilled = inputCat.value
    
    const btnSubmit = document.querySelector("#modal-add .btn-modal-add")
    // Si tous les champs sont remplis, on change la couleur du bouton (sauf si la couleur est déjà appliquée)
    if(imgFilled && titleFilled && catFilled) {
        removeErrorMsg()
        if(btnSubmit.getAttribute("style") !== null) {
            return
        } else {
            btnSubmit.style.backgroundColor = "#1D6154"
        }
    // Sinon, on enlève la couleur verte du bouton si elle avait précédemment été ajoutée
    // Permet de gérer les cas où l'utilisateur vide un champ qu'il avait rempli et qui avait activé le bouton
    } else {
        if(btnSubmit.getAttribute("style") !== null) {
            btnSubmit.removeAttribute("style")
        }
    }
}

// Fonction pour valider le formulaire d'ajout de photo
function validateModalForm(event, imgUploaded, btnUpload, inputTitle, inputCat, gallery, modalGallery) {
    event.preventDefault()
    removeErrorMsg()
    // On vérifie que les champs image, titre et catégorie sont remplis avant de valider le formulaire
    if(inputTitle.value && inputCat.value && imgUploaded === true) {
        postRequestAPI(inputCat, inputTitle, btnUpload, gallery, modalGallery)
    } else {
        addErrorMsg("Tous les champs du formulaire doivent être remplis")
    }
}

// Fonction pour envoyer une requête d'ajout de photo à l'API
function postRequestAPI(inputCat, inputTitle, btnUpload, gallery, modalGallery) {
    // On envoie la requête à l'API pour ajouter la photo à la galerie
    const inputCatID = inputCat.options[inputCat.selectedIndex].dataset.cat
    const infosImg = new FormData()
    infosImg.append("image", btnUpload.files[0])
    infosImg.append("title", inputTitle.value)
    infosImg.append("category", inputCatID)

    fetch("https://portfolio-architecte-sophie-bluel-trecul.onrender.com/api/works", {
        method: "POST",
        headers: {"Authorization": `Bearer ${window.sessionStorage.getItem("token")}`},
        body: infosImg
    }).then(response => {processAPIresponse(response, gallery, modalGallery)})
}

// Fonction pour traiter la réponse de l'API à la demande d'ajout d'une nouvelle photo
async function processAPIresponse(response, gallery, modalGallery) {
    if(response.ok) {
        response = await response.json()
        generateFigure(response, gallery)
        generateFigure(response, modalGallery)
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
    document.querySelector("#modal-add .btn-modal-add").removeAttribute("style")
}