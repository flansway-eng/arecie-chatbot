# ARECIE Assistant - Chatbot

Application chatbot Next.js développée pour l'ARECIE (Association des Anciens et Retraités de EECI et CIE). Conçue pour offrir une expérience accessible, simple et sécurisée aux seniors.

## Déploiement Vercel (en 3 étapes)

Ce projet est pré-configuré pour un déploiement optimal sur Vercel.

**Étape 1 : Importer le dépôt**
Connectez-vous à votre compte Vercel (https://vercel.com) et cliquez sur **Add New > Project**. Importez ce dépôt Git. Vercel détectera automatiquement qu'il s'agit d'un projet Next.js.

**Étape 2 : Configurer les variables d'environnement**
Avant de lancer le déploiement, ajoutez la variable suivante dans la section **Environment Variables** :
- `ANTHROPIC_API_KEY` : `sk-ant-...` (votre clé API Anthropic réelle)

**Étape 3 : Déployer et configurer le domaine**
Cliquez sur **Deploy**. Une fois le déploiement terminé, allez dans **Settings > Domains** et ajoutez le domaine personnalisé `arecie-asmar.com`.

---

## Fonctionnalités
- Design accessible (min 16px, fort contraste)
- Actions rapides pour les cas fréquents
- Interface de chat rassurante
- API Anthropic sécurisée en backend
- Aucune donnée stockée
