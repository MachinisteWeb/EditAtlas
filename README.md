# EdtitAtlas #

Version : 0.1.1 (Beta)

NodeAtlas Version minimale : 0.23.x



## Avant-propos ##

EditAtlas est un exemple d'édition de contenu sans Back-office avec [NodeAtlas](http://www.lesieur.name/nodeatlas/). Facile à intégrer, facile à éditer ! Il permet :

1. L'édition de n'importe quel texte, groupe de balise HTML ou attribut de balise dans la source cliente. 
2. L'édition avec rendu caractère par caractère du résultat final en temps réel partout ou la phrase est logé dans la page.
3. Répercution de toutes les modifications sur toutes les pages déjà ouvertes dans les navigateurs des utilisateurs sans rechargement de celles-ci.
4. Modification du texte depuis la source serveur (désactive les features 2 et 3).
5. Jouer des fonctions après modification pour re-rendre en temps réel le résultat (active la feature 4 et ré-active 2 et 3).
6. D'empiler et de déplacer vos zones d'édition dans une fenêtre pour toujours voir votre rendu.

Vous pouvez télécharger ce repository en vu de le tester ou de l'intégrer à l'un de vos projet [NodeAtlas](http://www.lesieur.name/nodeatlas/). Ce mécanisme est actuellement utilisé sur [BlogAtlas](https://github.com/Haeresis/BlogAtlas/).

Un exemple live de ce repository est testable à [http://www.lesieur.name/edit-atlas/](http://www.lesieur.name/edit-atlas/) (en cours de déploiement). *La seul différence avec le code de ce repository est que l'enregistrement dans les fichiers de variation de l'exemple live a été inhibé pour qu'en rechargeant votre page, vous récupériez le contenu de test.*



## Comment ça marche ? ##

[NodeAtlas](http://www.lesieur.name/nodeatlas/) possède deux types de fichier de variation vous permettant pour un template donné d'injecter du contenu différent : 

- un fichier « common » à tous les templates et
- des fichiers « specific » par template. 

Cela est très pratique pour produire une même page de maquette HTML plusieurs fois ou pour créer des sites multilingues.


### Sans édition, en standard ###

Dans un contexte standard, avec une configuration comme celle-ci :

```js
{
	"controllersRelativePath": "controllers/",
	"commonController": "common.js",
	"commonVariation": "common.json",
	"routes": {
		"/": {
			"template": "index.htm",
			"variation": "index.json"
		}
	}
}
```

et en plaçant dans le fichier de variation `common.js` commun ces variables :

*common.json*

```js
{
	"text": "<p>Un texte dans common.</p>",
	"liens": [{
		"url": "./",
		"description": "Le titre du lien dans common.",
		"content": "Le contenu du lien dans common."
	}]
}
```

ainsi que dans un fichier spécifique `index.json` ces variables :

*index.json*

```js
{
	"texts": ["<p>Un texte dans specific.</p>"],
	"lien": {
		"url": "./",
		"description": "Le titre du lien dans specific.",
		"content": "Le contenu du lien dans specific."
	}
}
```

nous sommes capable de les afficher dans le template `index.htm` comme ceci :

```html
<%- common.text %>
<a href="<%= common.liens[0].url %>" title="<%= common.liens[0].description %>">
	<%- common.liens[0].content %>
</a>

<%- specific.texts[0] %>
<a href="<%= specific.lien.url %>" title="<%= specific.lien.description %>">
	<%- specific.lien.content %>
</a>
```

et le code source disponible dans votre navigateur pour l'adresse `http://localhost/` sera :

```html
<p>Un texte dans common.</p>
<a href="./" title="Le titre du lien dans common.">
	Le contenu du lien dans common.
</a>

<p>Un texte dans specific.</p>
<a href="./" title="Le titre du lien dans specific.">
	Le contenu du lien dans specific.
</a>
```


### Du contenu éditable à la volée ###

En transformant le code précédent en celui-ci :

```html
<%-: common | eh: ['text','common.json'] %>
<a href="<%-: common | ea: ['liens[0].url','common.json','href'] %>" title="<%-: common | ea: ['liens[0].description','common.json','title'] %>">
	<%-: common | et: ['liens[0].content','common.json'] %>
</a>

<%-: specific | eh: ['texts[0]','index.json'] %>
<a href="<%-: specific | ea: ['lien.url','index.json','href'] %>" title="<%-: specific | ea: ['lien.title','index.json','title'] %>">
	<%-: specific | et: ['lien.content','index.json'] %>
</a>
```

Vous obtiendrez alors la sortie suivante dans la source Html :

```html
<div *attributs...*><p>Un texte dans common.</p></div>
<a *attributs...* href="./" title="Le titre du lien dans common.">
	<span *attributs...*>Le contenu du lien dans common.</span>
</a>

<div *attributs...*><p>Un texte dans specific.</p></div>
<a href="./" title="Le titre du lien dans specific.">
	<span *attributs...*>Le contenu du lien dans specific.</span>
</a>
```
On peut alors s'apercevoir que :

- Le filtre `eh` (raccourci de `editHtml` qui fonctionne aussi) génère une `div` supplémentaire encadrant votre rendu. C'est une édition de type `block` pour éditer de large frange de HTML.
- Le filtre `et` (raccourci de `editText` qui fonctionne aussi) génère un `span` supplémentaire encadrant votre rendu. C'est une édition de type `inline` pour éditer des phrases, des titres, des menus, etc. tout élément ne contenant pas de balise de type `block`.
- Le filtre `ea` (raccourci de `editAttr` qui fonctionne aussi) génère des attributs supplémentaires dans la balises mais ne créér pas de balise encadrante. Cela est réservé pour l'édition de lien, de titre ou même de classe, etc.

On remarque également que

- Pour `editHtml`, `editText` et `editAttr` on ne passe plus la variable mais l'objet contenant la variable. On passe en premier argument de filtre la valeur à afficher/modifier et en second le fichier json dans lequel la modification va être enregistré

**Dès lors, nos valeurs sont cliquable en maintenant la touche `Ctrl` enfoncé et éditable dans la fenêtre d'édition.**


### Gestion de droit d'édition / ne plus spécifier de fichier d'enregistrement ###

En imaginant que dans votre controller commun vous précisiez ceci :

```js
(function (publics) {
	"use strict";

	publics.preRender = function (params, mainCallback) {
		var variation = params.variation,
			session = params.request.session;

		// Création de variable à false.
		variation.fs = false;
		variation.fc = false;

		// Si l'utilisateur à le droit, on lui permet d'éditer les fichiers.
		if (session.hasPermissionForEdit) {
			// Le fichier spécifique utilisé pour générer cette vue.
			variation.fs = variation.pageParameters.variation;
			// Le fichier commun utilisé pour générer cette vue.
			variation.fc = variation.webconfig.commonVariation;
		}

		mainCallback(variation);
	};
}(website));

exports.preRender = website.preRender;
```

vous pourriez permettre da controller dans quel condition un utilisateur peut ou ne peut pas éditer le texte. Une implémentation similaire tourne dans [BlogAtlas](https://github.com/Haeresis/BlogAtlas/).

Ainsi le code précédent pourrait s'écrire comme ci-après avec l'injection des variables `fs` et `fc` :

```html
<%-: common | eh: ['text',fc] %>
<a href="<%-: common | ea: ['liens[0].url',fc,'href'] %>" title="<%-: common | ea: ['liens[0].description',fc,'title'] %>">
	<%-: common | et: ['liens[0].content',fc] %>
</a>

<%-: specific | eh: ['texts[0]',fs] %>
<a href="<%-: specific | ea: ['lien.url',fs,'href'] %>" title="<%-: specific | ea: ['lien.title',fs,'title'] %>">
	<%-: specific | et: ['lien.content',fs] %>
</a>
```

Dans ce cas: 

- si l'utilisateur en a le droit, `fs` et `fc` fournissent les noms des fichiers, et l'édition est possible mais
- si l'utilisateur n'en a pas le droit, `fs` et `fc` valent `false` et l'édition n'est pas permise.

*Note : il est également nécéssaire dans la partie Back-end d'interdire l'enregistrement dans le fichier json au cas ou un utilisateur bidouillerais le code client.*


### Modification à partir de la source du serveur ###

... en cours de rédaction ...



## Lancer le site en local ##

Pour faire tourner le site en local, il vous faudra installer [NodeAtlas](http://www.lesieur.name/node-atlas/) sur votre poste de développement.

Déplacez vous ensuite dans le dossier :


```
\> cd </path/to/blog>
```

et utilisez la commande :

```
\> node </path/to/>node-atlas/node-atlas.js --run
```

ou lancez `server.na` en double cliquant dessus :
- en expliquant à votre OS que les fichiers `.na` sont lancé par défaut par `node`,
- en ayant installé `node-atlas` via `npm install -g node-atlas`
- en étant sur que votre variable d'environnement `NODE_PATH` pointe bien sur le dossier des `node_modules` globaux.

Le site sera accessible ici :

- *http://localhost:7777/*



## Exemple en ligne ##

Vous pouvez voir fonctionner ce repository à l'adresse : [http://www.lesieur.name/edit-atlas/](http://www.lesieur.name/edit-atlas/) (en cours de déploiement).