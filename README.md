# TeleCLV — Prédiction de la Customer Lifetime Value

> Application de Machine Learning permettant d'estimer la **Customer Lifetime Value (CLV)** d'un client télécom à partir de son profil de services.

## 🎯 Objectif

La Customer Lifetime Value (CLV) représente une estimation de la valeur qu'un client peut générer sur sa relation avec une entreprise.

Dans ce projet, l'objectif est de construire un modèle de régression capable d'estimer une **CLV proxy** à partir des caractéristiques du client et des services auxquels il souscrit.

Le projet va au-delà de l'entraînement d'un modèle : le modèle est intégré dans une application web avec une API de prédiction.

## 🧩 Problématique métier

**Comment estimer la valeur potentielle d'un client à partir de son profil de services afin de mieux comprendre les segments de valeur et soutenir les décisions de gestion de la relation client ?**

Ce type d'approche peut notamment être utilisé comme base pour :
- segmenter les clients selon leur valeur estimée ;
- identifier les profils à forte valeur ;
- alimenter des stratégies de fidélisation et de personnalisation ;
- explorer des problématiques de Customer Analytics.

## 📊 Données

- **Dataset :** IBM Telco Customer Churn
- **Taille :** 7 043 clients
- **Nature :** données clients et services télécom
- **Variable cible :** CLV proxy

La CLV utilisée dans ce projet est construite à partir de :

```text
CLV = MonthlyCharges × tenure
```

> **Important :** cette variable est un proxy construit à partir du dataset. Elle ne constitue pas une mesure comptable de la valeur économique réelle d'un client.

## 🔬 Méthodologie

Le projet suit les principales étapes d'un workflow de Data Science :

1. Compréhension des données
2. Préparation et nettoyage
3. Construction de la variable cible
4. Sélection des variables explicatives
5. Entraînement d'un modèle de régression
6. Évaluation des performances
7. Analyse de l'importance des variables
8. Intégration du modèle dans une API
9. Mise à disposition d'une interface web de prédiction

### Variables utilisées

Le modèle utilise 16 variables décrivant notamment :
- le profil démographique ;
- les services téléphoniques ;
- les services Internet ;
- le type de contrat ;
- la méthode de paiement.

La durée réelle d'abonnement (`tenure`) n'est pas fournie au modèle au moment de la prédiction : elle sert à construire la cible historique.

## 🤖 Modèle

**CatBoost Regressor**

CatBoost est particulièrement adapté aux jeux de données comportant de nombreuses variables catégorielles et permet de travailler directement avec ce type de variables.

## 📈 Résultats

Les métriques présentées dans l'application sont :

| Métrique | Valeur |
|---|---:|
| R² | 0,81 |
| RMSE | 1016 |
| MAE | 709 |

Ces résultats doivent être interprétés dans le contexte du dataset et de la définition de la CLV proxy.

## ⚠️ Limites

Le projet présente plusieurs limites importantes :

- la CLV est un proxy construit et non une valeur client réelle ;
- le dataset utilisé est un dataset public et ne représente pas nécessairement un opérateur télécom particulier ;
- la performance du modèle ne garantit pas une performance équivalente sur de nouvelles populations ;
- les variables disponibles au moment de la prédiction conditionnent fortement la qualité de l'estimation ;
- une validation métier sur des données réelles serait nécessaire avant toute utilisation opérationnelle.

## 🏗️ Architecture

```text
Profil client
     │
     ▼
Interface web
     │
     ▼
API FastAPI
     │
     ▼
Modèle CatBoost
     │
     ▼
CLV estimée + segment de valeur
```

## 🖥️ Application

L'application contient trois espaces principaux :

- **Accueil** — présentation du projet
- **Prédiction** — saisie d'un profil client et estimation de sa CLV
- **Méthodologie** — données, modèle, métriques et importance des variables

## 🛠️ Technologies

- Python
- Pandas
- NumPy
- CatBoost
- FastAPI
- Pydantic
- Uvicorn
- HTML / CSS / JavaScript
- Chart.js

## 🚀 Installation locale

### 1. Cloner le dépôt

```bash
git clone https://github.com/Sela80/TeleCLV.git
cd TeleCLV
```

### 2. Installer les dépendances

```bash
cd backend
pip install -r requirements.txt
```

### 3. Lancer l'API

```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

L'API expose notamment :

```text
GET  /
POST /predict
```

## 📁 Structure

```text
TeleCLV/
├── backend/
│   ├── main.py
│   ├── model_CatBoost_R.cbm
│   └── requirements.txt
├── index.html
├── prediction.html
├── methodologie.html
├── script.js
├── style.css
├── chart.min.js
└── README.md
```

## 🔗 Démonstration

Application : https://sela80.github.io/TeleCLV/

## 👤 Auteur

**Kouakou Gédéon Sela**

Data Science | Python · SQL · Machine Learning · Power BI  
Intérêt : Data Science appliquée à la banque et à la finance

- GitHub : https://github.com/Sela80
- LinkedIn : https://www.linkedin.com/in/gedeon-sela/

---

### 📌 Projet académique

Projet réalisé dans le cadre de ma formation en Licence 3 à l'UVCI, avec pour objectif de mettre en pratique un workflow complet de Data Science, de la modélisation jusqu'à l'intégration dans une application.
