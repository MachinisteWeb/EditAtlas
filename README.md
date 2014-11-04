# EdtiAtlas #

Version : 0.1.0 (Beta)

NodeAtlas Version minimale : 0.23.x



## Avant-propos ##

Ceci est un site exemple d'édition de contenu sans Back-office avec [NodeAtlas](https://github.com/Haeresis/NodeAtlas). Facile à intégrer, facile à éditer ! Vous pouvez le télécharger en vu de le tester ou de l'intégrer à l'un de vos projet NodeAtlas. Ce mécanisme est actuellement utilisé sur [BlogAtlas](https://github.com/Haeresis/BlogAtlas/).

Un exemple live de ce repository est testable à (adresse en cours de mise en place). *La seul différence avec ce code est que l'enregistrement dans les fichiers de variation de l'exemple live a été inhibé pour qu'en rechargeant votre page, vous récupériez le contenu de test.*



## Comment ça marche ? ##

NodeAtlas possède deux types de fichier de variation vous permettant pour un template donné d'injecter du contenu différent : un commun à tous les templates et un spécifique au template en cours. Cela est très pratique pour produire une même page de maquette HTML plusieurs fois ou pour créer des sites multilingues.

### Sans édition, en standard ###

Dans un contexte standard, avec une configuration comme celle-ci :

```js
{
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

nous sommes capable de les affichers dans le template `index.htm` comme ceci :

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

... En cours de rédaction...


## Lancer le site en local ##

Pour faire tourner le site en local, il vous faudra installer [NodeAtlas](http://haeresis.github.io/NodeAtlas/) sur votre poste de développement.

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

Vous pouvez voir fonctionner ce repository à l'adresse : (adresse en cours de mise en place).