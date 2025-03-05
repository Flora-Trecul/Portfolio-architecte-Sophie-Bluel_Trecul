const login = document.getElementById("loginForm")

// Fonction pour traiter la réponse de l'API
async function processAPIresponse(response) {
    if(response.ok) {
        // Si les identifiants sont valides, on stocke le tocken dans le sessionStorage
        response = await response.json()
        const token = response.token
        window.sessionStorage.setItem("token", token)
        // Puis on renvoie l'utilisateur sur la page d'accueil
        window.location.href = "index.html"
    } else {
        // Si les identifiants sont incorrects, on affiche un message d'erreur pour l'utilisateur (s'il n'y en a pas déjà un)
        if(document.querySelector(".error") === null) {
            const errorMsg = document.createElement("p")
            errorMsg.className = "error"
            errorMsg.innerText = "Erreur dans l'identifiant ou le mot de passe"
            const forgotPassword = document.querySelector(".forgot-password")
            login.insertBefore(errorMsg,forgotPassword)
        }
    }
}

// Fonction pour traiter la demande d'authentification de l'utilisateur
function requestLogin() {
    login.addEventListener("submit", function(event) {
        event.preventDefault()
        // On récupère l'email et le mot de passe saisis par l'utilisateur
        const userID = {
            email: event.target.querySelector("[name=email]").value,
            password: event.target.querySelector("[name=password]").value,
        }
        const chargeUtile = JSON.stringify(userID)
        // On envoie la requête d'authentification à l'API
        fetch("http://localhost:5678/api/users/login", {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: chargeUtile
        }).then(function(response) {processAPIresponse(response)})
    })
}

// Appel à la fonction principale
requestLogin()