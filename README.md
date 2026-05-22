# Projet d'Architecture Serverless - Azure Functions

Ce projet implémente une architecture asynchrone et découplée utilisant Azure Functions (Node.js v4) et Azure Storage (Queue & Table).

## 🏗️ Architecture du projet

Le système repose sur un modèle producteur/consommateur sans communication directe entre les services, garantissant la résilience et la scalabilité de l'application.

1. **Client** ➔ Envoie une requête HTTP POST contenant des données.
2. **Fonction HTTP** ➔ Reçoit les données et les dépose dans une file d'attente (Queue Storage).
3. **Queue Storage** ➔ Stocke le message de manière temporaire.
4. **Fonction Queue** ➔ Détecte l'arrivée du message, le dépile et le traite.
5. **Table Storage** ➔ Stocke le résultat final de manière persistante.

## ⚙️ Rôle de chaque fonction

### 1. `recevoirDemande` (HTTP Trigger)
* **Déclenchement :** Requête HTTP (POST).
* **Rôle :** C'est le point d'entrée de l'API. Elle est strictement *stateless* (sans état) et ne contient aucune logique métier complexe. Elle se contente d'extraire le corps (body) de la requête et de publier un message dans la file d'attente `demandes-queue` via un *Output Binding*.
* **Réponse :** Retourne un code HTTP 202 (Accepted) pour indiquer que la demande a bien été prise en compte et sera traitée de manière asynchrone.

### 2. `traiterDemande` (Queue Trigger)
* **Déclenchement :** Automatique dès qu'un message arrive dans `demandes-queue`.
* **Rôle :** Elle est totalement indépendante de la fonction HTTP. Elle lit le contenu du message, prépare une entité de données (avec un `partitionKey` et un `rowKey` unique), puis écrit ces données dans la table `DemandesTraitees` via un *Output Binding*.

---

## 🚀 Procédure pour lancer le projet en local

### Prérequis
* Visual Studio Code avec l'extension **Azure Functions** et **Azurite**.
* [Azure Functions Core Tools](https://learn.microsoft.com/en-us/azure/azure-functions/functions-run-local) installé.
* Node.js installé.

### Étapes de lancement

1. **Démarrer l'émulateur de stockage (Azurite) :**
   * Ouvrir la palette de commandes dans VS Code (`Ctrl + Shift + P`).
   * Lancer la commande : `Azurite: Start` (vérifier que les services Blob, Queue et Table sont actifs dans la barre d'état en bas).

2. **Installer les dépendances :**
   * Ouvrir le terminal à la racine du projet.
   * Exécuter la commande :
     
```bash
     npm install
```

3. **Lancer le runtime Azure Functions :**
   * Appuyer sur `F5` pour lancer en mode débogage (ou taper `func start` dans le terminal).
   * Attendre que la console affiche l'URL locale de la fonction HTTP.

4. **Tester l'architecture :**
   * Ouvrir un nouveau terminal PowerShell et envoyer une requête POST :
     
```powershell
     Invoke-RestMethod -Uri "http://localhost:7071/api/recevoirDemande" -Method Post -Body "Message de test"
```

5. **Vérifier les résultats :**
   * **Dans la console :** Vérifier l'enchaînement des logs (exécution de `recevoirDemande` suivie automatiquement par `traiterDemande`).
   * **Dans la base de données :** Utiliser *Azure Storage Explorer* (ou l'onglet Azure de VS Code) pour vérifier l'apparition du message dans `Local Emulator > Tables > DemandesTraitees`.