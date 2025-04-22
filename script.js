// --- Login System Logic (Client-side, NON-SECURE) ---
// *** WARNING: This login system is for visual gating only. ***
// *** Credentials are hardcoded and exposed in the source code. ***
// *** DO NOT use this for sensitive applications. ***

// <<< DÉFINISSEZ VOS NOMS D'UTILISATEUR ET MOTS DE PASSE VALIDES ICI >>>
const validCredentials = [
    { username: 'SoutaIshikawa', password: 'SI4585' }
    // Ajoutez autant d'objets { username: '...', password: '...' } que nécessaire
];
// ********************************************************

// --- Configuration pour les Webhooks ---
// <<< REMPLACEZ CECI PAR L'URL DE VOTRE WEBHOOK DISCORD >>>
const discordWebhookUrl = 'https://discord.com/api/webhooks/1357643486480040000/4bbPWgI9HEyvaAJtCWpa23MOolJQg1TlzWrB-Bp-fU9WxlnCe6fA9gLPSiKCP1HemYbz'; // <-- Collez votre URL Discord ici
// ****************************************

const loginScreen = document.getElementById('login-screen');
const salesBookContent = document.getElementById('sales-book-content');
const loginForm = document.getElementById('login-form');
const loginErrorMessage = document.getElementById('login-error-message');

// Nous retirons l'utilisation de sessionStorage, donc pas besoin de vérifier 'isLoggedIn' au chargement.
// const isLoggedIn = sessionStorage.getItem('isLoggedIn'); // Ligne retirée


// Function to show the sales book and hide the login screen
function showSalesBook() {
    loginScreen.style.display = 'none';
    salesBookContent.style.display = 'block'; // Show the content
     // Reset body centering styles applied for the login screen
     document.body.style.justifyContent = 'flex-start';
     document.body.style.alignItems = 'flex-start';
    document.body.style.minHeight = 'auto';
    // sessionStorage.setItem('isLoggedIn', 'true'); // Ligne retirée : ne mémorise plus la connexion
}

// Variable to store the calculated total profit (still needed for display on page)
let currentTotalProfit = 0;
let currentTotalAmount = 0; // Also keep track of total amount


// Function to handle login form submission
if (loginForm) { // Check if the form exists
    loginForm.addEventListener('submit', (event) => {
        event.preventDefault(); // Prevent the default form submission (page reload)

        const usernameInput = document.getElementById('username');
        const passwordInput = document.getElementById('password');

        const enteredUsername = usernameInput.value;
        const enteredPassword = passwordInput.value;

        // Check credentials against the list
        const isAuthenticated = validCredentials.some(credentials => {
            return credentials.username === enteredUsername && credentials.password === enteredPassword;
        });

        if (isAuthenticated) {
            // Successful login
            loginErrorMessage.textContent = ''; // Clear any previous error message
            showSalesBook(); // Show the main content
            // Initialize sales book logic after showing it
             initializeSalesBook();

        } else {
            // Failed login
            loginErrorMessage.textContent = 'Nom d\'utilisateur ou mot de passe incorrect.';
            passwordInput.value = ''; // Clear password field
             usernameInput.focus(); // Put focus back on username
        }
    });
}


// --- Existing Sales Book Logic ---
// We wrap the existing calculation and event listener setup
// so it can be called after a successful login OR on page load if already logged in.
function initializeSalesBook() {
     // Only initialize if the sales book content is actually displayed
     if (salesBookContent.style.display === 'none') {
        return;
     }

    // Get elements needed for calculations and display
    const productSelects = document.querySelectorAll('.product-select');
    const quantityInputs = document.querySelectorAll('.quantity-input');
    const totalAmountDisplay = document.getElementById('total-amount');
    const totalProfitDisplay = document.getElementById('total-profit'); // Keep this to update display


    function calculateRowAmount(row) {
        const productSelect = row.querySelector('.product-select');
        const quantityInput = row.querySelector('.quantity-input');
        const rowAmountDisplay = row.querySelector('.row-amount');
        const rowProfitDisplay = row.querySelector('.row-profit'); // Keep this to update display
        const productProdPriceDisplay = row.querySelector('.product-prod-price');
        const productSellPriceDisplay = row.querySelector('.product-sell-price');

        const selectedOption = productSelect.options[productSelect.selectedIndex];
        const prodPrice = parseFloat(selectedOption.getAttribute('data-prod-price')) || 0;
        const sellPrice = parseFloat(selectedOption.getAttribute('data-sell-price')) || 0;
        const quantity = parseInt(quantityInput.value) || 0;

        const amount = sellPrice * quantity;
        const profit = (sellPrice - prodPrice) * quantity;

         // Update displayed prices only if a product is selected
        if (productSelect.value) {
             productProdPriceDisplay.textContent = `$${prodPrice.toFixed(2)}`;
             productSellPriceDisplay.textContent = `$${sellPrice.toFixed(2)}`;
         } else {
             productProdPriceDisplay.textContent = ''; // Clear if no product selected
             productSellPriceDisplay.textContent = ''; // Clear if no product selected
         }

        rowAmountDisplay.textContent = `$${amount.toFixed(2)}`;
        rowProfitDisplay.textContent = `$${profit.toFixed(2)}`; // KEEP: Update row profit display
    }

    function calculateTotal() {
        let totalAmount = 0;
        let totalProfit = 0;

        // Loop through each row to sum displayed amount and profit
         document.querySelectorAll('tbody tr').forEach(row => {
             const rowAmountDisplay = row.querySelector('.row-amount');
             const rowProfitDisplay = row.querySelector('.row-profit'); // Get profit display

             totalAmount += parseFloat(rowAmountDisplay.textContent.replace('$', '')) || 0;
             totalProfit += parseFloat(rowProfitDisplay.textContent.replace('$', '')) || 0; // Sum displayed profit
         });

        // Update total displays on the page
        totalAmountDisplay.textContent = `$${totalAmount.toFixed(2)}`;
        totalProfitDisplay.textContent = `$${totalProfit.toFixed(2)}`; // KEEP: Update total profit display

        // Store totals in variables accessible by the fetch call
        currentTotalAmount = totalAmount;
        currentTotalProfit = totalProfit; // Store total profit value
    }

    // Add event listeners for select and input changes (only once per element)
    const handleSalesBookChange = (event) => {
         calculateRowAmount(event.target.closest('tr'));
         calculateTotal();
     };

    document.querySelectorAll('.product-select, .quantity-input').forEach(element => {
        // Add listeners only if not added before
        if (!element.dataset.listenersAdded) {
            const eventType = element.tagName === 'SELECT' ? 'change' : 'input';
            element.addEventListener(eventType, handleSalesBookChange);
            element.dataset.listenersAdded = 'true';
        }
    });


    // --- Integration Logic ---

    // This version gets salesperson name from an element, not a select dropdown
    const salespersonNameElement = document.getElementById('salesperson-name');
    const currentDateElement = document.getElementById('current-date');
    const currentTimeElement = document.getElementById('current-time');
    const validateButton = document.getElementById('validate-button'); // Ensure button is accessible

    if (validateButton) {
        validateButton.addEventListener('click', () => {
            // Get salesperson name from the designated element
            const salesperson = salespersonNameElement ? salespersonNameElement.textContent.trim() : 'Inconnu'; // Added check

            const saleDate = currentDateElement.textContent.trim();
            const saleTime = currentTimeElement.textContent.trim();

            // Recalculate totals just before sending to ensure accuracy and update currentTotalAmount/currentTotalProfit
            calculateTotal();

            const totalAmount = currentTotalAmount; // Use the value stored in the variable
            const totalProfit = currentTotalProfit; // Use the total profit value


             // Check if there are any items selected with quantity > 0 or if total amount > 0
             const hasSelectedItems = Array.from(document.querySelectorAll('tbody tr')).some(row => {
                  const productSelect = row.querySelector('.product-select');
                  const quantityInput = row.querySelector('.quantity-input');
                  return productSelect.value && parseInt(quantityInput.value) > 0;
               });

             // Also check if total amount is 0, even if items are selected (e.g. free items)
             if (!hasSelectedItems && totalAmount <= 0) {
                 alert("Aucun article sélectionné avec une quantité supérieure à 0 ou le total à facturer est de $0.00.");
                 return;
             }


            // Créer un objet avec les données de résumé
            const summaryData = {
                Date: saleDate,
                Heure: saleTime,
                Vendeur: salesperson,
                Chiffre_Affaire: totalAmount,
                Marge_Totale: totalProfit
            };

            console.log('Données sommaires à envoyer :', summaryData);


            // --- Envoi à Google Sheets ---
            const googleSheetsUrl = 'https://script.google.com/macros/s/AKfycbycEBCzB1TTT6oAa4wXD6N8vR1fUxS58U_wFA9H_YtO6jdDz2nr-YpW14p7S9FqGqP-jg/exec'; // <<< REMPLACEZ CECI PAR VOTRE URL Apps Script

             if (googleSheetsUrl === 'YOUR_APPS_SCRIPT_WEB_APP_URL' || !googleSheetsUrl) {
                 alert("Erreur de configuration : L'URL Google Sheets n'est pas configurée correctement.");
                 // Optionally return here if Google Sheets is mandatory,
                 // but for now, we'll just log and proceed to Discord if configured.
                 console.error("Google Sheets URL not configured.");
             } else {
                 fetch(googleSheetsUrl, {
                     method: 'POST',
                     mode: 'no-cors', // Use 'no-cors' for Google Apps Script Web App
                     headers: {
                         'Content-Type': 'application/json'
                     },
                     body: JSON.stringify(summaryData) // Envoyez l'objet JSON résumé
                 })
                 .then(response => {
                      console.log('Réponse Google Sheets reçue (mode no-cors, réponse opaque):', response);
                      alert('Sélection validée. Données envoyées à Google Sheets (vérifiez la feuille pour confirmation) !');

                      // Optional: Clear the form after assumed successful submission
                      document.querySelectorAll('.quantity-input').forEach(input => input.value = 0);
                      document.querySelectorAll('.product-select').forEach(select => select.value = '');
                      document.querySelectorAll('tbody tr').forEach(row => calculateRowAmount(row)); // Recalculate to reset displays
                      calculateTotal(); // Recalculate totals to show $0.00
                      // Update date and time for the next transaction
                      updateDateTime();

                 })
                 .catch((error) => {
                     console.error('Erreur lors de l\'envoi des données à Google Sheets:', error);
                     alert('Échec de l\'envoi des données à Google Sheets. Vérifiez la console, la configuration Apps Script et l\'URL.');
                 });
             }


            // --- Envoi à Discord via Webhook ---
            if (discordWebhookUrl === 'YOUR_DISCORD_WEBHOOK_URL' || !discordWebhookUrl) {
                console.warn("Discord Webhook URL not configured. Skipping Discord notification.");
            } else {
                const discordPayload = {
                    // You can customize the message format here using Markdown
                    content: `**Nouvelle Vente Validée**:\n` +
                             `> **Date:** ${summaryData.Date}\n` +
                             `> **Heure:** ${summaryData.Heure}\n` +
                             `> **Vendeur:** ${summaryData.Vendeur}\n` +
                             `> **Chiffre d'Affaire:** $${summaryData.Chiffre_Affaire.toFixed(2)}\n` +
                             `> **Marge Totale:** $${summaryData.Marge_Totale.toFixed(2)}`,
                    // Optional: customize the username and avatar
                    // username: 'Sales Bot',
                    // avatar_url: 'URL_DE_VOTRE_ICONE'
                };

                console.log('Données à envoyer à Discord :', discordPayload);

                fetch(discordWebhookUrl, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(discordPayload)
                })
                .then(response => {
                    if (response.ok) { // Discord webhook success returns 204 No Content, which response.ok handles
                        console.log('Données envoyées à Discord avec succès !');
                        // No alert needed for Discord success typically
                    } else {
                        console.error('Erreur lors de l\'envoi des données à Discord. Statut :', response.status);
                        // Attempt to read response body for more info, but Discord might return empty
                        response.text().then(text => console.error('Corps de l\'erreur Discord (si disponible) :', text || 'Empty response body'));
                        // No alert needed for Discord failure, just console log
                    }
                })
                .catch((error) => {
                    console.error('Erreur réseau lors de l\'envoi à Discord:', error);
                    // No alert needed for Discord failure, just console log
                });
            }
            // Note: The Sheets fetch includes UI updates (clearing form, updating time)
            // so let's keep that as the primary success indicator for the user.
            // The Discord fetch runs in parallel or slightly after the Sheets fetch is initiated.

        });
    } else {
          console.error("Validation button not found!");
    }


    // Function to update date and time
    function updateDateTime() {
          const now = new Date();
          const day = String(now.getDate()).padStart(2, '0');
          const month = String(now.getMonth() + 1).padStart(2, '0'); // Month is 0-indexed
          const year = now.getFullYear();
          const hours = String(now.getHours()).padStart(2, '0');
          const minutes = String(now.getMinutes()).padStart(2, 0);
          const seconds = String(now.getSeconds()).padStart(2, 0);

          if(currentDateElement) currentDateElement.textContent = `${day}/${month}/${year}`;
          if(currentTimeElement) currentTimeElement.textContent = `${hours}:${minutes}:${seconds}`;
    }

    // Initial calculation and date/time set
     document.querySelectorAll('tbody tr').forEach(row => {
          calculateRowAmount(row); // Calculate row amounts and profits
     });
     calculateTotal(); // Calculate total amount and total profit, update displays and variables
    updateDateTime();

}


// --- Initial logic on page load ---
document.addEventListener('DOMContentLoaded', () => {
    // Retirons la vérification de sessionStorage. La page montrera toujours l'écran de login au départ.
    // if (isLoggedIn === 'true') {
    //     showSalesBook();
    //      initializeSalesBook();
    // } else {
        // Afficher l'écran de login (il est déjà affiché par défaut via CSS)
        // Mettre le focus sur le champ nom d'utilisateur
        const usernameInput = document.getElementById('username');
        if(usernameInput) usernameInput.focus();
    // }
});
