# Instructions pour les Agents IA

Ce document définit le contexte de développement pour ce projet. Merci de le prendre en compte pour toutes vos suggestions.

## 1. Contexte de Développement Clé

*   **Environnement :** Tout le développement se fait dans **GitHub Codespaces**. Il n'y a pas d'environnement local.
*   **Build & Test :** Le build de l'APK est entièrement géré par une **GitHub Action** qui se déclenche après un `push` sur la branche `main`. Il n'y a pas d'émulateur ; le test se fait sur l'APK généré.
*   **Langage :** Le projet utilise **JavaScript** (et non TypeScript). Le fichier principal est `App.js`.

## 2. Spécifications Techniques

*   **Version de React Native :** Le projet est basé sur **React Native `0.73.6`**. Toute nouvelle librairie doit être compatible avec cette version.