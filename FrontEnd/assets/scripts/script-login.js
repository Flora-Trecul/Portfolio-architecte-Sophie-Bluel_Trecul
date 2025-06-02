// Fonction pour traiter la demande d'authentification de l'utilisateur
function requestLogin() {
    const login = document.getElementById("loginForm")
    login.addEventListener("submit", function(event) {
        event.preventDefault()

        const userMail = event.target.querySelector("[name=email]").value
        const userPassword = event.target.querySelector("[name=password]").value
        // On envoie la requête uniquement si les deux champs sont remplis, sinon ça ne sert à rien
        if(userMail && userPassword) {
            // On récupère l'email et le mot de passe saisis par l'utilisateur
            const userID = {
                email: userMail,
                password: userPassword,
            }
            const chargeUtile = JSON.stringify(userID)
            // On envoie la requête d'authentification à l'API
            fetch("https://portfolio-architecte-sophie-bluel-trecul.onrender.com/api/users/login", {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: chargeUtile
            }).then(response => {processAPIresponse(response, login)})
        } else {
            showErrorMsg("Tous les champs doivent être remplis", login)
        }
    })
}

// Fonction pour traiter la réponse de l'API
async function processAPIresponse(response, login) {
    if(response.ok) {
        // Si les identifiants sont valides, on stocke le token dans le sessionStorage
        response = await response.json()
        const token = response.token
        window.sessionStorage.setItem("token", token)
        // Puis on renvoie l'utilisateur sur la page d'accueil
        window.location.href = "index.html"
    } else {
        // Si les identifiants sont incorrects, on affiche un message d'erreur pour l'utilisateur (s'il n'y en a pas déjà un)
        showErrorMsg("Erreur dans l'identifiant ou le mot de passe", login)
    }
}

// Fonction pour afficher un message d'ereur
function showErrorMsg(msg, login) {
    const previousMsg = document.querySelector(".error")
    if(previousMsg !== null) {
        previousMsg.remove()
    }
    const errorMsg = document.createElement("p")
    errorMsg.className = "error"
    errorMsg.innerText = msg
    const forgotPassword = document.querySelector(".forgot-password")
    login.insertBefore(errorMsg,forgotPassword)
}

// Appel à la fonction principale
requestLogin()